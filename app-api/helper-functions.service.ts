import { Injectable } from '@angular/core';

    // Import required modules
const path = require('path');
const signingModule = require('./utils/cryptoSigning');
const fetch = require('node-fetch');
const { FileSystemWallet } = require('fabric-network');
const io = require('socket.io-client');

// Set environment variables for connecting with API Server and CA, all following variables modifiable
const walletPath = path.join(__dirname, 'wallet');
const proxyurl = 'https://cors-anywhere.herokuapp.com/';
const apiServerURL = '155.138.134.91';

@Injectable()
export class HelperFunctionService {
    //-----------------------SUBMIT TRANSACTION FUNCTIONS---------------------------

/**
 * Sign transaction and commit proposal with id's private key offline and submit transaction.
 * Return proposal responses payload.
 * @param  {Proposal Request} transactionProposal JSON object in Proposal format containing transaction details
 * @param  {string}           id                  ID of user making transaction
 * @param  {string}           mspID               MSP ID of user making transaction
 * @return {string}                               Payload of transaction response
 */
async submitTransaction(transactionProposal, id) {

    // Get wallet instance and retrieve user cert and key
    const wallet = new FileSystemWallet(walletPath);
    const userIdentity = await wallet.export(id);
    const userCertificate = userIdentity.certificate;
    const userPrivateKey = userIdentity.privateKey;
    const mspID = userIdentity.mspId;

    // Returns transaction proposal payload as a promise
    return new Promise((resolve, reject) => {
        // Connect to server socket
        var submitTransactionSocket = io.connect(proxyurl + 'http://' + apiServerURL + '/submitTransaction');
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
                const signedTransactionProposal = signingModule.signProposal(transactionProposalDigestBuffer,
                    userPrivateKey);
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

    //------------------------EVALUATE TRANSACTION FUNCTIONS------------------------

    /**
     * Sign transaction proposal with id's private key offline and evaluate transaction.
     * Communicates through socket. 
     * Return proposal responses payload.
     * @param  {Proposal Request} transactionProposal JSON object in Proposal format containing transaction details
     * @param  {string}           id                  ID of user making transaction
     * @param  {string}           mspID               MSP ID of user making transaction
     * @return {string}                               Payload of transaction response
     */
    async evaluateTransactionSigned(transactionProposal, id, mspID) {

        // Get wallet instance and retrieve user cert and key
        const wallet = new FileSystemWallet(walletPath);
        const userIdentity = await wallet.export(id);
        const userCertificate = userIdentity.certificate;
        const userPrivateKey = userIdentity.privateKey;

        // Returns transaction proposal payload as a promise
        return new Promise((resolve, reject) => {
            // Connect to server socket
            var evaluateTransactionSocket = io.connect(proxyurl + 'http://' + apiServerURL + '/evaluateTransaction');
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
                    const signedTransactionProposal = signingModule.signProposal(transactionProposalDigestBuffer,
                        userPrivateKey);
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
    async  evaluateTransactionUnsigned(transactionProposal) {
        let url = proxyurl + 'http://' + apiServerURL + '/evaluateTransactionFetch';

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

}
