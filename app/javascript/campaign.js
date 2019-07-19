/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 * 
 * This module deals with frontend JavaScript calls related to campaigns.
 */

'use strict';

module.exports = {createCampaign, queryCampaignByID}

const { FileSystemWallet, Gateway } = require('fabric-network');

/**
 * Calls chaincode function CreateCampaign.
 * @param {*} connectionProfilePath 
 * @param {*} walletPath 
 * @param {*} channelName 
 * @param {*} contractName 
 * @param {*} id 
 * @param {*} name 
 * @param {*} campaignType 
 * @param {string} start 
 * @param {string} end 
 * @param {*} username ID of user in wallet attemptign to create campaign.
 */
async function createCampaign(connectionProfilePath, walletPath, channelName, contractName, id, name, campaignType, start, end, username) {

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
        await contract.submitTransaction('CreateCampaign', id, name, campaignType, start, end);
        console.log('CreateCampaign transaction has been submitted');

        // Disconnect from the gateway.
        console.log('NOT YET!')
        await gateway.disconnect();
        console.log('ALL DONE!')
    } catch (error) {
        console.error(`Failed to submit CreateCampaign transaction: ${error}`);
        process.exit(1);
    }
}

/**
 * Calls chaincode function QueryCampaignByID.
 * @param {string} connectionProfilePath 
 * @param {string} walletPath 
 * @param {string} id ID of user making call.
 * @param {string} channelName 
 * @param {string} contractName 
 * @param {string} idToQuery  ID of campaign to query.
 */
async function queryCampaignByID(connectionProfilePath, walletPath, id, channelName, contractName, idToQuery) {

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
        const queryResult = await contract.evaluateTransaction('QueryCampaignByID', idToQuery);
        console.log('Query Success.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        return queryResult.toString();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}