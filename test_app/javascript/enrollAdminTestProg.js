/*
 * Modification Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const enrollAdmin = require('./enrollAdmin.js');

// const FabricCAServices = require('fabric-ca-client');
// const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
// const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network', 'connection-sipher.json');
// const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
// const ccp = JSON.parse(ccpJSON);

const networkDirPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network')

async function main() {

    try {
        enrollAdmin.enroll(ccpPath, 'ca.libertas.sipher.co', networkDirPath, path.join(process.cwd(), 'wallet'), 'admin', 'adminpw', 'SipherMSP');
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }

}

main()