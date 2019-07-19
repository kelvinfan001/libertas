const path = require('path');
const express = require('express');
const router = express();

// modules
const accountsModule = require('../app/javascript/accounts')
const campaignModule = require('../app/javascript/campaign')


// environment variables
const ccpPath = path.resolve(__dirname, '..', 'libertas-dev-network', 'connection-sipher.json');
const walletPath = path.join(__dirname, '..', 'app', 'javascript', 'test_programs', 'wallet')

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

        await accountsModule.createAccount(ccpPath, walletPath, "test", "libertas", id, name, email, accountType);
        res.send('Success');
    } catch (error) {
        console.log(error)
    }
});


router.get('/queryAccountByID', async function (req, res) {
    try {
        let idToQuery = req.query.idToQuery;
        let result = await accountsModule.queryAccountByID(ccpPath, walletPath, 'jingleman', 'test', 'libertas', idToQuery);
        res.send(result);
    } catch (error) {
        console.log(error)
    }
});

router.listen(80, () => console.log("Listening on port 80"));

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