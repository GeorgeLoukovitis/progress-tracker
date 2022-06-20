import { getToken, getUser, setUser } from "./LoginService";

const isMilestoneAchieved = (usr,milestone)=>{
  return usr.milestones.includes(milestone._id)

}

const isEnrolled = (usr,pid) => {
  const projectIds = usr.projectsJoined
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