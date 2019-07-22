/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * This module provides tools for establishing a secure gateway for signing transactions offline.
 * 
 */

module.exports = { getEndorementPlanPeers };

const Client = require('fabric-client');

 /**
  * Returns a list of names of peers from the first option of discovery's endorsement plan.
  * 
  * @param {Client.channel} channel Channel of endoresment plans to get.
  */
async function getEndorementPlanPeers(channel) {
    const discoveryResults = await channel.getDiscoveryResults();
    const endoresmentGroups = discoveryResults.endorsement_plans[0].groups;

    // console.log(endoresmentGroups.G0.peers);

    var discoveryResultsPeersList = [];

    for (group in endoresmentGroups) {
        discoveryResultsPeersList = discoveryResultsPeersList.concat(endoresmentGroups[group].peers);
    }

    // console.log(discoveryResultsPeersList);

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
 * @param {*} adminCertificate 
 * @param {*} adminKey 
 * @param {*} mspID 
 */
async function getChannel(connectionProfilePath, channelName, adminCertificate, adminKey, mspID) {
    // Get connection profile
    const ccpJSON = fs.readFileSync(connectionProfilePath, 'utf8');
    const ccp = JSON.parse(ccpJSON);
    // Set fabric-client to use discovery
    // Client.setConfigSetting('initialize-with-discovery', true);
    const client = await Client.loadFromConfig(connectionProfilePath);
    client.setAdminSigningIdentity(adminKey, adminCertificate, mspID);
    client.setTlsClientCertAndKey(adminCertificate, adminKey);
    const channel = client.getChannel(channelName);

    const sipherPeer0TLSCertPath = path.resolve(networkDirPath, ccp.peers["peer0.libertas.sipher.co"].tlsCACerts.path);
    const sipherPeer0PEMCert = fs.readFileSync(sipherPeer0TLSCertPath, 'utf8');
    const sipherPeer0 = client.newPeer(
        'grpcs://localhost:7051',
        {
            pem: sipherPeer0PEMCert,
            'ssl-target-name-override': 'peer0.libertas.sipher.co',
        }
    );
    const whiteBoxPeer0TLSCertPath = path.resolve(networkDirPath, ccp.peers["peer0.libertas.whiteboxplatform.com"].tlsCACerts.path);
    const whiteboxPeer0PEMCert = fs.readFileSync(whiteBoxPeer0TLSCertPath, 'utf8');
    const whiteboxPeer0 = client.newPeer(
        'grpcs://localhost:9051',
        {
            pem: whiteboxPeer0PEMCert,
            'ssl-target-name-override': 'peer0.libertas.whiteboxplatform.com',
        }
    );

    const ordererTLSCertPath = path.resolve(networkDirPath, ccp.orderers["orderer.sipher.co"].tlsCACerts.path);
    const ordererPEMCert = fs.readFileSync(ordererTLSCertPath, 'utf8');

    const orderer = client.newOrderer(
        'grpcs://localhost:7050',
        {
            pem: ordererPEMCert,
            'ssl-target-name-override': 'orderer.sipher.co',
        }
    );

    // channel.addPeer(sipherPeer0);
    // channel.addPeer(whiteboxPeer0);
    // channel.addOrderer(orderer);

    await channel.initialize({ discover: true, asLocalhost: true });

    return channel;
}
