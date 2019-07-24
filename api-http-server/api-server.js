const path = require('path');
const express = require('express');
const router = express();

// modules
// const accountsModule = require('../app/javascript/accounts')
// const campaignModule = require('../app/javascript/campaign')
// const voterGroupModule = require('../app/javascript/votergroup')
//// const invokeModule = require('../app/javascript/invoke');
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
}))
    .use(express.json());

async function main() {
    // Retrieve admin information from wallet
    const wallet = new FileSystemWallet(walletPath);

    let adminIdentity = await wallet.export('admin');
    const adminKey = adminIdentity.privateKey;
    const adminCertificate = adminIdentity.certificate;
    const adminMSPID = adminIdentity.mspId;

    router.listen(80, () => console.log("Listening on port 80"));

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
            let transactionProposalDigestBytes = transactionProposalDigest.toBuffer();

            console.log(transactionProposalDigest)

            res.send(transactionProposalDigestBytes);

        } catch (error) {
            console.log('Get transaction proposal digest error: ' + error);
        }
    });

    router.post('/submitSignedGetCommit', async function (req, res) {
        try {
            // Retrieve values from POST request
            const signedTransactionProposal = req.body.signedTransactionProposal;
            const transactionProposalDigest = req.body.transactionProposalDigest;

            // Get channel object
            let channel = offlineSigningGatewayModule.getChannel(connectionProfilePath, channelID, adminCertificate, adminKey, adminMSPID);

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