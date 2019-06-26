#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

set -e

source ./env.sh

# Wait for setup to complete sucessfully
# awaitSetup



ORDERER_HOST=$ORDERER_HOST # need to specify, this would be the name of the container
ORDERER_PASS=${ORDERER_HOST}pw
ORDERER_HOME=/etc/hyperledger/orderer
ORDERER_GENERAL_TLS_PRIVATEKEY=$TLSDIR/tls/server.key
ORDERER_GENERAL_TLS_CERTIFICATE=$TLSDIR/tls/server.crt
ORDERER_GENERAL_LOCALMSPDIR=$ORDERER_HOME/msp
ENROLLMENT_URL=https://${ORDERER_PASS}pw@$admin:7054 # need to specify ORG

# Enroll to get orderer's TLS cert (using the "tls" profile)
fabric-ca-client enroll -d --enrollment.profile tls -u $ENROLLMENT_URL -M /tmp/tls --csr.hosts $ORDERER_HOST

# Copy the TLS key and cert to the appropriate place
TLSDIR=$ORDERER_HOME/tls
mkdir -p $TLSDIR
cp /tmp/tls/keystore/* $ORDERER_GENERAL_TLS_PRIVATEKEY
cp /tmp/tls/signcerts/* $ORDERER_GENERAL_TLS_CERTIFICATE
rm -rf /tmp/tls

# Enroll again to get the orderer's enrollment certificate (default profile)
fabric-ca-client enroll -d -u $ENROLLMENT_URL -M $ORDERER_GENERAL_LOCALMSPDIR

# Finish setting up the local MSP for the orderer
finishMSPSetup $ORDERER_GENERAL_LOCALMSPDIR
# copyAdminCert $ORDERER_GENERAL_LOCALMSPDIR

# Wait for the genesis block to be created
# dowait "genesis block to be created" 60 $SETUP_LOGFILE $ORDERER_GENERAL_GENESISFILE

# Start the orderer
# env | grep ORDERER
# orderer
