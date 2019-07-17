// test script for HTTP server

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
await fetch('http://155.138.134.91/createCampaign', {
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

let url = 'http://155.138.134.91/queryCampaignByID?idToQuery=torontomayoralelection';
fetch(url, {
    method: 'GET'
}).then(function (res) {
    res.json().then(function (data) {
        console.log(data);
    })
});


