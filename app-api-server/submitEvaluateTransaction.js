/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 * 
 * This module provides necessary functions for submitting transactions through offline signing.
 */

'use strict';

module.exports = { getTransactionProposalDigest, submitSignedTransactionProposal, getCommitProposalDigest, submitSignedCommitProposal };

const offlineSigningGatewayModule = require('../../api-http-server/offlineSigningGateway');

/**
 * Returns a Proposal type unsigned proposal for transaction.
 * @param {Channel}         channel              initialized Channel object
 * @param {string}          userCertPEM          certificate of user proposing transaction
 * @param {string}          userMSPID            ID of the MSD that user is registered with
 * @param {ProposalRequest} transactionProposal  a JSON with keys 'fnc' and 'args'
 * @returns {Proposal}                           a Proposal object
 */
async function getTransactionProposalDigest(channel, userCertPEM, userMSPID, transactionProposal) {

    try {
        // Generate an unsigned transaction proposal
        const { proposal, txId } = channel.generateUnsignedProposal(transactionProposal, userMSPID, userCertPEM, false);

        return proposal;

    } catch (error) {
        console.error(`Failed to generate transaction proposal digest: ${error}`);
        return `Failed to generate transaction proposal digest: ${error}`;
    }
}

/**
 * Submits a signed transaction proposal.
 * @param   {Channel}    channel                   an initialized Channel object
 * @param   {string}     contractName     
 * @param   {Proposal}   signedTransactionProposal signed transaction proposal
 * @returns {Response}   
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

        // Check if proposal got valid endorsement
        if (proposalResponses[0].response) {
            if (proposalResponses[0].response.status != 200) {
                throw new Error("Proposal response status not 200!");
            }
        } else {
            // Only reached if no response at all
            throw new Error(proposalResponses[0]);
        }

        return proposalResponses;

    } catch (error) {
        console.error(`Failed to submit signed transaction proposal: ${error}`);
        return `Failed to submit signed transaction proposal: ${error}`
    }
}

/**
 * Returns a Proposal type unsigned proposal for commit.
 * @param  {Channel}  channel                      an initialized Channel object
 * @param  {Proposal} transactionProposalDigest    an unsigned transaction proposal
 * @param  {Response} transactionProposalResponses transaction proposal responses
 * @return {Proposal}
 */
async function getCommitProposalDigest(channel, transactionProposalDigest, transactionProposalResponses) {

    try {
        const commitReq = {
            proposalResponses: transactionProposalResponses,
            proposal: transactionProposalDigest,
        };

        // Generate unsigned commit proposal
        const commitProposal = channel.generateUnsignedTransaction(commitReq);

        return commitProposal;

    } catch (error) {
        console.error(`Failed to generate commit proposal digest: ${error}`);
        return `Failed to generate commit proposal digest: ${error}`;
    }
}

/**
 * Submits a signed commit proposal.
 * @param  {Channel}  channel                      an initialized Channel object
 * @param  {Proposal} signedCommitProposal         signed commit proposal
 * @param  {Response} transactionProposalResponses transaction proposal responses
 * @param  {Proposal} transactionProposalDigest    unsigned transaction proposal
 * @return {Response}
 */
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

        return response;

    } catch (error) {
        console.error(`Failed to submit signed commit proposal: ${error}`);
        return `Failed to submit signed commit proposal: ${error}`;
    }
}
