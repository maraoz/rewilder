const { ethers } = require("hardhat");
const addresses = require("./lib/addresses");
const indexDonation = require("./lib/index-donation");

async function main() {

  if (!process.env.INDEXER_INFURA_ID) {
    throw new Error('Please set env variable $INDEXER_INFURA_ID with an infura app id');
  }
  const url = `https://${network.name}.infura.io/v3/${process.env.INDEXER_INFURA_ID}`;
  console.log('Connecting to', url);
  const provider = new ethers.providers.StaticJsonRpcProvider(url);

  // get donation campaign
  const RewilderDonationCampaign = await ethers.getContractFactory("RewilderDonationCampaign");
  const campaign = RewilderDonationCampaign
      .attach(addresses.RewilderDonationCampaign);
  console.log("RewilderDonationCampaign attached to:", campaign.address);

  // block tick
  provider.on("block", (blockNumber) => {
    if (blockNumber % 240 == 0) {
      console.log("block", blockNumber, "mined at", new Date().getTime());
    }
  });

  // listen for events
  console.log("Registering Donation event handler")

  campaign.connect(provider).on('DonationReceived', async function(donor, amount, tokenID, event) {
    const txid = event.transactionHash;
    await indexDonation(donor, amount, tokenID, txid);
  });
}

main();
