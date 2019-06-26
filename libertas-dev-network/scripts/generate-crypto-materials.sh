
export PEER_ORGS=""
export NUM_ORDERERS=0
export ORDERER_ORGS""
expor NUM_PEERS=0

log "Registering identities ..."
registerOrdererIdentities
registerPeerIdentities

# Register any identities associated with the orderer
function registerOrdererIdentities {
   for ORG in $ORDERER_ORGS; do
    #   initOrgVars $ORG
    #   enrollCAAdmin
      local COUNT=1
      while [[ "$COUNT" -le $NUM_ORDERERS ]]; do
        #  initOrdererVars $ORG $COUNT
         ORDERER_NAME=${COUNT}-${ORG}
         log "Registering $ORDERER_NAME" # with $CA_NAME"
         fabric-ca-client register -d --id.name $ORDERER_NAME --id.secret ${ORDERER_NAME}pw --id.type orderer # maybe we need diff pass for diff nodes
         COUNT=$((COUNT+1))
      done
    #   log "Registering admin identity with $CA_NAME"
      # The admin identity has the "admin" attribute which is added to ECert by default
    #   fabric-ca-client register -d --id.name $ADMIN_NAME --id.secret $ADMIN_PASS --id.attrs "admin=true:ecert"
   done
}

# Register any identities associated with a peer
function registerPeerIdentities {
   for ORG in $PEER_ORGS; do
    #   initOrgVars $ORG
    #   enrollCAAdmin
      local COUNT=1
      while [[ "$COUNT" -le $NUM_PEERS ]]; do
        #  initPeerVars $ORG $COUNT
         PEER_NAME=${COUNT}-${ORG}
         log "Registering $PEER_NAME" # with $CA_NAME"
         fabric-ca-client register -d --id.name $PEER_NAME --id.secret ${PEER_NAME}pw --id.type peer
         COUNT=$((COUNT+1))
      done
    #   log "Registering admin identity with $CA_NAME"
      # The admin identity has the "admin" attribute which is added to ECert by default
    #   fabric-ca-client register -d --id.name $ADMIN_NAME --id.secret $ADMIN_PASS --id.attrs "hf.Registrar.Roles=client,hf.Registrar.Attributes=*,hf.Revoker=true,hf.GenCRL=true,admin=true:ecert,abac.init=true:ecert"
    #   log "Registering user identity with $CA_NAME"
    #   fabric-ca-client register -d --id.name $USER_NAME --id.secret $USER_PASS
   done
}

function getCACerts {
   log "Getting CA certificates ..."
   for ORG in $ORGS; do
      initOrgVars $ORG
      log "Getting CA certs for organization $ORG and storing in $ORG_MSP_DIR"
      export FABRIC_CA_CLIENT_TLS_CERTFILES=$CA_CHAINFILE
      fabric-ca-client getcacert -d -u https://admin:7054 -M $ORG_MSP_DIR
      finishMSPSetup $ORG_MSP_DIR
      # If ADMINCERTS is true, we need to enroll the admin now to populate the admincerts directory
    #   if [ $ADMINCERTS ]; then
    #      switchToAdminIdentity
    #   fi
   done
}

