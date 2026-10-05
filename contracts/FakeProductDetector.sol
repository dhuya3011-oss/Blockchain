// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FakeProductDetector {
    enum Status { Unregistered, Genuine, Flagged }

    struct Product {
        string name;
        uint256 price;
        address manufacturer;
        Status status;
    }

    address public owner;
    mapping(address => bool) public manufacturers;
    mapping(bytes32 => Product) private products;

    event ProductRegistered(bytes32 indexed id, address indexed manufacturer);
    event ProductFlagged(bytes32 indexed id, address indexed by);

    constructor() {
        owner = msg.sender;
        manufacturers[msg.sender] = true;
    }

    function addManufacturer(address m) external {
        require(msg.sender == owner, "Only owner");
        manufacturers[m] = true;
    }

    function registerProduct(bytes32 id, string calldata name, uint256 price) external {
        require(manufacturers[msg.sender], "Not a manufacturer");
        require(products[id].status == Status.Unregistered, "Already registered");
        products[id] = Product(name, price, msg.sender, Status.Genuine);
        emit ProductRegistered(id, msg.sender);
    }

    function flagProduct(bytes32 id) external {
        Product storage p = products[id];
        require(p.status != Status.Unregistered, "Not found");
        require(msg.sender == p.manufacturer || msg.sender == owner, "Not authorized");
        p.status = Status.Flagged;
        emit ProductFlagged(id, msg.sender);
    }

    function verifyProduct(bytes32 id)
        external view
        returns (Status, string memory, uint256, address)
    {
        Product storage p = products[id];
        return (p.status, p.name, p.price, p.manufacturer);
    }
}
