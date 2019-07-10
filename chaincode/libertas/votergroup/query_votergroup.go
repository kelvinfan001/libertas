/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

package votergroup

// queryByVoterGroupsId queries the VoterGroups array for id and returns whether it exists.
func queryVoterGroupsByID(id string, voterGroups []VoterGroup) bool {

	for _, v := range voterGroups {
		if v.ID == id {
			return true
		}
	}

	return false
}
