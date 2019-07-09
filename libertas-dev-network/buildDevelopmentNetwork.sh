#!/usr/bin/sudo bash
# Copyright 2019 Sipher Inc.
#
# SPDX-License-Identifier: Apache-2.0
#
#

# This shell script assumes that the required docker images have been installed

PATH=$PATH:/home/kai/go/bin # we can have an arg for user
sudo -E env "PATH=$PATH" "$@"

export IMAGE_TAG=1.4.1 # specify version to use here
export COMPOSE_PROJECT_NAME=libertas-dev-network 

# build docker images for peer and ordering nodes compatible with fabric ca
function build_docker_images {
  docker build -f dockerbuild/fabric-ca-peer.dockerfile -t hyperledger/fabric-ca-peer:1.4.1 .
  docker build -f dockerbuild/fabric-ca-orderer.dockerfile -t hyperledger/fabric-ca-orderer:1.4.1 .
  # clean dangling images
  docker rmi $(docker images -f "dangling=true" -q)
}

# source ./scripts/env.sh
function wait_file {
  local file="$1"; shift
  local wait_seconds="${1:-10}"; shift # 10 seconds as default timeout

  until test $((wait_seconds--)) -eq 0 -o -f "$file" ; do sleep 1; done

  ((++wait_seconds))
}

#-----------------------------------------------------MAIN-------------------------------------------------------

echo "----------------------------------------Building Docker Images--------------------------------------------"
build_docker_images

# bring up CA docker containers
echo "----------------------------------------Bringing up CA containers-----------------------------------------"
mkdir data
docker-compose -f docker-compose-ca.yaml up -d

# generate cryptographic materials
# ../bin/cryptogen generate --config=./crypto-config.yaml
# export PATH=$PATH:/home/kai/go/bin # gonna need to change this
# wait until the ca containers finish setting up
echo "----------------------------------------Generating Crypto Materials-----------------------------------------"
wait_file ./data/ca-cert.pem
./scripts/generate-crypto-materials.sh
chmod -R 777 data/

echo "-----------------Doing Stuff--------------------------------"
export FABRIC_CFG_PATH=$PWD

# # create genesis block
# # channelID... here be dragons...
export CHANNEL_NAME=mychannel
mkdir channel-artifacts
../bin/configtxgen -profile TwoOrgsOrdererDevNetworkGenesis -channelID $CHANNEL_NAME -outputBlock ./channel-artifacts/genesis.block


# # create channel configuration transaction
../bin/configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME # need to specify channel name
# # set up anchor peers
# # define anchor peer for org1
../bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/SipherMSPanchors.tx -channelID $CHANNEL_NAME -asOrg SipherMSP

# # define anchor peer for org2
../bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/WhiteBoxPlatformMSPanchors.tx -channelID $CHANNEL_NAME -asOrg WhiteBoxPlatformMSP

# # bring up the docker containers for orderers, peers, and CLI
# export DEV_NETWORK_CA1_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/libertas.sipher.co/ca && ls *_sk)
# export DEV_NETWORK_CA2_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/libertas.whiteboxplatform.com/ca && ls *_sk)
docker-compose -f docker-compose-cli.yaml up 

# docker exec cli /bin/sh -c "scripts/run.sh"


# TODO >> make admin user msp for cli, logs and wait

