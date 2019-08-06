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

    //----------------------SUBMIT TRANSACTION SOCKET---------------------------

    let submitTransactionSocket = io.of('/submitTransaction').on('connection', function (socket) {
        socket.emit('connectionEstablished', 'Connection established');
        socket.on('sendTransactionProposal', async function (data) {
            // Retrieve values from transaction request and fill in TransactionProposal object
            const transactionProposal = data.transactionProposal;
            const userCertificate = data.userCertificate;
            const userMSPID = data.mspID;
            transactionProposal.chaincodeId = chaincodeID;
            transactionProposal.channelId = channelID;

            try {
                // Get channel object
                let channel = await offlineSigningGatewayModule.getChannel(connectionProfilePath, channelID,
                    adminCertificate, adminKey, adminMSPID);

                // Get unsigned transaction proposal digest
                let transactionProposalDigest = await submitEvaluateModule.getTransactionProposalDigest(channel,
                    userCertificate, userMSPID, transactionProposal);
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
                    let transactionProposalResponses =
                        await submitEvaluateModule.submitSignedTransactionProposal(channel, chaincodeID,
                            signedTransactionProposal);

                    // Check if transaction propsal response is error
                    if (typeof transactionProposalResponses == "string") {
                        socket.emit('submitTransactionErrors', transactionProposalResponses);
                        socket.disconnect();
                        return;
                    }

                    // If no error, get transaction response payload from one of the responses (first one)
                    let payload = transactionProposalResponses[0].response.payload;

                    // Get commit prposal digest
                    let commitProposalDigest = await submitEvaluateModule.getCommitProposalDigest(channel,
                        transactionProposalDigest, transactionProposalResponses);

                    // Check if failed to get commit proposal
                    if (typeof commitProposalDigest == "string") {
                        socket.emit('submitTransactionErrors', commitProposalDigest);
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
                        let commitProposalResponses = await submitEvaluateModule.submitSignedCommitProposal(channel,
                            signedCommitProposal, transactionProposalResponses, transactionProposalDigest);

                        // Check if commit propsal response is error
                        if (typeof commitProposalResponses == "string") {
                            socket.emit('submitTransactionErrors', commitProposalResponses);
                            socket.disconnect();
                            return;
                        }

                        // Send transaction response payload to client only if transaction was successfully committed
                        socket.emit('sendTransactionPayload', payload);
                        console.log('Transaction successfully submitted and committed.');
                    });
                });
            } catch (error) {
                console.error(error);
                socket.emit('submitTransactionErrors', error.toString());
                return;
            }
        });
    });

    //----------------------EVALUATE TRANSACTION SOCKET-------------------------

    let evaluateTransactionSocket = io.of('/evaluateTransaction').on('connection', function (socket) {
        socket.emit('connectionEstablished', 'Connection established');
        socket.on('sendTransactionProposal', async function (data) {
            // Retrieve values from transaction request and fill in TransactionProposal object
            const transactionProposal = data.transactionProposal;
            const userCertificate = data.userCertificate;
            const userMSPID = data.mspID;
            transactionProposal.chaincodeId = chaincodeID;
            transactionProposal.channelId = channelID;

            try {
                // Get channel object
                let channel = await offlineSigningGatewayModule.getChannel(connectionProfilePath, channelID,
                    adminCertificate, adminKey, adminMSPID);

                // Get unsigned transaction proposal digest
                let transactionProposalDigest = await submitEvaluateModule.getTransactionProposalDigest(channel,
                    userCertificate, userMSPID, transactionProposal);
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
                    let transactionProposalResponses =
                        await submitEvaluateModule.submitSignedTransactionProposal(channel, chaincodeID,
                            signedTransactionProposal);

                    // Check if transaction propsal response is error
                    if (typeof transactionProposalResponses == "string") {
                        socket.emit('evaluateTransactionErrors', transactionProposalResponses);
                        socket.disconnect();
                        return;
                    }

                    // If no error, get transaction response payload from one of the responses (first one)
                    let payload = transactionProposalResponses[0].response.payload;

                    // Send transaction response payload to client only if transaction had no errors
                    socket.emit('sendTransactionPayload', payload);
                    console.log('Transaction succesfully evaluated.')
                })
            } catch (error) {
                console.error(error);
                socket.emit('evaluateTransactionErrors', error.toString());
                return
            }
        });
    });

    router.post('/evaluateTransactionFetch', async function (req, res) {
        // Retrieve values from transaction proposal request
        const transactionProposal = req.body.transactionProposal;

        try {
            // Get channel object
            let channel = await offlineSigningGatewayModule.getChannel(connectionProfilePath, channelID,
                adminCertificate, adminKey, adminMSPID);

            // Get endorsement plan
            let endorsementPlanPeerNames = await offlineSigningGatewayModule.getEndorsementPlanPeers(channel,
                chaincodeID);

            // Target peers in the endorsement plan
            let targets = [];
            for (let i = 0; i < endorsementPlanPeerNames.length; i++) {
                targets.push(channel.getPeer(endorsementPlanPeerNames[i]));
            }

            // Package chaincode invoke request
            let chaincodeInvokeRequest = {
                targets: targets,
                chaincodeId: chaincodeID,
                fcn: transactionProposal.fcn,
                args: transactionProposal.args
            }

            // Get responses from peers
            let queryResponses = await channel.queryByChaincode(chaincodeInvokeRequest, true);

            // Check for errors. Note: queryResponses[i] could either be Error or Payload
            for (let i = 0; i < queryResponses.length; i++) {
                if (queryResponses[i].message) { // If is Error, must have message field
                    throw queryResponses[i];
                }
            }

            res.send(queryResponses[0]);
            console.log("Transaction successfully evaluated");

        } catch (error) {
            console.error(error.message);
            res.send(error.message);
        }
    });
}

main();
