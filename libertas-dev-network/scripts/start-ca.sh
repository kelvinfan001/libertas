# Initialize the root CA

fabric-ca-server init -b admin:adminpw

cp $FABRIC_CA_HOME/ca-cert.pem /data

# fabric-ca-server start --ca.certfile /etc/hyperledger/fabric-ca-server-config/ca.libertas.${ORG}.com-cert.pem --ca.keyfile /etc/hyperledger/fabric-ca-server-config/${DEV_NETWORK_CA_PRIVATE_KEY} -b admin:adminpw -d

fabric-ca-server start -b admin:adminpw -d