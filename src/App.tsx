import React, { useState } from 'react'
import './scss/styles.scss'
import Web3 from 'web3';

import { MetaMaskInpageProvider } from "@metamask/providers";


declare global {
    interface Window {
      ethereum?: MetaMaskInpageProvider
      web3: any
    }
  }
  
  interface Campaigns {
    campaignId: number;
    name: string;
    goalAmount: number
    currentAmount: number;
    isActive: boolean;
    endTime: number;
  }

  function App() {

    const [addresses, setAddresses] = useState<string[]>([]);
    
  const [isAdmin, setIsAdmin] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaigns[]>([]);


     const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"uint256","name":"goalAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"endTime","type":"uint256"}],"name":"CampaignCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":false,"internalType":"string","name":"newName","type":"string"},{"indexed":false,"internalType":"uint256","name":"newGoalAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newEndTime","type":"uint256"}],"name":"CampaignUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":false,"internalType":"address","name":"donor","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FundsDonated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FundsWithdrawn","type":"event"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"campaignCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"goalAmount","type":"uint256"},{"internalType":"uint256","name":"durationInDays","type":"uint256"}],"name":"createCampaign","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"campaignId","type":"uint256"}],"name":"donateToCampaign","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"getCampaigns","outputs":[{"components":[{"internalType":"uint256","name":"campaignId","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"goalAmount","type":"uint256"},{"internalType":"uint256","name":"currentAmount","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"uint256","name":"endTime","type":"uint256"}],"internalType":"struct FundraisingCampaign.Campaign[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"campaignId","type":"uint256"}],"name":"getCollectedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"campaignId","type":"uint256"},{"internalType":"string","name":"newName","type":"string"},{"internalType":"uint256","name":"newGoalAmount","type":"uint256"},{"internalType":"uint256","name":"newDurationInDays","type":"uint256"}],"name":"updateCampaign","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"campaignId","type":"uint256"}],"name":"viewCampaignDetails","outputs":[{"components":[{"internalType":"uint256","name":"campaignId","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"goalAmount","type":"uint256"},{"internalType":"uint256","name":"currentAmount","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"uint256","name":"endTime","type":"uint256"}],"internalType":"struct FundraisingCampaign.Campaign","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"campaignId","type":"uint256"}],"name":"withdrawFunds","outputs":[],"stateMutability":"nonpayable","type":"function"}]
     const address = "0x96CDC5763337745008bf433ebF06F51912509129"


     const connect = async () => {
        if (window.ethereum) {
          let addresses = await window.ethereum.request({ method: 'eth_requestAccounts' }).then()
          window.web3 = new Web3(window.ethereum);
          if (addresses && Array.isArray(addresses)) {
            setAddresses(addresses);
            let admin = await checkAdmin()
            addresses[0].toUpperCase() == admin.toUpperCase() ? setIsAdmin(true) : setIsAdmin(false)
            getCampaigns();
          }
        }
    }

      async function checkAdmin(): string {

        setIsLoading(true);
    
        const contract = new window.web3.eth.Contract(abi, address);
        let admin;
        try {
          admin = await contract.methods.admin().call();
        } catch (err) {
          window.alert(err.toString());
          return
        }
        setIsLoading(false)
        return admin
      }

  }

  return ()

export default App