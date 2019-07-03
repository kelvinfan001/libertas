    #!/bin/bash
#
# Copyright 2019 Sipher Inc. 
#
#

set -e

scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
# source $scriptDir/env.sh

# Copy the org's admin cert into some target MSP directory
# We do this for the peer nodes
function copyAdminCert {
   if [ $# -ne 1 ]; then
      fatal "Usage: copyAdminCert <targetMSPDIR>"
   fi
   
   dstDir=$1/admincerts
   ORG_MSP_DIR=/data/orgs/${ORG}/msp
   ORG_ADMIN_CERT=${ORG_MSP_DIR}/admincerts/cert.pem
   mkdir -p $dstDir
   # dowait "$ORG administator to enroll" 60 $SETUP_LOGFILE $ORG_ADMIN_CERT
   cp $ORG_ADMIN_CERT $dstDir
}

# ORDERER_HOST=$ORDERER_HOST # need to specify, this would be the name of the container
ORDERER_PASS=${ORDERER_HOST}:${ORDERER_HOST}pw
ENROLLMENT_URL=http://${ORDERER_PASS}@ca-sipher:7054 

# Enroll again to get the orderer's enrollment certificate (default profile)
fabric-ca-client enroll -d -u $ENROLLMENT_URL -M $ORDERER_GENERAL_LOCALMSPDIR

# every ordering node has a copy of the org admin cert
copyAdminCert $ORDERER_GENERAL_LOCALMSPDIR

# start the orderer
orderer