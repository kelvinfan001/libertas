# Copyright 2019 Sipher Inc.
#
# SPDX-License-Identifier: Apache-2.0

# This shell script assumes that the required docker images have been installed

# generate cryptographic materials
../bin/cryptogen generate --config=./crypto-config.yaml

export FABRIC_CFG_PATH=$PWD

# create genesis block
# channelID... here be dragons...
../bin/configtxgen -profile TwoOrgsOrdererDevNetworkGenesis -channelID libertas-sys-channel -outputBlock ./channel-artifacts/genesis.block


# create channel configuration transaction
../bin/configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME

# set up anchor peers
# define anchor peer for org1
../bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg SipherMSP

# define anchor peer for org2
../bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID $CHANNEL_NAME -asOrg WhiteBoxPlatformMSP

# bring up the docker containers for orderers, peers, CLI, and CA's
export DEV_NETWORK_CA1_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/libertas.sipher.co/ca && ls *_sk)
export DEV_NETWORK_CA2_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/libertas.whiteboxplatform.com/ca && ls *_sk)
IMAGE_TAG=latest COMPOSE_PROJECT_NAME=libertas-dev-network docker-compose -f docker-compose-cli.yaml -f docker-compose-ca.yaml up -d

# docker exec cli /bin/sh -c "scripts/run.sh"