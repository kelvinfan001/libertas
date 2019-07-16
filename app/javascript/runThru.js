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
const accountsModule = require('./accounts');

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

        await registrationEnrollmentModule.enrollUser(ccpPath, walletPath, "ca.libertas.sipher.co",
            networkDirPath, "kelvinfan", secret, "SipherMSP");

        console.log(secret);

        secret = await registrationEnrollmentModule.registerUser(ccpPath, walletPath,
            "voting_district1", "kailonghuang", "client", "Kailong Huang", "Personal");

        await registrationEnrollmentModule.enrollUser(ccpPath, walletPath, "ca.libertas.sipher.co",
            networkDirPath, "kailonghuang", secret, "SipherMSP");

        console.log(secret);

        // Create new accounts with id 'kelvinfan' and 'kailonghuang'
        await accountsModule.createAccount(ccpPath, walletPath, "test", "libertas",
            "kelvinfan", "Kelvin Fan", "kelvin@sipher.co", "Personal");
        await accountsModule.createAccount(ccpPath, walletPath, "test", "libertas",
            "kailonghuang", "Kailong Huang", "kailong@sipher.co", "Personal");

        // Query for id 'kailonghuang'
        const account = await accountsModule.queryAccountByID(ccpPath, walletPath,
            'kelvinfan', 'test', 'libertas', 'kailonghuang');
        console.log(account)


    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }

}

main()