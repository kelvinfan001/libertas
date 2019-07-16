// test script for HTTP server


const fetch = require('node-fetch');
const registrationEnrollmentModule = require('../app/javascript/registrationEnrollment');

const ccpPath = path.resolve(__dirname, '..', '..', '..', 'libertas-dev-network', 'connection-sipher.json');
const networkDirPath = path.resolve(__dirname, '..', '..', '..', 'libertas-dev-network')
const walletPath = path.join(process.cwd(), 'wallet')

//--------------------------------------------Register and Enroll----------------------------------------
async function register() {

    try {
        var secret = await registrationEnrollmentModule.registerUser(ccpPath, walletPath, "voting_district1", "jingleman", "client", "Jingle Man", "Personal");
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }

    return secret
}


async function enroll(secret) {

    try {
        await registrationEnrollmentModule.enrollUser(ccpPath, walletPath, "ca.libertas.sipher.co", networkDirPath, "jingleman", secret, "SipherMSP");
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
}

//--------------------------------------------------------------------------------------


secret = register();
enroll(secret);

fetch('http://155.138.134.91/createAccount', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        id: 'jingleman',
        name: 'Jingle Man',
        email: 'jingle@sipher.co',
        accountType: 'Personal'
    })
});

let url = 'http://155.138.134.91/queryAccountByID?idToQuery=jingleman'
fetch(url, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    }
});