import { getUser, setUser } from "./LoginService";

const isMilestoneAchieved = (usr,projectId,milestone)=>{
  const userProjectIds = usr.projectsEnrolled.map((p)=>(p.projectId))
  if(!userProjectIds.includes(projectId))
    return false;
  const currentProject = usr.projectsEnrolled.filter((p)=>(p.projectId==projectId))[0]
  return currentProject.milestonesAchieved.includes(milestone.name)

}

const isEnrolled = (usr,id) => {
  const projectIds = usr.projectsEnrolled.map((p)=>p.projectId)
  console.log(projectIds)
  return projectIds.includes(id)
}

const enrollToProject = (id, updateState)=>{
  const user = getUser()
  user.projectsEnrolled.push({
    projectId: id,
    milestonesAchieved: []
  })
  fetch("http://localhost:8000/users/"+user.id,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  })
  .then((res)=>{
    if(res.ok)
    {
      return res.json()
    }
  })
  .then((data)=>{
    setUser(data)
    updateState(data)
    console.log(data)
  })
}

export {isMilestoneAchieved, isEnrolled, enrollToProject}