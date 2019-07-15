
/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const enrollAdminModule = require('../enrollAdmin.js');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', '..', 'libertas-dev-network', 'connection-sipher.json');
const networkDirPath = path.resolve(__dirname, '..', '..', '..', 'libertas-dev-network')

async function main() {

    try {
        enrollAdminModule.enrollAdmin(ccpPath, 'ca.libertas.sipher.co', networkDirPath, path.join(process.cwd(), 'wallet'), 'admin', 'adminpw', 'SipherMSP');
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }

}

main()