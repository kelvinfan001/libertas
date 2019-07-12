/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

package main

import (
	"testing"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

func TestLibertas_Init(t *testing.T) {
	scc := new(Libertas)
	stub := shim.NewMockStub("libertas", scc)

	// Init "Project ID"="123", "Project Name"="Derp Project"
	checkInit(t, stub, [][]byte{[]byte("init"), []byte("123"), []byte("Derp Project")})

	checkState(t, stub, "Project ID", "123")
	checkState(t, stub, "Project Name", "Derp Project")
	// TODO: check state for 'Project Create Time'
}

// func TestLibertas_Invoke(t *testing.T) {
// 	scc := new(Libertas)
// 	stub := shim.NewMockStub("libertas", scc)

// 	// Init "Project ID"="123", "Project Name"="Derp Project"
// 	checkInit(t, stub, [][]byte{[]byte("init"), []byte("123"), []byte("Derp Project")})

// 	// Make a creator identity
// 	sid := &msp.SerializedIdentity{Mspid: "SipherMSP", IdBytes: []byte(certWithAttrs)}

// 	b, err := proto.Marshal(sid)
// 	stub

// 	// Invoke "CreateAccount"
// 	checkInvoke(t, stub, [][]byte{[]byte("CreateAccount"), []byte("kelvinfan"), []byte("Kelvin Fan"), []byte("kelvinfan001@gmail.com"), []byte("Personal")})

// 	checkStateAccountListExists(t, stub)
// }

// Can't test stuff cuz Fabric aint ready. Not our fault.
