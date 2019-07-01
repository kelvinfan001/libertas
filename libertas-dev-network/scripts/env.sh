set -e

# function genClientTLSCert {
#     ENROLLMENT_URL=$1

#    if [ $# -ne 3 ]; then
#       echo "Usage: genClientTLSCert <host name> <cert file> <key file>: $*"
#       exit 1
#    fi

#    HOST_NAME=$2
#    CERT_FILE=$3
#    KEY_FILE=$4

#    # Get a client cert
#    fabric-ca-client enroll -d --enrollment.profile tls -u $ENROLLMENT_URL -M /tmp/tls --csr.hosts $HOST_NAME

#    mkdir /data/tls || true
#    cp /tmp/tls/signcerts/* $CERT_FILE
#    cp /tmp/tls/keystore/* $KEY_FILE
#    rm -rf /tmp/tls
# }


# Copy the org's admin cert into some target MSP directory
# We do this for the peer nodes
function copyAdminCert {
   if [ $# -ne 1 ]; then
      fatal "Usage: copyAdminCert <targetMSPDIR>"
   fi
   
   dstDir=$1/admincerts
   mkdir -p $dstDir
   # dowait "$ORG administator to enroll" 60 $SETUP_LOGFILE $ORG_ADMIN_CERT
   cp $ORG_ADMIN_CERT $dstDir
}

# # Create the TLS directories of the MSP folder if they don't exist.
# # The fabric-ca-client should do this.
# function finishMSPSetup {
#    if [ $# -ne 1 ]; then
#       fatal "Usage: finishMSPSetup <targetMSPDIR>"
#    fi
#    if [ ! -d $1/tlscacerts ]; then
#       mkdir $1/tlscacerts
#       cp $1/cacerts/* $1/tlscacerts
#       if [ -d $1/intermediatecerts ]; then
#          mkdir $1/tlsintermediatecerts
#          cp $1/intermediatecerts/* $1/tlsintermediatecerts
#       fi
#    fi
# }