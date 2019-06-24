# This shell script assumes that the required docker images have been installed

# generate cryptographic materials
../bin/cryptogen generate --config=./crypto-config.yaml

export FABRIC_CFG_PATH=$PWD

# create genesis block... QUESTION!!! WHAT IS channelID here???????
../bin/configtxgen -profile TwoOrgsOrdererGenesis -channelID election-sys-channel -outputBlock ./channel-artifacts/genesis.block


# create channel configuration transaction
../bin/configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME

# set up anchor peers
# define anchor peer for org1
../bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP

# define anchor peer for org2
../bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org2MSP

# bring up the docker containers for orderers, peers, CLI, and CA's
export BYFN_CA1_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/org1.example.com/ca && ls *_sk)
export BYFN_CA2_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/org2.example.com/ca && ls *_sk)
IMAGE_TAG=latest COMPOSE_PROJECT_NAME=my-network docker-compose -f docker-compose-cli.yaml -f docker-compose-ca.yaml up -d

# docker exec cli /bin/sh -c "scripts/run.sh"