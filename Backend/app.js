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
    res.status(400).send("All input is required");
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
  res.status(201).json(result);
});

app.post("/login", async (req, res)=>{
  const { email, password } = req.body;

  // Validate user input
  if (!(email && password)) {
    res.status(400).send("All input is required");
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

  Milestone.find().sort({name:-1})
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
    res.status(500).send({err: "Invalid ID"})
  }
})

app.post("/milestones", (req, res)=>{
  const milestone = req.body
  console.log(milestone)

  const document = new Milestone(milestone)
  console.log(document)
  document.save()
    .then(result=>res.status(201).send(result))
    .catch(err=>res.status(500).send({error: err}))
})

app.delete("/milestones/:id", (req, res)=>{
  const id = req.params.id
  console.log(id)

  if(ObjectId.isValid(id))
  {
    Milestone.findByIdAndDelete(id)
      .then(result=>res.status(200).json(result))
      .catch(err=>res.status(500).send({error: err}))
  }
  else {
    res.status(500).send({err: "Invalid ID"})
  }
})

app.get("/users", (req, res)=>{
  
  User.find().sort({username:1})
    .then(result=>res.status(200).send(result))
    .catch((err)=>{res.status(500).send({err: `Error: ${err}`})})
})

app.get("/users/:id", (req, res)=>{
  
  const id = req.params.id
  if (ObjectId.isValid(id)){
    User.findById(id)
      .then(result=>res.status(200).send(result))
      .catch((err)=>{res.status(500).send({err: `Error: ${err}`})})
  }
  else {
    res.status(500).send({err: "Invalid ID"})
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
    res.status(500).send({err: "Invalid ID"})
  }
})

app.get("/projects", (req, res)=>{
  
  Project.find().sort({name: 1})
    .then(result=>res.status(200).send(result))
    .catch((err)=>{res.status(500).send({err: `Error: ${err}`})})
})

app.get("/projects/:id", (req, res)=>{
  const id = req.params.id

  if (ObjectId.isValid(id)){
    Project.findById(id)
      .then(result=>res.status(200).send(result))
      .catch((err)=>{res.status(500).send({err: `Error: ${err}`})})
  }
  else {
    res.status(500).send({err: "Invalid ID"})
  }
})

app.post("/projects", (req, res)=> {
  const project = req.body
  const document = new Project(project)

  document.save()
    .then(result=>{res.status(201).send({dbResponse: result, object: document})})
    .catch(err=>res.status(500).send({err: `Error: ${err}`}))
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
    res.status(500).send({err: "Invalid ID"})
  }
})