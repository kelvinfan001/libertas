/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 * 
 * This module deals with frontend JavaScript calls related to voter groups.
 */

'use strict';

module.exports = {createVoterGroup, queryVoterGroupsByID}

const { FileSystemWallet, Gateway } = require('fabric-network');


/**
 * Calls chaincode function CreateVoterGroup.
 * @param {string} connectionProfilePath 
 * @param {string} walletPath 
 * @param {string} channelName 
 * @param {string} contractName
 * @param {string} id
 * @param {string} campaignID
 * @param {string} name
 * @param {string} username ID of user in wallet attempting to create campaign.
 */
async function createVoterGroup(connectionProfilePath, walletPath, channelName, contractName, id, campaignID, name, username) {
    try {
        // Create a new file system based wallet for managing identities.
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if user credentials exist in wallet.
        const userExists = await wallet.exists(username);
        if (!userExists) {
            console.log('User credentials with id: ' + username + ' do not exist in the wallet');
            return;
        }

        // Create a new gateway for connecting to peer node.
        const gateway = new Gateway();
        await gateway.connect(connectionProfilePath, { wallet, identity: username, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) that our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(contractName);

        // Submit the transaction.
        await contract.submitTransaction('CreateVoterGroup', id, campaignID, name);
        console.log('CreateVoterGroup transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit CreateVoterGroup transaction: ${error}`);
        process.exit(1);
    }
}

/**
 * Calls chaincode function QueryCampaignByID.
 * @param {string} connectionProfilePath 
 * @param {string} walletPath 
 * @param {string} username ID of user making call.
 * @param {string} channelName 
 * @param {string} contractName 
 * @param {string} idToQuery  ID of campaign to query.
 */
async function queryVoterGroupsByID(connectionProfilePath, walletPath, id, channelName, contractName, idToQuery) {

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
        const queryResult = await contract.evaluateTransaction('QueryVoterGroupsByID', idToQuery); // add s
        console.log('Query Success.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        return queryResult.toString();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

