// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

uint256 constant MAX_PREREQUISITES = 5;

contract AssignmentContract{

    struct Achievement {
        uint256 milestone;
        string data;
        uint256[] support;
    }
    
    
    mapping(address => mapping(uint256 => Achievement)) public userMilestones;
    mapping(uint256 => mapping(address => bool)) public milestoneAuthorities;
    mapping(uint256 => uint256[]) public milestonePrerequisites;
    

    // Add milestone to milestones
    function createMilestone(uint256 _milestone) public 
    {
        milestoneAuthorities[_milestone][msg.sender] = true;
    }

    // Check if an adress has a milestone in userMilestones
    function hasMilestone(address _usr, uint256 _milestone) public view returns(bool)
    {
        return (userMilestones[_usr][_milestone].milestone > 0);
    }

    function meetsPrerequisites(address _user, uint256 _milestone) public view returns(bool)
    {
        uint256[] memory _prerequisites = milestonePrerequisites[_milestone];
        for(uint i = 0; i<_prerequisites.length; i++)
        {
            if(!(userMilestones[_user][_prerequisites[i]].milestone > 0))
                return false;
        }
        return true;
    }

    // Add a milestone to an adress in userMilestones
    function awardMilestone(address _user, uint256 _milestone, string memory data) public 
    {
        require(isAdmin(msg.sender, _milestone), "You are not an authority of this milestone");
        require(meetsPrerequisites(_user, _milestone), "The user doesn't meet the prerequisites of the Milestone");
        uint256[] memory support;
        userMilestones[_user][_milestone] = Achievement(_milestone, data, support);
    }
    
    // Check if milestone1 has milestone2 as a prerequisite in milestonePrerequisites
    function hasPrerequisite(uint256 _milestone1, uint256 _milestone2) public view returns(bool)
    {
        uint256[] memory _prerequisites = milestonePrerequisites[_milestone1];
        for(uint i = 0; i<_prerequisites.length && i<MAX_PREREQUISITES; i++)
        {
            if(_milestone2 == _prerequisites[i])
                return true;
        }
        return false;
    }

    // Add a milestone2 to milestone1's prerequisites in milestonePrerequisites
    function addMilestonePrerequisite(uint256 _milestone1, uint256 _milestone2) public
    {
        require(isAdmin(msg.sender, _milestone1), "Only a milestone authority can add a prerequisite to a contract");
        require(milestonePrerequisites[_milestone1].length < MAX_PREREQUISITES, "There is a finite number of prerequisites a milestone can have");

        milestonePrerequisites[_milestone1].push(_milestone2);
    }

    // Check if a user is an admin of milestone in milestoneAuthorities
    function isAdmin(address _user, uint256 _milestone) public view returns(bool)
    {
        return milestoneAuthorities[_milestone][_user];
    }

    // Add user to milestones's admins in milestoneAuthorities
    function addMilestoneAdmin(address _user, uint256 _milestone) public 
    {
        require(isAdmin(msg.sender, _milestone));
        milestoneAuthorities[_milestone][_user] = true;
    }

    function checkSupportItem(address _user, uint256 _milestone, uint number) public view returns (uint256)
    {
        require(userMilestones[_user][_milestone].milestone > 0,  "The user hasn't been awarded that milestone");
        require(number < userMilestones[_user][_milestone].support.length, "The index should be smaller than the size of the array");
        return userMilestones[_user][_milestone].support[number];
    }

    function addSupportItem(address _user, uint256 _milestone, uint256 _supportMilestone) public
    {
        require(userMilestones[_user][_milestone].milestone > 0,  "The user hasn't been awarded that milestone");
        userMilestones[_user][_milestone].support.push(_supportMilestone);
    }


}