/*
 * Modification Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

module.exports = { enroll };

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function enroll(connectionProfilePath, caName, networkDirPath, walletPath, enrollmentID, enrollmentSecret, mspID) {
    const ccpJSON = fs.readFileSync(connectionProfilePath, 'utf8');
    const ccp = JSON.parse(ccpJSON);

    try {
        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities[caName];
        const caTLSCACertsPath = path.resolve(networkDirPath, caInfo.tlsCACerts.path);
        const caTLSCACerts = fs.readFileSync(caTLSCACertsPath);
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.Name);

        // Create a new file system based wallet for managing identities.
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if admin user is already enrolled.
        const adminExists = await wallet.exists('admin');
        if (adminExists) {
            console.log("Admin already exists in wallet.")
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