/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fs = require('fs');

const accountModule = require('./accounts');
const path = require('path')

const ccpPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network', 'connection-sipher.json');
const walletPath = path.join(process.cwd(), 'wallet')

const certPath = path.resolve(__dirname, './wallet/kelvinfan/kelvinfanCertPem.pem');
const certPem = fs.readFileSync(certPath, 'utf8');

const adminCertPath = path.resolve(__dirname, './wallet/admin/adminCertPem.pem');
const adminCertPem = fs.readFileSync(adminCertPath, 'utf8');

const adminKeyPath = path.resolve(__dirname, './wallet/admin/3fb21beb600f7061ac98e46fb15f1d0f9c33c6cacf4970baf6d3c655b67469ad-priv');
const adminKeyPem = fs.readFileSync(adminKeyPath, 'utf8');

async function main() {

    try {
        await accountModule.createAccountOffline(ccpPath, "test", "libertas", "SipherMSP", certPem, adminCertPem, adminKeyPem, "kelvinfan", "Kelvin Fan", "kelvin@sipher.co", "Personal");
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }

}

main();