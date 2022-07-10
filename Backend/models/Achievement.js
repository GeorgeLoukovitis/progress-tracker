const mongoose = require("mongoose")

const achievementSchema = new mongoose.Schema({
  milestone:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Milestone",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  data: {
    type: String
  },
  support: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Milestone",
    required: true
  }]
})

const Achievement = mongoose.model("Achievement", achievementSchema)
module.exports = Achievement