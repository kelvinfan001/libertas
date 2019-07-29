# Copyright 2019 Sipher Inc.
#
# SPDX-License-Identifier: Apache-2.0
#
# This script uninstalls the test app by bringing down the test network and deleting any keys in the wallet.

# Exit on first error
set -e

# Set relative path correctly
cd $(dirname "$0")

# Bring down test network if it is up
if [ "$(docker ps -q -f name=cli)" ]; then
    ./downDevelopmentNetwork.sh
fi

# Remove keys in wallet
rm -rf ./app-server/tests/wallet/*

echo "Squeaky clean!"