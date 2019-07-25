/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 * 
 * This module provides necessary functions for submitting transactions through offline signing.
 */

'use strict';

module.exports = { getTransactionProposalDigest, submitSignedTransactionProposal, getCommitProposalDigest, submitSignedCommitProposal };

// const cryptoSigningModule = require('./cryptoSigning');
const offlineSigningGatewayModule = require('./offlineSigningGateway');

const fs = require('fs');
const path = require('path');

// const PRIVATE_KEY_PATH = path.resolve(__dirname, './wallet/kelvinfan/322b3214bd6e7c7c1b4713ed4374c174fd1cac21166cfef8e4f55f8933baf84e-priv');
// const PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

// const { FileSystemWallet } = require('fabric-network')

// /**
//  * 
//  * @param {*} connectionProfilePath 
//  * @param {*} userCertPEM 
//  * @param {*} walletPath 
//  * @param {object} transactionProposal
//  * @param {Response} res Response to send back to frontend caller
//  */
// async function submitTransaction(connectionProfilePath, userCertPEM, walletPath, transactionProposal) {
//     // Get connection profile
//     const ccpJSON = fs.readFileSync(connectionProfilePath, 'utf8');
//     const ccp = JSON.parse(ccpJSON);

//     // Retrieve channel and chaincode information from transaction proposal
//     const channelName = transactionProposal.channelID;
//     const contractName = transactionProposal.chaincodeId;

//     // Retrieve admin information from wallet
//     const wallet = new FileSystemWallet(walletPath);
//     const adminIdentity = await wallet.export('admin');
//     const adminKey = adminIdentity.privateKey;
//     const adminCertificate = adminIdentity.certificate;
//     const mspID = adminIdentity.mspId;

//     try {
//         /**
//          * Start endorsement step
//          */

//         // Get Channel instance
//         const channel = await offlineSigningGatewayModule.getChannel(connectionProfilePath, channelName, adminCertificate, adminKey, mspID);

//         // Get endorsement plan
//         var endorsementPlanPeerNames = await offlineSigningGatewayModule.getEndorsementPlanPeers(channel, contractName);
        
//         // Package the transaction proposal
//         const transactionProposalReq = transactionProposal;

//         // Generate an unsigned transaction proposal
//         const { proposal, txId } = channel.generateUnsignedProposal(transactionProposalReq, mspID, userCertPEM, false);

//         console.log(proposal.toBuffer());

//         // Sign the transaction proposal
//         // TODO: this will be done by app

//         const signedProposal = cryptoSigningModule.signProposal(proposal.toBuffer(), PRIVATE_KEY);

//         var targets = [];
//         for (var i = 0; i < endorsementPlanPeerNames.length; i++) {
//             targets.push(channel.getPeer(endorsementPlanPeerNames[i]));
//         }

//         // Send signed proposal
//         const sendSignedProposalReq = { signedProposal, targets };
//         const proposalResponses = await channel.sendSignedProposal(sendSignedProposalReq);

//         // Check if proposal got valid endorsement
//         if (proposalResponses[0].status != 200) {
//             throw new Error(proposalResponses[0]);
//         }

//         /**
//          * End endorsement step.
//          * Start commit transaction step.
//          */
        
//         const commitReq = {
//             proposalResponses,
//             proposal,
//         };

//         // Generate unsigned commit proposal
//         const commitProposal = channel.generateUnsignedTransaction(commitReq);

//         // Sign unsigned commit proposal
//         // TODO: this will be done by app
//         const signedCommitProposal = cryptoSigningModule.signProposal(commitProposal.toBuffer(), PRIVATE_KEY);

//         // Send signed transaction
//         const response = await channel.sendSignedTransaction({
//             signedProposal: signedCommitProposal,
//             request: commitReq,
//         });
//     } catch (error) {
//         console.error(`Failed to submit transaction: ${error}`);
//         process.exit(1);
//     }
// }

/**
 * Returns a Proposal type unsigned proposal.
 * @param {Channel} channel                     initialized Channel object
 * @param {string} userCertPEM                  certificate of user proposing transaction
 * @param {string} userMSPID                    ID of the MSD that user is registered with
 * @param {ProposalRequest} transactionProposal
 */
async function getTransactionProposalDigest(channel, userCertPEM, userMSPID, transactionProposal) {
    // // Get connection profile
    // const ccpJSON = fs.readFileSync(connectionProfilePath, 'utf8');
    // const ccp = JSON.parse(ccpJSON);

    // // Retrieve channel and chaincode information from transaction proposal
    // const channelName = transactionProposal.channelID;
    // const contractName = transactionProposal.chaincodeId;

    // Retrieve admin information from wallet
    // const wallet = new FileSystemWallet(walletPath);
    // const adminIdentity = await wallet.export('admin');
    // const adminKey = adminIdentity.privateKey;
    // const adminCertificate = adminIdentity.certificate;
    // const mspID = adminIdentity.mspId;

    try {
        /**
         * Start endorsement step
         */

        // // Get Channel instance
        // const channel = await offlineSigningGatewayModule.getChannel(connectionProfilePath, channelName, adminCertificate, adminKey, mspID);

        // Package the transaction proposal
        const transactionProposalReq = transactionProposal;

        // Generate an unsigned transaction proposal
        const { proposal, txId } = channel.generateUnsignedProposal(transactionProposalReq, userMSPID, userCertPEM, false);

        return proposal;

    } catch (error) {
        console.error(`Failed to generate transaction proposal digest: ${error}`);
        process.exit(1);
    }
}

/**
 * Submits a signed transaction proposal.
 * @param {Channel} channel 
 * @param {string} contractName 
 * @param {Proposal} signedTransactionProposal 
 */
async function submitSignedTransactionProposal(channel, contractName, signedTransactionProposal) {

    try {
        // Get endorsement plan
        var endorsementPlanPeerNames = await offlineSigningGatewayModule.getEndorsementPlanPeers(channel, contractName);

        // Connect to peers in the endorsement plan
        var targets = [];
        for (var i = 0; i < endorsementPlanPeerNames.length; i++) {
            targets.push(channel.getPeer(endorsementPlanPeerNames[i]));
        }

        // Send signed proposal
        const sendSignedProposalReq = { signedProposal: signedTransactionProposal, targets };
        const proposalResponses = await channel.sendSignedProposal(sendSignedProposalReq);

        console.log('right before logging proposal responses') // todo remove
        console.log(proposalResponses) // todo remove

        // Check if proposal got valid endorsement
        if (proposalResponses[0].status != 200) {
            throw new Error(proposalResponses[0]);
        }

        return proposalResponses;
    } catch (error) {
        console.error(`Failed to submit signed transaction proposal: ${error}`);
        process.exit(1); // TODO: maybe dont exit
    }
}

async function getCommitProposalDigest(channel, transactionProposalDigest, transactionProposalResponses) {
    
    try {
        const commitReq = {
            transactionProposalResponses,
            transactionProposalDigest,
        };

        // Generate unsigned commit proposal
        const commitProposal = channel.generateUnsignedTransaction(commitReq);

        return commitProposal;

    } catch (error) {
        console.error(`Failed to generate commit proposal digest: ${error}`);
        process.exit(1);
    }
}

async function submitSignedCommitProposal(channel, signedCommitProposal, transactionProposalResponses, transactionProposalDigest) {
    
    try {

        const commitReq = {
            transactionProposalResponses,
            transactionProposalDigest
        }

        const response = await channel.sendSignedTransaction({
            signedProposal: signedCommitProposal,
            request: commitReq,
        });

    } catch (error) {
        console.error(`Failed to submit signed commit proposal: ${error}`);
        process.exit(1);
    }
}
