# Copyright 2019 Sipher Inc.
#
# SPDX-License-Identifier: Apache-2.0
#
# This script uninstalls the test app by bringing down the test network and deleting any keys in the wallet.

# Bring down test network
cd ../libertas-dev-network
./downDevelopmentNetwork.sh

# Remove keys in wallet
cd ../test_app/javascript/
rm -rf ./wallet/*

echo "Squeaky clean!"