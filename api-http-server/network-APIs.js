// test script for HTTP server
// Usage: enroll admin and add affiliation. Then run HTTPapi-test.js in the server and finally the fetch tests individually(so have the other fetch calls commented out).

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
    fetch(url, {
        method: 'GET'
    }).then(function (res) {
        res.json().then(function (data) {
            console.log(data);
        })
    });
}

//---------------------------------------CAMPAIGN FUNCTIONS------------------------------------------------
async function createCampaign(id, name, campaignType, start, end, username) {
    fetch('http://155.138.134.91/createCampaign', {
        method: 'POST',
        body: JSON.stringify({
            id: "city1",
            name: "City1",
            campaignType: "Mayoral Election",
            start: startStr,
            end: endStr,
            username: 'city1'
        }),
        headers: {
            // 'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    });

}

async function queryCampaignByID() {
    let url = 'http://155.138.134.91/queryCampaignByID?idToQuery=city1';
    fetch(url, {
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

// createAccount('ciudad6', 'Ciudad', 'ciudad@sipher.co', 'Institution');
queryAccountByID('ciudad6');

// var start = Date.parse('2019-7-16');
// var end = Date.parse('2019-8-1');
// var startStr = start.toString();
// var endStr = end.toString();
// createCampaign('ciudad', 'Ciudad Election', 'Mayoral Election', startStr, endStr, 'ciudad');
// queryCampaignByID('ciudad');