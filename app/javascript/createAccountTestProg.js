/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const createAccountModule = require('./createAccount');
const path = require('path')

const ccpPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network', 'connection-sipher.json');
const walletPath = path.join(process.cwd(), 'wallet')

async function main() {

    try {
        createAccountModule.createAccount(ccpPath, walletPath, 'test', '123', 'Kelvin', 'kelvin@sipher.co', 'client')
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }

}

main();