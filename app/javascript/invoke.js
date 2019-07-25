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

module.exports = {
    submit,
    evaluate
}
const {
    FileSystemWallet,
    Gateway
} = require('fabric-network');

async function submit(connectionProfilePath, walletPath, transactionProposal) {
    try {
        // Create a new file system based wallet for managing identities.
        const wallet = new FileSystemWallet(walletPath);


        // Check to see if user credentials exist in wallet.
        const username = transactionProposal.username
        const userExists = await wallet.exists(username);
        if (!userExists) {
            console.log('User credentials with id: ' + username + ' do not exist in the wallet');
            return;
        }

        // Create a new gateway for connecting to peer node.
        const gateway = new Gateway();
        await gateway.connect(connectionProfilePath, {
            wallet,
            identity: username,
            discovery: {
                enabled: true,
                asLocalhost: true
            }
        });

        // Get the network (channel) that our contract is deployed to.
        const network = await gateway.getNetwork(transactionProposal.channelId);

        // Get the contract from the network.
        const contract = network.getContract(transactionProposal.chaincodeId);

        // Submit the transaction.
        const args = [transactionProposal.fcn].concat(transactionProposal.args);
        const result = await contract.submitTransaction.apply(contract, args);
        // await contract.submitTransaction(transactionProposal.fcn, transactionProposal.args);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        return 'Success';
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

async function evaluate(connectionProfilePath, walletPath, transactionProposal) {
    try {
        // Create a new file system based wallet for managing identities.
        const wallet = new FileSystemWallet(walletPath);


        // Check to see if user credentials exist in wallet.
        const username = transactionProposal.username
        const userExists = await wallet.exists(username);
        if (!userExists) {
            console.log('User credentials with id: ' + username + ' do not exist in the wallet');
            return;
        }

        // Create a new gateway for connecting to peer node.
        const gateway = new Gateway();
        await gateway.connect(connectionProfilePath, {
            wallet,
            identity: username,
            discovery: {
                enabled: true,
                asLocalhost: true
            }
        });

        // Get the network (channel) that our contract is deployed to.
        const network = await gateway.getNetwork(transactionProposal.channelId);

        // Get the contract from the network.
        const contract = network.getContract(transactionProposal.chaincodeId);

        // Submit the transaction.
        const args = [transactionProposal.fcn].concat(transactionProposal.args);

        console.log(args)
        const queryResult = await contract.evaluateTransaction.apply(contract, args);
        console.log('Query Success.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        return queryResult.toString();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

// transactionProposal obj, ccp, wallet >> eventually need cert 