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
    ref: "Milestone",
    required: true
  }]
})

const Milestone = mongoose.model("Milestone", milestoneSchema)
module.exports = Milestone