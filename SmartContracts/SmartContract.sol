// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract AssignmentContract{

    string[] milestones;
    mapping(address => string[]) public userMilestones;
    mapping(string => string[]) public milestonePrerequisites;
    mapping(string => address[]) public milestoneAuthorities;

    // Add milestone to milestones
    function createMilestone(string memory _milestone) public 
    {

    }

    // Check if an adress has a milestone in userMilestones
    function hasMilestone(address _usr, string memory _milestone) public view returns(bool)
    {

    }

    // Add a milestone to an adress in userMilestones
    function awardMilestone(address _usr, string memory _milestone) public 
    {

    }
    
    // Check if milestone1 has milestone2 as a prerequisite in milestonePrerequisites
    function hasPrerequisite(string memory _milestone1, string memory _milestone2) public view returns(bool)
    {

    }

    // Add a milestone2 to milestone1's prerequisites in milestonePrerequisites
    function addMilestonePrerequisite(string memory _milestone1, string memory _milestone2) public
    {

    }

    // Check if a user is an admin of milestone in milestoneAuthorities
    function isAdmin(address _user, string memory _milestone) public view returns(bool)
    {

    }

    // Add user to milestones's admins in milestoneAuthorities
    function addMilestoneAdmin(address _user, string memory _milestone) public 
    {

    }


}