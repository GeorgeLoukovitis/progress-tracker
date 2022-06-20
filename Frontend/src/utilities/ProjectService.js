import { getToken, getUser, setUser } from "./LoginService";

const isMilestoneAchieved = (usr,milestone)=>{
  // const userProjectIds = usr.projectsEnrolled.map((p)=>(p.projectId))
  // if(!userProjectIds.includes(projectId))
  //   return false;
  // const currentProject = usr.projectsEnrolled.filter((p)=>(p.projectId==projectId))[0]
  // return currentProject.milestonesAchieved.includes(milestone.name)

  return usr.milestones.includes(milestone._id)

}

const isEnrolled = (usr,pid) => {
  console.log("isEnrolled-usr")
  console.log(usr)
  const projectIds = usr.projectsJoined
  console.log(projectIds)
  return projectIds.includes(pid)
}

const enrollToProject = (pid, updateState)=>{
  const token = getToken()
  fetch("http://localhost:8000/enrollToProject/",
  {
    mode: "cors",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": token, 
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({projectId:pid})
  })
  .then((res)=>{
    if(res.ok)
    {
      return res.json()
    }
    else
    {
      throw Error("Enrollment error")
    }
  })
  .then((data)=>{
    setUser(data.user)
    updateState(data.user)
    console.log(data)
  })
  .catch((err)=>{
    console.log(err.message)
  })
}

export {isMilestoneAchieved, isEnrolled, enrollToProject}