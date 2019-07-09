'use strict';

const FabricClient = require('fabric-client')
const {
    FileSystemWallet,
    X509WalletMixin
} = require('fabric-network')
const fs = require('fs')
const path = require('path')

/**
 * @description setup a development channel 'mychannel' and add peer nodes to this channel 
 * @precondition an admin user has already been enrolled
 * @param {String} channelName Channel name used in configtxgen to create the channel transaction (mychannel)
 * @param {String} channeltxPath Path of the channel transaction (/home/root/channel-artifacts/channel.tx)
 * @param {String} ordererName Orderer name (orderer.example.com)
 */
async function setupDevChannel(channelName, channeltxPath, ordererName, ccpPath) {
    try {
        var client = await getClient(ccpPath)
        var channel = await makeChannel(channelName, channeltxPath, ordererName, client)
        // var channel = client.getChannel('mychannel')
        // await joinNodes(channelName, client)
    } catch (error) {
        throw error
    }
}

/**
 * @description setup and return a fabric client 
 * @param {the path to connection profile} ccpPath 
 */
async function getClient(ccpPath) {
    var client = FabricClient.loadFromConfig(ccpPath)
    // confirm admin identity
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);

    // Check to see if admin user is already enrolled.
    const adminExists = await wallet.exists('admin');
    if (!adminExists) {
        process.stdout.write("Admin has yet to be enrolled. Please run enrollAdminTestProg.js first.")
        return;
    }

    var adminIdentity = await wallet.export('admin')
    client.setAdminSigningIdentity(adminIdentity.privateKey, adminIdentity.certificate, adminIdentity.mspId)

    return client
}

/**
 * @description create channel channelName
 * @param {string} channelName name of the channel to be made
 * @param {string} channeltxPath path to the channel.tx file
 * @param {string} ordererName domain name of an ordering node
 * @param {string} client fabric client for creating the channel
 */
async function makeChannel(channelName, channeltxPath, ordererName, client) {
    try {
        // Setup create channel
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

        var channel = await client.createChannel(request)
        return channel
    } catch (error) {
        throw error
    }
}

// assumes that channel channelName has already been created
async function joinNodes(channelName, client) {
    var channel = new FabricClient.Channel(channelName, client)
    await channel.initialize({
        discover: true
    })

    // set the channel up with network endpoints
    // var orderers and peers >> dict url, opts
    var orderersUrlToOpts = {
        "grpc://localhost:7050": {
            name: "1-ordsipher",
            pem: ""
        }
    }

    var peersUrlToOpts = {
        "grpc://localhost:7051": {
            name: "1-sipher",
            pem: ""
        },
        "grpc://localhost:8051": {
            name: "2-sipher",
            pem: ""
        },
        "grpc://localhost:9051": {
            name: "1-libertas",
            pem: ""
        },
        "grpc://localhost:10051": {
            name: "2-libertas",
            pem: ""
        }
    }
    // for ... add orderer 
    for (var url in orderersUrlToOpts) {
        var opts = orderersUrlToOpts[url]
        var orderer = client.newOrderer(url, opts) // opts
        channel.addOrderer(orderer)
    }

    // for ... add peer
    for (var url in peersUrlToOpts) {
        var opts = peersUrlToOpts[url]
        var peer = client.newPeer(url, opts) // opts
        channel.addPeer(peer)
    }

    // transaction id
    tx_id = client.newTransactionID();
    let g_request = {
        txId: tx_id
    };


    // get the genesis block from the orderer

    channel.getGenesisBlock(g_request).then((genesisBlock) => {
        let j_request = {
            // targets: targets,
            block: genesisBlock,
            txId: client.newTransactionID()
        }

        // send genesis block to the peer
        return channel.joinChannel(j_request)
    }).then((results) => {
        if (results && results.response && results.response.status == 200) {
            process.stdout.write('Peer and Ordering Nodes have successfully joined the channel')
        } else {
            process.stdout.write('Nodes are Not Good!')
        }
    })
}

//--------------------------------------MAIN-----------------------------------------
const channelName = 'mychannel'
const channeltxPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network', 'channel-artifacts', 'channel.tx')
const ordererName = 'orderer.sipher.co'
const ccpPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network', 'connection-sipher.json')
setupDevChannel(channelName, channeltxPath, ordererName, ccpPath)

//------------------------------------------------------------------------------------

// TODO >> finish setup dev channel, then call query >> note all this is done without the cli

// fix policy error, finish joinNodes

// need opcode stuff for args >> also need user to specify computer account name 

// eventually, support TLS

// discovery feature for connection profile means that we just have to have a couple of nodes >> the rest are discovered