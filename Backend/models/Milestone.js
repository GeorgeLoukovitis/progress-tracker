const mongoose = require("mongoose")

const milestoneSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  assosiatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  },
  moreInfo: {
    type: String
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Milestone"
  }],
  age: {
    type: Number
  }
})

const Milestone = mongoose.model("Milestone", milestoneSchema)
module.exports = Milestone