#!/bin/bash
#
# Copyright 2019 Sipher Inc. 
#
#

set -e

scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
source $scriptDir/env.sh


# ORDERER_HOST=$ORDERER_HOST # need to specify, this would be the name of the container
ORDERER_PASS=${ORDERER_HOST}:${ORDERER_HOST}pw
ORDERER_HOME=/etc/hyperledger/orderer
ORDERER_GENERAL_LOCALMSPDIR=$ORDERER_HOME/msp
ENROLLMENT_URL=http://${ORDERER_PASS}pw@0.0.0.0:7054 

# Enroll again to get the orderer's enrollment certificate (default profile)
fabric-ca-client enroll -d -u $ENROLLMENT_URL -M $ORDERER_GENERAL_LOCALMSPDIR

# every ordering node has a copy of the org admin cert
copyAdminCert $ORDERER_GENERAL_LOCALMSPDIR

# start the orderer
orderer