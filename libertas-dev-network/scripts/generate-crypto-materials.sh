set -e

source ./env.sh

export PEER_ORGS="sipher whiteboxplatform"
export NUM_ORDERERS=2 # number of ordering nodes for each ordering org
export ORDERER_ORGS="ordsipher"
export NUM_PEERS=1 # number of peer nodes for each peer org
export ORGS="$ORDERER_ORGS $PEER_ORGS"

# Register any identities associated with the orderer
function registerOrdererIdentities {
   for ORG in $ORDERER_ORGS; do
      local COUNT=1
      while [[ "$COUNT" -le $NUM_ORDERERS ]]; do
         ORDERER_NAME=${COUNT}-${ORG}
         echo "Registering $ORDERER_NAME" # with $CA_NAME"
         fabric-ca-client register -d --id.name $ORDERER_NAME --id.secret ${ORDERER_NAME}pw --id.type orderer # maybe we need diff pass for diff nodes
         COUNT=$((COUNT+1))
      done
   done
}

# Register any identities associated with a peer
function registerPeerIdentities {
   for ORG in $PEER_ORGS; do
      local COUNT=1
      while [[ "$COUNT" -le $NUM_PEERS ]]; do
         PEER_NAME=${COUNT}-${ORG}
         echo "Registering $PEER_NAME" # with $CA_NAME"
         fabric-ca-client register -d --id.name $PEER_NAME --id.secret ${PEER_NAME}pw --id.type peer
         COUNT=$((COUNT+1))
      done
   done
}

function getCACerts {
   log "Getting CA certificates ..."
   for ORG in $ORGS; do
      # initOrgVars $ORG
      ORG_MSP_DIR=/data/orgs/${ORG}/msp
      echo "Getting CA certs for organization $ORG and storing in $ORG_MSP_DIR"
      # export FABRIC_CA_CLIENT_TLS_CERTFILES=$CA_CHAINFILE
      fabric-ca-client getcacert -d -u http://0.0.0.0:7054 -M $ORG_MSP_DIR
      # finishMSPSetup $ORG_MSP_DIR
   done
}

# Enroll the CA administrator
function enrollCAAdmin {
   # ORG=$1
   # CA_HOST=ca-${ORG}
   # waitPort "$CA_NAME to start" 90 $CA_LOGFILE $CA_HOST 7054
   echo "Enrolling with $CA_HOST as bootstrap identity ..."
   # export FABRIC_CA_CLIENT_HOME=$HOME/cas/$CA_NAME
   # export FABRIC_CA_CLIENT_TLS_CERTFILES=$CA_CHAINFILE
   fabric-ca-client enroll -d -u http://admin:adminpw@0.0.0.0:7054
   # fabric-ca-client enroll -d -u http://admin:adminpw@0.0.0.0:8054
}

echo "Enrolling CA admin ..."
enrollCAAdmin # $ORG
echo "Registering identities ..."
registerOrdererIdentities
registerPeerIdentities
echo "Generating MSP folders ..."
enrollCAAdmin

# TODO >> admins, tls

# steps >> bring up ca containers, generate crypto materials, bring up peer and ordering node containers