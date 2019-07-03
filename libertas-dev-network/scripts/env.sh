#!/bin/bash

set -e

# usage: wait_file <file>
function wait_file {
  local file="$1"; shift
  local wait_seconds="${1:-10}"; shift # 10 seconds as default timeout

  until test $((wait_seconds--)) -eq 0 -o -f "$file" ; do sleep 1; done

  ((++wait_seconds))
}

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

