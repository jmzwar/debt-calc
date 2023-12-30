const { Contract } = require("ethers");
const ovmAddressSDSPrice = "0x0D5642c6329adB3246c13D78B429a9FB1965a0d8";
const ovmAddressIssuedSynths = "0x22f04bc4162d63730dcde051fdfd97b4f55ff63b";
const { ethers } = require("ethers");

const abi = ["function latestAnswer() view returns (int256)"];

exports.initSdsContract = function (infuraId) {
  const url = `https://optimism-mainnet.infura.io/v3/${infuraId}`;
  const provider = new ethers.providers.JsonRpcProvider(url);
  return new Contract(ovmAddressSDSPrice, abi, provider);
};

exports.initIssuedsSynthsContract = function (infuraId) {
  const url = `https://optimism-mainnet.infura.io/v3/${infuraId}`;
  const provider = new ethers.providers.JsonRpcProvider(url);
  return new Contract(ovmAddressIssuedSynths, abi, provider);
};
