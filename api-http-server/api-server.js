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

// environment variables
//// const ccpPath = path.resolve(__dirname, '..', 'libertas-dev-network', 'connection-sipher.json');
const connectionProfilePath = path.resolve(__dirname, '..', 'libertas-dev-network', 'connection-sipher.json');
const walletPath = path.join(__dirname, 'wallet');
const networkDirPath = path.resolve(__dirname, '..', 'libertas-dev-network');

// JSON parser 
router.use(express.urlencoded({
        extended: false
    }))
    .use(express.json());

//-----------------------------------------SUBMIT FUNCTIONS--------------------------------------------------

router.post('/submit', async function (req, res) {
    try {
        // Retrieve values from POST request
        const transactionProposal = req.body.transactionProposal;
        const userCertificate = req.body.userCertificate;
        transactionProposal.chaincodeId = 'libertas';
        transactionProposal.channelId = 'test';
        
        //// await invokeModule.submit(ccpPath, walletPath, transactionProposal);

        await submitEvaluateModule.submitTransaction(connectionProfilePath, userCertificate, walletPath, transactionProposal, res)
        res.send('Success');
    } catch (error) {
        console.log(error);
    }
});

//-------------------------------------EVALUATE FUNCTIONS---------------------------------------
router.get('/queryAccountByID', async function (req, res) {
    try {
        const username = req.query.username;
        const idToQuery = req.query.idToQuery;
        const result = await accountsModule.queryAccountByID(ccpPath, walletPath, username, 'test', 'libertas', idToQuery);

        res.send(result);
    } catch (error) {
        console.log(error);
    }
});

//-----------------------------------------CAMPAIGN FUNCTIONS--------------------------------------------------



router.get('/queryCampaignByID', async function (req, res) {
    try {
        const username = req.query.username;
        const idToQuery = req.query.idToQuery;
        const result = await campaignModule.queryCampaignByID(ccpPath, walletPath, username, 'test', 'libertas', idToQuery);

        res.send(result);
    } catch (error) {
        console.log(error)
    }
});

//-----------------------------------------VOTER GROUP FUNCTIONS--------------------------------------------------

router.get('/queryVoterGroupsByID', async function (req, res) {
    try {
        const username = req.query.username;
        const idToQuery = req.query.idToQuery;
        const result = await voterGroupModule.queryVoterGroupsByID(ccpPath, walletPath, username, 'test', 'libertas', idToQuery);

        res.send(result);
    } catch (error) {
        console.log(error)
    }
});

//-----------------------------------------TEMP FUNCTIONS-----------------------------------------------------
async function registerAndEnroll(id, name, accountType) {
    secret = await register(id, name, accountType)
    await enroll(id, secret)
}

async function register(id, name, accountType) {
    try {
        var secret = await registrationEnrollmentModule.registerUser(ccpPath, walletPath, "voting_district1", id, "client", name, accountType);
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }

    console.log(id, secret)
    return secret
}


async function enroll(id, secret) {
    try {
        await registrationEnrollmentModule.enrollUser(ccpPath, walletPath, "ca.libertas.sipher.co", networkDirPath, id, secret, "SipherMSP");
    } catch (error) {
        process.exit(1);
    }
}



router.listen(80, () => console.log("Listening on port 80"));