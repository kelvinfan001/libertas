/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

package votergroup

import (
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// VoterGroup is a group of voters.
type VoterGroup struct {
	ID        string
	ProjectID string
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
	Voters    []Voter
}

// CreateVoterGroup creates a new voter group
func (t *Libertas) CreateVoterGroup(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var id, projectID, name, creatorID string
	var createdAt, updatedAt time.Time

	id = args[0]
	projectID = args[1]
	name = args[2]
	transactionTimeProtobuf, _ := stub.GetTxTimestamp()
	// Convert protobuf timestamp to Time data structure
	transactionTime := time.Unix(transactionTimeProtobuf.Seconds, int64(transactionTimeProtobuf.Nanos))

	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3.")
	}

	// Require that the account calling this function is an Institution Account..

}
