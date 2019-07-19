'use strict'

// Import the required modules
const path = require('path');
const campaignModule = require('./campaign');

// Set paths to connection profile and wallet
const ccpPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network', 'connection-sipher.json');
const networkDirPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network')
const walletPath = path.join(process.cwd(), 'wallet')

async function main() {

    try {
        // Create a campaign
        var start = Date.parse('2019-7-16');
        var end = Date.parse('2019-8-1');
        var startStr = start.toString();
        var endStr = end.toString();
        await campaignModule.createCampaign(ccpPath, walletPath, "test", "libertas", "torontomayoralelection", "Toronto Mayoral Election", "Mayoral Election", startStr, endStr, 'cityoftoronto');

    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }

}

main()