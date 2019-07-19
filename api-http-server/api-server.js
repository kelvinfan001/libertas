const path = require('path');
const express = require('express');
const router = express();

// modules
const accountsModule = require('../app/javascript/accounts')
const campaignModule = require('../app/javascript/campaign')
const registrationEnrollmentModule = require('../app/javascript/registrationEnrollment');

// environment variables
const ccpPath = path.resolve(__dirname, '..', 'libertas-dev-network', 'connection-sipher.json');
const walletPath = path.join(__dirname, '..', 'app', 'javascript', 'test_programs', 'wallet')
const networkDirPath = path.resolve(__dirname, '..', 'libertas-dev-network')

// JSON parser 
router.use(express.urlencoded({
        extended: false
    }))
    .use(express.json());

//-----------------------------------------ACCOUNT FUNCTIONS--------------------------------------------------

router.post('/createAccount', async function (req, res) {
    try {
        let id = req.body.id;
        let name = req.body.name;
        let email = req.body.email;
        let accountType = req.body.accountType;

        // TODO: remove this once offline private key stuff works 
	 await registerAndEnroll(id, name, accountType);

        await accountsModule.createAccount(ccpPath, walletPath, "test", "libertas", id, name, email, accountType);
        res.send('Success');
    } catch (error) {
        console.log(error)
    }
});


router.get('/queryAccountByID', async function (req, res) {
    try {
	const username = req.query.username;
        const idToQuery = req.query.idToQuery;
        const result = await accountsModule.queryAccountByID(ccpPath, walletPath, username, 'test', 'libertas', idToQuery);
        res.send(result);
    } catch (error) {
        console.log(error)
    }
});

//-----------------------------------------CAMPAIGN FUNCTIONS--------------------------------------------------

router.post('/createCampaign', async function (req, res) {
    try {
        let id = req.body.id;
        let name = req.body.name;
        let campaignType = req.body.campaignType;
        let start = req.body.start;
        let end = req.body.end;
        let username = req.body.username;
        
        await campaignModule.createCampaign(ccpPath, walletPath, 'test', 'libertas', id, name, campaignType, start, end, username);
    } catch (error) {
        console.log(error)
    }
});

router.get('/queryCampaignByID', async function (req, res) {
    try {
        let idToQuery = req.query.idToQuery;
        let result = await campaignModule.queryCampaignByID(ccpPath, walletPath, 'jingleman', 'test', 'libertas', idToQuery);
        res.send(result);
    } catch (error) {
        console.log(error)
    }
});

//-----------------------------------------VOTER GROUP FUNCTIONS--------------------------------------------------


// TODO:




//-----------------------------------------VOTER FUNCTIONS--------------------------------------------------

// TODO:


//-----------------------------------------VOTE FUNCTIONS--------------------------------------------------

// TODO:


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
        console.log(id + " " + secret);
	console.error(`${error}`);
        process.exit(1);
    }
}



router.listen(80, () => console.log("Listening on port 80"));
