// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LandRegistry {
    struct Land {
        uint256 id;
        string fullName;      // NEW: Owner's real name
        string surveyNumber;  // NEW: Govt Survey ID
        string propertyType;  // NEW: Residential/Commercial etc.
        string location;      // Physical Address
        uint256 area;
        uint256 price;
        string ipfsHash;      // The Deed Document
        address payable owner;
        bool isRegistered;
        bool isVerified;
        bool isForSale;
    }

    uint256 public landCount = 0;
    mapping(uint256 => Land) public lands;
    address public government;

    event LandRegistered(uint256 indexed id, address indexed owner);
    event LandVerified(uint256 indexed id);
    event LandPurchased(uint256 indexed id, address indexed newOwner);

    constructor() {
        government = msg.sender;
    }

    modifier onlyGovt() {
        require(msg.sender == government, "Only Government can perform this action");
        _;
    }

    // UPDATED: Now accepts 7 arguments instead of 4
    function registerLand(
        string memory _fullName,
        string memory _surveyNumber,
        string memory _propertyType,
        string memory _location,
        uint256 _area,
        uint256 _price,
        string memory _ipfsHash
    ) public {
        landCount++;
        lands[landCount] = Land(
            landCount,
            _fullName,
            _surveyNumber,
            _propertyType,
            _location,
            _area,
            _price,
            _ipfsHash,
            payable(msg.sender),
            true,
            false,
            false
        );
        emit LandRegistered(landCount, msg.sender);
    }

    function verifyLand(uint256 _id) public onlyGovt {
        require(lands[_id].isRegistered, "Land not found");
        lands[_id].isVerified = true;
        emit LandVerified(_id);
    }

    function listLandForSale(uint256 _id) public {
        require(msg.sender == lands[_id].owner, "Only owner can list land");
        require(lands[_id].isVerified, "Land must be verified first");
        lands[_id].isForSale = true;
    }

    function buyLand(uint256 _id) public payable {
        Land storage land = lands[_id];
        require(land.isForSale, "Land not for sale");
        require(msg.value >= land.price, "Not enough Ether");
        require(msg.sender != land.owner, "Cannot buy own land");

        address payable oldOwner = land.owner;
        land.owner = payable(msg.sender);
        land.isForSale = false;
        
        // Transfer money
        oldOwner.transfer(msg.value);

        emit LandPurchased(_id, msg.sender);
    }
    
    function getLand(uint256 _id) public view returns (Land memory) {
        return lands[_id];
    }
}