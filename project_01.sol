// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract FundraisingCampaign {
    address public admin;
    
    struct Campaign {
        string name;
        uint goalAmount;
        uint currentAmount;
        bool isActive;
        uint endTime;
        uint[] suggestedDonations;
    }

    mapping(uint => Campaign) private campaigns;
    uint public campaignCount;

    event CampaignCreated(uint indexed campaignId, string name, uint goalAmount, uint endTime);
    event FundsDonated(uint indexed campaignId, address donor, uint amount);
    event FundsWithdrawn(uint indexed campaignId, uint amount);
    event CampaignUpdated(uint indexed campaignId, string newName, uint newGoalAmount, uint newEndTime);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier isActiveCampaign(uint campaignId) {
        require(campaigns[campaignId].isActive, "The campaign is not active");
        _;
    }

    function createCampaign(string memory name, uint goalAmount, uint durationInDays, uint[] memory _suggestedDonations) public onlyAdmin {
        uint endTime = block.timestamp + (durationInDays * 1 days);
        uint[] memory suggestedDonationsInWei = new uint[](_suggestedDonations.length);
        for (uint i = 0; i < _suggestedDonations.length; i++) {
            suggestedDonationsInWei[i] = _suggestedDonations[i] * 1 ether;
        }

        Campaign memory newCampaign = Campaign({
            name: name,
            goalAmount: goalAmount * 1 ether,
            currentAmount: 0,
            isActive: true,
            endTime: endTime,
            suggestedDonations: suggestedDonationsInWei
        });

        campaigns[campaignCount] = newCampaign;
        emit CampaignCreated(campaignCount, name, goalAmount, endTime);
        campaignCount++;
    }

    function donateToCampaign(uint campaignId) public payable isActiveCampaign(campaignId) {
        require(msg.sender != admin, "Admin cannot donate to campaigns"); //moze se dodat modifier za ovo npr.user
        require(isValidDonationAmount(campaignId, msg.value), "Invalid donation amount");

        Campaign storage campaign = campaigns[campaignId];
        require(block.timestamp < campaign.endTime, "The campaign has ended");

        campaign.currentAmount += msg.value;
        emit FundsDonated(campaignId, msg.sender, msg.value);
    }

    function isValidDonationAmount(uint campaignId, uint amount) internal view returns (bool) {
        Campaign storage campaign = campaigns[campaignId];
        for (uint i = 0; i < campaign.suggestedDonations.length; i++) {
            if (amount == campaign.suggestedDonations[i]) {
                return true;
            }
        }
        return false;
    }

    function withdrawFunds(uint campaignId) public onlyAdmin {
        Campaign storage campaign = campaigns[campaignId];
        require(block.timestamp >= campaign.endTime, "Cannot withdraw funds yet");

        uint withdrawalAmount = campaign.currentAmount;
        campaign.currentAmount = 0;
        campaign.isActive = false;

        address payable adminPayable = payable(admin);
        adminPayable.transfer(withdrawalAmount);

        emit FundsWithdrawn(campaignId, withdrawalAmount);
    }

    function viewCampaignDetails(uint campaignId) public view returns (Campaign memory) {
        return campaigns[campaignId];
    }

    function updateCampaign(uint campaignId, string memory newName, uint newGoalAmount, uint newDurationInDays) public onlyAdmin isActiveCampaign(campaignId) {
        Campaign storage campaign = campaigns[campaignId];

        campaign.name = newName;
        campaign.goalAmount = newGoalAmount * 1 ether;
        campaign.endTime = block.timestamp + (newDurationInDays * 1 days);

        emit CampaignUpdated(campaignId, newName, newGoalAmount, campaign.endTime);
    }

    function getCampaigns() external view returns (Campaign[] memory) {
        Campaign[] memory _campaigns = new Campaign[](campaignCount);
        for (uint i = 0; i < campaignCount; i++) {
            _campaigns[i] = campaigns[i];
        }
        return _campaigns;
    }

    
    function getCollectedAmount(uint campaignId) public view returns (uint) {
    require(campaignId < campaignCount, "Invalid campaign ID");
    return campaigns[campaignId].currentAmount;
}
}
