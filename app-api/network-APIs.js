/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * API for app to interact with the Hyperledger Network.
 * 
 * !!CA TLS Certificate path MUST BE SET CORRECTLY IN CONNECTION PROFILE!!
 * 
 */

// Import required modules
const path = require('path');
const registrationEnrollmentModule = require('./utils/userEnrollment');
const signingModule = require('./utils/cryptoSigning');
const fetch = require('node-fetch');
const { FileSystemWallet } = require('fabric-network');
const io = require('socket.io-client');

// Set environment variables, all following variables modifiable
// TODO: Create a profile for doing this more modularly.
const walletPath = path.join(__dirname, 'wallet');
const caURL = "https://127.0.0.1:7054/";
const caTLSCACertsPath = "../libertas-dev-network/crypto-config/peerOrganizations/libertas.sipher.co/tlsca/tlsca.libertas.sipher.co-cert.pem";
const caName = "ca-sipher";
const apiServerURL = '127.0.0.1';

module.exports = { createAccount }

//---------------------------------------CREATE ACCOUNT FUNCTION-----------------------------------------------

async function createAccount(id, name, email, accountType, enrollmentSecret, mspID) {

    try {
        const wallet = new FileSystemWallet(walletPath);
        let userExists = await wallet.exists(id);
        if (!userExists) {
            // Enroll user (directly communicating with CA)
            await registrationEnrollmentModule.enrollUser(caURL, caTLSCACertsPath, caName, walletPath, id, enrollmentSecret, mspID);
        } else {
            console.log('Warning: User with id ' + id + ' already exists in wallet and enrolled with CA.');
        }

        // Prepare transaction proposal for creating account on chaincode
        const transactionProposal = {
            fcn: 'CreateAccount',
            args: [id, name, email, accountType],
        }
        // Submit transaction
        await submitTransaction(transactionProposal, id, mspID);

    } catch (error) {
        console.log(error);
    }
}

//------------------------------------SUBMIT TRANSACTION FUNCTIONS---------------------------------------------

/**
 * 
 * @param {Proposal Request} transactionProposal JSON object in Proposal format containing transaction details
 * @param {string}           id                  ID of user making transaction
 * @param {string}           mspID               MSP ID of user making transaction
 */
async function submitTransaction(transactionProposal, id, mspID) {
    // Get wallet instance and retrieve user cert and key
    const wallet = new FileSystemWallet(walletPath);
    const userIdentity = await wallet.export(id);
    const userCertificate = userIdentity.certificate;
    const userPrivateKey = userIdentity.privateKey;

    // Connect to server socket
    var submitTransactionSocket = await io.connect('http://' + apiServerURL + '/submitTransaction');
    submitTransactionSocket.on('connectionEstablished', async function () {
        // Send transaction proposal data
        submitTransactionSocket.emit('sendTransactionProposal', {
            transactionProposal: transactionProposal,
            userCertificate: userCertificate,
            mspID: mspID
        });
        // Handle if get transaction proposal digest error
        submitTransactionSocket.on('getTransactionProposalError', function (error) {
            console.log(error);
            submitTransactionSocket.disconnect();
        })
        // Receive unsigned transaction proposal digest, sign, send signed transaction proposal digest
        submitTransactionSocket.on('sendTransactionProposalDigest', async function (data) {
            const transactionProposalDigestBuffer = Buffer.from(data);

            // Sign transaction proposal
            const signedTransactionProposal = signingModule.signProposal(transactionProposalDigestBuffer, userPrivateKey);
            // Get signature
            const transactionProposalSignature = signedTransactionProposal.signature;

            // Send the signature back
            submitTransactionSocket.emit('sendTransactionProposalSignature', transactionProposalSignature);
            // Handle if submit transaction error
            submitTransactionSocket.on('submitTransactionError', function (error) {
                console.log(error);
                submitTransactionSocket.disconnect();
            })
            // Handle if get commit proposal error
            submitTransactionSocket.on('getCommitProposalError', function (error) {
                console.log(error);
                submitTransactionSocket.disconnect();
            })

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
                submitTransactionSocket.on('commitTransactionError', function (error) {
                    console.log(error);
                    submitTransactionSocket.disconnect();
                })
                submitTransactionSocket.disconnect();
                console.log('Transaction successfully submitted and completed.')
            })
        });
    });
}

//---------------------------------------ACCOUNT FUNCTIONS------------------------------------------------


/**
 * 
 * @param {string} username username for the user calling this function
 * @param {string} idToQuery username with respect to the query
 */
async function queryAccountByID(username, idToQuery) {
    let url = 'http://155.138.134.91/queryAccountByID?username=' + username + '&idToQuery=' + idToQuery;
    await fetch(url, {
        method: 'GET'
    }).then(function (res) {
        res.json().then(function (data) {
            console.log(data);
        })
    });
}

//-------------------------------------------CAMPAIGN FUNCTIONS--------------------------------------------
/**
 * 
 * @param {string} id 
 * @param {string} name name of the campaign
 * @param {string} campaignType 
 * @param {string} start start date for the campaign
 * @param {string} end end date fo rthe campaign
 * @param {string} username username for the user calling this function
 */
async function createCampaign(id, name, campaignType, startStr, endStr, username) {
    const transactionProposal = {
        fcn: 'CreateCampaign',
        args: [id, name, campaignType, start, end, username],
        chaincodeId: "libertas", // 
        channelId: "test" //
    }
    
    await fetch('http://155.138.134.91/submit', {
        method: 'POST',
        body: JSON.stringify({
            transactionProposal: transactionProposal
        }),
        headers: {
            // 'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    }).then(function (res) {
        res.text().then(function(text) {
            console.log(text);
        });
    }).catch(function (error) {
        console.log(error)
    });
}

/**
 * 
 * @param {string} username username for the user calling this function
 * @param {string} idToQuery username with respect to the query
 */
async function queryCampaignByID(username, idToQuery) {
    let url = 'http://155.138.134.91/queryCampaignByID?username=' + username + '&idToQuery=' + idToQuery;
    await fetch(url, {
        method: 'GET'
    }).then(function (res) {
        res.json().then(function (data) {
            console.log(data);
        })
    }).catch(function (error) {
        console.log(error)
    });
}

//----------------------------------------------------Voter Group Functions-------------------------------------
/**
 * 
 * @param {*} id 
 * @param {*} campaignID 
 * @param {*} name 
 * @param {*} username 
 */
async function createVoterGroup(id, campaignID, name, username) {
    const transactionProposal = {
        fcn: 'CreateVoterGroup',
        args: [id, campaignID, name, username],
        chaincodeId: "libertas", // 
        channelId: "test" //
    }
    
    await fetch('http://155.138.134.91/submit', {
        method: 'POST',
        body: JSON.stringify({
            transactionProposal: transactionProposal
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    }).then(function (res) {
        res.text().then(function(text) {
            console.log(text);
        });
    }).catch(function (error) {
        console.log(error)
    });
}

/**
 * 
 * @param {string} username username for the user calling this function
 * @param {string} idToQuery username with respect to the query
 */
async function queryVoterGroupsByID(username, idToQuery) {
    let url = 'http://155.138.134.91/queryVoterGroupsByID?username=' + username + '&idToQuery=' + idToQuery;
    await fetch(url, {
        method: 'GET'
    }).then(function (res) {
        res.json().then(function (data) {
            console.log(data);
        })
    }).catch(function (error) {
        console.log(error)
    });
}

//----------------------------------------------------TEST----------------------------------------------------
// Here are some sample API calls 

// Account: we create an instituion account 
// createAccount('ciudad5', 'Ciudad5', 'ciudad5@sipher.co', 'Institution');
// queryAccountByID('hello', 'hello');


// Campaign: using our institution account, we create a new campaign
var start = Date.parse('2019-7-16');
var end = Date.parse('2019-8-1');
var startStr = start.toString();
var endStr = end.toString();
// createCampaign('ciudad', 'Ciudad Election', 'Mayoral Election', startStr, endStr, 'ciudad');
// queryCampaignByID('ciudad10', 'ciudad10');


// Voter Group:
// createVoterGroup('ciudadVoterGroup', 'ciudad', 'Ciudad Voter Group', 'ciudad')
// queryVoterGroupsByID('ciudad', 'ciudadVoterGroup')