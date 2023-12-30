const mainnet = require("@synthetixio/contracts/build/mainnet/deployment/SynthetixDebtShare");
const mainnetOvm = require("@synthetixio/contracts/build/mainnet-ovm/deployment/SynthetixDebtShare");
const { Contract } = require("ethers");

exports.initDebtContract = function (provider, network) {
  const contract = network === "mainnet" ? mainnet : mainnetOvm;
  return new Contract(contract.address, contract.abi, provider);
};
