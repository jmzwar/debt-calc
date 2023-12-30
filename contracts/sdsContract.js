const { Contract } = require("ethers");
const ovmAddress = "0x0D5642c6329adB3246c13D78B429a9FB1965a0d8";
const { ethers } = require("ethers");

const abi = ["function latestAnswer() view returns (int256)"];

exports.initSdsContract = function (infuraId) {
  const url = `https://optimism-mainnet.infura.io/v3/${infuraId}`;
  const provider = new ethers.providers.JsonRpcProvider(url);
  return new Contract(ovmAddress, abi, provider);
};
