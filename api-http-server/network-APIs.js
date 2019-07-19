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
// async function createAccount(id, name, email, accountType) {
//     // enroll >> extra secret

//     let url = 'http://155.138.134.91/createAccount'; // digest >> also give certificate >> for user identity
//     await fetch(url, {
//         method: 'POST',
//         body: JSON.stringify({
//             id: id,
//             name: name,
//             email: email,
//             accountType: accountType
//         }),
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//         }
//     });

//     // signStuff >> signed cert for transaction

//     // send signed stuff >> give signed cert >> this actually createsAccount
// }

// /**
//  * 
//  * @param {string} idToQuery jingleman
//  */
// async function queryAccountByID(idToQuery) {
//     let url = 'http://155.138.134.91/queryAccountByID?idToQuery=' + idToQuery;
//     fetch(url, {
//         method: 'GET'
//     }).then(function (res) {
//         res.json().then(function (data) {
//             console.log(data);
//         })
//     });
// }

//---------------------------------------CAMPAIGN FUNCTIONS------------------------------------------------
// var start = Date.parse('2019-7-16');
// var end = Date.parse('2019-8-1');
// var startStr = start.toString();
// var endStr = end.toString();

// fetch('http://155.138.134.91/createCampaign', {
//     method: 'POST',
//     body: JSON.stringify({
//         id: "city1",
//         name: "City1",
//         campaignType: "Mayoral Election",
//         start: startStr,    
//         end: endStr,
//         username: 'city1'
//     }),
//     headers: {
//         // 'Accept': 'application/json',
//         'Content-Type': 'application/json',
//     }
// });

let url = 'http://155.138.134.91/queryCampaignByID?idToQuery=city1';
fetch(url, {
    method: 'GET'
}).then(function (res) {
    res.json().then(function (data) {
        console.log(data);
    })
});