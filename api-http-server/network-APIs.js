// API for app to interact with the Hyperledger Network

const fetch = require('node-fetch');

//---------------------------------------ACCOUNT FUNCTIONS------------------------------------------------

/**
 * 
 * @param {string} username the name to be registered with the certifate authority
 * @param {string} name 
 * @param {string} email 
 * @param {string} accountType may be 'Personal' or 'Institution'
 */
async function createAccount(username, name, email, accountType) {
    // enroll >> extra secret

    // TODO: note that chaincodeId and channelId are hardcoded
    const transactionProposal = {
        fcn: 'CreateAccount',
        args: [username, name, email, accountType],
        chaincodeId: "libertas", // 
        channelId: "test", //
        username: username
    }

    await submitHTTPReq(transactionProposal);

    // signStuff >> signed cert for transaction

    // send signed stuff >> give signed cert >> this actually createsAccount
}

/**
 * 
 * @param {string} username username for the user calling this function
 * @param {string} idToQuery username with respect to the query
 */
async function queryAccountByID(username, idToQuery) {
    const transactionProposal = {
        fcn: 'QueryAccountByID',
        args: [idToQuery],
        chaincodeId: "libertas", // 
        channelId: "test", //
        username: username
    }

    await evaluateHTTPReq(transactionProposal);
}

//-----------------------------------------------CAMPAIGN FUNCTIONS------------------------------------------------
/**
 * 
 * @param {string} id 
 * @param {string} name name of the campaign
 * @param {string} campaignType 
 * @param {string} start start date for the campaign
 * @param {string} end end date fo rthe campaign
 * @param {string} username username for the user calling this function
 */
async function createCampaign(id, name, campaignType, startStr, endStr, username) {
    const transactionProposal = {
        fcn: 'CreateCampaign',
        args: [id, name, campaignType, startStr, endStr],
        chaincodeId: "libertas", // 
        channelId: "test", //
        username: username
    }

    await submitHTTPReq(transactionProposal);
}

/**
 * 
 * @param {string} username username for the user calling this function
 * @param {string} idToQuery username with respect to the query
 */
async function queryCampaignByID(username, idToQuery) {
    const transactionProposal = {
        fcn: 'QueryCampaignByID',
        args: [idToQuery],
        chaincodeId: "libertas", // 
        channelId: "test", //
        username: username
    }

    await evaluateHTTPReq(transactionProposal);
}

//----------------------------------------------------Voter Group Functions-------------------------------------
/**
 * 
 * @param {*} id 
 * @param {*} campaignID 
 * @param {*} name 
 * @param {*} username 
 */
async function createVoterGroup(id, campaignID, name, username) {
    const transactionProposal = {
        fcn: 'CreateVoterGroup',
        args: [id, campaignID, name],
        chaincodeId: "libertas", // 
        channelId: "test", //
        username: username
    }

    await submitHTTPReq(transactionProposal)
}

/**
 * 
 * @param {string} username username for the user calling this function
 * @param {string} idToQuery username with respect to the query
 */
async function queryVoterGroupsByID(username, idToQuery) {
    const transactionProposal = {
        fcn: 'QueryVoterGroupsByID',
        args: [idToQuery],
        chaincodeId: "libertas", // 
        channelId: "test", //
        username: username
    }

    await evaluateHTTPReq(transactionProposal);
}

//------------------------------------------------VOTER FUNCTIONS-----------------------------------------------

async function createVoter(id, personalAccountID, voterGroupID, username) {
    const transactionProposal = {
        fcn: 'CreateVoter',
        args: [id, personalAccountID, voterGroupID],
        chaincodeId: "libertas", // 
        channelId: "test", //
        username: username
    }

    await submitHTTPReq(transactionProposal)
}

async function queryVoterByID(username, idToQuery) {
    const transactionProposal = {
        fcn: 'QueryVoterByID', // TODO: change this
        args: [idToQuery],
        chaincodeId: "libertas", // 
        channelId: "test", //
        username: username
    }

    await evaluateHTTPReq(transactionProposal);
}

//----------------------------------------------------HELPERS---------------------------------------------------

async function submitHTTPReq(transactionProposal) {
    const ip = '0.0.0.0:3000';
    let url = 'http://' + ip + '/submit';
    await fetch(url, {
        method: 'POST',
        body: JSON.stringify(transactionProposal),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    }).then(function (res) {
        res.text().then(function (text) {
            console.log(text);
        });
    }).catch(function (error) {
        console.log(error)
    });
}

async function evaluateHTTPReq(transactionProposal) {
    const ip = '0.0.0.0:3000';
    let url = 'http://' + ip + '/evaluate';
    await fetch(url, {
        method: 'POST',
        body: JSON.stringify(transactionProposal),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    }).then(function (res) {
        res.json().then(function (data) {
            console.log(data);
        });
    }).catch(function (error) {
        console.log(error)
    });
}


//----------------------------------------------------TEST----------------------------------------------------
// Here are some sample API calls 

// Account: we create an instituion account 
// createAccount('username', 'name', 'email', 'Institution');
// queryAccountByID('ciudad4', 'ciudad4');


// Campaign: using our institution account, we create a new campaign
var start = Date.parse('2019-7-16');
var end = Date.parse('2019-8-1');
var startStr = start.toString();
var endStr = end.toString();
// createCampaign('campaignID', 'name', 'Mayoral Election', startStr, endStr, 'username');
// queryCampaignByID('ciudad10', 'ciudad10');


// Voter Group:
// createVoterGroup('voterGroupID', 'campaignID', 'name', 'username');
// queryVoterGroupsByID('username', 'voterGroupID')

// Voter: 
createVoter('voterID', 'personalAccountID', 'voterGroupID', 'username');


// fix success returned even when weird stuff happens