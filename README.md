# Libertas

## App Usage
### Step 1: Network-related registration.
1. Administrator registers new user identities with the CA by providing **enrollmentID**, **affiliation**, and **role**. CA returns enrollment **secret** to administrator. Additionally, the administrator will need to provide the new user's legal **name** and **accountType** as attributes to be used by the Libertas account. 
2. Administrator provides enrollment ID and secret to actual users (through mail, email, or other secure means).
3. Users enroll their identities on the network with the provided enrollment ID and secret. User securely receives their locally generated public and private keys, and a signed certificate in their wallet. 
### Step 2: App-related registration.
1. Users create Libertas account by providing their **id**, **name**, **email**, and **accountType**. The **id** must be the same as the network enrollment ID provided by the administrator, **name** must be the user's legal name, and **accountType** must be the correct **accountType**. The user may choose an **email** to be associated with this Libertas account.
2. Users may call chaincode functions by providing their network identities (through their wallets), which are now associated with a unique Libertas account.

Note: Steps 1.3 and 2.1 should probably seem like a single "Create Account" step in the UI.

## Fabric Installation
Install Samples, Binaries and Docker Images: https://hyperledger-fabric.readthedocs.io/en/release-1.4/install.html
1. cd into root directory
2. curl -sSL http://bit.ly/2ysbOFE | bash -s -- 1.4.1 1.4.1

## Network

Use buildDevelopmentNetwork.sh to bring up a two-organization, solo fabric network with credentials pre-generated 
using the cryptogen tool. Docker containers are on debug mode. 

TODO: Replace CLI, implement raft ordering service

Current Implementation:
Cryptogen pre-generates the private/public key pairs and the corresponding certificates at system setup. Admin user
can enroll directly using ID: admin and Secret: adminpw after the network is set up.

This is NOT production ready.

## Dependencies
* Nodejs
* NPM
* Golang
* Docker
* Docker-compose
* build-essentials(for linux)
