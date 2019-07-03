#!/usr/bin/sudo bash
# Use this script to bring down the network and clean network-specific artifacts.

set -x

# clean up docker containers
docker kill $(docker ps -q)
docker system prune --volumes << !
y
!
docker rmi $(docker images -a)

# delete blocks and certificates, if already existing
rm -rf ./channel-artifacts/
rm -rf ./crypto-config/
rm -rf ./data/
