/*
 * Modification Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

module.exports = { enrollAdmin};

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

/**
 * Enrolls a registered admin and stores its public key, private key, and X.509 certificate in a local wallet.
 * 
 * This process uses a Certificate Signing Request where the private and public keys are first generated locally 
 * and the public key is then sent to the CA which returns an encoded certificate for use by the application. 
 * 
 * @param {string} connectionProfilePath Path to connection profile.
 * @param {string} caDomain              Domain of a certificate authority defined in connection profile to connect to.
 * @param {string} networkDirPath        Path to directory containing the "crypto-config" directory.
 * @param {string} walletPath            Path to local wallet.
 * @param {string} enrollmentID          Enrolment ID for admin.
 * @param {string} enrollmentSecret      Enrolment secret for admin.
 * @param {string} mspID                 MSP ID for creating identity object.
 */
async function enrollAdmin(connectionProfilePath, caDomain, networkDirPath, walletPath, enrollmentID, enrollmentSecret, mspID) {
    const ccpJSON = fs.readFileSync(connectionProfilePath, 'utf8');
    const ccp = JSON.parse(ccpJSON);

    try {
        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities[caDomain];
        // const caTLSCACertsPath = path.resolve(networkDirPath, caInfo.tlsCACerts.path);
        // const caTLSCACerts = fs.readFileSync(caTLSCACertsPath);
        
        // need to disable TLS for now
        const caTLSCACerts = []
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.Name);

        // Create a new file system based wallet for managing identities.
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if admin user is already enrolled.
        const adminExists = await wallet.exists('admin');
        if (adminExists) {
            console.log("Admin already exists in wallet.")
            return;
        }

        // Enroll the admin user.
        const enrollment = await ca.enroll({ enrollmentID: enrollmentID, enrollmentSecret: enrollmentSecret });
        // Import the new identity into the wallet.
        const identity = X509WalletMixin.createIdentity(mspID, enrollment.certificate, enrollment.key.toBytes());
        await wallet.import('admin', identity)

    } catch (error) {
        throw new Error(`Failed to enroll admin user "admin": ${error}`)
    }

    console.log("Admin successfully enrolled in wallet.")
}