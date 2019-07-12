#!/usr/bin/sudo bash
#
# Copyright IBM Corp All Rights Reserved
#
# Modifications Copyright 2019 Sipher Inc.
#
# SPDX-License-Identifier: Apache-2.0
#
# This shell script sets up the network based on the specfications in configtx.yaml and crypto-config.yaml 
# and instantiates the chaincode. 
#
# POLICIES: one peer from Sipher AND one peer from WhiteBoxPlatform. Modifiable. 

# Exit on first error
set -e

# Set relative path correctly
cd $(dirname "$0")

# set some variables
CC_SRC_LANGUAGE=go
CC_RUNTIME_LANGUAGE=golang
# directory for chaincode to install
CC_SRC_PATH=github.com/chaincode/libertas
# set channel name
export CHANNEL_NAME=test
# set contract (chaincode) name
CONTRACT_NAME=libertas
# set chaincode version
CHAINCODE_VERSION=$2 # 1.6.1

# clean the keystore
rm -rf ./hfc-key-store

# launch network
cd ../libertas-dev-network
if [$1 -eq "mac"]; then
    ./buildDevelopmentNetwork.sh
else 
    ./buildDevelopmentNetwork-linux.sh
fi

CONFIG_ROOT=/opt/gopath/src/github.com/hyperledger/fabric/peer

SIPHER_MSPCONFIGPATH=${CONFIG_ROOT}/crypto/peerOrganizations/libertas.sipher.co/users/Admin@libertas.sipher.co/msp
SIPHER_TLS_ROOTCERT_FILE=${CONFIG_ROOT}/crypto/peerOrganizations/libertas.sipher.co/peers/peer0.libertas.sipher.co/tls/ca.crt
 
WHITEBOXPLATFORM_MSPCONFIGPATH=${CONFIG_ROOT}/crypto/peerOrganizations/libertas.whiteboxplatform.com/users/Admin@libertas.whiteboxplatform.com/msp
WHITEBOXPLATFORM_TLS_ROOTCERT_FILE=${CONFIG_ROOT}/crypto/peerOrganizations/libertas.whiteboxplatform.com/peers/peer0.libertas.whiteboxplatform.com/tls/ca.crt

ORDERER_TLS_ROOTCERT_FILE=${CONFIG_ROOT}/crypto/ordererOrganizations/sipher.co/orderers/orderer.sipher.co/msp/tlscacerts/tlsca.sipher.co-cert.pem
set -x

# create channel
echo "Creating channel"
docker exec \
    -e CORE_PEER_MSPCONFIGPATH=${SIPHER_MSPCONFIGPATH} \
    -e CORE_PEER_ADDRESS=peer0.libertas.sipher.co:7051 \
    -e CORE_PEER_LOCALMSPID="SipherMSP" \
    -e CORE_PEER_TLS_ROOTCERT_FILE=${SIPHER_TLS_ROOTCERT_FILE} \
    cli \
    peer channel create \
        -o orderer.sipher.co:7050 \
        -c $CHANNEL_NAME \
        -f ./channel-artifacts/channel.tx \
        --tls \
        --cafile ${ORDERER_TLS_ROOTCERT_FILE}

# join peers to channel
echo "Joining peer0 of Sipher"
docker exec \
    -e CORE_PEER_LOCALMSPID=SipherMSP \
    -e CORE_PEER_ADDRESS=peer0.libertas.sipher.co:7051 \
    -e CORE_PEER_MSPCONFIGPATH=${SIPHER_MSPCONFIGPATH} \
    -e CORE_PEER_TLS_ROOTCERT_FILE=${SIPHER_TLS_ROOTCERT_FILE} \
    cli \
    peer channel join \
        -b ${CHANNEL_NAME}.block

echo "Joining peer1 of Sipher"
docker exec \
    -e CORE_PEER_LOCALMSPID=SipherMSP \
    -e CORE_PEER_ADDRESS=peer1.libertas.sipher.co:8051 \
    -e CORE_PEER_MSPCONFIGPATH=${SIPHER_MSPCONFIGPATH} \
    -e CORE_PEER_TLS_ROOTCERT_FILE=${SIPHER_TLS_ROOTCERT_FILE} \
    cli \
    peer channel join \
        -b ${CHANNEL_NAME}.block

echo "Joining peer0 of WhiteBoxPlatform"
docker exec \
    -e CORE_PEER_LOCALMSPID=WhiteBoxPlatformMSP \
    -e CORE_PEER_ADDRESS=peer0.libertas.whiteboxplatform.com:9051 \
    -e CORE_PEER_MSPCONFIGPATH=${WHITEBOXPLATFORM_MSPCONFIGPATH} \
    -e CORE_PEER_TLS_ROOTCERT_FILE=${WHITEBOXPLATFORM_TLS_ROOTCERT_FILE} \
    cli \
    peer channel join \
        -b ${CHANNEL_NAME}.block

echo "Joining peer1 of WhiteBoxPlatform"
docker exec \
    -e CORE_PEER_LOCALMSPID=WhiteBoxPlatformMSP \
    -e CORE_PEER_ADDRESS=peer1.libertas.whiteboxplatform.com:10051 \
    -e CORE_PEER_MSPCONFIGPATH=${WHITEBOXPLATFORM_MSPCONFIGPATH} \
    -e CORE_PEER_TLS_ROOTCERT_FILE=${WHITEBOXPLATFORM_TLS_ROOTCERT_FILE} \
    cli \
    peer channel join \
        -b ${CHANNEL_NAME}.block

# update anchor peers
echo "Updating channel definition to define anchor peer for Sipher as peer0.libertas.sipher.co"
docker exec \
    -e CORE_PEER_LOCALMSPID=SipherMSP \
    -e CORE_PEER_ADDRESS=peer0.libertas.sipher.co:7051 \
    -e CORE_PEER_MSPCONFIGPATH=${SIPHER_MSPCONFIGPATH} \
    -e CORE_PEER_TLS_ROOTCERT_FILE=${SIPHER_TLS_ROOTCERT_FILE} \
    cli \
    peer channel update \
        -o orderer.sipher.co:7050 -c $CHANNEL_NAME \
        -f ./channel-artifacts/SipherMSPanchors.tx \
        --tls \
        --cafile ${ORDERER_TLS_ROOTCERT_FILE} \

echo "Updating channel definition to define anchor peer for WhiteBoxPlatform as peer0.libertas.whiteboxplatform.com"
docker exec \
    -e CORE_PEER_LOCALMSPID=WhiteBoxPlatformMSP \
    -e CORE_PEER_ADDRESS=peer0.libertas.whiteboxplatform.com:9051 \
    -e CORE_PEER_MSPCONFIGPATH=${WHITEBOXPLATFORM_MSPCONFIGPATH} \
    -e CORE_PEER_TLS_ROOTCERT_FILE=${WHITEBOXPLATFORM_TLS_ROOTCERT_FILE} \
    cli \
    peer channel update \
        -o orderer.sipher.co:7050 -c $CHANNEL_NAME \
        -f ./channel-artifacts/WhiteBoxPlatformMSPanchors.tx \
        --tls \
        --cafile ${ORDERER_TLS_ROOTCERT_FILE} \

# install chaincode and instantiate
echo "Installing smart contract \"libertas\" on peer0 of Sipher"
docker exec \
    -e CORE_PEER_LOCALMSPID=SipherMSP \
    -e CORE_PEER_ADDRESS=peer0.libertas.sipher.co:7051 \
    -e CORE_PEER_MSPCONFIGPATH=${SIPHER_MSPCONFIGPATH} \
    -e CORE_PEER_TLS_ROOTCERT_FILE=${SIPHER_TLS_ROOTCERT_FILE} \
    cli \
    peer chaincode install \
        -n $CONTRACT_NAME \
        -v $CHAINCODE_VERSION \
        -p "$CC_SRC_PATH" \
        #-l "$CC_RUNTIME_LANGUAGE"

echo "Installing smart contract \"libertas\" on peer0 of WhiteBoxPlatform"
docker exec \
    -e CORE_PEER_LOCALMSPID=WhiteBoxPlatformMSP \
    -e CORE_PEER_ADDRESS=peer0.libertas.whiteboxplatform.com:9051 \
    -e CORE_PEER_MSPCONFIGPATH=${WHITEBOXPLATFORM_MSPCONFIGPATH} \
    -e CORE_PEER_TLS_ROOTCERT_FILE=${WHITEBOXPLATFORM_TLS_ROOTCERT_FILE} \
    cli \
    peer chaincode install \
        -n $CONTRACT_NAME \
        -v $CHAINCODE_VERSION \
        -p "$CC_SRC_PATH" \
        #-l "$CC_RUNTIME_LANGUAGE"

echo "Instantiating smart contract \"libertas\" on testchannel"
docker exec \
    -e CORE_PEER_LOCALMSPID=SipherMSP \
    -e CORE_PEER_MSPCONFIGPATH=${SIPHER_MSPCONFIGPATH} \
    cli \
    peer chaincode instantiate \
        -o orderer.sipher.co:7050 \
        -C $CHANNEL_NAME \
        -n $CONTRACT_NAME \
        -v $CHAINCODE_VERSION \
        -c '{"Args":["init", "123", "derp"]}' \
        -P "AND('SipherMSP.member','WhiteBoxPlatformMSP.member')" \
        --tls \
        --cafile ${ORDERER_TLS_ROOTCERT_FILE} \
        --peerAddresses peer0.libertas.sipher.co:7051 \
        --tlsRootCertFiles ${SIPHER_TLS_ROOTCERT_FILE}
        #-l "$CC_RUNTIME_LANGUAGE" \
        # TOOD: maybe put names in a variable, e.g. Dummy Name

echo "Waiting for instatiation request to be committed..."
echo " Going to sleep for 15 seconds."
set +x
sleep 5
echo "Still sleeping..."
sleep 5
echo "Derp derp"
sleep 5

echo "ALL GOOD!"
