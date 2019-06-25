# Use this script to bring down the network and clean network-specific artifacts.

# clean up docker containers
docker kill $(docker ps -q)
docker rm $(docker ps -aq)
docker system prune --volumes << !
y
!

# delete blocks and certificates, if already existing
rm -f ./channel-artifacts/*
rm -f -r ./crypto-config/*
