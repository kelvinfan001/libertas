# Development Network

Use buildDevelopmentNetwork.sh to bring up a two-organization, solo fabric network with credentials pre-generated 
using the cryptogen tool. Docker containers are on debug mode. 

TODO: use Fabric-CA instead of cryptogen.

Current Implementation:
Cryptogen pre-generates the private/public key pairs and the corresponding certificates at system setup. Admin user
can enroll directly using ID: admin and Secret: adminpw after the network is set up.

This is NOT production ready.
