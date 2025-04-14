// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
contract CrowdFunding{
    address public CampaignOwner;
    uint public CampaignGoal;
    uint public CampaignFunding;
    uint public CampaignDeadline;
    bool public CampaignComplete;
    constructor(address owner,uint target,uint deadline_days){
        CampaignOwner=owner;
        CampaignGoal=target;
        CampaignDeadline = block.timestamp + (deadline_days * 1 days);
        CampaignComplete=false;
    }
    mapping(address=>uint) public Contributions;

    function funding()public payable returns(uint){
        require(!CampaignComplete,"The Campaign target funding has been reached!!!");
        require(block.timestamp < CampaignDeadline,"The Campaign deadline has passed!!!");
        require(msg.value > 0, "Must send ETH to fund.");
        Contributions[msg.sender]+= msg.value;
        CampaignFunding+=msg.value;
        if (CampaignFunding>=CampaignGoal)
        {
            CampaignComplete=true;
        }
        return(CampaignGoal-CampaignFunding);
    }
    function withdraw() public payable
    {
        require(CampaignComplete == true,"The funding is not complete yet!!!");
        require(msg.sender==CampaignOwner,"Only the owner can transfer the funds!!!");
        payable(CampaignOwner).transfer(CampaignFunding);
        CampaignFunding=0;
    }

    function refund() public payable
    {
        require(!CampaignComplete,"The Campaign target funding has been reached, No refunds!!!");
        require(block.timestamp > CampaignDeadline,"The Campaign deadline has not been reached yet, No refunds!!!");
        uint amt=Contributions[msg.sender];
        require(amt > 0,"No funding found!, No refunds!!!" );
        payable(msg.sender).transfer(amt);
        CampaignFunding-=amt;
        Contributions[msg.sender]-=amt;
    }
function getBalance() public view returns(uint)
{
    return address(this).balance;
}

function timeLeft() public view returns (uint) {
    if (block.timestamp >= CampaignDeadline) {
        return 0;
    } else {
        return CampaignDeadline - block.timestamp;
    }
}

}
