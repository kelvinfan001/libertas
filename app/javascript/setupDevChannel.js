'use strict';

const FabricClient = require('fabric-client')
const {
    FileSystemWallet,
    X509WalletMixin
} = require('fabric-network')
const fs = require('fs')
const path = require('path')

/**
 * @param {String} channelName Channel name used in configtxgen to create the channel transaction (mychannel)
 * @param {String} channeltxPath Path of the channel transaction (/home/root/channel-artifacts/channel.tx)
 * @param {String} ordererName Orderer name (orderer.example.com)
 * @description setup a development channel 'mychannel' and add peer nodes to this channel 
 * @precondition an admin user has already been enrolled
 */
async function setupDevChannel(channelName, channeltxPath, ordererName, ccpPath) {
    try {
        // await channel.initialize({ discover: true }); // vat
        var client = await getClient(ccpPath)
        // process.stdout.write(client.getMspid()
        await makeChannel(channelName, channeltxPath, ordererName, client)
        joinPeerNodes
    } catch (error) {
        throw error
    }
}

async function getClient(ccpPath) {
    var client = FabricClient.loadFromConfig(ccpPath)
    // confirm admin identity
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);

    // Check to see if admin user is already enrolled.
    const adminExists = await wallet.exists('admin');
    if (!adminExists) {
        console.log("Admin has yet to be enrolled. Please run enrollAdminTestProg.js first.")
        return;
    }

    var adminIdentity = await wallet.export('admin')
    client.setAdminSigningIdentity(adminIdentity.privateKey, adminIdentity.certificate, adminIdentity.mspId)

    // enable discovery
    client.addConnectionOptions()

    return client
}

async function makeChannel(channelName, channeltxPath, ordererName, client) {
    try {
        // Setup create channel
        var channelName = 'mychannel'
        var envelope = fs.readFileSync(channeltxPath)
        let channelConfig = client.extractChannelConfig(envelope)
        let signature = await client.signChannelConfig(channelConfig)
        const request = {
            name: channelName,
            orderer: client.getOrderer(ordererName),
            config: channelConfig,
            signatures: [signature],
            txId: client.newTransactionID(true)
        }

        result = await client.createChannel(request)
    } catch (error) {
        throw error
    }
}

function joinPeerNodes() {

}

const channelName = 'mychannel'
const channeltxPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network', 'channel-artifacts', 'channel.tx')
const ordererName = 'orderer.sipher.co'
const ccpPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network', 'connection-sipher.json')



// var client = FabricClient.loadFromConfig(ccpPath)
// // confirm admin identity
// const walletPath = path.join(process.cwd(), 'wallet');
// process.stdout.write(walletPath)
// const wallet = new FileSystemWallet(walletPath);
// adminIdentity = await wallet.export('admin')
// process.stdout.write(adminIdentity.privateKey)





setupDevChannel(channelName, channeltxPath, ordererName, ccpPath)


// TODO >> finish setup dev channel, then call query >> note all this is done without the cli
// enable discovery service


// make mac version >> need opcode stuff for args >> also need user to specify computer account name 

// eventually, support TLS

// discovery feature for connection profile means that we just have to have a couple of nodes >> the rest are discovered