/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const accountModule = require('../accounts');
const path = require('path')

const ccpPath = path.resolve(__dirname, '..', '..', '..', 'libertas-dev-network', 'connection-sipher.json');
const walletPath = path.join(process.cwd(), 'wallet')

async function main() {

    try {
        await accountModule.createAccount(ccpPath, walletPath, "test", "libertas", "kelvinfan", "Kelvin Fan", "kelvin@sipher.co", "Personal");
        await accountModule.createAccount(ccpPath, walletPath, "test", "libertas", "kailonghuang", "Kailong Huang", "kailong@sipher.co", "Personal");
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }

}

main();