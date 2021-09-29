import React, { useState , useContext, useEffect } from "react";
import SliderUnstyled from '@mui/core/SliderUnstyled';
import { styled, alpha } from '@mui/system';
import { useEthers, useEtherBalance } from "@usedapp/core";
import { ethers } from 'ethers';
import { getLatestPrice, calculateHectaresEstimate } from '../lib/priceUtils';

import Button from "../components/Button";
import InformationIcon from "../components/InformationIcon";
import networkMatches from "../lib/networkMatches";
import config from "../config";
import WalletModalContext from "../lib/walletModalContext";
import TIER_MARKERS from "../lib/tierMarkers";

const rewilderColor = '#277336';
const RewilderSlider = styled(SliderUnstyled)(
`
  color: ${rewilderColor};
  height: 10px;
  width: 100%;
  padding: 2px 0;
  display: inline-block;
  position: relative;
  cursor: pointer;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  opacity: 0.90;
  &:hover {
    opacity: 1;
  }

  & .MuiSlider-mark {
    width: 1px;
    height: 7px;
    position: absolute;
    display: inline;
    background-color: rgba(63, 105, 71, 0.2);
  }

  & .MuiSlider-rail {
    display: block;
    position: absolute;
    width: 100%;
    -webkit-appearance: none;
    width: 100%;
    height: 8px;
    background: #FAF8F6;
    border: 1px solid rgba(63, 105, 71, 0.2);
    outline: none;
    border-radius: 6px;
  }

  & .MuiSlider-track {
    width: 0%;
    height: 8px;
    background: -webkit-linear-gradient(360deg, #3f6947 0%, #339445 100%);
    border-radius: 6px;
    position: absolute;
    left: 0;
    z-index: 1;
  }

  & .MuiSlider-thumb {
    position: absolute;
    z-index: 3;
    width: 20px;
    height: 20px;
    background-image: url("/assets/img/logo/logo-small-white.svg");
    margin-top: -6px;
    transform: translateX(-50%);
    z-index: 2;
    box-sizing: border-box;
    border-radius: 50%;
    outline: 0;
    border: 2px solid currentColor;
    opacity: 1;
    background-color: ${rewilderColor};
    background-size: 75%;
    background-repeat: no-repeat;
    background-position: 42% 50%;;
    //background-color: #fff;
    //background: rgb(56, 132, 71, 2);
    :hover,
    &.Mui-focusVisible {
      box-shadow: 0 0 0 0.25rem ${alpha(
        rewilderColor,
        0.15,
      )};
    }


    &.Mui-active {
      box-shadow: 0 0 0 0.25rem ${alpha(
        rewilderColor,
        0.3,
      )};
    }

    @media screen and (max-width: 767px) {
      &.MuiSlider-thumb {
        width: 30px;
        height: 30px;
        margin-top: -12px;
      }
    }
  }
`,
);

function DonationControls({ amount, setAmount, tier, alreadyDonated, donateTx, requestDonationToWallet }) {

  const { account } = useEthers();
  const modalContext = useContext(WalletModalContext);
  const [walletOpened, setWalletOpened] = useState(false);
  const etherBalance  = useEtherBalance(account);
  const networkIncorrect = !networkMatches();
  const ethToUSD = 3500;
  const [hectaresEstimation, setHectaresEstimation] = useState(calculateHectaresEstimate(amount, ethToUSD));
  const insufficientBalance = amount > etherBalance/1e18;
  const clamp = (n, lower, upper) => Math.min(Math.max(n, lower), upper);

  getLatestPrice().then((price) => {
    setHectaresEstimation(calculateHectaresEstimate(amount, price));
  })

  const donateButtonText = networkIncorrect?
    `Change wallet network to ${config.networkName}`:
    !account?
      "Connect Wallet":
      alreadyDonated?
        "Thanks for donating!":
        insufficientBalance?
          "Insufficient Balance":
          "Donate and mint your NFT";


  const donateButtonLoadingText = !account?
    "Connecting Wallet":
    donateTx.status == 'Mining'?
      "Donation tx pending":
      "Sign Transaction in Wallet";

  const handleSliderChange = (event, newValue) => {
    setAmount(newValue);
  };

  const handleInputChange = (event, newValue) => {
    if (event.target.value == "") {
      setAmount("");
      return;
    }
    const value = clamp(event.target.value, 1, 100);
    setAmount(value);
  };

  useEffect(() => {
    if (donateTx.status == 'Exception' ||
        donateTx.status == 'Mining') {
      setWalletOpened(false);
    }
  }, [donateTx]);


  // call the campaign smart contract, send a donation
  const donate = () => {
    if (!account) {
      return modalContext.onOpen();
    }
    if (!amount) return;

    const donationAmountWEI = ethers.utils.parseEther(amount.toString());
    console.log(`${account} is about to donate`, donationAmountWEI/1e18, "ETH");
    requestDonationToWallet({value: donationAmountWEI});
    setWalletOpened(true);
  }

  const setMinimumFor = (tier) => {
    switch (tier) {
      case 'cypress':
        setAmount(1);
        break;
      case 'araucaria':
        setAmount(TIER_MARKERS['araucaria']);
        break;
      case 'sequoia':
        setAmount(TIER_MARKERS['sequoia']);
        break;
    }
  }

  const marks = [
    {
      value: TIER_MARKERS['araucaria'],
    },
    {
      value: TIER_MARKERS['sequoia'],
    },
  ];

  return (<>
    <div className="donation-control">
      <div className="tree-group">
        <div className="single-tree" onClick={()=>{setMinimumFor('cypress')}}>
          <img
            src={`assets/img/tree/tree-1-${tier=='cypress'?'green':'gray'}.png`}
            alt="Cypress tier"
            className="tree-img small-tree"/>
          <h5 className={tier=='cypress'?'active':''}>Cypress</h5>
        </div>
        <div className="single-tree" onClick={()=>{setMinimumFor('araucaria')}}>
          <img
            src={`assets/img/tree/tree-2-${tier=='araucaria'?'green':'gray'}.png`}
            alt="Araucaria tier"
            className="tree-img medium-tree"/>
          <h5 className={tier=='araucaria'?'active':''}>Araucaria</h5>
        </div>
        <div className="single-tree" onClick={()=>{setMinimumFor('sequoia')}}>
          <img
            src={`assets/img/tree/tree-3-${tier=='sequoia'?'green':'gray'}.png`}
            alt="sequoia tier"
            className="tree-img large-tree"/>
          <h5 className={tier=='sequoia'?'active':''}>Sequoia</h5>
        </div>
      </div>
      <div className="range-input">
          <RewilderSlider
            value={amount}
            min={1}
            step={1}
            marks={marks}
            max={100}
            disabled={alreadyDonated}
            onChange={handleSliderChange}
          />
      </div>
      <div className="range-value">
          <span>
            1 ETH{" "}
            <InformationIcon text={"Our current best estimates say that donating the equivalent of $3000 USD in ETH will help add ~1 acre (~0.4 hectares) of wildland to our first rewilding project. This fact, added to marginal costs of providing updates in the future, is why we require this as the minimum ETH donation value in this campaign."}/>
          </span>
          <span>
            100 ETH{" "}
          <InformationIcon text={"Given this is our first fundraising campaign, we've decided to set a maximum donation per address."}/>
          </span>
      </div>
      <div className="donating-value">
        <h4 className="view-amount">
          You are donating{" "}
          <input
            className="selected-amount"
            type="number"
            value={amount}
            min={1}
            disabled={alreadyDonated}
            onChange={handleInputChange}
            />{" "} <img src="/assets/img/icon/eth.svg" height="16" width="16" alt="ETH" /> ETH</h4>
        <span>
          We estimate this will help buy ~{hectaresEstimation.toFixed(2)} hectares.
          <InformationIcon text={"This is our current best estimate, assuming we keep part of the raised funds in an endowment fund to pay for lifetime maintenance costs, and a preliminary survey of land purchase costs. Final numbers may change according to where we decide to buy land, but we'll do our best to keep the hectares/$ ratio high."}/>
        </span>
      </div>
    </div>
    <div className="hero-v1-btn">
      <Button
        onClick={donate}
        isLoading={walletOpened || donateTx.status=="Mining"}
        disabled={networkIncorrect || alreadyDonated || insufficientBalance}
        text={donateButtonText}
        loadingText={donateButtonLoadingText}
        />
    </div>
  </>);
}

export default DonationControls;
