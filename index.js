const { clientMainnet, clientOptimism } = require("./client");
const { GET_BURNEDS, GET_ISSUEDS } = require("./queries");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const fs = require("fs");
const { ethers } = require("ethers");
const axios = require("axios");
const { wei } = require("@synthetixio/wei");
const { initDebtContract } = require("./contracts/debt");
const { initSdsContract } = require("./contracts/sdsContract");

const argv = yargs(hideBin(process.argv))
  .option("account", {
    alias: "a",
    describe: "Your wallet address",
    type: "string",
    demandOption: true,
  })
  .option("network", {
    alias: "n",
    describe: "Network to use",
    type: "string",
    demandOption: true,
  })
  .option("infuraId", {
    alias: "id",
    describe: "Infura ID to use",
    type: "string",
    demandOption: true,
  })
  .option("apiKey", {
    alias: "apiKey",
    describe: "Etherscan API Key to use",
    type: "string",
    demandOption: true,
  }).argv;

async function main() {
  const url = `https://${
    argv.network === "optimism" ? "optimism-mainnet" : "mainnet"
  }.infura.io/v3/${argv.infuraId}`;

  const provider = new ethers.providers.JsonRpcProvider(url);

  const debtContract = initDebtContract(provider, argv.network);
  const sdsContract = initSdsContract(argv.infuraId);

  const issueds = await getIssueds();
  const burneds = await getBurneds();

  const issued = issueds.map((item) => {
    const event = "Issued";

    const entry = {
      Event: event,
      Block: item.block,
      Value: item.value,
      Timestamp: item.timestamp,
      Token: item.source,
    };

    return entry;
  });

  const burned = burneds.map((item) => {
    const event = "Burned";

    const entry = {
      Event: event,
      Block: item.block,
      Value: item.value,
      Timestamp: item.timestamp,
      Token: item.source,
    };

    return entry;
  });

  const sorted = [...issued, ...burned].sort((a, b) => {
    return a.Block - b.Block;
  });

  const consolidated = [];
  let issuedDebt = 0;

  for (const item of sorted) {
    const { Block, Event } = item;

    // check if index of item is 0
    const index = sorted.indexOf(item);

    if (Event === "Issued") {
      issuedDebt += Number(item.Value);
    } else if (Event === "Burned") {
      issuedDebt -= Number(item.Value);
    }

    const [balanceOf] = await debtContract.functions.balanceOf(argv.account, {
      blockTag: Number(Block),
    });

    // This is always calling optimism chainlink aggregator
    // So we will need to get the correct block if we are running on mainnet
    const blockOnOp =
      argv.network === "optimism"
        ? Block
        : await timestampToBlockOvm(item.Timestamp);

    console.log("Block on op", blockOnOp);

    const [sdsPrice] = await sdsContract.functions.latestAnswer({
      blockTag: Number(blockOnOp),
    });

    console.log("Sds price", wei(sdsPrice, 27, true).toNumber());

    const BalanceOf = wei(balanceOf, 18, true);
    const SdsPrice = wei(sdsPrice, 27, true);

    const ActiveDebt =
      index === 0 ? issuedDebt : BalanceOf.mul(SdsPrice).toNumber();

    consolidated.push({
      ...item,
      BalanceOf: BalanceOf.toNumber(),
      SdsPrice: SdsPrice.toNumber(),
      ActiveDebt,
      IssuedDebt: issuedDebt,
      Delta: issuedDebt - ActiveDebt,
    });
  }

  writeCSV(consolidated);
}

main();

async function writeCSV(data) {
  let csvContent =
    "Address,Event,Value,Block,Timestamp,DebtShareBalance,SdsPrice,IssuedDebt,ActiveDebt,Delta\n";
  data.forEach((item) => {
    csvContent += `${argv.account},${item.Event},${item.Value},${item.Block},${item.Timestamp},${item.BalanceOf},${item.SdsPrice},${item.IssuedDebt},${item.ActiveDebt},${item.Delta}\n`;
  });

  fs.writeFile("output.csv", csvContent, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("output.csv written");
  });
}

async function timestampToBlockOvm(timestamp) {
  const { data } = await axios.get(
    `https://api-optimistic.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=after&apikey=${argv.apiKey}`
  );

  return Number(data.result);
}

async function getIssueds(issuedsTally = [], skip = 0) {
  const client = argv.network === "optimism" ? clientOptimism : clientMainnet;
  const {
    data: { issueds },
  } = await client.query({
    query: GET_ISSUEDS,
    variables: {
      where: {
        account: argv.account,
      },
      skip,
      first: 1000,
    },
  });

  if (issueds.length === 0) {
    return issuedsTally;
  }

  return getIssueds([...issuedsTally, ...issueds], skip + 1000);
}

async function getBurneds(burnedsTally = [], skip = 0) {
  const client = argv.network === "optimism" ? clientOptimism : clientMainnet;
  const {
    data: { burneds },
  } = await client.query({
    query: GET_BURNEDS,
    variables: {
      where: {
        account: argv.account,
      },
      skip,
      first: 1000,
    },
  });

  if (burneds.length === 0) {
    return burnedsTally;
  }

  return getBurneds([...burnedsTally, ...burneds], skip + 1000);
}
