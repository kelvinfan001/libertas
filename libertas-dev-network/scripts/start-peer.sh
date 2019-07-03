#!/bin/bash
#
# Copyright 2019 Sipher Inc. 
#
#

set -e

scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
# source $scriptDir/env.sh

# Copy the org's admin cert into some target MSP directory
# We do this for the peer nodes
function copyAdminCert {
   if [ $# -ne 1 ]; then
      fatal "Usage: copyAdminCert <targetMSPDIR>"
   fi
   
   dstDir=$1/admincerts
   mkdir -p $dstDir
   # dowait "$ORG administator to enroll" 60 $SETUP_LOGFILE $ORG_ADMIN_CERT
   cp $ORG_ADMIN_CERT $dstDir
}


# PEER_HOST defined as env var
PEER_NAME=$PEER_HOST
PEER_PASS=${PEER_NAME}:${PEER_NAME}pw
PEER_HOME=/opt/gopath/src/github.com/hyperledger/fabric/peer
CORE_PEER_MSPCONFIGPATH=$PEER_HOME/msp
ENROLLMENT_URL=http://${PEER_PASS}@ca-sipher:7054

# Enroll the peer to get an enrollment certificate and set up the core's local MSP directory
fabric-ca-client enroll -d -u $ENROLLMENT_URL -M $CORE_PEER_MSPCONFIGPATH

# every peer node has a copy of the org admin cert
copyAdminCert $CORE_PEER_MSPCONFIGPATH

# start the peer
peer node start