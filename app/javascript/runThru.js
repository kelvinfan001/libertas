/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * This is a sample run through of how the JavaScript endpoints may be used.
 * 
 * No rigorous testing involved. TODO: write real unit tests.
 * 
 */

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
         // Enroll the pre-registered admin
        await registrationEnrollmentModule.enrollAdmin(ccpPath, 'ca.libertas.sipher.co',
            networkDirPath, path.join(process.cwd(), 'wallet'), 'admin', 'adminpw', 'SipherMSP');

        // Add new affiliation for new users
        await registrationEnrollmentModule.addAffiliation(walletPath, ccpPath, 'voting_district1');

        // Register and enroll new users with id 'kelvinfan' and 'kailonghuang'
        var secret = await registrationEnrollmentModule.registerUser(ccpPath, walletPath,
            "voting_district1", "kelvinfan", "client", "Kelvin Fan", "Personal");

        console.log(secret);

        await registrationEnrollmentModule.enrollUser(ccpPath, walletPath, "ca.libertas.sipher.co",
            networkDirPath, "kelvinfan", secret, "SipherMSP");

        secret = await registrationEnrollmentModule.registerUser(ccpPath, walletPath,
            "voting_district1", "kailonghuang", "client", "Kailong Huang", "Personal");

        console.log(secret);

        await registrationEnrollmentModule.enrollUser(ccpPath, walletPath, "ca.libertas.sipher.co",
            networkDirPath, "kailonghuang", secret, "SipherMSP");
        
        // Register and enroll City of Toronto as institution account.
        var secret = await registrationEnrollmentModule.registerUser(ccpPath, walletPath,
            "voting_district1", "cityoftoronto", "client", "City of Toronto", "Institution");

        console.log(secret);

        await registrationEnrollmentModule.enrollUser(ccpPath, walletPath, "ca.libertas.sipher.co",
            networkDirPath, "cityoftoronto", secret, "SipherMSP");

        // Create new accounts with id 'kelvinfan', 'kailonghuang', and 'cityoftoronto'.
        await accountModule.createAccount(ccpPath, walletPath, "test", "libertas",
            "kelvinfan", "Kelvin Fan", "kelvin@sipher.co", "Personal");
        await accountModule.createAccount(ccpPath, walletPath, "test", "libertas",
            "kailonghuang", "Kailong Huang", "kailong@sipher.co", "Personal");
        await accountModule.createAccount(ccpPath, walletPath, "test", "libertas",
            "cityoftoronto", "City of Toronto", "city@toronto.ca", "Institution");

        // Query for id 'kailonghuang'
        const account = await accountModule.queryAccountByID(ccpPath, walletPath,
            'kelvinfan', 'test', 'libertas', 'kailonghuang');
        console.log(account)

        // Create a campaign
        var start = Date.parse('2019-7-16');
        var end = Date.parse('2019-8-1');
        var startStr = start.toString();
        var endStr = end.toString();
        await campaignModule.createCampaign(ccpPath, walletPath, "test", "libertas", "torontomayoralelection", "Toronto Mayoral Election", "Mayoral Election", startStr, endStr, 'cityoftoronto');
        
        // Query for campaign with id 'torontomayoralelection'
        const campaign = await campaignModule.queryCampaignByID(ccpPath, walletPath, 'kelvinfan', 'test', 'libertas', 'torontomayoralelection');
        console.log(campaign)

    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }

}

main()