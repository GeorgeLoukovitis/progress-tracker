const express = require("express")
const mongoose = require("mongoose")
const {ObjectId, ServerApiVersion} = require("mongodb")
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


console.log("Environment: ")
console.log(env.parsed)

// Create EXPRESS app
const app = express()
app.use(express.json())
app.use(morgan("dev"))
app.use(cors())
let server;
let cardanoWallet;
let ethereumProvider, ethereumWallet, ethereumContract;
const cardanoEnabled = (process.env.CARDANO === "enabled")?true:false;
const ethereumEnabled = (process.env.ETHEREUM === "enabled")?true:false;

if(cardanoEnabled)
{
  cardano.getWallet().then((data)=>{
    cardanoWallet = data
    console.log("Balance:")
    console.log(cardanoWallet.balance)
  })
}

if(ethereumEnabled)
{
  ethereumProvider = ethereum.getProvider()
  ethereum.getContract(process.env.CONTRACT_ADDRESS, ethereumProvider).then((data)=> {
    ethereumContract = data
    // console.log(ethereumContract)
  })
}

mongoose.connect(process.env.REMOTE_DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })
  .then((connection)=>{
    server = app.listen(process.env.SERVING_PORT, ()=>{
      console.log("App listening on http://localhost:"+process.env.SERVING_PORT)
    })
    
  })

app.post("/register", async (req, res) => {

  // Get user input
  const { firstName, lastName, email, password } = req.body;

  // Validate user input
  if (!(email && password && firstName && lastName)) {
    return res.status(400).send("All input is required");
  }

  // check if user already exist
  // Validate if user exist in our database
  const checkEmail = await User.findOne({ email: email });
  if (checkEmail) {
    console.log("User Already Exist. Please Login")
    return res.status(409).send("User Already Exist. Please Login");
  }
  
  const username = firstName+lastName
  const checkUsername = await User.findOne({ username: username });
  if (checkUsername) {
    console.log("User Already Exist. Please Login")
    return res.status(409).send("User Already Exist. Please Login");
  }

  //Encrypt user password
  encryptedUserPassword = await bcrypt.hash(password, 10);
  
  let tempUser = {
    username : username,
    firstName: firstName,
    lastName: lastName,
    email: email.toLowerCase(), // sanitize
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

  // Create user in our database
  let user = await User.create(tempUser);

  // Create token
  const token = jwt.sign(
    { user_id: user._id, username },
    process.env.TOKEN_KEY,
    {
      expiresIn: "5h",
    }
  );

  let loggedUser = await User.findById(user._id)
  result = {
    ...loggedUser._doc,
    token
  }

  console.log("Result")
  console.log(result)

  // return new user
  return res.status(201).json(result);
});

app.post("/login", async (req, res)=>{
  const { email, password } = req.body;

  // Validate user input
  if (!(email && password)) {
    return res.status(400).send("All input is required");
  }
  // Validate if user exist in our database
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

    // save user token
    result = {
      ...user._doc,
      token
    }
    console.log(result)
    // user
    return res.status(200).json(result);
  }
  else{
    return res.status(400).send("Invalid Credentials");
  }
});

app.get("/", async (req, res)=>{

  let wallet = await cardano.getWallet();
  console.log(wallet.getAvailableBalance());
  let transactions = await wallet.getTransactions();
  console.log(transactions)

  const id = ObjectId("62b0b6d47d0e8421534caf0d").valueOf()
  const num_id = parseInt(id, 16)
  console.log(id)
  console.log(num_id)
  return res.status(200).send(id)
})


app.get("/milestones", (req, res)=>{

  Milestone.find().sort({name:1})
    .then(result=>res.status(200).send(result))
    .catch((err)=>{res.status(500).send({err: `Error: ${err}`})})
})

app.get("/milestones/:id", (req, res)=>{
  const id = req.params.id

  if (ObjectId.isValid(id)){
    Milestone.findById(id)
      .then(result=>res.status(200).send(result))
      .catch((err)=>{res.status(500).send({err: `Error: ${err}`})})
  }
  else {
    return res.status(500).send({err: "Invalid ID"})
  }
})

app.post("/milestones", auth, async (req, res)=>{
  const uid = req.user.user_id
  const milestone = req.body
  const {name, prerequisites} = milestone

  if(!name)
  {
    return res.status(400).send("All input is required");
  }

  const creator = await User.findById(uid)
  const document = new Milestone(
    {
      name,
      prerequisites: (prerequisites)?prerequisites.map((p)=>(ObjectId(p))):[]
    }
  )
  const result = await document.save()
  console.log("Result:")
  console.log(result)

  if(ethereumEnabled && creator.ethereumAddress)
  {
    const mid = result._id
    const userWallet = ethereum.getWallet(creator.username, ethereumProvider)
    const userContract = ethereumContract.connect(userWallet);
    let blockchainResult = await userContract.createMilestone(BigNumber.from("0x"+ mid.toString()))
    console.log("Milestone: " + BigNumber.from("0x"+mid.toString()))
    console.log("isAdmin: " + creator.ethereumAddress)
    console.log(await userContract.isAdmin(creator.ethereumAddress, BigNumber.from("0x"+mid.toString())))

    for(let milestonePrerequisite of prerequisites)
    {
      blockchainResult = await userContract.addMilestonePrerequisite(BigNumber.from("0x"+mid.toString()), BigNumber.from("0x"+milestonePrerequisite.toString()))
      // console.log(blockchainResult)
      console.log("isPrerequisite: " + milestonePrerequisite.toString())
      console.log(await userContract.hasPrerequisite(BigNumber.from("0x"+mid.toString()), BigNumber.from("0x"+milestonePrerequisite.toString())))
    }
  }

  return res.status(201).send(result);
})

app.delete("/milestones/:id", auth, async (req, res)=>{
  const uid = req.user.user_id
  const mid = req.params.id

  if(ObjectId.isValid(mid))
  {
    const milestone = await Milestone.findById(mid)
    if(milestone.assosiatedProject)
    {
      const project = await Project.findById(milestone.assosiatedProject)
      if((uid == project.creator) || project.admins.includes(uid))
      {
        project.milestones = project.milestones.filter((m)=>(m!==mid))
        await project.save()
        const milestoneResult = await Milestone.findByIdAndDelete(mid)
        return res.status(200).send({result:milestoneResult})
      }
    }
  }
  else {
    return res.status(500).send({err: "Invalid ID"})
  }
})

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
    .catch((err)=>{res.status(500).send({err: `Error: ${err}`})})
})

app.get("/users/:id", auth, (req, res)=>{
  
  const id = req.params.id
  if (ObjectId.isValid(id)){
    User.findById(id).populate("achievements")
      .then(result=>{
        if(req.user.user_id == id)
        {
          res.status(200).send(result)
        }
        else
        {
          res.status(200).send({
            firstName: result.firstName,
            lastName: result.lastName,
            achievements: result.milestones
          })
        }
      })
      .catch((err)=>{res.status(500).send({err: `Error: ${err}`})})
  }
  else {
    return res.status(500).send({err: "Invalid ID"})
  }
})

app.delete("/users/:id", (req, res)=>{
  const id = req.params.id
  console.log(id)

  if(ObjectId.isValid(id))
  {
    User.findByIdAndDelete(id)
      .then(result=>res.status(200).json(result))
      .catch(err=>res.status(500).send({error: err}))
  }
  else {
    return res.status(500).send({err: "Invalid ID"})
  }
})

app.get("/projects", (req, res)=>{
  
  Project.find()
    .sort({title: 1})
    .populate("milestones")
    .then(result=>res.status(200).send(result))
    .catch((err)=>{res.status(500).send({err: `Error: ${err}`})})
})

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
    return res.status(500).send({err: "Invalid ID"})
  }
})

app.post("/projects", auth, async (req, res) => {

  const uid = req.user.user_id
  // Get user input
  const { title, admins, usersEnrolled, milestones, requiredMilestones } = req.body;

  // Validate user input
  if (!(title && admins)) {
    return res.status(400).send("All input is required");
  }

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

  for(let mid of milestones){
    if(ObjectId.isValid(mid))
    {
      const milestone = await Milestone.findById(mid)
      milestone.assosiatedProject = result._id
      const milestoneResult = await milestone.save()

      if(ethereumEnabled && creator.ethereumAddress)
      {
        const userWallet = ethereum.getWallet(req.user.username, ethereumProvider)
        const userContract = ethereumContract.connect(userWallet);
        // let blockchainResult = await userContract.createMilestone(BigNumber.from("0x"+mid.toString()))
        for(let projectAdmin of projectAdmins)
        {
          if(projectAdmin.ethereumAddress)
          {
            blockchainResult = await userContract.addMilestoneAdmin(projectAdmin.ethereumAddress, BigNumber.from("0x"+mid.toString()))
            console.log("isAdmin: " + projectAdmin.ethereumAddress)
            console.log(await userContract.isAdmin(projectAdmin.ethereumAddress, BigNumber.from("0x"+mid.toString())))
          }
        }

        // for(let milestonePrerequisite of milestone.prerequisites)
        //   blockchainResult = await userContract.addMilestonePrerequisite(BigNumber.from("0x"+mid.toString()), BigNumber.from("0x"+milestonePrerequisite.toString()))
      }
    }
  }
  return res.status(201).send(result)
})

app.post("/enrollToProject", auth, async (req, res)=>{
  const uid = req.user.user_id
  const pid = req.body.projectId
  console.log(uid)
  console.log(req)
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
    return res.status(500).send({err: "Invalid ID"})
  }
})

app.post("/awardMilestone", auth, async (req, res)=>{
  const uid = req.user.user_id
  const mid = req.body.milestoneId
  const awardTo = req.body.userId
  const support = req.body.support
  const data = req.body.data

  console.log("Data:")
  console.log(data)
  console.log(sha256(data))


  if(!(ObjectId.isValid(mid) && ObjectId.isValid(uid)))
  {
    console.log("Milestone not valid " + mid)
    return res.status(500).send({err: "Invalid ID"})
  }

  const milestone = await Milestone.findById(mid)
  const pid = milestone.assosiatedProject

  if(!ObjectId.isValid(pid))
  {
    console.log("Project not valid "+pid)
    return res.status(500).send({err: "Invalid ID"})
  }

  const project = await Project.findById(pid)
  if((uid == project.creator) || project.admins.includes(uid))
  {
    const usr = await User.findById(awardTo)
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

      if(cardanoEnabled && usr.cardanoAddress)
      {
        const metadata = [authority.firstName + authority.lastName, uid, project.title, milestone.name, mid, dataHash, support]
        const txId = await cardano.saveMetadata(cardanoWallet, metadata, usr.cardanoAddress)
        tempAchievemt.cardanoTx = txId
      }

      if(ethereumEnabled && authority.ethereumAddress && usr.ethereumAddress)
      {
        const userWallet = ethereum.getWallet(req.user.username, ethereumProvider)
        const userContract = ethereumContract.connect(userWallet);
        console.log(usr.ethereumAddress)
        console.log(BigNumber.from("0x"+mid.toString()))
        console.log(data)
        let blockchainResult = await userContract.awardMilestone(usr.ethereumAddress, BigNumber.from("0x"+mid.toString()), dataHash)
        // console.log(blockchainResult)
        for(let supportMilestone of support)
        {
          blockchainResult = await userContract.addSupportItem(usr.ethereumAddress, BigNumber.from("0x"+mid.toString()), BigNumber.from("0x"+supportMilestone.toString()))
        }
      }


      const achievement = new Achievement(tempAchievement)
      const achievementSaved = await achievement.save()
      console.log(achievementSaved)

      usr.achievements.push(achievementSaved._id)
      const usrSaved = await usr.save()
      // console.log(usrSaved);

      return res.status(201).send({result: "ok"})
    }
    else
    {
      return res.status(500).send({result: "The users hasn't joined this project"})
    }
    
  }
  else
  {
    console.log("Not an admin")
    return res.status(500).send({err: "Your are not an admin"})
  }

})

app.get("/myProjects", auth, async (req, res)=>{
  const uid = req.user.user_id
  const projects = await Project.find({$or:[
    {creator: uid},
    {admins: {$all: [uid]}}
  ]})
  .sort({title:1})

  return res.status(200).send(projects)
})

app.post("/addMilestoneToProject", auth, async (req, res)=>{
  const uid = req.user.user_id
  const mid = req.body.milestoneId
  const pid = req.body.projectId
  const required = req.body.required

  if(!(ObjectId.isValid(mid) && ObjectId.isValid(uid) && ObjectId.isValid(pid)))
    return res.status(500).send({err: "Invalid ID"})

  const milestone = await Milestone.findById(mid)
  if(milestone.assosiatedProject)
    return res.status(500).send({err: "Already belongs to project"})

  const project = await Project.findById(pid)
  if((uid == project.creator) || project.admins.includes(uid))
  {
    project.milestones.push(ObjectId(mid))
    if(required)
      project.requiredMilestones.push(ObjectId(mid))
    const projectResult = await project.save()
    return res.status(201).send({project: projectResult})
  }
  else
  {
    return res.status(500).send({err: "Your are not an admin"})
  }

})

app.post("/addAdminToProject", auth, async (req, res)=>{
  const uid = req.user.user_id
  const aid = req.body.adminId
  const pid = req.body.projectId

  if(!(ObjectId.isValid(aid) && ObjectId.isValid(uid) && ObjectId.isValid(pid)))
    return res.status(500).send({err: "Invalid ID"})

  const project = await Project.findById(pid)
  if(uid == project.creator)
  {
    project.admins.push(ObjectId(aid))
    const projectResult = await project.save()
    return res.status(201).send({project: projectResult})
  }
  else
  {
    return res.status(500).send({err: "Your are not an admin"})
  }

})

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
    return res.status(500).send({err: "Your are not an admin"})
  }

})

app.get("/joinedProjects", auth, async (req, res)=>{
  const uid = req.user.user_id
  if(ObjectId(uid))
  {
    const user = await User.findById(uid).populate("projectsJoined")
    return res.status(200).send(user.projectsJoined)
  }
  else
  {
    return res.status(500).send({err: "Invalid Id"})
  }
})

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
        console.log(metadataObj)
        const receiverAddress = await cardano.getTxReceivingAddress(cardanoWallet, achievement.cardanoTx)
        console.log(receiverAddress)
        return (achievement.milestone == metadataObj.mid) && (user.cardanoAddress == receiverAddress)
      })
    }
    return res.status(200).send(achievements)
  }
  else
  {
    return res.status(500).send({err: "Invalid Id"})
  }
})
