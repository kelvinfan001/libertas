/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

module.exports = { queryByID };

const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

/**
 * Calls chaincode function queryByID.
 * @param {string} connectionProfilePath Path to connection profile.
 * @param {string} walletPath Path to wallet containing user certificate and private/public keys.
 * @param {string} id ID of user making call. Same as enrollment ID.
 * @param {string} channelName Name of network channel as specified in 'install.sh'
 * @param {string} contractName Name of contract installed as specified in 'install.sh'
 * @param {string} idToQuery ID of user to query.
 */
async function queryByID(connectionProfilePath, walletPath, id, channelName, contractName, idToQuery) {

    try {
        // Create a new file system based walllet for managing identities.
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if user exists in wallet.
        const userExists = await wallet.exists(id);
        if (!userExists) {
            console.log(id + ' does not exist in the wallet.')
            return;
        }

        // Create a new gateway for connecting to peer node.
        const gateway = new Gateway();
        await gateway.connect(connectionProfilePath, { wallet, identity: id, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) that our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(contractName);

        // Submit the transaction.
        await contract.submitTransaction('QueryByID', idToQuery);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}
