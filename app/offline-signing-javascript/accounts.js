/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 * 
 * This module deals with frontend JavaScript calls related to accounts.
 */

'use strict';

module.exports = { createAccount, queryAccountByID, createAccountOffline };

const fs = require('fs');
const path = require('path');

const FabricCAService = require('fabric-ca-client');
const Client = require('fabric-client');
const hash = require('fabric-client/lib/hash');

const jsrsa = require('jsrsasign');
const { KEYUTIL } = jsrsa;
const elliptic = require('elliptic');
const EC = elliptic.ec;

const PRIVATE_KEY_PATH = path.resolve(__dirname, './wallet/kelvinfan/933fff033e5b0f4025e254f597dd794a160896f63da1dd478674ff0290d262b4-priv');
const PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

// this ordersForCurve comes from CryptoSuite_ECDSA_AES.js and will be part of the
// stand alone fabric-sig package in future.
const ordersForCurve = {
    'secp256r1': {
        'halfOrder': elliptic.curves.p256.n.shrn(1),
        'order': elliptic.curves.p256.n
    },
    'secp384r1': {
        'halfOrder': elliptic.curves.p384.n.shrn(1),
        'order': elliptic.curves.p384.n
    }
};

// this function comes from CryptoSuite_ECDSA_AES.js and will be part of the
// stand alone fabric-sig package in future.
function _preventMalleability(sig, curveParams) {
    const halfOrder = ordersForCurve[curveParams.name].halfOrder;
    if (!halfOrder) {
        throw new Error('Can not find the half order needed to calculate "s" value for immalleable signatures. Unsupported curve name: ' + curveParams.name);
    }

    // in order to guarantee 's' falls in the lower range of the order, as explained in the above link,
    // first see if 's' is larger than half of the order, if so, it needs to be specially treated
    if (sig.s.cmp(halfOrder) === 1) { // module 'bn.js', file lib/bn.js, method cmp()
        // convert from BigInteger used by jsrsasign Key objects and bn.js used by elliptic Signature objects
        const bigNum = ordersForCurve[curveParams.name].order;
        sig.s = bigNum.sub(sig.s);
    }

    return sig;
}

/**
 * this method is used for test at this moment. In future this
 * would be a stand alone package that running at the browser/cellphone/PAD
 *
 * @param {string} privateKey PEM encoded private key
 * @param {Buffer} proposalBytes proposal bytes
 */
function sign(privateKey, proposalBytes, algorithm, keySize) {
    const hashAlgorithm = algorithm.toUpperCase();
    const hashFunction = hash[`${hashAlgorithm}_${keySize}`];
    const ecdsaCurve = elliptic.curves[`p${keySize}`];
    const ecdsa = new EC(ecdsaCurve);
    const key = KEYUTIL.getKey(privateKey);

    const signKey = ecdsa.keyFromPrivate(key.prvKeyHex, 'hex');
    const digest = hashFunction(proposalBytes);

    let sig = ecdsa.sign(Buffer.from(digest, 'hex'), signKey);
    sig = _preventMalleability(sig, key.ecparams);

    return Buffer.from(sig.toDER());
}

function signProposal(proposalBytes, privateKeyPem) {
    const signature = sign(privateKeyPem, proposalBytes, 'sha2', 256);
    const signedProposal = { signature, proposal_bytes: proposalBytes };
    return signedProposal;
}

async function setupChannel(connectionProfilePath, channelName, adminCertificate, adminKey, mspID) {
    // Set fabric-client to use discovery
    Client.setConfigSetting('initialize-with-discovery', true);
    const client = await Client.loadFromConfig(connectionProfilePath);
    client.setAdminSigningIdentity(adminKey, adminCertificate, mspID);
    client.setTlsClientCertAndKey(adminCertificate, adminKey);
    const channel = client.getChannel(channelName);
    // await channel.initialize({
    //     discover: true});
    return channel;
}


async function createAccountOffline(connectionProfilePath, channelName, contractName, mspID, userCertPEM, adminCertificate, adminKey, id, name, email, accountType) {
    // Get connection profile
    const ccpJSON = fs.readFileSync(connectionProfilePath, 'utf8');
    const ccp = JSON.parse(ccpJSON);

    try {
        /**
         * Start endorsement step
         */

        // Create Channel instance
        const channel = await setupChannel(connectionProfilePath, channelName, adminCertificate, adminKey, mspID);

        // Package the transaction proposal
        const transactionProposalReq = {
            fcn: 'CreateAccount',
            args: [id, name, email, accountType],
            chaincodeId: contractName,
            channelId: channelName,
        };

        // Generate an unsigned transaction proposal
        const { proposal, txId } = channel.generateUnsignedProposal(transactionProposalReq, mspID, userCertPEM);

        // Sign the transaction proposal
        // TODO: this will be done by app
        const signedProposal = signProposal(proposal.toBuffer(), PRIVATE_KEY);

        // Send signed proposal
        const proposalResponses = await channel.sendSignedProposal(signedProposal);

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
        const signedCommitProposal = signProposal(commitProposal.toBuffer(), PRIVATE_KEY);

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











/**
 * Calls the createAccount function on chaincode.
 * @param {string} connectionProfilePath Path to connection profile.
 * @param {string} walletPath            Path to wallet containing user certificate and private/public keys.
 * @param {string} channelName           Name of network channel as specified in 'install.sh'.
 * @param {string} contractName          Name of contract installed as specified in 'install.sh'.
 * @param {string} id                    ID for new account. Must be same as enrollmentID.
 * @param {string} name                  Name for new account. Must be name registered with this id.
 * @param {string} email                 Email associated with new account.
 * @param {string} accountType           Account type for new account. Must be accountType registered with this ID.
 */
async function createAccount(connectionProfilePath, walletPath, channelName, contractName,
    id, name, email, accountType) {

    try {
        // Create a new file system based wallet for managing identities.
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if user credentials exist in wallet. This is only a precursory check. 
        const userExists = await wallet.exists(id);
        if (!userExists) {
            console.log('User credentials with id: ' + id + ' do not exist in the wallet.');
            return;
        }

        // Create a new gateway for connecting to peer node.
        const gateway = new Gateway();
        await gateway.connect(connectionProfilePath, {
            wallet, identity: id,
            discovery: { enabled: true, asLocalhost: true }
        });

        // Get the network (channel) that our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(contractName);

        // Submit the transaction.
        await contract.submitTransaction('CreateAccount', id, name, email, accountType);
        console.log('CreateAccount transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}


/**
 * Calls chaincode function QueryAccountByID.
 * @param {string} connectionProfilePath Path to connection profile.
 * @param {string} walletPath Path to wallet containing user certificate and private/public keys.
 * @param {string} id ID of user making call. Same as enrollment ID.
 * @param {string} channelName Name of network channel as specified in 'install.sh'
 * @param {string} contractName Name of contract installed as specified in 'install.sh'
 * @param {string} idToQuery ID of user to query.
 */
async function queryAccountByID(connectionProfilePath, walletPath, id, channelName, contractName, idToQuery) {

    try {
        // Create a new file system based walllet for managing identities.
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if user exists in wallet.
        const userExists = await wallet.exists(id);
        if (!userExists) {
            console.log(id + ' does not exist in the wallet.')
            return;
        }

        // Create a new gateway for connecting to peer node.
        const gateway = new Gateway();
        await gateway.connect(connectionProfilePath, { wallet, identity: id, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) that our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(contractName);

        // Submit the transaction.
        const queryResult = await contract.evaluateTransaction('QueryAccountByID', idToQuery);
        console.log('Query Success.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        return queryResult.toString();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}