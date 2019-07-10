/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

package main

import (
	"errors"

	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// CheckCertAttribute checks whether parameter matches with the caller's certificates attributes.
// Returns true if attribute matches.
func CheckCertAttribute(stub shim.ChaincodeStubInterface, attribute string, parameter string) (bool, error) {
	val, ok, err := cid.GetAttributeValue(stub, attribute)
	if err != nil {
		return false, err
	}
	if !ok {
		return false, errors.New("The client identity does not possess attribute: " + attribute)
	}
	if val != parameter {
		return false, errors.New("User certificate's attribute: " + attribute +
			" does not match " + parameter)
	}
	return true, nil
}

// GetCertAttribute returns the value of attribute in the caller's certificate.
func GetCertAttribute(stub shim.ChaincodeStubInterface, attribute string) (string, error) {
	val, ok, err := cid.GetAttributeValue(stub, attribute)
	if err != nil {
		return "", err
	}
	if !ok {
		return "", errors.New("The client identity does not possess attribute: " + attribute)
	}

	return val, nil
}
