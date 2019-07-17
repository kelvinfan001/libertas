const registrationEnrollmentModule = require('../registrationEnrollment');
const path = require('path');

const walletPath = path.join(process.cwd(), 'wallet')
const ccpPath = path.resolve(__dirname, '..', '..', '..', 'libertas-dev-network', 'connection-sipher.json');
const networkDirPath = path.resolve(__dirname, '..', '..', '..', 'libertas-dev-network')

//--------------------------------------------Register and Enroll----------------------------------------
async function register() {

    try {
        var secret = await registrationEnrollmentModule.registerUser(ccpPath, walletPath, "voting_district1", "jingleman", "client", "Jingle Man", "Personal");
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }

    console.log(secret)
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

secret = register()
enroll(secret)