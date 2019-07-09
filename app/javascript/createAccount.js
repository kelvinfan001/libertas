/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

module.exports = { createAccount };

const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

/**
 * Calls the createAccount function on chaincode.
 * @param {string} connectionProfilePath Path to connection profile.
 * @param {string} walletPath            Path to wallet containing user certificate and private/public keys.
 * @param {string} channelName           Name of network channel as specified in 'install.sh'
 * @param {string} contractName          Name of contract installed as specified in 'install.sh'
 * @param {string} id                    ID for new account. Must be same as enrollmentID.
 * @param {string} name                  Name for new account. Must be name registered with this id.
 * @param {string} email                 Email associated with new account.
 * @param {string} accountType           Account type for new account. Must be accountType registered with this ID.
 */
async function createAccount(connectionProfilePath, walletPath, channelName, contractName,
    id, name, email, accountType) {

    try {
        // Create a new file system based walllet for managing identities.
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if user credentials exist in wallet. This is only a precursory check. 
        const userExists = await wallet.exists(id);
        if (!userExists) {
            console.log('User credentials with id: ' + id + ' do not exist in the wallet.')
            return;
        }

        // Create a new gateway for connecting to peer node.
        const gateway = new Gateway();
        await gateway.connect(connectionProfilePath, {
            wallet, identity: id,
            discovery: { enabled: true, asLocalhost: true }
        });

        // Get the network (channel) that our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(contractName);

        // Submit the transaction.
        await contract.submitTransaction('CreateAccount', id, name, email, accountType);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}
