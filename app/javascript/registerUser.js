/*
 * Modification Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');

// const ccpPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network', 'connection-sipher.json');

async function registerUser(connectionProfilePath, walletPath, userName, affiliation, enrollmentID, role) {
    try {

        // Create a new file system wallet  object for managing identities.
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if user is already enrolled.
        const userExists = await wallet.exists(userName);
        if (userExists) {
            console.log(userName + "identity already exists in the wallet");
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
    } catch (error) {
        throw new Error(`Failed to register user: ` + enrollmentID + `${error}`);
    }
}