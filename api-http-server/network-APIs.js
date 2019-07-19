// test script for HTTP server
// Usage: enroll admin and add affiliation. Then run HTTPapi-test.js in the server and finally the fetch tests individually(so have the other fetch calls commented out).

const fetch = require('node-fetch');

//---------------------------------------ACCOUNT FUNCTIONS------------------------------------------------

/**
 * 
 * @param {string} id jingleman
 * @param {string} name Jingle Man
 * @param {string} email jingle@sipher.co
 * @param {string} accountType Personal
 */
async function createAccount(id, name, email, accountType) {
    let url = 'http://155.138.134.91/createAccount';
    await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            id: id,
            name: name,
            email: email,
            accountType: accountType
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    });
}

/**
 * 
 * @param {string} idToQuery jingleman
 */
async function queryAccountByID(idToQuery) {
    let url = 'http://155.138.134.91/queryAccountByID?idToQuery=' + idToQuery;
    fetch(url, {
        method: 'GET'
    }).then(function (res) {
        res.json().then(function (data) {
            console.log(data);
        })
    });
}

//---------------------------------------CAMPAIGN FUNCTIONS------------------------------------------------
// var start = Date.parse('2019-7-16');
// var end = Date.parse('2019-8-1');
// var startStr = start.toString();
// var endStr = end.toString();

// fetch('http://155.138.134.91/createCampaign', {
//     method: 'POST',
//     body: JSON.stringify({
//         id: "torontoElections",
//         name: "Toronto Mayoral Election",
//         campaignType: "Mayoral Election",
//         start: startStr,    
//         end: endStr,
//         username: 'jingleman'
//     }),
//     headers: {
//         // 'Accept': 'application/json',
//         'Content-Type': 'application/json',
//     }
// });

// let url = 'http://155.138.134.91/queryCampaignByID?idToQuery=torontomayoralelection';
// fetch(url, {
//     method: 'GET'
// }).then(function (res) {
//     res.json().then(function (data) {
//         console.log(data);
//     })
// });