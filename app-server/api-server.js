/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * API server for making calls to chaincode on behalf of client app.
 */

// Import required modules
const path = require('path');
const express = require('express');

// Set up server and socket
const router = express();
var server = require('http').Server(router);
var io = require('socket.io')(server);
const submitEvaluateModule = require('./submitEvaluateTransaction');
const offlineSigningGatewayModule = require('./offlineSigningGateway');
const { FileSystemWallet } = require('fabric-network')

// Environment variables
const chaincodeID = 'libertas';
const channelID = 'test';
const connectionProfilePath = path.resolve(__dirname, '..', 'libertas-dev-network', 'connection-sipher.json');
const walletPath = path.join(__dirname, 'tests', 'wallet');

// JSON parser 
router.use(express.urlencoded({
    extended: false
})).use(express.json());

async function main() {
    // Retrieve admin information from wallet. User identity is required for connecting to channel.
    // This should not be required since we are doing offline signing; this is a design issue by fabric node SDK.
    const wallet = new FileSystemWallet(walletPath);
    let adminIdentity = await wallet.export('admin');
    const adminKey = adminIdentity.privateKey;
    const adminCertificate = adminIdentity.certificate;
    const adminMSPID = adminIdentity.mspId;

    server.listen(80, () => console.log("Listening on port 80"));

    //---------------------------------------SUBMIT TRANSACTION SOCKET-----------------------------------------------

    var submitTransactionSocket = io.of('/submitTransaction').on('connection', function (socket) {
        socket.emit('connectionEstablished', 'Connection established');
        socket.on('sendTransactionProposal', async function (data) {
            // Retrieve values from transaction request and fill in TransactionProposal object
            const transactionProposal = data.transactionProposal;
            const userCertificate = data.userCertificate;
            const userMSPID = data.mspID;
            transactionProposal.chaincodeId = chaincodeID;
            transactionProposal.channelId = channelID;

            // Get channel object
            let channel = await offlineSigningGatewayModule.getChannel(connectionProfilePath, channelID, adminCertificate, adminKey, adminMSPID);

            // Get unsigned transaction proposal digest
            let transactionProposalDigest = await submitEvaluateModule.getTransactionProposalDigest(channel, userCertificate, userMSPID, transactionProposal);
            // Check if get transaction propsal is error
            if (typeof transactionProposalDigest == "string") {
                socket.emit('getTransactionProposalError', transactionProposalDigest);
                socket.disconnect();
                return;
            }
            let transactionProposalDigestBuffer = transactionProposalDigest.toBuffer();

            // Send unsigned transaction proposal digest back to client as Buffer
            socket.emit('sendTransactionProposalDigest', transactionProposalDigestBuffer);

            socket.on('sendTransactionProposalSignature', async function (data) {
                // Retrieve the signature for transaction proposal
                const transactionProposalSignature = data;
                // Package signed transaction proposal
                const signedTransactionProposal = {
                    signature: transactionProposalSignature,
                    proposal_bytes: transactionProposalDigestBuffer
                }

                // Submit signed transaction proposal
                let transactionProposalResponses = await submitEvaluateModule.submitSignedTransactionProposal(channel, chaincodeID, signedTransactionProposal);
            
                // Check if transaction propsal response is error
                if (typeof transactionProposalResponses == "string") {
                    socket.emit('submitTransactionError', transactionProposalResponses);
                    socket.disconnect();
                    return;
                }

                // If no error, get transaction response payload
                let payload = transactionProposalResponses[0].response.payload;

                // Get commit prposal digest
                let commitProposalDigest = await submitEvaluateModule.getCommitProposalDigest(channel, transactionProposalDigest, transactionProposalResponses);

                // Check if failed to get commit proposal
                if (typeof commitProposalDigest == "string") {
                    socket.emit('getCommitProposalError', commitProposalDigest);
                    socket.disconnect();
                    return;
                }
                let commitProposalDigestBuffer = commitProposalDigest.toBuffer();

                // Send unsigned commit proposal digest to client as Buffer
                socket.emit('sendCommitProposalDigest', commitProposalDigestBuffer);

                socket.on('sendCommitProposalSignature', async function (data) {
                    // Retrieve the signature for commit proposal
                    const commitProposalSignature = data;
                    // Package signed commit proposal
                    const signedCommitProposal = {
                        signature: commitProposalSignature,
                        proposal_bytes: commitProposalDigestBuffer
                    }

                    // Submit signed commit proposal
                    let commitProposalResponses = await submitEvaluateModule.submitSignedCommitProposal(channel, signedCommitProposal, transactionProposalResponses, transactionProposalDigest);

                    // Check if commit propsal response is error
                    if (typeof commitProposalResponses == "string") {
                        socket.emit('commitTransactionError', commitProposalResponses);
                        socket.disconnect();
                        return;
                    }
                    
                    // Send transaction response payload to client
                    socket.emit('sendTransactionPayload', payload);

                    console.log('Transaction successfully submitted and committed.');
                })
            })
        });
    });
}

main();
