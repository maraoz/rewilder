const {config, ethers, upgrades, network} = require("hardhat");
const fs = require("fs");
const path = require('path')
const { LedgerSigner } = require("@ethersproject/hardware-wallets");

const contractAddressFile = `${config.paths.artifacts}${path.sep}..${path.sep}addresses-${network.name}.json`

async function verifyImplementationOnEtherscan(implAddress, constructorArguments) {
  if (network.name == "localhost" || network.name == "hardhat") 
    return;

  console.log(`Attempting to verify ${implAddress} on Etherscan...`);
  let attempt;
  for (attempt=0; attempt<5; attempt += 1) {
    try {
      await hre.run("verify:verify", {
        address: implAddress,
        constructorArguments: constructorArguments??[],
      });
      break
    } catch(err) {
      if (err.message.includes("Contract source code already verified")) {
        console.log(`Contract source code for ${implAddress} already verified, skipping.`)
        break;
      } else if (err.message.includes("Failed to send contract verification request")) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue
      } else {
        throw err;
      }
    }
  }
  if (attempt == 5) {
    console.log(`FAILED to verify ${implAddress} contract on Etherscan`+
    ` after ${attempt} attempts. Abandoning.`);
  }
}

async function main() {
  
  let [_, wallet] = await ethers.getSigners();
  const hardhatProvider = wallet.provider;

  const ledger = new LedgerSigner(hardhatProvider, "hid", process.env.LEDGER_DERIVATION_PATH);
  const address = await ledger.getAddress();
  const balance = await ledger.getBalance();
  console.log("ledger", address, balance/1e18);

  wallet = wallet.address;
  if (process.env.REWILDER_MULTISIG && 
    ethers.utils.isAddress(process.env.REWILDER_MULTISIG)) {
    
    wallet = process.env.REWILDER_MULTISIG
  }

  console.log("Using wallet address:", wallet);
  const addresses = {};
  addresses['wallet'] = wallet;
  
  console.log("Deploying contracts with the account:", address);
  console.log("Account balance:", 
    (await ledger.getBalance()/1e18).toString(), 
    network.name, "ETH");
  
  addresses['network'] = network.name;
    
  // NFT -- upgradeable
  console.log("Deploying upgradeable RewilderNFT...");
  const RewilderNFT = await ethers.getContractFactory("RewilderNFT");
  const nft = await upgrades.deployProxy(RewilderNFT.connect(ledger), { kind: "uups" });
  await nft.deployed();
  console.log("RewilderNFT proxy deployed to:", nft.address);
  const nftImpl = await upgrades.erc1967.getImplementationAddress(nft.address);
  console.log("RewilderNFT implementation at:", nftImpl);
  addresses["RewilderNFT"] = nft.address;
  addresses["RewilderNFTImpl"] = nftImpl;
  await verifyImplementationOnEtherscan(nftImpl);
  
  
  // donation campaign -- non-upgradeable
  console.log("Deploying RewilderDonationCampaign...");
  const RewilderDonationCampaign = await ethers.getContractFactory("RewilderDonationCampaign");
  const campaign = await RewilderDonationCampaign.connect(ledger).deploy(
    nft.address, wallet
  );
  await campaign.deployed();
  console.log("RewilderDonationCampaign deployed to:", campaign.address);
  addresses["RewilderDonationCampaign"] = campaign.address;
  await verifyImplementationOnEtherscan(campaign.address, [nft.address, wallet]);

  // transfer nft ownership to donation campaign
  console.log("Transferring NFT ownership to Campaign...");
  await nft.connect(ledger).transferOwnership(campaign.address);
  
  
  // re-create contract address file if needed, and back up old one
  if (fs.existsSync(contractAddressFile)) {
    const ts = new Date().getTime();
    const contractAddressFileNoJSON = contractAddressFile.split(".")[0];
    fs.copyFileSync(contractAddressFile, `${contractAddressFileNoJSON}-${ts}.json`)
    fs.unlinkSync(contractAddressFile);
  }
  
  // Save the new contract addresses so our frontend can read it
  console.log("Saving deployed contract addresses to file...");
  fs.appendFileSync(contractAddressFile, JSON.stringify(addresses, null, 2));
  console.log("Done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
