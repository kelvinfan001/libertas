/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * API for app to interact with the Hyperledger Network.
 */

// Import required modules
const path = require('path');
const registrationEnrollmentModule = require('./utils/userEnrollment');
const signingModule = require('./utils/cryptoSigning');
const fetch = require('node-fetch');
const { FileSystemWallet } = require('fabric-network');
const io = require('socket.io-client');

// Set environment variables for connecting with API Server and CA, all following variables modifiable
const walletPath = path.join(__dirname, 'wallet');
// const caURL = "https://155.138.134.91:7054/";
// const caTLSCACertsPath = "../tlsca.libertas.sipher.co-cert.pem";
// const caName = "ca-sipher";
// const apiServerURL = '155.138.134.91';

// The following for local testing
const caURL = "https://127.0.0.1:7054/";
const caTLSCACertsPath = "../libertas-dev-network/crypto-config/peerOrganizations/libertas.sipher.co/tlsca/tlsca.libertas.sipher.co-cert.pem";
const caName = "ca-sipher";
const apiServerURL = '127.0.0.1'

module.exports = { createAccount, queryAccountByID, editAccountByID }

//---------------------------------------ACCOUNT FUNCTIONS----------------------------------------------

/**
 * Creates an account on chaincode. 
 * @param {string} id 
 * @param {string} name 
 * @param {string} email 
 * @param {string} accountType 
 * @param {string} enrollmentSecret 
 * @param {string} mspID 
 */
async function createAccount(id, name, email, accountType, enrollmentSecret, mspID) {

    try {
        const wallet = new FileSystemWallet(walletPath);
        let userExists = await wallet.exists(id);
        if (!userExists) {
            // Enroll user (directly communicating with CA)
            await registrationEnrollmentModule.enrollUser(caURL, caTLSCACertsPath, caName, walletPath, id, enrollmentSecret, mspID);
        } else {
            console.warn('Warning: User with id ' + id + ' already exists in wallet and enrolled with CA.');
        }
        // Prepare transaction proposal for creating account on chaincode
        const transactionProposal = {
            fcn: 'CreateAccount',
            args: [id, name, email, accountType],
        }
        // Submit transaction
        await submitTransaction(transactionProposal, id, mspID);

    } catch (error) {
        console.error(error);
    }
}

/**
 * Returns the account with ID.
 * @param {string} idToQuery
 * @param {string} userID
 * @param {string} mspID
 */
async function queryAccountByID(idToQuery) {
    
    try {
         // Prepare transaction proposal for querying account by id on chaincode
        const transactionProposal = {
            fcn: 'QueryAccountByID',
            args: [idToQuery]
        }
        let response = await evaluateTransactionUnsigned(transactionProposal);
        return response;

    } catch (error) {
        console.error(error);
     }
}

async function editAccountByID(accountID, field, value, mspID) {

    try {
        // Prepare trnasaction proposal for editting account by id on chaincode
        const transactionProposal = {
            fcn: 'EditAccountByID',
            args: [accountID, field, value]
        }
        // Submit transaction
        await submitTransaction(transactionProposal, accountID, mspID);

    } catch (error) {
        console.error(error);
    }
}

//------------------------------------SUBMIT TRANSACTION FUNCTIONS---------------------------------------------

/**
 * Sign transaction and commit proposal with id's private key offline and submit transaction.
 * Return proposal responses payload.
 * @param  {Proposal Request} transactionProposal JSON object in Proposal format containing transaction details
 * @param  {string}           id                  ID of user making transaction
 * @param  {string}           mspID               MSP ID of user making transaction
 * @return {string}                               Payload of transaction response
 */
async function submitTransaction(transactionProposal, id, mspID) {

    // Get wallet instance and retrieve user cert and key
    const wallet = new FileSystemWallet(walletPath);
    const userIdentity = await wallet.export(id);
    const userCertificate = userIdentity.certificate;
    const userPrivateKey = userIdentity.privateKey;

    // Returns transaction proposal payload as a promise
    return new Promise((resolve, reject) => {
        // Connect to server socket
        var submitTransactionSocket = io.connect('http://' + apiServerURL + '/submitTransaction');
        submitTransactionSocket.on('connectionEstablished', async function () {
            // Send transaction proposal data
            submitTransactionSocket.emit('sendTransactionProposal', {
                transactionProposal: transactionProposal,
                userCertificate: userCertificate,
                mspID: mspID
            });

            // Receive unsigned transaction proposal digest, sign, send signed transaction proposal digest
            submitTransactionSocket.on('sendTransactionProposalDigest', async function (data) {
                const transactionProposalDigestBuffer = Buffer.from(data);

                // Sign transaction proposal
                const signedTransactionProposal = signingModule.signProposal(transactionProposalDigestBuffer, userPrivateKey);
                // Get signature
                const transactionProposalSignature = signedTransactionProposal.signature;

                // Send the signature back
                submitTransactionSocket.emit('sendTransactionProposalSignature', transactionProposalSignature);

                // Receive unsigned commit proposal digest, sign, send signed commit proposal digest
                submitTransactionSocket.on('sendCommitProposalDigest', async function (data) {
                    const commitProposalDigestBuffer = Buffer.from(data);

                    // Sign commit proposal
                    const signedCommitProposal = signingModule.signProposal(commitProposalDigestBuffer, userPrivateKey);
                    // Get signature
                    const commitProposalSignature = signedCommitProposal.signature;

                    // Send the signature back
                    submitTransactionSocket.emit('sendCommitProposalSignature', commitProposalSignature);
                    // Handle if commit transaction error
                    submitTransactionSocket.on('submitTransactionErrors', function (error) {
                        submitTransactionSocket.disconnect();
                        reject(error);
                    });
                });
            });
        });
        // Receive transaction response payload
        submitTransactionSocket.on('sendTransactionPayload', function (payload) {
            submitTransactionSocket.disconnect();
            console.log('Transaction successfully submitted and committed.');
            resolve(payload);
        });
        // Deal with any errors emitted by socket
        submitTransactionSocket.on('submitTransactionErrors', function (error) {
            submitTransactionSocket.disconnect();
            reject(error);
        })
    });
}

//------------------------------------EVALUATE TRANSACTION FUNCTIONS---------------------------------------------

/**
 * Sign transaction proposal with id's private key offline and evaluate transaction.
 * Communicates through socket. 
 * Return proposal responses payload.
 * @param  {Proposal Request} transactionProposal JSON object in Proposal format containing transaction details
 * @param  {string}           id                  ID of user making transaction
 * @param  {string}           mspID               MSP ID of user making transaction
 * @return {string}                               Payload of transaction response
 */
async function evaluateTransactionSigned(transactionProposal, id, mspID) {

    // Get wallet instance and retrieve user cert and key
    const wallet = new FileSystemWallet(walletPath);
    const userIdentity = await wallet.export(id);
    const userCertificate = userIdentity.certificate;
    const userPrivateKey = userIdentity.privateKey;

    // Returns transaction proposal payload as a promise
    return new Promise((resolve, reject) => {
        // Connect to server socket
        var evaluateTransactionSocket = io.connect('http://' + apiServerURL + '/evaluateTransaction');
        evaluateTransactionSocket.on('connectionEstablished', async function () {
            // Send transaction proposal data
            evaluateTransactionSocket.emit('sendTransactionProposal', {
                transactionProposal: transactionProposal,
                userCertificate: userCertificate,
                mspID: mspID
            });

            // Receive unsigned transaction proposal digest, sign, send signed transaction proposal digest
            evaluateTransactionSocket.on('sendTransactionProposalDigest', async function (data) {
                const transactionProposalDigestBuffer = Buffer.from(data);

                // Sign transaction proposal
                const signedTransactionProposal = signingModule.signProposal(transactionProposalDigestBuffer, userPrivateKey);
                // Get signature
                const transactionProposalSignature = signedTransactionProposal.signature;

                // Send the signature back
                evaluateTransactionSocket.emit('sendTransactionProposalSignature', transactionProposalSignature);

                // Handle error
                evaluateTransactionSocket.on('evaluateTransactionErrors', function (error) {
                    evaluateTransactionSocket.disconnect();
                    reject(error);
                });
            });
        });
        // Receive transaction response payload
        evaluateTransactionSocket.on('sendTransactionPayload', function (payload) {
            evaluateTransactionSocket.disconnect();
            resolve(payload);
        });
        // Deal with any errors emitted by socket
        evaluateTransactionSocket.on('submitTransactionErrors', function (error) {
            evaluateTransactionSocket.disconnect();
            reject(error);
        })
    });
}

/**
 * Post transaction proposal to server for server to evaluate the transaction (as admin on behalf of user).
 * Communicates through fetch.
 * Return proposal responses payload.
 * @param  {Proposal Request} transactionProposal JSON object in Proposal format containing transaction details
 * @return {string}                               Payload of transaction response
 */
async function evaluateTransactionUnsigned(transactionProposal) {
    let url = 'http://' + apiServerURL + '/evaluateTransactionFetch';

    return new Promise(async (resolve, reject) => {
        await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                transactionProposal: transactionProposal
            }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        }).then(function (res) {
            res.text().then(function (text) {
                resolve(text);
            });
        }).catch(function (error) {
            reject(error);
        });
    });
}