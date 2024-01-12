import React, { useState } from 'react'
import './scss/styles.scss'
import Web3 from 'web3';
import {Blocks} from 'react-loader-spinner'
import Modal from 'react-modal';


import { MetaMaskInpageProvider } from "@metamask/providers";

//css
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

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

Modal.setAppElement('#root');
function App() {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaigns[]>([]);

  const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"uint256","name":"goalAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"endTime","type":"uint256"}],"name":"CampaignCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":false,"internalType":"string","name":"newName","type":"string"},{"indexed":false,"internalType":"uint256","name":"newGoalAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newEndTime","type":"uint256"}],"name":"CampaignUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":false,"internalType":"address","name":"donor","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FundsDonated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FundsWithdrawn","type":"event"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"campaignCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"goalAmount","type":"uint256"},{"internalType":"uint256","name":"durationInDays","type":"uint256"}],"name":"createCampaign","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"campaignId","type":"uint256"}],"name":"donateToCampaign","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"getCampaigns","outputs":[{"components":[{"internalType":"uint256","name":"campaignId","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"goalAmount","type":"uint256"},{"internalType":"uint256","name":"currentAmount","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"uint256","name":"endTime","type":"uint256"}],"internalType":"struct FundraisingCampaign.Campaign[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"campaignId","type":"uint256"}],"name":"getCollectedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"campaignId","type":"uint256"},{"internalType":"string","name":"newName","type":"string"},{"internalType":"uint256","name":"newGoalAmount","type":"uint256"},{"internalType":"uint256","name":"newDurationInDays","type":"uint256"}],"name":"updateCampaign","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"campaignId","type":"uint256"}],"name":"viewCampaignDetails","outputs":[{"components":[{"internalType":"uint256","name":"campaignId","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"goalAmount","type":"uint256"},{"internalType":"uint256","name":"currentAmount","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"uint256","name":"endTime","type":"uint256"}],"internalType":"struct FundraisingCampaign.Campaign","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"campaignId","type":"uint256"}],"name":"withdrawFunds","outputs":[],"stateMutability":"nonpayable","type":"function"}]
  const address = "0x96CDC5763337745008bf433ebF06F51912509129"

  const [campaignId, setCampaignId] = useState(0)
  const [campaignName, setCampaignName] = useState('');
  const [campaignTarget, setCampaignTarget] = useState(0);
  const [campaignDuration, setCampaignDuration] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOnCreate, setisLoadingOnCreate] = useState(false);


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

  const editCampaign = async (campaign: number, newName: string, newGoalAmount: number, newDuration: number) => {
    const contract = new window.web3.eth.Contract(abi,address); 
    setIsLoading(true)
    try {
      await contract.methods.updateCampaign(campaign, newName, newGoalAmount, newDuration).send({from: addresses[0]})
    }
    catch (err) {
      window.alert(err.toString());
      return
    }
    setIsLoading(false)
  }

  const donateToCampaign = async (campaign: Campaigns, donationValue: number) => {
    const contract = new window.web3.eth.Contract(abi,address);
    setIsLoading(true);
    try {
      await contract.methods.donateToCampaign(campaign.campaignId).send({
        from: addresses[0],
        value: Web3.utils.toWei(donationValue, 'ether')
      })
    }
    catch (err) {
      window.alert(err.toString());
      setIsLoading(false)
      return
    }
    setIsLoading(false);
  }

  const getCampaigns = async () => {
    const contract = new window.web3.eth.Contract(abi, address);
    try {
      let campaigns = await contract.methods.getCampaigns().call();
      setCampaigns(campaigns);
    }
    catch (err) {
      window.alert(err.toString());
      setIsLoading(false)
    }
    setIsLoading(false)
  }

  const createCampaign = async (addresses: string, name: string, target: number, duration: number) => {
    const campaign = new window.web3.eth.Contract(abi,address);
    setIsLoading(true);
    try {
      let create = await campaign.methods.createCampaign(name, target, duration).send({from: addresses})
      let list = await getCampaigns();
    }
    catch (err) {
      window.alert(err.toString());
      setIsLoading(false);
    }
    setIsLoading(false)
  }

  const getCollectedAmount =  (id: number) => {
    const campaign = new window.web3.eth.Contract(abi,address);
    let result = campaign.methods.getCollectedAmount(id).call();
    console.log(Web3.utils.fromWei(result, 'ether'));
    return result.toString();
  }

  const handleCampaignName = event =>  {
    setCampaignName(event.target.value);
  }

  const handleCampaignTarget = event =>  {
    setCampaignTarget(event.target.value);
  }

  const handleCmapaignDuration = event => {
    setCampaignDuration(event.target.value);
  }

  function handleCreateCampaign() {
    createCampaign(addresses[0], campaignName, campaignTarget, campaignDuration)
  }


  return (
      <>
        {
           addresses.length === 0 &&
           <main >
            {isLoading ? (
                  <div
                      style={{
                        width: "100px",
                        margin: "auto",
                      }}
                  >
                    <Blocks />
                  </div>
              ) : ( <div> </div>) }
              <img className="mb-4 w-50"
                   src="https://media.vanityfair.com/photos/5ed812f22c5917db2359b07e/master/pass/VF-Relief-Funds.jpg"/>
              <h1 className="h3 mb-3 fw-normal">Please connect your wallet</h1>
              <button className="btn btn-primary w-50 py-2" id="connect" onClick={connect}>Connect your wallet</button>
            </main>
        }
        {

          addresses.length > 0 && !isAdmin &&
          <div className="container align-content-center justify-content-center text-center">
            {isLoading ? (
                <div
                    style={{
                      width: "100px",
                      margin: "auto",
                    }}
                >
                  <Blocks />
                </div>
            ) : ( <div> </div>) }
            <header>
              <div className="d-flex flex-column flex-md-row align-items-center pb-3 mb-4 border-bottom">
                <h3 className="d-flex align-items-center link-body-emphasis text-decoration-none">
                  <span className="fs-4">Connected address: {addresses[0]}</span>
                </h3>
              </div>
            </header>
          </div>
        }
        {
          
            addresses.length > 0 && isAdmin &&
            <div className="container align-content-center justify-content-center text-center">
              {isLoading ? (
                  <div
                      style={{
                        width: "100px",
                        margin: "auto",
                      }}
                  >
                    <Blocks />
                  </div>
              ) : ( <div> </div>) }
              <header>
                <div className="d-flex flex-column flex-md-row align-items-center pb-3 mb-4 border-bottom">
                  <h3 className="d-flex align-items-center link-body-emphasis text-decoration-none">
                    <span className="fs-4">Connected address: {addresses[0]}</span>
                  </h3>
                </div>
              </header>

              <div>
                <main>
                  <h2>Create new campaign</h2>
                  <div className="form-floating">
                    <input type="text" onChange={handleCampaignName} value={campaignName} className="form-control"
                           id="floatingInput" placeholder="name"/>
                    <label htmlFor="floatingInput">Name</label>
                  </div>
                  <div className="form-floating">
                    <input type="number" onChange={handleCampaignTarget} value={campaignTarget} className="form-control"
                           id="floatingInput" placeholder="Target"/>
                    <label htmlFor="floatingInput">Target</label>
                  </div>
                  <div className="form-floating">
                    <input type="number" onChange={handleCmapaignDuration} value={campaignDuration}
                           className="form-control" id="floatingInput" placeholder="duration"/>
                    <label htmlFor="floatingInput">Duration</label>
                  </div>
                  <button className="btn btn-primary m-auto mt-3" onClick={handleCreateCampaign}>Create campaign
                  </button>
                  <br/>
                  <br/>
                </main>
              </div>

              <Modal
                  isOpen={modalIsOpen}
                  onRequestClose={() => setModalIsOpen(false)}
                  style={customStyles}
              >
                <button className="btn-close" onClick={() => setModalIsOpen(false)}></button>
                <h2>Campaign {campaignName}</h2>
                <p hidden={true} id={campaignId.toString() + '_id'}>{campaignId.toString()}</p>
                <p>Campaign name: <input onChange={handleCampaignName} id={campaignId + '_name'} className="float-end" type="text"
                                         defaultValue={campaignName}/></p>
                <p>Campaign end time: <input onChange={handleCmapaignDuration} id={campaignId + '_goal_duration'} className="float-end"
                                             type="number" defaultValue={
                  (campaignDuration / 86400000).toString()
                }/></p>
                <p>Campaign goal amount: <input id={campaignId + '_goal_amount'} className="float-end"
                                                type="number"
                                                onChange={handleCampaignTarget}
                                                defaultValue={Web3.utils.fromWei(campaignTarget, 'ether').toString()}/>
                </p>
                <button className="btn btn-primary" onClick={
                  () => editCampaign(
                      campaignId,
                      campaignName,
                      campaignTarget,
                      campaignDuration
                  )
                }>Edit
                </button>
              </Modal>

            </div>
        }
        {
            campaigns.length > 0 &&
            campaigns.map((campaign, i) => (
                <div key={campaign.name}
                 className="container w-100 text-center overflow-hidden align-content-center justify-content-center align-items-center">
                  <div key={i} className="bg-body-secondary text-bg-light w-75 m-auto">

                    {isLoading ? (
                        <div
                            style={{
                              width: "100px",
                              margin: "auto",
                            }}
                        >
                          <Blocks />
                        </div>
                    ) : ( <div> </div>) }
                    <div className="my-3 py-3">
                      <p className="display-0">Campaign name: <b>{campaign.name}</b></p>
                      <p className="display-0">Campaign status <b>{campaign.isActive.toString()}</b></p>
                      <p className="display-0">Current collected amount: <b>{Web3.utils.fromWei(campaign.currentAmount, 'ether')}</b></p>
                      <p className="display-0">Valid
                        until: <b>{new Date(parseInt(campaign.endTime) * 1000).toString()}</b></p>
                      <p className="display-0">Campaign
                        goal: <b>{Web3.utils.fromWei(campaign.goalAmount, 'ether').toString()} Ether</b></p>

                      <input id={campaign.campaignId+'_donation'} className="bg-body-secondary" type="number"
                             placeholder="donationValue"/>
                      <button onClick={() => donateToCampaign(campaign, document.getElementById(campaign.campaignId+'_donation').value)}>Donate</button>
                      <button style={isAdmin ? {visibility:"visible"} : {visibility:"hidden"}} onClick={ () => {
                        setCampaignId(campaign.campaignId)
                        setCampaignName(campaign.name)
                        setCampaignDuration(parseInt(campaign.endTime.toString()))
                        setCampaignTarget(campaign.goalAmount)
                        setModalIsOpen(true);
                      } }>Edit</button>
                    </div>
                    <div className="bg-body-tertiary shadow-sm mx-auto"></div>
                  </div>
                </div>
            ))
        } 
      </>
  )
}

export default App
