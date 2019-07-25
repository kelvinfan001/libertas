const path = require('path');
const express = require('express');
const router = express();

// modules
// const accountsModule = require('../app/javascript/accounts')
// const campaignModule = require('../app/javascript/campaign')
// const voterGroupModule = require('../app/javascript/votergroup')
const invokeModule = require('../app/javascript/invoke');
const registrationEnrollmentModule = require('../app/javascript/registrationEnrollment');

// environment variables
const ccpPath = path.resolve(__dirname, '..', 'libertas-dev-network', 'connection-sipher.json');
const walletPath = path.join(__dirname, '..', 'app', 'javascript', 'test_programs', 'wallet');
const networkDirPath = path.resolve(__dirname, '..', 'libertas-dev-network');

// JSON parser 
router.use(express.urlencoded({
        extended: false
    }))
    .use(express.json());

//-----------------------------------------SUBMIT FUNCTIONS--------------------------------------------------

router.post('/submit', async function (req, res) {
    try {
        const transactionProposal = req.body;

        // TODO: remove this once offline private key stuff works 
        if (transactionProposal.fcn == 'CreateAccount') {
            const username = transactionProposal.username;
            const name = transactionProposal.args[1];
            const accountType = transactionProposal.args[3]
            await registerAndEnroll(username, name, accountType);
        }
        
        const result = await invokeModule.submit(ccpPath, walletPath, transactionProposal);
        res.send(result);

    } catch (error) {
        console.log(error);
    }
});

//-------------------------------------EVALUATE FUNCTIONS---------------------------------------
router.post('/evaluate', async function (req, res) {  // hmm, get in theory makes more sense, but post is more practical
    try {
        // const username = req.query.username;
        // const idToQuery = req.query.idToQuery;
        // const result = await accountsModule.queryAccountByID(ccpPath, walletPath, username, 'test', 'libertas', idToQuery);
        const transactionProposal = req.body;

        const result = await invokeModule.evaluate(ccpPath, walletPath, transactionProposal);        
        res.send(result);
    } catch (error) {
        console.log(error);
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

