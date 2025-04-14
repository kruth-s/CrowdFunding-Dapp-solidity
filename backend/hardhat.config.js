require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Load environment variables

const { PRIVATE_KEY, ALCHEMY_API } = process.env;

module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {},
    sepolia: {
      url: ALCHEMY_API,
      accounts: [PRIVATE_KEY]
    }
  }
};
