// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileRegistry {
    mapping(string => string) public fileHashes;

    function registerFile(string memory name, string memory hash) public {
        fileHashes[name] = hash;
    }

    function getFileHash(string memory name) public view returns (string memory) {
        return fileHashes[name];
    }
}
