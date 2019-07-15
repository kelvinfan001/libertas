/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const registerEnrollUserModule = require('../registerEnrollUser.js');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', '..', 'libertas-dev-network', 'connection-sipher.json');
const networkDirPath = path.resolve(__dirname, '..', '..', '..', 'libertas-dev-network')
const walletPath = path.join(process.cwd(), 'wallet')

async function main() {

    try {

        const secret1 = process.argv[2];

        const secret2 = process.argv[3];

        await registerEnrollUserModule.enrollUser(ccpPath, walletPath, "ca.libertas.sipher.co", networkDirPath, "kelvinfan", secret1, "SipherMSP");

        await registerEnrollUserModule.enrollUser(ccpPath, walletPath, "ca.libertas.sipher.co", networkDirPath, "kailonghuang", secret2, "SipherMSP");

    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
}

main();