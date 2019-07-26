// Import required modules
const path = require('path');
const express = require('express');
const router = express();
var server = require('http').Server(router);
var io = require('socket.io')(server);
const submitEvaluateModule = require('../app/offline-signing-javascript/submitEvaluateTransaction');
const registrationEnrollmentModule = require('../app/javascript/registrationEnrollment');
const offlineSigningGatewayModule = require('../app/offline-signing-javascript/offlineSigningGateway');
const { FileSystemWallet } = require('fabric-network')

// environment variables
const chaincodeID = 'libertas';
const channelID = 'test';
const connectionProfilePath = path.resolve(__dirname, '..', 'libertas-dev-network', 'connection-sipher.json');
const walletPath = path.join(__dirname, '..', 'app', 'offline-signing-javascript', 'wallet');
const networkDirPath = path.resolve(__dirname, '..', 'libertas-dev-network');

// JSON parser 
router.use(express.urlencoded({
    extended: false
})).use(express.json());

async function main() {
    // Retrieve admin information from wallet. user identity is required for connecting to channel.
    // This should not be required since we are doing offline signing; this is a design issue by fabric node SDK.
    const wallet = new FileSystemWallet(walletPath);
    let adminIdentity = await wallet.export('admin');
    const adminKey = adminIdentity.privateKey;
    const adminCertificate = adminIdentity.certificate;
    const adminMSPID = adminIdentity.mspId;

    server.listen(80, () => console.log("Listening on port 80"));

    //---------------------------------------SUBMIT TRANSACTION SOCKET-----------------------------------------------

    var submitTransactionSocket = io.of('/submitTransaction').on('connection', function (socket) {
        socket.emit('connectionEstablished', 'Connection established');
        socket.on('sendTransactionProposal', async function (data) {
            // Retrieve values from transaction request and fill in TransactionProposal object
            const transactionProposal = data.transactionProposal;
            const userCertificate = data.userCertificate;
            const userMSPID = data.mspID;
            transactionProposal.chaincodeId = chaincodeID;
            transactionProposal.channelId = channelID;

            // Get channel object
            let channel = await offlineSigningGatewayModule.getChannel(connectionProfilePath, channelID, adminCertificate, adminKey, adminMSPID);

            // Get unsigned transaction proposal digest
            let transactionProposalDigest = await submitEvaluateModule.getTransactionProposalDigest(channel, userCertificate, userMSPID, transactionProposal);
            // Check if get transaction propsal is error
            if (typeof transactionProposalDigest == "string") {
                socket.emit('getTransactionProposalError', transactionProposalDigest);
                socket.disconnect();
                return;
            }
            let transactionProposalDigestBuffer = transactionProposalDigest.toBuffer();

            // Send unsigned transaction proposal digest back to client as Buffer
            socket.emit('sendTransactionProposalDigest', transactionProposalDigestBuffer);

            socket.on('sendTransactionProposalSignature', async function (data) {
                // Retrieve the signature for transaction proposal
                const transactionProposalSignature = data;
                // Package signed transaction proposal
                const signedTransactionProposal = {
                    signature: transactionProposalSignature,
                    proposal_bytes: transactionProposalDigestBuffer
                }

                // Submit signed transaction proposal
                let transactionProposalResponses = await submitEvaluateModule.submitSignedTransactionProposal(channel, chaincodeID, signedTransactionProposal);
            
                // Check if transaction propsal response is error
                if (typeof transactionProposalResponses == "string") {
                    socket.emit('submitTransactionError', transactionProposalResponses);
                    socket.disconnect();
                    return;
                }

                let commitProposalDigest = await submitEvaluateModule.getCommitProposalDigest(channel, transactionProposalDigest, transactionProposalResponses);
                // Check if failed to get commit proposal
                if (typeof commitProposalDigest == "string") {
                    socket.emit('getCommitProposalError', commitProposalDigest);
                    socket.disconnect();
                    return;
                }
                let commitProposalDigestBuffer = commitProposalDigest.toBuffer();

                // Send unsigned commit proposal digest to client as Buffer
                socket.emit('sendCommitProposalDigest', commitProposalDigestBuffer);

                socket.on('sendCommitProposalSignature', async function (data) {
                    // Retrieve the signature for commit proposal
                    const commitProposalSignature = data;
                    // Package signed commit proposal
                    const signedCommitProposal = {
                        signature: commitProposalSignature,
                        proposal_bytes: commitProposalDigestBuffer
                    }

                    // Submit signed commit proposal
                    let commitProposalResponses = await submitEvaluateModule.submitSignedCommitProposal(channel, signedCommitProposal, transactionProposalResponses, transactionProposalDigest);

                    // Check if commit propsal response is error
                    if (typeof commitProposalResponses == "string") {
                        socket.emit('commitTransactionError', commitProposalResponses);
                        socket.disconnect();
                        return;
                    }
                })
            })
        });
    });

    //-----------------------------------------SUBMIT FUNCTIONS--------------------------------------------------

    router.post('/getTransactionProposalDigest', async function (req, res) {
        try {

            // Retrieve values from POST request
            const transactionProposal = req.body.transactionProposal;
            const userCertificate = req.body.userCertificate;
            const userMSPID = req.body.mspID;
            // Fill in and complete TransactionProposal object with chaincode ID and channel ID
            transactionProposal.chaincodeId = chaincodeID;
            transactionProposal.channelId = channelID;
            
            // Get channel object
            let channel = await offlineSigningGatewayModule.getChannel(connectionProfilePath, channelID, adminCertificate, adminKey, adminMSPID);

            // Get transaction proposal digest
            let transactionProposalDigest = await submitEvaluateModule.getTransactionProposalDigest(channel, userCertificate, userMSPID, transactionProposal);
            let transactionProposalDigestBuffer = transactionProposalDigest.toBuffer();


            console.log('this is what transactionProposalDigestBuffer looks like: ' + transactionProposalDigestBuffer); //todo remove

            res.send(transactionProposalDigestBuffer);

        } catch (error) {
            console.log('Get transaction proposal digest error: ' + error);
        }
    });

    router.post('/submitSignedGetCommit', async function (req, res) {
        try {
            // Retrieve values from POST request
            const signedTransactionProposal = req.body.signedTransactionProposal;
            const transactionProposalDigest = req.body.transactionProposalDigest;

            console.log("received signed transaction proposal: " + signedTransactionProposal); // todo remove 
            console.log("received transaction proposal digest: " + transactionProposalDigest); // todo remove

            // Get channel object
            let channel = await offlineSigningGatewayModule.getChannel(connectionProfilePath, channelID, adminCertificate, adminKey, adminMSPID);

            // Submit signed transaction proposal
            let transactionProposalResponses = await submitEvaluateModule.submitSignedTransactionProposal(channel, chaincodeID, signedTransactionProposal);

            let commitProposalDigest = await submitEvaluateModule.getCommitProposalDigest(channel, transactionProposalDigest, transactionProposalResponses);

            res.send({
                commitProposalDigest: commitProposalDigest,
                transactionProposalResponses: transactionProposalResponses
            });

        } catch (error) {
            console.log('Submit signed proposal and get commit proposal digest error: ' + error);
        }

    });

    router.post('/submitSignedCommitProposal', async function (req, res) {
        try {
            // Retrieve values from POST request
            const signedCommitProposal = req.body.signedCommitProposal;
            const transactionProposalDigest = req.body.transactionProposalDigest;
            const transactionProposalResponses = req.body.transactionProposalResponses;

            // Get channel object
            let channel = offlineSigningGatewayModule.getChannel(connectionProfilePath, channelID, adminCertificate, adminKey, adminMSPID);

            // Submit signed commit proposal
            let commitRepsonses = await submitEvaluateModule.submitSignedCommitProposal(channel, signedCommitProposal, transactionProposalResponses, transactionProposalDigest);
        } catch (error) {
            console.log('Submit signed commit proposal error: ' + error);
        }
    });
}

main();

// //-------------------------------------EVALUATE FUNCTIONS---------------------------------------
// router.get('/queryAccountByID', async function (req, res) {
//     try {
//         const username = req.query.username;
//         const idToQuery = req.query.idToQuery;
//         const result = await accountsModule.queryAccountByID(ccpPath, walletPath, username, 'test', 'libertas', idToQuery);

//         res.send(result);
//     } catch (error) {
//         console.log(error);
//     }
// });

// //-----------------------------------------CAMPAIGN FUNCTIONS--------------------------------------------------



// router.get('/queryCampaignByID', async function (req, res) {
//     try {
//         const username = req.query.username;
//         const idToQuery = req.query.idToQuery;
//         const result = await campaignModule.queryCampaignByID(ccpPath, walletPath, username, 'test', 'libertas', idToQuery);

//         res.send(result);
//     } catch (error) {
//         console.log(error)
//     }
// });

// //-----------------------------------------VOTER GROUP FUNCTIONS--------------------------------------------------

// router.get('/queryVoterGroupsByID', async function (req, res) {
//     try {
//         const username = req.query.username;
//         const idToQuery = req.query.idToQuery;
//         const result = await voterGroupModule.queryVoterGroupsByID(ccpPath, walletPath, username, 'test', 'libertas', idToQuery);

//         res.send(result);
//     } catch (error) {
//         console.log(error)
//     }
// });

// //-----------------------------------------TEMP FUNCTIONS-----------------------------------------------------
// async function registerAndEnroll(id, name, accountType) {
//     secret = await register(id, name, accountType)
//     await enroll(id, secret)
// }

// async function register(id, name, accountType) {
//     try {
//         var secret = await registrationEnrollmentModule.registerUser(ccpPath, walletPath, "voting_district1", id, "client", name, accountType);
//     } catch (error) {
//         console.error(`${error}`);
//         process.exit(1);
//     }

//     console.log(id, secret)
//     return secret
// }


// async function enroll(id, secret) {
//     try {
//         await registrationEnrollmentModule.enrollUser(ccpPath, walletPath, "ca.libertas.sipher.co", networkDirPath, id, secret, "SipherMSP");
//     } catch (error) {
//         process.exit(1);
//     }
// }