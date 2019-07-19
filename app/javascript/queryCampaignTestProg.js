'use strict'

// Import the required modules
const path = require('path');
const registrationEnrollmentModule = require('./registrationEnrollment');
const accountModule = require('./accounts');
const campaignModule = require('./campaign');

// Set paths to connection profile and wallet
const ccpPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network', 'connection-sipher.json');
const networkDirPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network')
const walletPath = path.join(process.cwd(), 'wallet')

async function main() {

    try {
        // Query for campaign with id 'torontomayoralelection'
        const campaign = await campaignModule.queryCampaignByID(ccpPath, walletPath, 'kelvinfan', 'test', 'libertas', 'torontomayoralelection');
        console.log(campaign)

    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }

}

main()