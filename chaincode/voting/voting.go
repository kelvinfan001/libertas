package main

import (
	"bytes"
	"encoding/gob"
	"fmt"
	"log"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// Vote represents a vote.
type Vote struct {
	CastedBy string
	CastedTo string
}

// BallotBox is the collection of casted Votes.
type BallotBox struct {
	Votes []Vote
}

// Election is a simple election implementation
type Election struct {
}

// Init initializses the chaincode
func (t *Election) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Election Init")
	_, args := stub.GetFunctionAndParameters()
	var electionName string
	var electionNameVal string
	var err error
	var ballotBoxBytes []byte // ballot box in bytes

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	// Initialize the chaincode
	electionName = "Election Name"
	electionNameVal = args[0]

	// Make an empty BallotBox
	votesSlice := make([]Vote, 0)
	ballotBox := BallotBox{votesSlice}

	ballotBoxBytes = convertToByte(ballotBox)

	// Write the state to the ledger
	err = stub.PutState(electionName, []byte(electionNameVal))
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState("Ballot Box", ballotBoxBytes[:])
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

// Invoke invokes stuff
func (t *Election) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Election Invoke")
	function, args := stub.GetFunctionAndParameters()
	if function == "vote" {
		// Cast a vote
		return t.vote(stub, args)
	} else if function == "query" {
		// Query
		return t.query(stub, args)
	}

	return shim.Error("Invalid invoke function name. Expecting \"vote\" or \"query\"")
}

// Queries the number of ballots in the ballot box
func (t *Election) query(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var ballotBoxBytes []byte
	var err error

	if len(args) != 0 {
		return shim.Error("Incorrect number of arguments. Expecting 0")
	}

	// Get the ballot box from the ledger
	ballotBoxBytes, err = stub.GetState("Ballot Box")
	if err != nil {
		return shim.Error("Failed to retrieve ballot box")
	}
	ballotBox := convertBallotBoxFromByte(ballotBoxBytes)

	fmt.Printf("There are %d votes in the ballot box\n", len(ballotBox.Votes))

	numVotes := []byte(strconv.Itoa(len(ballotBox.Votes)))

	return shim.Success(numVotes)
}

func (t *Election) vote(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var castedBy, castedTo string
	var err error
	var ballotBoxBytes []byte

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	castedBy = args[0]
	castedTo = args[1]

	// Create the new vote
	newVote := Vote{castedBy, castedTo}

	// Get the ballot box from the ledger
	ballotBoxBytes, err = stub.GetState("Ballot Box")
	ballotBox := convertBallotBoxFromByte(ballotBoxBytes)

	// Put the vote in the ballotBox
	ballotBox.Votes = append(ballotBox.Votes, newVote)

	// Update state and put state on ledger
	ballotBoxBytes = convertToByte(ballotBox)

	err = stub.PutState("Ballot Box", ballotBoxBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("Vote casted.")

	return shim.Success(nil)
}

func convertToByte(toConvert BallotBox) []byte {

	var result bytes.Buffer
	encoder := gob.NewEncoder(&result)

	if err := encoder.Encode(toConvert); err != nil {
		// TODO: set error properly
		log.Fatal("encode error:", err)
	}

	return result.Bytes()
}

func convertBallotBoxFromByte(toConvert []byte) BallotBox {
	var ret BallotBox

	decoder := gob.NewDecoder(bytes.NewReader(toConvert))

	if err := decoder.Decode(&ret); err != nil {
		// TODO: set error properly
		log.Fatal("decode error:", err)
	}

	return ret
}

func main() {
	err := shim.Start(new(Election))
	if err != nil {
		fmt.Printf("Error starting Election: %s", err)
	}
}
