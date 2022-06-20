const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  admins : [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  ],
  usersEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true
    }
  ],
  milestones: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Milestone",
      required: true
    }
  ],
  requiredMilestones: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Milestone",
      required: true
    }
  ]

})

const Project = mongoose.model("Project", projectSchema)
module.exports = Project