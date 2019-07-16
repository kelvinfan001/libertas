const path = require('path');
const express = require('express');
const app = express();
const accountsModule = require('../app/javascript/accounts')

// Set paths to connection profile and wallet
const ccpPath = path.resolve(__dirname, '..', 'libertas-dev-network', 'connection-sipher.json');
// const networkDirPath = path.resolve(__dirname, '..', 'libertas-dev-network')
const walletPath = path.join(__dirname, 'app', 'javascript', 'wallet')

//-----------------------------------------ACCOUNT FUNCTIONS--------------------------------------------------

app.post('/createAccount', (req, res) => {
    // get params
    var id = req.body.id;
    var name = req.body.name;
    var email = req.body.email;
    var accountType = req.body.accountType;

    await accountsModule.createAccount(ccpPath, walletPath, "test", "libertas", id, name, email, accountType);
});

app.get('/queryAccountByID', (req, res) => {
    // get params
    var idToQuery = req.query.idToQuery;

    result = await accountsModule.queryAccountByID(ccpPath, walletPath, "test", "libertas", idToQuery);
    res.send(result);
});

app.listen(80, () => console.log("Listening on port 80"));








