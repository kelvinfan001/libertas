// test script for HTTP server
// Usage: enroll admin and add affiliation. Then run HTTPapi-test.js in the server and finally the fetch tests individually(so have the other fetch calls commented out).

const fetch = require('node-fetch');

//---------------------------------------ACCOUNT TESTS------------------------------------------------
await fetch('http://155.138.134.91/createAccount', {
    method: 'POST',
    body: JSON.stringify({
        id: 'jingleman',
        name: 'Jingle Man',
        email: 'jingle@sipher.co',
        accountType: 'Personal'
    }),
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

let url = 'http://155.138.134.91/queryAccountByID?idToQuery=jingleman';
fetch(url, {
    method: 'GET'
}).then(function (res) {
    res.json().then(function (data) {
        console.log(data);
    })
});

//---------------------------------------CAMPAIGN TESTS------------------------------------------------
var start = Date.parse('2019-7-16');
var end = Date.parse('2019-8-1');
var startStr = start.toString();
var endStr = end.toString();

await fetch('http://155.138.134.91/createCampaign', {
    method: 'POST',
    body: JSON.stringify({
        id: "torontomayoralelection",
        name: "Toronto Mayoral Election",
        campaignType: "Mayoral Election",
        start: startStr,
        end: endStr,
        username: 'cityoftoronto'
    }),
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

let url = 'http://155.138.134.91/queryCampaignByID?idToQuery=torontomayoralelection';
fetch(url, {
    method: 'GET'
}).then(function (res) {
    res.json().then(function (data) {
        console.log(data);
    })
});