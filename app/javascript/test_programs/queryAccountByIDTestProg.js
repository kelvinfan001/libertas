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
        const result = await accountModule.queryAccountByID(ccpPath, walletPath, "kelvinfan", "test", "libertas", "kailonghuang");
        console.log(result)
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }

}

main();