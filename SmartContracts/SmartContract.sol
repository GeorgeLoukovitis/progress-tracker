// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract AssignmentContract{

    uint256[] public milestones;
    
    
    mapping(uint256 => mapping(address => bool)) public userMilestones;
    mapping(uint256 => mapping(address => bool)) public milestoneAuthorities;
    mapping(uint256 => mapping(uint256 => bool)) public milestonePrerequisites;
    

    // Add milestone to milestones
    function createMilestone(uint256 _milestone) public 
    {
        milestones.push(_milestone);
        milestoneAuthorities[_milestone][msg.sender] = true;
    }

    // Check if an adress has a milestone in userMilestones
    function hasMilestone(address _usr, uint256 _milestone) public view returns(bool)
    {
        return userMilestones[_milestone][_usr];
    }

    // Add a milestone to an adress in userMilestones
    function awardMilestone(address _usr, uint256 _milestone) public 
    {
        require(isAdmin(msg.sender, _milestone));
        userMilestones[_milestone][_usr] = true;
    }
    
    // Check if milestone1 has milestone2 as a prerequisite in milestonePrerequisites
    function hasPrerequisite(uint256 _milestone1, uint256 _milestone2) public view returns(bool)
    {
        return milestonePrerequisites[_milestone1][_milestone2];

    }

    // Add a milestone2 to milestone1's prerequisites in milestonePrerequisites
    function addMilestonePrerequisite(uint256 _milestone1, uint256 _milestone2) public
    {
        require(isAdmin(msg.sender, _milestone1));
        milestonePrerequisites[_milestone1][_milestone2] = true;
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


}