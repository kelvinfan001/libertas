/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const registerEnrollUserModule = require('..', './registerEnrollUser.js');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', '..', 'libertas-dev-network', 'connection-sipher.json');
const networkDirPath = path.resolve(__dirname, '..', '..', '..', 'libertas-dev-network')
const walletPath = path.join(process.cwd(), 'wallet')

async function main() {

    try {
        var secret = await registerEnrollUserModule.registerUser(ccpPath, walletPath, "voting_district1", "kelvinfan", "client", "Kelvin Fan", "Personal");

        console.log("kelvinfan's secret: " + secret);

        secret = await registerEnrollUserModule.registerUser(ccpPath, walletPath, "voting_district1", "kailonghuang", "client", "Kailong Huang", "Personal");

        console.log("kailonghuang's secret: " + secret)

    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
}

main();