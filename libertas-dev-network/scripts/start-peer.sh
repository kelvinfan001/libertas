#!/bin/bash
#
# Copyright 2019 Sipher Inc. 
#
#

set -e

scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
source $scriptDir/env.sh

# PEER_HOST defined as env var
PEER_NAME=$PEER_HOST
PEER_PASS=${PEER_NAME}:${PEER_NAME}pw
PEER_HOME=/opt/gopath/src/github.com/hyperledger/fabric/peer
CORE_PEER_MSPCONFIGPATH=$PEER_HOME/msp
ENROLLMENT_URL=http://${PEER_PASS}pw@0.0.0.0:7054

# Enroll the peer to get an enrollment certificate and set up the core's local MSP directory
fabric-ca-client enroll -d -u $ENROLLMENT_URL -M $CORE_PEER_MSPCONFIGPATH

# every peer node has a copy of the org admin cert
copyAdminCert $CORE_PEER_MSPCONFIGPATH

# start the peer
peer node start