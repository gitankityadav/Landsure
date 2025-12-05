require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    // We define a network named 'ganache'
    ganache: {
      url: "http://127.0.0.1:7545", // CHANGE TO 8545 IF USING CLI
      chainId: 1337 // Standard Ganache Chain ID
    }
  }
};