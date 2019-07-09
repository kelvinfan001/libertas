/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const queryByIDModule = require('./queryByID');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network', 'connection-sipher.json');
const walletPath = path.join(process.cwd(), 'wallet')

async function main() {

    try {
        const userExists = await queryByIDModule.queryByID(ccpPath, walletPath, 'kelvinfan', 'test', 'libertas', 'kailonghuang');
        if (userExists === 'true') {
            console.log('ID kailonghuang exists');
        } else {
            console.log('ID kailonghuang does not exist');
        }
        
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
}

main();