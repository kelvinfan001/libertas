/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const registrationEnrollmentModule = require('../registrationEnrollment');
const path = require('path');

const walletPath = path.join(process.cwd(), 'wallet')
const ccpPath = path.resolve(__dirname, '..', '..', '..', 'libertas-dev-network', 'connection-sipher.json');

async function main() {

    try {
        await registrationEnrollmentModule.addAffiliation(walletPath, ccpPath, 'voting_district1')
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
}

main()