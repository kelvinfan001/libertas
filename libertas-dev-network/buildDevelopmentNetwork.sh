# Copyright 2019 Sipher Inc.
#
# SPDX-License-Identifier: Apache-2.0

# This shell script assumes that the required docker images have been installed

export IMAGE_TAG=latest 
export COMPOSE_PROJECT_NAME=libertas-dev-network 

# bring up CA docker containers
mkdir data
docker-compose -f docker-compose-ca.yaml up -d

# generate cryptographic materials
# ../bin/cryptogen generate --config=./crypto-config.yaml
export PATH=$PATH:/home/kai/go/bin # gonna need to change this
./scripts/generate-crypto-materials.sh

export FABRIC_CFG_PATH=$PWD

# # create genesis block
# # channelID... here be dragons...
# ../bin/configtxgen -profile TwoOrgsOrdererDevNetworkGenesis -channelID herebedragons -outputBlock ./channel-artifacts/genesis.block


# # create channel configuration transaction
# ../bin/configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME

# # set up anchor peers
# # define anchor peer for org1
# ../bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/SipherMSPanchors.tx -channelID $CHANNEL_NAME -asOrg SipherMSP

# # define anchor peer for org2
# ../bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/WhiteBoxPlatformMSPanchors.tx -channelID $CHANNEL_NAME -asOrg WhiteBoxPlatformMSP

# # bring up the docker containers for orderers, peers, and CLI
# export DEV_NETWORK_CA1_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/libertas.sipher.co/ca && ls *_sk)
# export DEV_NETWORK_CA2_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/libertas.whiteboxplatform.com/ca && ls *_sk)
# docker-compose -f docker-compose-cli.yaml -f up -d

# # docker exec cli /bin/sh -c "scripts/run.sh"