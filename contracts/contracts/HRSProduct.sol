// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract HRSProduct is ERC721Burnable {

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {}

    // supportsInterface(interfaceId)
    // balanceOf(owner)
    // ownerOf(tokenId)
    // name()
    // symbol()
    // tokenURI(tokenId)
    // _baseURI()
    // approve(to, tokenId)
    // getApproved(tokenId)
    // setApprovalForAll(operator, approved)
    // isApprovedForAll(owner, operator)
    // transferFrom(from, to, tokenId)
    // safeTransferFrom(from, to, tokenId)
    // safeTransferFrom(from, to, tokenId, _data)
    // _safeTransfer(from, to, tokenId, _data)
    // _exists(tokenId)
    // _isApprovedOrOwner(spender, tokenId)
    // _safeMint(to, tokenId)
    // _safeMint(to, tokenId, _data)
    // _mint(to, tokenId)
    // _burn(tokenId)
    // _transfer(from, to, tokenId)
    // _approve(to, tokenId)
    // _setApprovalForAll(owner, operator, approved)
    // _beforeTokenTransfer(from, to, tokenId)
}
