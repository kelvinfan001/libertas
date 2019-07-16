/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 * 
 * This module deals with frontend JavaScript calls related to campaigns.
 */

'use strict';

module.exports = {createCampaign}

import { FileSystemWallet, Gateway } from "fabric-network";

/**
 * 
 * @param {*} connectionProfilePath 
 * @param {*} walletPath 
 * @param {*} channelName 
 * @param {*} contractName 
 * @param {*} id 
 * @param {*} name 
 * @param {*} kind 
 * @param {string} start 
 * @param {string} end 
 * @param {*} username 
 */
async function createCampaign(connectionProfilePath, walletPath, channelName, contractName, id, name, kind, start, end, username) {

    try {
        // Create a new file system based wallet for managing identities.
        const walet = new FileSystemWallet(walletPath);

        // Check to see if user credentials exist in wallet.
        const userExists = await wallet.exists(username);
        if (!userExists) {
            console.log('User credentials with id: ' + id + ' do not exist in the wallet');
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
        await contract.submitTransaction('CreateCampaign', id, name, kind, start, end);
        console.log('CreateCampaign transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit CreateCampaign transaction: ${error}`);
        process.exit(1);
    }
}