// test script for HTTP server


const fetch = require('node-fetch');


// fetch('http://155.138.134.91/createAccount', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//         id: 'kailonghuang',
//         name: 'Kailong Huang',
//         email: 'kailong@sipher.co',
//         accountType: 'Personal'
//     })
// });

let url = 'http://155.138.134.91/queryAccountByID?idToQuery=world'
fetch(url, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    }
});