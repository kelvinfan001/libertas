/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * API for app to interact with the Hyperledger Network.
 */

// Import required modules
const path = require('path');
const registrationEnrollmentModule = require('../api-http-server/registrationEnrollment');
const signingModule = require('./cryptoSigning');
const fetch = require('node-fetch');
const { FileSystemWallet } = require('fabric-network');

// Set environment variables
const connectionProfilePath = path.resolve(__dirname, 'connection-sipher.json');
const walletPath = path.join(__dirname, 'wallet'); // TODO: this could be modified.
const caDomain = "ca.libertas.sipher.co";
const apiServerURL = '127.0.0.1';

module.exports = {createAccount}


//---------------------------------------ACCOUNT FUNCTIONS------------------------------------------------

/**
 * 
 * @param {string} id          the id to be registered with the certifate authority (same as enrollmentID)
 * @param {string} name 
 * @param {string} email 
 * @param {string} accountType may be 'Personal' or 'Institution'. This is preset at registration.
 * @param {string} affiliation preset affiliation for new account
 * @param {string} enrollmentSecret
 * @param {string} mspID // TODO tis tricky. lots of hard coding going on rn   ALWAYS USE 'SipherMSP' for now.
 */
async function createAccount(id, name, email, accountType, enrollmentSecret, mspID) {
    
    // // Register user (directly communicating with CA)
    // registrationEnrollmentModule.enrollUser(connectionProfilePath, walletPath, caDomain, id, enrollmentSecret, mspID);

    // console.log('Enrollment step complete.')
    
    // Get wallet instance and retrieve user cert and key
    const wallet = new FileSystemWallet(walletPath);
    const userIdentity = wallet.export(id);
    const userCertificate = userIdentity.certificate;
    const userPrivateKey = userIdentity.privateKey;

    // Create account on chaincode
    const transactionProposal = {
        fcn: 'CreateAccount',
        args: [id, name, email, accountType],
    }

    let url = 'http://' + apiServerURL + '/getTransactionProposalDigest';
    await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            transactionProposal: transactionProposal,
            userCertificate: userCertificate,
            mspID: mspID
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    }).then(function (res) {
        res.arrayBuffer().then(function (arrayBuffer) {
            const transactionProposalDigest = arrayBuffer; //? not sure if res.text() works
            console.log(transactionProposalDigest)
        });
    }).catch(function (error) {
        console.log(error);
    });

    const transactionProposalDigestBytes = new Buffer(transactionProposalDigest);
    // Sign transaction proposal
    const signedTransactionProposal = signingModule.signProposal(transactionProposalDigestBytes, userPrivateKey);

    // Submit signed transaction proposal
    url = 'http://' + apiServerURL + '/submitSignedGetCommit';
    await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            signedTransactionProposal: signedTransactionProposal, //? idk if any of this is serializable like this
            transactionProposalDigest: transactionProposalDigest  //? this prob wont work
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    }).then(function (res) {
        res.json().then(function (response) { //? idk if i can read it like this
            const commitProposalDigest = response.commitProposalDigest;
            console.log(commitProposalDigest);
            const transactionProposalResponses = response.transactionproposalResponses
            console.log(transactionProposalResponses);
        });
    }).catch(function (error) {
        console.log(error);
    });

    commitProposalDigestBytes = new Buffer(commitProposalDigest);
    const signedCommitProposal = signingModule.signProposal(commitProposalDigestBytes, userPrivateKey);

    // Get commit proposal digest
    url = 'http://' + apiServerURL + '/submitSignedCommitProposal';
    await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            signedCommitProposal: signedCommitProposal,
            transactionProposalResponses: transactionProposalResponses,
            transactionProposalDigest: transactionProposalDigest
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    }).then(function (res) {
        res.text().then(function (text) {
            console.log(text);
        });
    }).catch(function (error) {
        console.log(error);
    });
}

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

//-----------------------------------------------CAMPAIGN FUNCTIONS------------------------------------------------
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