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
const mspID = 'SipherMSP'; // TODO: hardcoded for now, query from server in future.
const caURL = "https://155.138.134.91:7054/";
const caTLSCACertsPath = "../tlsca.libertas.sipher.co-cert.pem";
const caName = "ca-sipher";
const apiServerURL = '155.138.134.91';

// The following for local testing
// const caURL = "https://127.0.0.1:7054/";
// const caTLSCACertsPath = "../libertas-dev-network/crypto-config/peerOrganizations/libertas.sipher.co/tlsca/tlsca.libertas.sipher.co-cert.pem";
// const caName = "ca-sipher";
// const apiServerURL = '127.0.0.1'

module.exports = {
    createAccount, queryAccountByID, personalEditAccount,
    createCampaign, queryCampaignByID, queryCampaignByInstitutionUsername, editCampaignByID, deleteCampaignByID,
    createVoterGroup, queryVoterGroupsByID, editVoterGroupByID, deleteVoterGroupByID,
    createVoter, listVotersByVoterGroupID, editVoterByID, deleteVoterByID,
    createVote, listBallotByCampaignID
}

//-----------------------------ACCOUNT FUNCTIONS--------------------------------

/**
 * Creates an account on chaincode. 
 * @param {string} id 
 * @param {string} name 
 * @param {string} email 
 * @param {string} accountType 
 * @param {string} enrollmentSecret 
 * @param {string} mspID 
 */
async function createAccount(id, name, email, accountType, enrollmentSecret) {
    try {
        const wallet = new FileSystemWallet(walletPath);
        let userExists = await wallet.exists(id);
        if (!userExists) {
            // Enroll user (directly communicating with CA)
            await registrationEnrollmentModule.enrollUser(caURL, caTLSCACertsPath, caName, walletPath, id,
                enrollmentSecret, mspID);
        } else {
            console.warn('Warning: User with id ' + id + ' already exists in wallet and enrolled with CA.');
        }
        // Prepare transaction proposal for creating account on chaincode
        const transactionProposal = {
            fcn: 'CreateAccount',
            args: [id, name, email, accountType],
        }
        // Submit transaction
        await submitTransaction(transactionProposal, id);

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

async function personalEditAccount(field, value, userID) {
    try {
        // Prepare transaction proposal for editing account by id on chaincode
        const transactionProposal = {
            fcn: 'PersonalEditAccount', // todo: might change fcn name
            args: [userID, field, value]
        }
        // Submit transaction
        await submitTransaction(transactionProposal, userID);

    } catch (error) {
        console.error(error);
    }
}

//----------------------------CAMPAIGN FUNCTIONS--------------------------------

async function createCampaign(campaignID, campaignName, campaignType, start, end, userID) {
    try {
        // Prepare transaction proposal for creating campaign on chaincode
        const transactionProposal = {
            fcn: 'CreateCampaign',
            args: [campaignID, campaignName, campaignType, start, end]
        }
        // Submit transaction
        await submitTransaction(transactionProposal, userID);

    } catch (error) {
        console.error(error);
    }
}

async function queryCampaignByID(idToQuery) {
    try {
        // Prepare transaction proposal
        const transactionProposal = {
            fcn: 'QueryCampaignByID',
            args: [idToQuery]
        }
        let response = await evaluateTransactionUnsigned(transactionProposal);
        return response;

    } catch (error) {
        console.error(error);
    }
}

async function queryCampaignByInstitutionUsername(usernameToQuery) {
    try {
        // Prepare transaction proposal
        const transactionProposal = {
            fcn: 'QueryCampaignByInstitutionUsername',
            args: [usernameToQuery]
        }
        let response = await evaluateTransactionUnsigned(transactionProposal);
        return response;

    } catch (error) {
        console.error(error);
    }
}

async function editCampaignByID(campaignID, field, value, userID) {
    try {
        // Prepare transaction proposal
        const transactionProposal = {
            fcn: 'EditCampaignByID',
            args: [campaignID, field, value]
        }
        // Submit transaction
        await submitTransaction(transactionProposal, userID);

    } catch (error) {
        console.error(error);
    }
}

async function deleteCampaignByID(campaignID, userID) {
    try {
        // Prepare transaction proposal
        const transactionProposal = {
            fcn: 'DeleteCampaignByID',
            args: [campaignID]
        }
        // Submit transaction
        await submitTransaction(transactionProposal, userID);

    } catch (error) {
        console.error(error);
    }
}

//-------------------------VOTERGROUP FUNCTIONS---------------------------------

async function createVoterGroup(voterGroupID, campaignID, voterGroupName, userID) {
    try {
        // Prepare transaction proposal
        const transactionProposal = {
            fcn: 'CreateVoterGroup',
            args: [voterGroupID, campaignID, voterGroupName]
        }
        // Submit transaction
        await submitTransaction(transactionProposal, userID);

    } catch (error) {
        console.error(error);
    }
}

async function queryVoterGroupsByID(voterGroupIDToQuery) {
    try {
        // Prepare transaction proposal
        const transactionProposal = {
            fcn: 'QueryVoterGroupsByID',
            args: [voterGroupIDToQuery]
        }
        let response = await evaluateTransactionUnsigned(transactionProposal);
        return response;

    } catch (error) {
        console.error(error);
    }
}

async function editVoterGroupByID(voterGroupID, field, value, userID) {
    try {
        // Prepare transaction proposal
        const transactionProposal = {
            fcn: 'EditVoterGroupByID',
            args: [voterGroupID, field, value]
        }
        // Submit transaction
        await submitTransaction(transactionProposal, userID);

    } catch (error) {
        console.error(error);
    }
}

async function deleteVoterGroupByID(voterGroupID, userID) {
    try {
        // Prepare transaction proposal
        const transactionProposal = {
            fcn: 'DeleteVoterGroupByID',
            args: [voterGroupID]
        }
        // Submit transaction
        await submitTransaction(transactionProposal, userID);

    } catch (error) {
        console.error(error);
    }
}

//-----------------------------VOTER FUNCTIONS----------------------------------

async function createVoter(voterID, personalAccountID, voterGroupID, userID) {
    try {
        // Prepare transaction proposal
        const transactionProposal = {
            fcn: 'CreateVoter',
            args: [voterID, personalAccountID, voterGroupID]
        }
        // Submit transaction
        await submitTransaction(transactionProposal, userID);

    } catch (error) {
        console.error(error);
    }
}

async function editVoterByID(voterID, voterGroupID, field, value, userID) {
    try {
        // Prepare transaction proposal
        const transactionProposal = {
            fcn: 'EditVoterByID',
            args: [voterID, voterGroupID, field, value]
        }
        // Submit transaction
        await submitTransaction(transactionProposal, userID);

    } catch (error) {
        console.error(error);
    }
}

async function deleteVoterByID(voterID, voterGroupID, userID) {
    try {
        // Prepare transaction proposal
        const transactionProposal = {
            fcn: 'DeleteVoterByID',
            args: [voterID, voterGroupID]
        }
        // Submit transaction
        await submitTransaction(transactionProposal, userID);

    } catch (error) {
        console.error(error);
    }
}

async function listVotersByVoterGroupID(voterGroupID) {
    try {
        // Prepare transaction proposal
        const transactionProposal = {
            fcn: 'ListVotersByVoterGroupID',
            args: [voterGroupID]
        }
        let response = await evaluateTransactionUnsigned(transactionProposal);
        return response;

    } catch (error) {
        console.error(error);
    }
}

//------------------------------VOTE FUNCTIONS----------------------------------

async function createVote(voterID, campaignID, voterGroupID, userID) {
    try {
        // Prepare transaction proposal
        const transactionProposal = {
            fcn: 'CreateVote',
            args: [voterID, campaignID, voterGroupID]
        }
        // Submit transaction
        await submitTransaction(transactionProposal, userID);

    } catch (error) {
        console.error(error);
    }
}

async function listBallotByCampaignID(campaignID) {
    try {
        // Prepare transaction proposal
        const transactionProposal = {
            fcn: 'ListBallotByCampaignID',
            args: [campaignID]
        }
        let response = await evaluateTransactionUnsigned(transactionProposal);
        return response;

    } catch (error) {
        console.error(error);
    }
}


//-----------------------SUBMIT TRANSACTION FUNCTIONS---------------------------

/**
 * Sign transaction and commit proposal with id's private key offline and submit transaction.
 * Return proposal responses payload.
 * @param  {Proposal Request} transactionProposal JSON object in Proposal format containing transaction details
 * @param  {string}           id                  ID of user making transaction
 * @param  {string}           mspID               MSP ID of user making transaction
 * @return {string}                               Payload of transaction response
 */
async function submitTransaction(transactionProposal, id) {

    // Get wallet instance and retrieve user cert and key
    const wallet = new FileSystemWallet(walletPath);
    const userIdentity = await wallet.export(id);
    const userCertificate = userIdentity.certificate;
    const userPrivateKey = userIdentity.privateKey;
    const mspID = userIdentity.mspId;

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

                // Only sign if transaction proposal digest returned by server matches with user certificate
                // and transaction sendCommitProposalSignature
                proposalDigestOK = checkProposalDigest(data.toString(), transactionProposal, userCertificate);
                if (proposalDigestOK) {
                    // Sign transaction proposal
                    const signedTransactionProposal = signingModule.signProposal(transactionProposalDigestBuffer,
                        userPrivateKey);
                    // Get signature
                    const transactionProposalSignature = signedTransactionProposal.signature;

                    // Send the signature back
                    submitTransactionSocket.emit('sendTransactionProposalSignature', transactionProposalSignature);
                } else {
                    submitTransactionSocket.disconnect();
                    reject(new Error("Transaction proposal digest returned by API server does not match" +
                        "TransactionProposalDigest"));
                    return;
                }

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
                        return;
                    });
                });
            });
        });
        // Receive transaction response payload
        submitTransactionSocket.on('sendTransactionPayload', function (payload) {
            submitTransactionSocket.disconnect();
            console.log('Transaction successfully submitted and committed.');
            resolve(payload.toString());
        });
        // Deal with any errors emitted by socket
        submitTransactionSocket.on('submitTransactionErrors', function (error) {
            submitTransactionSocket.disconnect();
            reject(error);
            return;
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

//-----------------------------------HELPERS------------------------------------

function checkProposalDigest(transactionProposalDigest, transactionProposal, userCert) {

    let userCertIndex = kmpSearch(userCert, transactionProposalDigest);
    if (userCertIndex == -1) {
        return false
    }

    transactionProposalDigest = transactionProposalDigest.slice(userCertIndex);

    let fcnIndex = kmpSearch(transactionProposal.fcn, transactionProposalDigest);
    if (fcnIndex == -1) {
        return false;
    }

    transactionProposalDigest = transactionProposalDigest.slice(fcnIndex);

    for (let i = 0; i < transactionProposal.args.length; i++) {
        let argIndex = kmpSearch(transactionProposal.args[i], transactionProposalDigest);
        if (argIndex == -1) {
            return false;
        }
        transactionProposalDigest = transactionProposalDigest.slice(argIndex + transactionProposal.args[i].length);
    }

    return true

}

// Searches for the given pattern string in the given text string using the Knuth-Morris-Pratt string matching algorithm.
// If the pattern is found, this returns the index of the start of the earliest match in 'text'. Otherwise -1 is returned.
function kmpSearch(pattern, text) {
    if (pattern.length == 0)
        return 0;  // Immediate match

    // Compute longest suffix-prefix table
    var lsp = [0];  // Base case
    for (var i = 1; i < pattern.length; i++) {
        var j = lsp[i - 1];  // Start by assuming we're extending the previous LSP
        while (j > 0 && pattern.charAt(i) != pattern.charAt(j))
            j = lsp[j - 1];
        if (pattern.charAt(i) == pattern.charAt(j))
            j++;
        lsp.push(j);
    }

    // Walk through text string
    var j = 0;  // Number of chars matched in pattern
    for (var i = 0; i < text.length; i++) {
        while (j > 0 && text.charAt(i) != pattern.charAt(j))
            j = lsp[j - 1];  // Fall back in the pattern
        if (text.charAt(i) == pattern.charAt(j)) {
            j++;  // Next char matched, increment position
            if (j == pattern.length)
                return i - (j - 1);
        }
    }
    return -1;  // Not found
}