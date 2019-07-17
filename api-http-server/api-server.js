const path = require('path');
const express = require('express');
const router = express();
const accountsModule = require('../app/javascript/accounts')

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
    } catch (error) {
        console.log(error)
    }
});


router.get('/queryAccountByID', async function (req, res) {
    try {
        let idToQuery = req.query.idToQuery;
        console.log(idToQuery)

        let result = await accountsModule.queryAccountByID(ccpPath, walletPath,
            'jingleman', 'test', 'libertas', idToQuery);
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

        await accountsModule.createCampaign(ccpPath, walletPath, 'jingleman', 'test', 'libertas', id, name, campaignType, start, end, username);
    } catch (error) {
        console.log(error)
    }
});

router.get('/queryCampaignByID', async function (req, res) {
    try {
        let idToQuery = req.query.idToQuery;
        console.log(idToQuery)

        let result = await accountsModule.queryCampaignByID(ccpPath, walletPath,
            'jingleman', 'test', 'libertas', idToQuery);
        res.send(result);
    } catch (error) {
        console.log(error)
    }
});

