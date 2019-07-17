const path = require('path');
const express = require('express');
const router = express();
const accountsModule = require('../app/javascript/accounts')

// Set paths to connection profile and wallet
const ccpPath = path.resolve(__dirname, '..', 'libertas-dev-network', 'connection-sipher.json');
// const networkDirPath = path.resolve(__dirname, '..', 'libertas-dev-network')
const walletPath = path.join(__dirname, '..', 'app', 'javascript', 'test_programs', 'wallet')

// JSON parser 
app.use(express.urlencoded({ extended: false }))
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
    
        let result = await accountsModule.queryAccountByID(ccpPath, walletPath,
            'jingleman', 'test', 'libertas', idToQuery);
        res.send(result);
    } catch (error) {
        console.log(error)
    }
});

router.listen(80, () => console.log("Listening on port 80"));