#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

set -e

scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
source $scriptDir/env.sh

# PEER_HOST=....
PEER_NAME=$PEER_HOST
PEER_PASS=${PEER_NAME}:${PEER_NAME}pw
PEER_HOME=/opt/gopath/src/github.com/hyperledger/fabric/peer
# CORE_PEER_TLS_CERT_FILE=$PEER_HOME/tls/server.crtchannelchannelchannelchchannelannel
# CORE_PEER_TLS_KEY_FILE=$PEER_HOME/tls/server.key
CORE_PEER_MSPCONFIGPATH=$PEER_HOME/msp
# CORE_PEER_TLS_CLIENTCERT_FILE=/data/tls/$PEER_NAME-client.crt
# CORE_PEER_TLS_CLIENTKEY_FILE=/data/tls/$PEER_NAME-client.key
ENROLLMENT_URL=https://${PEER_PASS}pw@0.0.0.0:7054

# awaitSetup

# Although a peer may use the same TLS key and certificate file for both inbound and outbound TLS,
# we generate a different key and certificate for inbound and outbound TLS simply to show that it is permissible

# Generate server TLS cert and key pair for the peer
# fabric-ca-client enroll -d --enrollment.profile tls -u $ENROLLMENT_URL -M /tmp/tls --csr.hosts $PEER_HOST

# Copy the TLS key and cert to the appropriate place
# TLSDIR=$PEER_HOME/tls
# mkdir -p $TLSDIR
# cp /tmp/tls/signcerts/* $CORE_PEER_TLS_CERT_FILE
# cp /tmp/tls/keystore/* $CORE_PEER_TLS_KEY_FILE
# rm -rf /tmp/tls

# Generate client TLS cert and key pair for the peer
# genClientTLSCert $ENROLLMENT_URL $PEER_NAME $CORE_PEER_TLS_CLIENTCERT_FILE $CORE_PEER_TLS_CLIENTKEY_FILE

# Generate client TLS cert and key pair for the peer CLI
# genClientTLSCert $ENROLLMENT_URL $PEER_NAME /data/tls/$PEER_NAME-cli-client.crt /data/tls/$PEER_NAME-cli-client.key

# Enroll the peer to get an enrollment certificate and set up the core's local MSP directory

fabric-ca-client enroll -d -u $ENROLLMENT_URL -M $CORE_PEER_MSPCONFIGPATH
# finishMSPSetup $CORE_PEER_MSPCONFIGPATH
# copyAdminCert $CORE_PEER_MSPCONFIGPATH

# Start the peer
# log "Starting peer '$CORE_PEER_ID' with MSP at '$CORE_PEER_MSPCONFIGPATH'"
# env | grep CORE
# peer node start

# every peer node has a copy of the org admin cert
copyAdminCert $CORE_PEER_MSPCONFIGPATH