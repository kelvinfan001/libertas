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
/**
 * 
 * @param {string} id 
 * @param {string} name name of the campaign
 * @param {string} campaignType 
 * @param {string} start start date for the campaign
 * @param {string} end end date fo rthe campaign
 * @param {string} username username for the user calling this function
 */
async function createCampaign(id, name, campaignType, start, end, username) {
    await fetch('http://155.138.134.91/createCampaign', {
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

/**
 * 
 * @param {string} username username for the user calling this function
 * @param {string} idToQuery username with respect to the query
 */
async function queryCampaignByID(username, idToQuery) {
    let url = 'http://155.138.134.91/queryCampaignByID?username=' + username + '&idToQuery=' + idToQuery;
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
// Here are some sample API calls 

// Account: we create an instituion account 
await createAccount('ciudad7', 'Ciudad', 'ciudad@sipher.co', 'Institution');
await queryAccountByID('ciudad6', 'ciudad6');


// Campaign: using our institution account, we create a new campaign
var start = Date.parse('2019-7-16');
var end = Date.parse('2019-8-1');
var startStr = start.toString();
var endStr = end.toString();
await createCampaign('ciudad7', 'Ciudad7 Election', 'Mayoral Election', startStr, endStr, 'ciudad7');
await queryCampaignByID('ciudad');