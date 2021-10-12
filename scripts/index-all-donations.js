const {ethers, network} = require("hardhat");
const fs = require("fs");
const processTransaction = require("./lib/process-transaction");
const addresses = require("./lib/addresses");
const journalFileName = "./journal.json";
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  if (!process.env.ETHERSCAN_KEY) {
    console.log('Required ETHERSCAN_KEY env variable not set.');
    return;
  }
  let donationCampaignAddress = addresses.RewilderDonationCampaign;
  // console.log('Using donation address', donationCampaignAddress);
  const journal = JSON.parse(fs.readFileSync(journalFileName));
  // console.log('journal contains', Object.keys(journal).length, 'entries');
  let etherscan = new ethers.providers.EtherscanProvider(network.name, process.env.ETHERSCAN_KEY);
  let history = await etherscan.getHistory(donationCampaignAddress);
  
  // console.log('Found', history.length, 'transactions.');
  for(var tx of history){
    if (tx.to == donationCampaignAddress){
      if (journal[tx.hash]) {
        // console.log('journal entry found for', tx.hash, '... skipping.')
        continue;
      }
      console.log("indexing", tx.hash);
      await processTransaction(tx);
      journal[tx.hash] = new Date().getTime();
      fs.writeFileSync(journalFileName, JSON.stringify(journal, null, 2));
      console.log("indexed", tx.hash, '- now waiting...');

      await sleep(5000);
    } else {
      // console.log('ignoring', tx.hash);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
