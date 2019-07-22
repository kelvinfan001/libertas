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

    let url = 'http://155.138.134.91/createAccount'; // digest >> also give certificate >> for user identity
    await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            username: username,
            name: name,
            email: email,
            accountType: accountType
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    }).then(function (res) {
        res.text().then(function(text) {
            console.log(text);
        });
    }).catch(function (error) {
        console.log(error)
    });

    // signStuff >> signed cert for transaction

    // send signed stuff >> give signed cert >> this actually createsAccount
}

/**
 * 
 * @param {string} username username for the user calling this function
 * @param {string} idToQuery username with respect to the query
 */
async function queryAccountByID(username, idToQuery) {
    let url = 'http://155.138.134.91/queryAccountByID?username=' + username + '&idToQuery=' + idToQuery;
    await fetch(url, {
        method: 'GET'
    }).then(function (res) {
        res.json().then(function (data) {
            console.log(data);
        })
    });
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
    await fetch('http://155.138.134.91/createCampaign', {
        method: 'POST',
        body: JSON.stringify({
            id: id,
            name: name,
            campaignType: campaignType,
            start: startStr,
            end: endStr,
            username: username
        }),
        headers: {
            // 'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    }).then(function (res) {
        res.text().then(function(text) {
            console.log(text);
        });
    }).catch(function (error) {
        console.log(error)
    });
}

/**
 * 
 * @param {string} username username for the user calling this function
 * @param {string} idToQuery username with respect to the query
 */
async function queryCampaignByID(username, idToQuery) {
    let url = 'http://155.138.134.91/queryCampaignByID?username=' + username + '&idToQuery=' + idToQuery;
    await fetch(url, {
        method: 'GET'
    }).then(function (res) {
        res.json().then(function (data) {
            console.log(data);
        })
    }).catch(function (error) {
        console.log(error)
    });
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
    await fetch('http://155.138.134.91/createVoterGroup', {
        method: 'POST',
        body: JSON.stringify({
            id: id,
            campaignID: campaignID,
            name: name,
            username: username
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    }).then(function (res) {
        res.text().then(function(text) {
            console.log(text);
        });
    }).catch(function (error) {
        console.log(error)
    });
}

/**
 * 
 * @param {string} username username for the user calling this function
 * @param {string} idToQuery username with respect to the query
 */
async function queryVoterGroupsByID(username, idToQuery) {
    let url = 'http://155.138.134.91/queryVoterGroupsByID?username=' + username + '&idToQuery=' + idToQuery;
    await fetch(url, {
        method: 'GET'
    }).then(function (res) {
        res.json().then(function (data) {
            console.log(data);
        })
    }).catch(function (error) {
        console.log(error)
    });
}

//----------------------------------------------------TEST----------------------------------------------------
// Here are some sample API calls 

// Account: we create an instituion account 
createAccount('ciudad3', 'Ciudad3', 'ciudad3@sipher.co', 'Institution');
// queryAccountByID('hello', 'hello');


// Campaign: using our institution account, we create a new campaign
var start = Date.parse('2019-7-16');
var end = Date.parse('2019-8-1');
var startStr = start.toString();
var endStr = end.toString();
// createCampaign('ciudad', 'Ciudad Election', 'Mayoral Election', startStr, endStr, 'ciudad');
// queryCampaignByID('ciudad10', 'ciudad10');


// Voter Group:
// createVoterGroup('ciudadVoterGroup', 'ciudad', 'Ciudad Voter Group', 'ciudad')
// queryVoterGroupsByID('ciudad', 'ciudadVoterGroup')