// test script for HTTP server

const fetch = require('node-fetch');

async function wrapper() {
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
    await fetch(url, {
        method: 'GET'
    }).then(function (res) {
        console.log(res);
    });
}

wrapper();