const express = require("express")
const mongoose = require("mongoose")
const {ObjectId, ServerApiVersion} = require("mongodb")
const path = require("path");
const User = require("./models/User")
const Project = require("./models/Project")
const Milestone = require("./models/Milestone")
const Achievement = require("./models/Achievement")
const morgan = require("morgan")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const cors = require("cors")
const env = require("dotenv").config()
const auth = require("./middleware/auth");
const cardano = require("./services/cardanoWrapper")
const ethereum = require("./services/ethereumWrapper")
const {sha256} = require("js-sha256")
const { BigNumber, utils } = require("ethers")

const {ethers} = require("ethers");
const { contractABI } = require("../SmartContracts/contractABI");
const {readFileSync, writeFileSync} = require("fs")


console.log("Environment: ")
console.log(env.parsed)

// Create EXPRESS app
const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, "..", "build")));
app.use(express.static("public"));
app.use(morgan("dev"))
app.use(cors())
// app.use((req, res, next) => {
//   res.sendFile(path.join(__dirname, "..", "build", "index.html"));
//   return next();
// });

let server;

let cardanoWallet;
const cardanoEnabled = (process.env.CARDANO === "enabled")?true:false;
if(cardanoEnabled)
{
  cardano.getApplicationWallet().then((data)=>{
    cardanoWallet = data
    console.log("Balance:")
    console.log(cardanoWallet.balance)
  })
}

let ethereumProvider, ethereumContract;
const ethereumEnabled = (process.env.ETHEREUM === "enabled")?true:false;
if(ethereumEnabled)
{
  ethereumProvider = new ethers.providers.JsonRpcProvider()
  ethereumContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, ethereumProvider)
}

mongoose.connect(process.env.REMOTE_DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })
  .then((connection)=>{
    server = app.listen(process.env.SERVING_PORT, ()=>{
      console.log("App listening on http://localhost:"+process.env.SERVING_PORT)
    })
    
  })

app.post("/register", async (req, res) => {

  const { firstName, lastName, email, password } = req.body;
  if (!(email && password && firstName && lastName)) {
    return res.status(400).send("All input is required");
  }

  const checkEmail = await User.findOne({ email: email });
  if (checkEmail) {
    console.log("User Already Exist. Please Login")
    res.statusMessage = "User Already Exist. Please Login"
    return res.status(409).send("User Already Exist. Please Login");
  }
  
  const username = firstName+lastName
  const checkUsername = await User.findOne({ username: username });
  if (checkUsername) {
    console.log("User Already Exist. Please Login")
    res.statusMessage = "User Already Exist. Please Login"
    return res.status(409).send("User Already Exist. Please Login");
  }

  //Encrypt user password
  encryptedUserPassword = await bcrypt.hash(password, 10);
  
  let tempUser = {
    username : username,
    firstName: firstName,
    lastName: lastName,
    email: email.toLowerCase(),
    password: encryptedUserPassword,
  }
  
  if(cardanoEnabled)
    tempUser.cardanoAddress = await cardano.createUserAddress(username)
  
  if(ethereumEnabled)
  {
    const userWallet = ethereum.newWallet(username, ethereumProvider)
    await ethereum.fundWallet(userWallet, ethereumProvider)
    tempUser.ethereumAddress = userWallet.address
  }

  let user = await User.create(tempUser);

  // Create token
  const token = jwt.sign(
    { user_id: user._id, username },
    process.env.TOKEN_KEY,
    {
      expiresIn: "5h",
    }
  );
  
  // Include the auth token to the response
  let loggedUser = await User.findById(user._id)
  result = {
    ...loggedUser._doc,
    token
  }

  console.log(result)

  return res.status(201).json(result);
});

app.post("/login", async (req, res)=>{
  const { email, password } = req.body;

  // Retrieve the user document
  if (!(email && password)) {
    return res.status(400).send("All input is required");
  }
  const user = await User.findOne({ email }).populate("achievements");

  if (user && (await bcrypt.compare(password, user.password))) {
    
    // Create token
    const token = jwt.sign(
      { user_id: user._id, username: user.username },
      process.env.TOKEN_KEY,
      {
        expiresIn: "5h",
      }
    );

    // Include the auth token to the response
    result = {
      ...user._doc,
      token
    }
    console.log(result)
    return res.status(200).json(result);
  }
  else{
    res.statusMessage = "Invalid Credentials";
    return res.status(400).send("Invalid Credentials");
  }
});

app.get("/", async (req, res)=>{
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
})


// Get a list of all the milestones
app.get("/milestones", (req, res)=>{

  Milestone.find().sort({name:1})
    .then(result=>res.status(200).send(result))
    .catch((err)=>{res.status(500).send({err: `Error: ${err}`})})
})

// Get milestone information
app.get("/milestones/:id", (req, res)=>{
  const id = req.params.id

  if (ObjectId.isValid(id)){
    Milestone.findById(id)
      .then(result=>res.status(200).send(result))
      .catch((err)=>{res.status(500).send({err: `Error: ${err}`})})
  }
  else {
    return res.status(500).send("Invalid ID")
  }
})

// Create a new milestone
app.post("/milestones", auth, async (req, res)=>{
  const uid = req.user.user_id
  const milestone = req.body
  const {name, prerequisites} = milestone

  if(!name)
  {
    res.statusMessage = "All input is required"
    return res.status(400).send("All input is required");
  }

  // Retrieve the document regarding the milestone creator and save the milestone to the database

  const creator = await User.findById(uid)
  const document = new Milestone(
    {
      name,
      prerequisites: (prerequisites)?prerequisites.map((p)=>(ObjectId(p))):[]
    }
  )
  const result = await document.save()

  // Create the milestone in the contract and add its prerequisites

  if(ethereumEnabled && creator.ethereumAddress)
  {
    const mid = result._id
    const userWallet = ethereum.getWallet(creator.username, ethereumProvider)
    const userContract = ethereumContract.connect(userWallet);

    try
    {
      let blockchainResult = await userContract.createMilestone(BigNumber.from("0x"+ mid.toString()))
      console.log("Success:", await userContract.isAdmin(creator.ethereumAddress, BigNumber.from("0x"+mid.toString())))
  
      for(let milestonePrerequisite of prerequisites)
      {
        blockchainResult = await userContract.addMilestonePrerequisite(BigNumber.from("0x"+mid.toString()), BigNumber.from("0x"+milestonePrerequisite.toString()))
        console.log("Success", await userContract.hasPrerequisite(BigNumber.from("0x"+mid.toString()), BigNumber.from("0x"+milestonePrerequisite.toString())))
      }
    }
    catch(err)
    {
      // If the contract call reverts delete the milestone

      await Milestone.findByIdAndDelete(result._id)
      console.log(err.errorArgs[0])
      res.statusMessage = err.errorArgs[0]
      return res.status(500).send(err.errorArgs[0])
    }
  }
  return res.status(201).send(result);
})

// app.delete("/milestones/:id", auth, async (req, res)=>{
//   const uid = req.user.user_id
//   const mid = req.params.id

//   if(ObjectId.isValid(mid))
//   {
//     const milestone = await Milestone.findById(mid)
//     if(milestone.assosiatedProject)
//     {
//       const project = await Project.findById(milestone.assosiatedProject)
//       if((uid == project.creator) || project.admins.includes(uid))
//       {
//         project.milestones = project.milestones.filter((m)=>(m!==mid))
//         await project.save()
//         const milestoneResult = await Milestone.findByIdAndDelete(mid)
//         return res.status(200).send({result:milestoneResult})
//       }
//     }
//   }
//   else {
//     return res.status(500).send({err: "Invalid ID"})
//   }
// })

// Get a list of all the users
app.get("/users", (req, res)=>{
  
  User.find().sort({username:1})
    .then(result=>{
      res.status(200).send(result.map(usr=>{
        return {
          username: usr.username,
          _id: usr._id
        }
      }))
    })
    .catch((err)=>{res.status(500).send(`Error: ${err}`)})
})

// Get user information. Full access is only granted to a user about himself
app.get("/users/:id", auth, (req, res)=>{
  const id = req.params.id
  if (ObjectId.isValid(id)){
    User.findById(id).populate("achievements")
      .then(result=>{
        if(req.user.user_id == id)
        {
          return res.status(200).send(result)
        }
        else
        {
          return res.status(200).send({
            firstName: result.firstName,
            lastName: result.lastName,
            achievements: result.milestones
          })
        }
      })
      .catch((err)=>{res.status(500).send(`Error: ${err}`)})
  }
  else {
    return res.status(500).send("Invalid ID")
  }
})

// app.delete("/users/:id", (req, res)=>{
//   const id = req.params.id
//   console.log(id)

//   if(ObjectId.isValid(id))
//   {
//     User.findByIdAndDelete(id)
//       .then(result=>res.status(200).json(result))
//       .catch(err=>res.status(500).send({error: err}))
//   }
//   else {
//     return res.status(500).send({err: "Invalid ID"})
//   }
// })

// Get a list of all the projects
app.get("/projects", (req, res)=>{
  
  Project.find()
    .sort({title: 1})
    .populate("milestones")
    .then(result=>res.status(200).send(result))
    .catch((err)=>{res.status(500).send(`Error: ${err}`)})
})

// Get a specified project
app.get("/projects/:id", (req, res)=>{
  const id = req.params.id

  if (ObjectId.isValid(id)){
    Project.findById(id)
      .populate("milestones")
      .populate("creator")
      .then(result=>res.status(200).send(result))
      .catch((err)=>{res.status(500).send({err: `Error: ${err}`})})
  }
  else {
    res.statusMessage = "Invalid ID"
    return res.status(500).send("Invalid ID")
  }
})

// Create a new project
app.post("/projects", auth, async (req, res) => {

  const uid = req.user.user_id
  const { title, admins, usersEnrolled, milestones, requiredMilestones } = req.body;
  if (!(title && admins)) {
    return res.status(400).send("All input is required");
  }

  // Save the new project to the database and retreive the documents regarding the project creator and the project admins

  const creator = await User.findById(uid)
  const project = {
    title,
    creator: ObjectId(uid),
    admins : admins.map((admin)=>ObjectId(admin)),
    usersEnrolled: (usersEnrolled)?usersEnrolled.map((uid)=>(ObjectId(uid))):[],
    milestones: (milestones)?milestones.map((mid)=>(ObjectId(mid))):[],
    requiredMilestones: (requiredMilestones)?requiredMilestones.map((rmid)=>(ObjectId(rmid))):[]
  }
  const document = new Project(project)
  const result = await document.save()
  const projectAdmins = (await Project.findById(result._id).populate("admins")).admins

  // Associate all milestones to the project

  for(let mid of milestones){
    if(ObjectId.isValid(mid))
    {
      if(ethereumEnabled && creator.ethereumAddress)
      {
        const userWallet = ethereum.getWallet(req.user.username, ethereumProvider)
        const userContract = ethereumContract.connect(userWallet);

        // Add each admin of the project as an authority of each milestone in the contract

        for(let projectAdmin of projectAdmins)
        {
          if(projectAdmin.ethereumAddress)
          {
            try
            {
              blockchainResult = await userContract.addMilestoneAdmin(projectAdmin.ethereumAddress, BigNumber.from("0x"+mid.toString()))
              console.log("Admin added: ", await userContract.isAdmin(projectAdmin.ethereumAddress, BigNumber.from("0x"+mid.toString())))
            }
            catch(err)
            {
              // If the contract call reverts delete the project

              await Project.findByIdAndDelete(result._id)
              console.log(err.errorArgs[0])
              res.statusMessage = err.errorArgs[0]
              res.status(500).send(err.errorArgs[0])
            }
          }
        }
      }
      const milestone = await Milestone.findById(mid)
      milestone.assosiatedProject = result._id
      const milestoneResult = await milestone.save()
    }
  }
  return res.status(201).send(result)
})


// Enroll the user to a project
app.post("/enrollToProject", auth, async (req, res)=>{
  const uid = req.user.user_id
  const pid = req.body.projectId

  if(ObjectId.isValid(uid) && ObjectId.isValid(pid))
  {
    const user = await User.findById(uid)
    user.projectsJoined.push(ObjectId(pid))
    const userResult = await user.save()

    const project = await Project.findById(pid)
    project.usersEnrolled.push(ObjectId(uid))
    const projectResult = await project.save()

    res.status(200).send({user:userResult, project, projectResult})
  }
  else
  {
    res.statusMessage = "Invalid ID"
    return res.status(500).send("Invalid ID")
  }
})

// Award a milestone to a user
app.post("/awardMilestone", auth, async (req, res)=>{
  const uid = req.user.user_id
  const mid = req.body.milestoneId
  const awardTo = req.body.userId
  const support = req.body.support
  const data = req.body.data

  // Retrieve user, milestone and project information from the database

  if(!(ObjectId.isValid(mid) && ObjectId.isValid(uid)))
  {
    console.log("Milestone or User is not valid")
    res.statusMessage = "Milestone or User is not valid"
    return res.status(500).send("Milestone or User is not valid")
  }
  const milestone = await Milestone.findById(mid)
  const pid = milestone.assosiatedProject

  if(!ObjectId.isValid(pid))
  {
    console.log("Assosiated Project is not valid")
    res.statusMessage = "Assosiated Project is not valid"
    return res.status(500).send("Assosiated Project is not valid")
  }
  const project = await Project.findById(pid)

  // Check that the logged in user is an admin of the project and that the user to be awarded is enrolled

  if((uid == project.creator) || project.admins.includes(uid))
  {
    const usr = await User.findById(awardTo).populate("achievements")
    const authority = await User.findById(uid)

    if(usr.projectsJoined.includes(ObjectId(pid)))
    {
      let tempAchievement = {
        milestoneName: project.title + " - " + milestone.name,
        milestone: mid,
        user: awardTo,
        data: data,
        support: (support)?support.map((p)=>(ObjectId(p))):[]
      }
      const dataHash = sha256(data)

      // Check that the user to be awarded meets the prerequisites

      const achievedMilestones = usr.achievements.map((a)=>a.milestone);
      for(let prerequisite of milestone.prerequisites)
      {
        if(!achievedMilestones.includes(prerequisite))
        {
          res.statusMessage = "Not all prerequisites have been accomplished"
          return res.status(500).send("Not all prerequisites have been accomplished")
        }
      }

      // Submit a transaction to cardano with metadata verifying the achievement

      if(cardanoEnabled && usr.cardanoAddress)
      {
        const metadata = [authority.firstName + authority.lastName, uid, project.title, milestone.name, mid, dataHash, support]
        const txId = await cardano.saveMetadata(cardanoWallet, metadata, usr.cardanoAddress)
        tempAchievemt.cardanoTx = txId
      }

      // Add the achievement and its support to the Ethereum smart contract

      if(ethereumEnabled && authority.ethereumAddress && usr.ethereumAddress)
      {
        const userWallet = ethereum.getWallet(req.user.username, ethereumProvider)
        const userContract = ethereumContract.connect(userWallet);
        try{
          let blockchainResult = await userContract.awardMilestone(usr.ethereumAddress, BigNumber.from("0x"+mid.toString()), dataHash)
          for(let supportMilestone of support)
            blockchainResult = await userContract.addSupportItem(usr.ethereumAddress, BigNumber.from("0x"+mid.toString()), BigNumber.from("0x"+supportMilestone.toString()))
        }
        catch (err){
          res.statusMessage = err.errorArgs[0]
          return res.status(500).send(err.errorArgs[0])
        }
      }

      // Save the achievement to the database

      const achievement = new Achievement(tempAchievement)
      const achievementSaved = await achievement.save()

      usr.achievements.push(achievementSaved._id)
      const usrSaved = await usr.save()

      return res.status(201).send(achievementSaved)
    }
    else
    {
      res.statusMessage = "The users hasn't joined this project"
      return res.status(500).send("The users hasn't joined this project")
    }
  }
  else
  {
    console.log("Only a project admin can award milestones")
    res.statusMessage = "Only a project admin can award milestones"
    return res.status(500).send("Only a project admin can award milestones")
  }

})

// Get the projects for which the user is an authority
app.get("/myProjects", auth, async (req, res)=>{
  const uid = req.user.user_id
  const projects = await Project.find({$or:[
    {creator: uid},
    {admins: {$all: [uid]}}
  ]})
  .sort({title:1})

  return res.status(200).send(projects)
})

// Associate a milestone with a specific project 
// app.post("/addMilestoneToProject", auth, async (req, res)=>{
//   const uid = req.user.user_id
//   const mid = req.body.milestoneId
//   const pid = req.body.projectId
//   const required = req.body.required

//   if(!(ObjectId.isValid(mid) && ObjectId.isValid(uid) && ObjectId.isValid(pid)))
//   {
//     res.statusMessage = "Invalid ID"
//     return res.status(500).send("Invalid ID")
//   }

//   const milestone = await Milestone.findById(mid)
//   if(milestone.assosiatedProject)
//   {
//     res.statusMessage = "Already belongs to project"
//     return res.status(500).send("Already belongs to project")
//   }

//   const project = await Project.findById(pid)
//   if((uid == project.creator) || project.admins.includes(uid))
//   {
//     project.milestones.push(ObjectId(mid))
//     if(required)
//       project.requiredMilestones.push(ObjectId(mid))
//     const projectResult = await project.save()
//     return res.status(201).send({project: projectResult})
//   }
//   else
//   {
//     res.statusMessage = "Your are not an admin"
//     return res.status(500).send("Your are not an admin")
//   }

// })

// Add a new admin to a project
// app.post("/addAdminToProject", auth, async (req, res)=>{
//   const uid = req.user.user_id
//   const aid = req.body.adminId
//   const pid = req.body.projectId

//   if(!(ObjectId.isValid(aid) && ObjectId.isValid(uid) && ObjectId.isValid(pid)))
//   {
//     res.statusMessage = "Invalid ID"
//     return res.status(500).send("Invalid ID")
//   }

//   const project = await Project.findById(pid)
//   if(uid == project.creator)
//   {
//     project.admins.push(ObjectId(aid))
//     const projectResult = await project.save()
//     return res.status(201).send({project: projectResult})
//   }
//   else
//   {
//     res.statusMessage = "Your are not an admin"
//     return res.status(500).send("Your are not an admin")
//   }
// })

// Get the users that have enrolled to a project
app.get("/enrolledUsers/:pid", auth, async (req, res)=>{
  const uid = req.user.user_id
  const pid = req.params.pid

  const project = await Project.findById(pid).populate({
    path : 'usersEnrolled',
    populate : {
      path : 'achievements'
    }
  })
  console.log(project)
  if((uid == project.creator) || project.admins.includes(uid))
  {
    return res.status(201).send(project.usersEnrolled)
  }
  else
  {
    res.statusMessage = "Your are not an admin";
    return res.status(500).send("Your are not an admin")
  }
})

// Get the projects a users has enrolled to 
app.get("/joinedProjects", auth, async (req, res)=>{
  const uid = req.user.user_id
  if(ObjectId(uid))
  {
    const user = await User.findById(uid).populate("projectsJoined")
    return res.status(200).send(user.projectsJoined)
  }
  else
  {
    res.statusMessage = "Invalid Id"
    return res.status(500).send("Invalid Id")
  }
})

// Get the achievement that the user has verifiably got
app.get("/achievements", auth, async (req, res)=>{
  const uid = req.user.user_id
  if(ObjectId(uid))
  {
    const user = await User.findById(uid).populate("achievements")
    let achievements = [];
    if(cardanoEnabled)
    {
      achievements = user.achievements.filter(async (achievement)=> {
        const metadata = await cardano.getMetadata(cardanoWallet, achievement.cardanoTx)
        const metadataObj = cardano.metadataToObject(metadata)
        const receiverAddress = await cardano.getTxReceivingAddress(cardanoWallet, achievement.cardanoTx)
        return (achievement.milestone == metadataObj.mid) && (user.cardanoAddress == receiverAddress)
      })
      return res.status(200).send(achievements)
    }
    res.statusMessage = "The backend needs to be connected to cardano for verified achievements to be displayed"
    return res.status(500).send("The backend needs to be connected to cardano for verified achievements to be displayed")
  }
  else
  {
    return res.status(500).send("Invalid Id")
  }
})

app.post("/projectExists", async (req, res) => {
  const projectTitle = req.body.title;
  const result = await Project.findOne({title: projectTitle})
  if(result)
    return res.status(200).send("yes")
  else
    return res.status(200).send("no")
})
