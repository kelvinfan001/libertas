/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 * 
 * This module deals with frontend JavaScript calls related to accounts.
 */

'use strict';

module.exports = { submitTransaction };

const cryptoSigningModule = require('./cryptoSigning');
const offlineSigningGatewayModule = require('./offlineSigningGateway');

const fs = require('fs');
const path = require('path');

const PRIVATE_KEY_PATH = path.resolve(__dirname, './wallet/kelvinfan/322b3214bd6e7c7c1b4713ed4374c174fd1cac21166cfef8e4f55f8933baf84e-priv');
const PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

const { FileSystemWallet } = require('fabric-network')

/**
 * 
 * @param {*} connectionProfilePath 
 * @param {*} userCertPEM 
 * @param {*} walletPath 
 * @param {object} transactionProposal 
 */
async function submitTransaction(connectionProfilePath, userCertPEM, walletPath, transactionProposal) {
    // Get connection profile
    const ccpJSON = fs.readFileSync(connectionProfilePath, 'utf8');
    const ccp = JSON.parse(ccpJSON);

    // Retrieve channel and chaincode information from transaction proposal
    const channelName = transactionProposal.channelID;
    const contractName = transactionProposal.chaincodeId;

    // Retrieve admin information from wallet
    const wallet = new FileSystemWallet(walletPath);
    const adminIdentity = await wallet.export('admin');
    const adminKey = adminIdentity.privateKey;
    const adminCertificate = adminIdentity.certificate;
    const mspID = adminIdentity.mspId;

    try {
        /**
         * Start endorsement step
         */

        // Get Channel instance
        const channel = await offlineSigningGatewayModule.getChannel(connectionProfilePath, channelName, adminCertificate, adminKey, mspID);

        // Get endorsement plan
        var endorsementPlanPeerNames = await offlineSigningGatewayModule.getEndorsementPlanPeers(channel, contractName);
        
        // Package the transaction proposal
        const transactionProposalReq = transactionProposal;

        // Generate an unsigned transaction proposal
        const { proposal, txId } = channel.generateUnsignedProposal(transactionProposalReq, mspID, userCertPEM, false);

        // Sign the transaction proposal
        // TODO: this will be done by app
        const signedProposal = cryptoSigningModule.signProposal(proposal.toBuffer(), PRIVATE_KEY);

        var targets = [];
        for (var i = 0; i < endorsementPlanPeerNames.length; i++) {
            targets.push(channel.getPeer(endorsementPlanPeerNames[i]));
        }

        // Send signed proposal
        const sendSignedProposalReq = { signedProposal, targets };
        const proposalResponses = await channel.sendSignedProposal(sendSignedProposalReq);

        // Check if proposal got valid endorsement
        if (proposalResponses[0].status != 200) {
            throw new Error(proposalResponses[0]);
        }

        /**
         * End endorsement step.
         * Start commit transaction step.
         */
        
        const commitReq = {
            proposalResponses,
            proposal,
        };

        // Generate unsigned commit proposal
        const commitProposal = channel.generateUnsignedTransaction(commitReq);

        // Sign unsigned commit proposal
        // TODO: this will be done by app
        const signedCommitProposal = cryptoSigningModule.signProposal(commitProposal.toBuffer(), PRIVATE_KEY);

        // Send signed transaction
        const response = await channel.sendSignedTransaction({
            signedProposal: signedCommitProposal,
            request: commitReq,
        });
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}