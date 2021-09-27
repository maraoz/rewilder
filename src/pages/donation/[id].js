import React from "react";
import { useRouter } from "next/router";

import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import { getExplorerTransactionLink, useEthers } from "@usedapp/core";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

import DonationUpdate from "../../components/DonationUpdate";
import DonationInfo from "../../components/DonationInfo";
import Head from "../../components/Head";
import config from "../../config";
import { addressFor } from "../../lib/addresses";
import useStoredState  from "../../lib/storedState";
import { useToken, useUpdatesForToken } from "../../lib/db";
import truncateHash from "../../lib/truncateHash";
import RewilderIdenticon from "../../components/RewilderIdenticon";

function DonationPage() {
  const router = useRouter();
  const { account } = useEthers();
  const [taxInfoDismissed, setTaxInfoDismissed] = useStoredState(false, "taxInfoDismissed");
  const [futureUpdatesInfoDismissed, setFutureUpdatesInfoDismissed] = useStoredState(false, "futureUpdatesInfo");
  
  // TODO: dev, delete
  if (taxInfoDismissed || futureUpdatesInfoDismissed) {
    // setTaxInfoDismissed(false);
    // setFutureUpdatesInfoDismissed(false);
  }

  const tokenId = router.query.id;
  let data = {};
  const { data: tokenData, status } = useToken(tokenId);
  const { data: updates, status: updatesStatus} = useUpdatesForToken(tokenId);

  const isLoading = (status == 'loading' || updatesStatus == 'loading') ||
    ((tokenData == null || updates == null))
  const attributes = {};

  if (!isLoading) {
    tokenData.attributes.map(({trait_type, value}) => { attributes[trait_type] = value;});
    data = tokenData;
  } else {
    // loading placeholder data
    data = {
      "name": "Loading...",
      "image": `/assets/img/donation/cypress.png`,
    }
    attributes["flavor"] = "Loading...";
    attributes["amount"] = "...";
    attributes["tier"] = "loading...";
    attributes["donor"] = "...";
  }
  const openseaURL = "https://" + 
    (config.networkName=='mainnet'?'':'testnets.')+
    'opensea.io/assets/'+addressFor("RewilderNFT")+
    "/"+tokenId;
  
  const imageSource = data.image;

  const parseUpdates = (updates) => {
    if (!updates) return [];
    return Object.keys(updates)
      .filter((key)=> key != 'id' )
      .map((i) => updates[i]);
  };
  const updateList = parseUpdates(updates);
  const dateOptions = {year: 'numeric', month: 'short', day: 'numeric'};
  
  const isDonor = !isLoading && account == attributes["donor"];
  const youText = !isLoading && (isDonor?'You':truncateHash(attributes["donor"]));
  const yourText = !isLoading && (isDonor?'your':'their');
  const thanksText = !isLoading && (isDonor?' - thank you so much!':'');
  const creationDate = !isLoading && new Date(updateList[0].timestamp).toLocaleDateString(undefined, dateOptions);
  return (
    <>
      <Head { ...{ title: data.name } } />
      <div className="noise"></div>    
      <div className="description-area">
        <div className="description-wrapper">
          <div className="nft">
            <div className="donation-logo">
              <img src="/assets/img/logo/logo.svg" alt="logo"/>
            </div>
            <div className="thumb">
              {!isLoading && <img src={imageSource} alt="nft"
                className={"nft-image"}/>
              }
              <img src="/assets/images/stamp.svg" height="446" width="390" alt="decorative stamp frame" className="frame"/>
            </div>
            <figcaption>“{attributes["flavor"]}”</figcaption>
          </div>

          <div className="donation">
            <div className="header">
              <img src={isLoading?"/assets/img/shape/stamp.png":("/assets/img/shape/stamp-" + attributes.tier + ".svg")} alt={attributes.tier + " stamp"} className="stamp"/>
              <div className="title">
                <span>Tier: {attributes.tier}</span>
                <h2>{data.name}</h2>
              </div>
              <div className="info-container">
                <div className="flex">
                  <DonationInfo 
                    icon={<img src="/assets/images/icon/donation.svg" alt="donation"/>}
                    label="donation"
                    data={attributes["amount"]}
                    />
                  <DonationInfo 
                    icon={<img src="/assets/images/icon/rewilder-logo.svg" alt="rewilding"/>}
                    label="rewilding"
                    data="Location TBD"
                    />
                </div>
                <DonationInfo 
                  icon={<RewilderIdenticon size={24} account={attributes["donor"]} />}
                  label="donor"
                  data={attributes["donor"]}
                  />
              </div>
            </div>
          
            <h5>Updates</h5>
            <div className="updates">
              {/* synthetic updates */}
              {
              isDonor && !taxInfoDismissed &&
              <DonationUpdate 
                icon="/assets/images/icon/info.svg"
                iconalt="info"
                date={creationDate}
                message={
                  <>
                    If you want your donation to be 501(c)(3) tax deductible, send us an email to{" "}
                    <a target="_blank" href="mailto:receipts@rewilder.xyz">receipts@rewilder.xyz</a>
                  </>
                }
                isCloseable={true}
                onClose={()=>{setTaxInfoDismissed(true)}}
                />
              }
              {
              isDonor && !futureUpdatesInfoDismissed &&
              <DonationUpdate 
                icon="/assets/images/icon/info.svg"
                iconalt="info"
                date={creationDate}
                message="You will be able to see future updates about your donation here. For example, when we buy the land or make a payment."
                linkText="Subscribe to also receive email notifications."
                linkHref="https://rewilder.substack.com/subscribe"
                isCloseable={true}
                onClose={()=>{setFutureUpdatesInfoDismissed(true)}}
                />
              }
              {/* real updates */}
              { updateList && updateList.length > 0 && updateList.map((update) => (
                update.type == 'creation' && 
                  <DonationUpdate 
                  key={update.timestamp}
                  icon="/assets/images/icon/avatar-icon.svg"
                  iconalt="creation"
                  date={creationDate}
                  message={
                    <>
                      {youText} donated {attributes["amount"]} {" "}
                      <a href={getExplorerTransactionLink(update.info.txid, config.chainId)??"#"} target="_blank">
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                      </a> 
                      {thanksText}
                      <br />
                      and minted {yourText} unique NFT donation receipt{" "}
                      <a href={openseaURL} target="_blank">
                        <FontAwesomeIcon className="icon-color" icon={faExternalLinkAlt} />
                      </a>
                    </>
                  }>
                  </DonationUpdate>
                ))
              }
            </div>
          </div>
        </div>
        <div className="footer text-center donation-page">
          <p>© Rewilder Foundation, Inc.  -  Terms of use  -  Privacy</p>
        </div>
      </div>
      
    </>
  );
}
export default DonationPage;


import {
  getToken as getTokenServer,
  getAllTokens as getAllTokensServer,
  getUpdatesForToken as getUpdatesForTokenServer,
} from "../../lib/server/db";

// Pre-render pages at build-time
export async function getStaticProps(context) {
  const { id } = context.params;
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery([`${id}`], () => getTokenServer(id));
  await queryClient.prefetchQuery([`updates/${id}`], () => getUpdatesForTokenServer(id))

  return {
    props: {
      reactQueryState: dehydrate(queryClient),
    },
  };
}
// Generates routes for all pages we want to pre-render
export async function getStaticPaths() {
  // Get all tokens
  const tokens = await getAllTokensServer();
  // Generate page path params for all tokens
  const paths = tokens.map((token) => ({
    params: { id: token.id },
  }));
  return {
    paths,
    // Server-render on demand if page does't exist yet
    // TODO: Not sure if "blocking" is supported by Netlify, but not a big deal since client-side will
    // still take over and fetch data from `/api/token`.
    fallback: "blocking",
  };
}
