/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Takes in two command line arguments for the two secrets required to enroll new users kelvinfan 
 * and kailonghuang.
 * 
 */

'use strict';

const registrationEnrollmentModule = require('../registrationEnrollment');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', '..', 'libertas-dev-network', 'connection-sipher.json');
const networkDirPath = path.resolve(__dirname, '..', '..', '..', 'libertas-dev-network')
const walletPath = path.join(process.cwd(), 'wallet')

async function main() {

    try {

        const secret1 = process.argv[2];

        const secret2 = process.argv[3];

        await registrationEnrollmentModule.enrollUser(ccpPath, walletPath, "ca.libertas.sipher.co", networkDirPath, "kelvinfan", secret1, "SipherMSP");

        await registrationEnrollmentModule.enrollUser(ccpPath, walletPath, "ca.libertas.sipher.co", networkDirPath, "kailonghuang", secret2, "SipherMSP");

    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
}

main();

