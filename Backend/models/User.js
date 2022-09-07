const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String,
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  ethereumAddress: {
    type: String,
    required: false
  },
  cardanoAddress: {
    type: String,
    required: false
  },
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Achievement",
    required: true
  }],
  projectsJoined: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    }
  ]
})

const User = mongoose.model("User", userSchema);
module.exports = User