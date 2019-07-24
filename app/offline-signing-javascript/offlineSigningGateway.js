/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * This module provides tools for establishing a secure gateway for signing transactions offline.
 * 
 */

module.exports = { getEndorsementPlanPeers, getChannel };

const fs = require('fs');

const Client = require('fabric-client');

 /**
  * Returns a list of names of peers from the first option of discovery's endorsement plan.
  * 
  * @param {Client.channel} channel Channel of endoresment plans to get.
  */
async function getEndorsementPlanPeers(channel, contractName) {
    const discoveryResults = await channel.getDiscoveryResults({name: contractName});
    const endoresmentGroups = discoveryResults.endorsement_plans[0].groups;

    var discoveryResultsPeersList = [];

    for (group in endoresmentGroups) {
        discoveryResultsPeersList = discoveryResultsPeersList.concat(endoresmentGroups[group].peers);
    }

    var peerNames = [];
    for (peer in discoveryResultsPeersList) {
        peerNames.push(discoveryResultsPeersList[peer].name);
    }

    return peerNames
}

/**
 * Returns an instance of Channel based on connection profile specified by connectionProfilePath.
 * @param {*} connectionProfilePath 
 * @param {*} channelName 
 * @param {string} adminCertificate 
 * @param {*} adminKey 
 * @param {*} mspID 
 */
async function getChannel(connectionProfilePath, channelName, adminCertificate, adminKey, mspID) {
    // Get connection profile
    const ccpJSON = fs.readFileSync(connectionProfilePath, 'utf8');
    const ccp = JSON.parse(ccpJSON);

    // Get channel (admin credentials required)
    const client = await Client.loadFromConfig(connectionProfilePath);
    client.setAdminSigningIdentity(adminKey, adminCertificate, mspID);
    client.setTlsClientCertAndKey(adminCertificate, adminKey);
    const channel = client.getChannel(channelName);

    // Initialize channel with discovery enabled
    await channel.initialize({ discover: true, asLocalhost: true });

    return channel;
}
