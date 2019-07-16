const path = require('path');
const express = require('express');
const router = express();
const accountsModule = require('../app/javascript/accounts')

// Set paths to connection profile and wallet
const ccpPath = path.resolve(__dirname, '..', 'libertas-dev-network', 'connection-sipher.json');
// const networkDirPath = path.resolve(__dirname, '..', 'libertas-dev-network')
const walletPath = path.join(__dirname, 'app', 'javascript', 'wallet')

//-----------------------------------------ACCOUNT FUNCTIONS--------------------------------------------------

router.post('/createAccount', async (req, res) => {
    // get params
    var id = req.body.id;
    var name = req.body.name;
    var email = req.body.email;
    var accountType = req.body.accountType;

    await accountsModule.createAccount(ccpPath, walletPath, "test", "libertas", id, name, email, accountType);
});

router.get('/queryAccountByID', async (req, res) => {
    // get params
    var idToQuery = req.query.idToQuery;

    result = await accountsModule.queryAccountByID(ccpPath, walletPath,
        'kailonghuang', 'test', 'libertas', 'kailonghuang');
    res.send(result);
});

router.listen(80, () => console.log("Listening on port 80"));








