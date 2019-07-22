/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 * 
 * This module allows the app to invoke chaincall calls.
 */

'use strict';

// TransactionProposal {
//     fcn:
//     args: []
//     chaincodeId: 
//     channelId:   
// }

module.exports = {submit, evaluate}
const { FileSystemWallet, Gateway } = require('fabric-network');

async function submit(connectionProfilePath, walletPath, transactionProposal) {
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
        await contract.submitTransaction(transactionProposal.fcn, transactionProposal.args);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

function evaluate() {
    
}

// transactionProposal obj, ccp, wallet >> eventually need cert 