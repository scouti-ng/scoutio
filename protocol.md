# Protocol
This document is WIP and not well structured yet. Still it is important to jot some of this information down before I forget.

# Overview
## 1. Connecting
If a user joins a non-existing room an error is displayed.
If a leader joins a non-existing room with specified password a new room is created.
Once a room is created everyone can join that room, provided the correct roomcode is used.
New leaders can only join the room with the correct code and password.

## 99. Destroy
If no active clients are in a room the room is immidiatly destroyed.