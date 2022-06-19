const express = require("express")
const mongoose = require("mongoose")
const {ObjectId} = require("mongodb")
const User = require("./models/User")
const Project = require("./models/Project")
const Milestone = require("./models/Milestone")
const morgan = require("morgan")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const env = require("dotenv").config()
const auth = require("./middleware/auth");

console.log(env)

// Create EXPRESS app
const app = express()
app.use(express.json())
app.use(morgan("dev"))
let server;

mongoose.connect("mongodb://localhost:27017/appTest")
  .then((connection)=>{
    server = app.listen(8080, ()=>{
      console.log("App listening on http://localhost:8080")
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
  const oldUser = await User.findOne({ email: email });

  if (oldUser) {
    return res.status(409).send("User Already Exist. Please Login");
  }

  //Encrypt user password
  encryptedUserPassword = await bcrypt.hash(password, 10);

  // Create user in our database
  let user = await User.create({
    username : firstName + lastName,
    firstName: firstName,
    lastName: lastName,
    email: email.toLowerCase(), // sanitize
    password: encryptedUserPassword,
  });

  // Create token
  const token = jwt.sign(
    { user_id: user._id, email },
    process.env.TOKEN_KEY,
    {
      expiresIn: "5h",
    }
  );
  // save user token
  // user.token = token;

  let loggedUser = await User.findById(user._id)
  result = {
    ...loggedUser._doc,
    token
  }

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
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
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

    // user
    return res.status(200).json(result);
  }
  else{
    return res.status(400).send("Invalid Credentials");
  }
});

app.get("/",auth, async (req, res)=>{
  console.log(req.user)
  const user = await User.findById(req.user.user_id)
  console.log(user)
  res.send(user)
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

app.post("/milestones", (req, res)=>{
  const milestone = req.body
  const {name, prerequisites} = milestone

  if(!name)
  {
    return res.status(400).send("All input is required");
  }

  const document = new Milestone(
    {
      name,
      prerequisites: (prerequisites)?prerequisites.map((p)=>(ObjectId(p))):[]
    }
  )
  console.log(document)
  document.save()
    .then(result=>res.status(201).send(result))
    .catch(err=>res.status(500).send({error: err}))
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
          uid: usr._id
        }
      }))
    })
    .catch((err)=>{res.status(500).send({err: `Error: ${err}`})})
})

app.get("/users/:id", auth, (req, res)=>{
  
  const id = req.params.id
  if (ObjectId.isValid(id)){
    User.findById(id)
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
            milestones: result.milestones
          })
        }
      })
      .catch((err)=>{res.status(500).send({err: `Error: ${err}`})})
  }
  else {
    return res.status(500).send({err: "Invalid ID"})
  }
})

app.post("/users", (req, res)=> {
  const user = req.body
  const document = new User(user)

  document.save()
    .then(result=>{res.status(201).send({dbResponse: result, object: document})})
    .catch(err=>res.status(500).send({err: `Error: ${err}`}))
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
  const { title, admins, usersEnrolled, milestones } = req.body;

  // Validate user input
  if (!(title && admins)) {
    return res.status(400).send("All input is required");
  }

  const project = {
    title,
    creator: ObjectId(uid),
    admins : admins.map((admin)=>ObjectId(admin)),
    usersEnrolled: (usersEnrolled)?usersEnrolled.map((uid)=>(ObjectId(uid))):[],
    milestones: (milestones)?milestones.map((mid)=>(ObjectId(mid))):[]
  }
  const document = new Project(project)

  const result = await document.save()
  for(mid of milestones){
    if(ObjectId.isValid(mid))
    {
      const milestone = await Milestone.findById(mid)
      milestone.assosiatedProject = result._id
      const milestoneResult = await milestone.save()
      console.log(milestoneResult)
    }
  }
  return res.status(201).send(result)
})

app.delete("/projects/:id", (req, res)=>{
  const id = req.params.id
  console.log(id)

  if(ObjectId.isValid(id))
  {
    Project.findByIdAndDelete(id)
      .then(result=>res.status(200).json(result))
      .catch(err=>res.status(500).send({error: err}))
  }
  else {
    return res.status(500).send({err: "Invalid ID"})
  }
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
  const awardTo = req.body.userIds

  if(!(ObjectId.isValid(mid) && ObjectId.isValid(uid)))
    return res.status(500).send({err: "Invalid ID"})

  const milestone = await Milestone.findById(mid)
  const pid = milestone.assosiatedProject

  if(!ObjectId.isValid(pid))
    return res.status(500).send({err: "Invalid ID"})

  const project = await Project.findById(pid)
  if((uid == project.creator) || project.admins.includes(uid))
  {
    for(const usrId of awardTo)
    {
      const usr = await User.findById(usrId)
      if(usr.projectsJoined.includes(ObjectId(pid)))
      {
        usr.milestones.push(ObjectId(mid))
        await usr.save()
      }
    }
    return res.status(201).send({result: "ok"})
  }
  else
  {
    return res.status(500).send({err: "Your are not an admin"})
  }

})

app.get("/myProjects", auth, async (req, res)=>{
  const uid = req.user.user_id
  console.log(uid)
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

  if(!(ObjectId.isValid(mid) && ObjectId.isValid(uid) && ObjectId.isValid(pid)))
    return res.status(500).send({err: "Invalid ID"})

  const milestone = await Milestone.findById(mid)
  if(milestone.assosiatedProject)
    return res.status(500).send({err: "Already belongs to project"})

  const project = await Project.findById(pid)
  if((uid == project.creator) || project.admins.includes(uid))
  {
    project.milestones.push(ObjectId(mid))
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
