/*
 * Modification Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 * 
 * This module contains frontend JavaScript calls for enrolling user.
 * 
 */

'use strict';

module.exports = { enrollUser }

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');

/**
 * Enrolls a registered user and stores its public key, private key, and X.509 certificate in a local wallet.
 *
 * This process uses a Certificate Signing Request where the private and public keys are first generated locally
 * and the public key is then sent to the CA which returns an encoded certificate for use by the application.
 * 
 * @param {string} connectionProfilePath Path to connection profile.
 * @param {string} walletPath            Path to wallet.
 * @param {string} caDomain              Domain name of certificate authority.
 * @param {string} enrollmentID 
 * @param {string} enrollmentSecret 
 * @param {string} mspID 
 */
async function enrollUser(caURL, caTLSCACertsPath, caName, walletPath, enrollmentID,
    enrollmentSecret, mspID) {

    const ccpJSON = fs.readFileSync(connectionProfilePath, 'utf8');
    const ccp = JSON.parse(ccpJSON);

    try {
        // Create a new CA client for interacting with the CA.
        const caTLSCACerts = fs.readFileSync(caTLSCACertsPath);
        const ca = new FabricCAServices(caURL, { trustedRoots: caTLSCACerts, verify: false }, caName);

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
