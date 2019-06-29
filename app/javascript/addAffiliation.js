/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

module.exports = { addAffiliation }

const { FileSystemWallet, Gateway } = require('fabric-network');

/**
 * Adds a new affiliation affiliationName in the CA provided in connectionProfilePath
 * by using the admin credentials in walletPath.
 * Must be admin to add affiliation.
 * @param {string} walletPath 
 * @param {string} connectionProfilePath 
 * @param {string} affiliationName 
 */
async function addAffiliation(walletPath, connectionProfilePath, affiliationName) {
    try {
        // Create a new file system wallet for managing identities.
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if admin credentials exist in wallet.
        const adminExists = await wallet.exists('admin')
        if (!adminExists) {
            console.log('Cannot find admin identity in wallet.');
            return;
        }

        // Create a new gateway for connecting to peer node.
        const gateway = new Gateway();
        await gateway.connect(connectionProfilePath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get CA client object from gateway for interacting with CA. 
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        await ca.newAffiliationService().create({ "name": affiliationName }, adminIdentity);

        console.log("Successfully added affiliation: " + affiliationName);
    } catch (error) {
        throw new Error(`Failed to add affiliation: ` + affiliationName + ` ${error}`);
    }
}