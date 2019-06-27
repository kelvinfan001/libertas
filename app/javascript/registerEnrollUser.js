/*
 * Modification Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

module.exports = { registerUser, enrollUser }

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

/**
 * Registers a new user with affiliation, enrollmentID, and role with the CA provided in the connection profile 
 * at connectionProfilePath. Registrar must have admin credentials.
 * 
 * @param {string} connectionProfilePath Path to connection profile.
 * @param {string} walletPath            Path to wallet where admin credentials are stored.
 * @param {string} affiliation  
 * @param {string} enrollmentID 
 * @param {string} role 
 */
async function registerUser(connectionProfilePath, walletPath, affiliation, enrollmentID, role) {
    try {

        // Create a new file system wallet  object for managing identities.
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if user is already enrolled.
        const userExists = await wallet.exists(enrollmentID);
        if (userExists) {
            console.log(enrollmentID + "identity already exists in the wallet");
            return;
        }

        // Check to see if there are any admin credentials.
        const adminExists = await wallet.exists('admin');
        if (!adminExists) {
            console.log("No identity for admin exists in the wallet.");
            return;
        }

        // Create a new gateway for connecting to peer node.
        const gateway = new Gateway();
        await gateway.connect(connectionProfilePath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get CA client object from gateway for interacting with CA.
        const ca = gateway.getClient().getCertificateAuthority(); // here be dragons (don't need FabricCAServices() here?)
        const adminIdentity = gateway.getCurrentIdentity();

        // Register the user.
        const secret = await ca.register({ affiliation: affiliation, enrollmentID: enrollmentID, role: role }, adminIdentity);
        console.log('Successfully registered user: ' + enrollmentID)

        return secret;

    } catch (error) {
        throw new Error(`Failed to register user: ` + enrollmentID + `${error}`);
    }
}

/**
 * Enrolls a registered user and stores its public key, private key, and X.509 certificate in a local wallet.
 *
 * This process uses a Certificate Signing Request where the private and public keys are first generated locally
 * and the public key is then sent to the CA which returns an encoded certificate for use by the application.
 * 
 * @param {string} connectionProfilePath Path to connection profile.
 * @param {string} walletPath            Path to wallet.
 * @param {string} caDomain              Domain name of certificate authority.
 * @param {string} networkDirPath        Path to directory containing the "crypto-config" directory.
 * @param {string} enrollmentID 
 * @param {string} enrollmentSecret 
 * @param {string} mspID 
 */
async function enrollUser(connectionProfilePath, walletPath, caDomain, networkDirPath, enrollmentID, enrollmentSecret, mspID) {

    const ccpJSON = fs.readFileSync(connectionProfilePath, 'utf8');
    const ccp = JSON.parse(ccpJSON);

    try {
        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities[caDomain];
        const caTLSCACertsPath = path.resolve(networkDirPath, caInfo.tlsCACerts.path);
        const caTLSCACerts = fs.readFileSync(caTLSCACertsPath);
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.Name);

        // Enroll user with enrollmentID and enrollmentSecret.
        const enrollment = await ca.enroll({ enrollmentID: enrollmentID, enrollmentSecret: enrollmentSecret });


        // Import public, private keys and certificate to local wallet.
        const wallet = new FileSystemWallet(walletPath);
        const userIdentity = X509WalletMixin.createIdentity(mspID, enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(enrollmentID, userIdentity);
        console.log('Successfully enrolled user: ' + enrollmentID + ' and imported it into the wallet');

    } catch (error) {
        throw new Error(`Failed to enroll user: ` + enrollmentID + ` ${error}`);
    }
}