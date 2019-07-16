const path = require('path');
const express = require('express');
const app = express();
const accountsModule = require('../app/javascript/accounts')

// Set paths to connection profile and wallet
const ccpPath = path.resolve(__dirname, '..', 'libertas-dev-network', 'connection-sipher.json');
const networkDirPath = path.resolve(__dirname, '..', 'libertas-dev-network')
const walletPath = path.join(__dirname, 'app', 'javascript', 'wallet')

app.post('/createAccount', (req, res) => {
    // get params
    var id = req.body.id;
    var name = req.body.name;
    var email = req.body.email;
    var accountType = req.body.accountType;

    accountsModule.createAccount(ccpPath, walletPath, "test", "libertas", id, name, email, accountType);
});

app.listen(3000, () => console.log("Listening on port 3000"));








