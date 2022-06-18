import {Avatar, Box, Button, Card, CardActions, CardContent, Checkbox, CssBaseline, List, ListItem, ListItemButton, ListItemText, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DoneIcon from '@mui/icons-material/Done';


const SelectMilestone = ({nextStage, setMilestoneToAward, projectId}) => {

  const [project, setProject] = useState(null)
  useEffect(()=>{
    fetch("http://localhost:8000/projects/"+projectId)
      .then((res)=>{
        if(res.ok)
        {
          return res.json()
        }
      })
      .then((data)=>{
        setProject(data)
      })
  },[])
  
  const navigate = useNavigate()
  const [milestone, setMilestone] = useState("")

  return (
    <Card sx={{width:500}}>
      <CardContent>
        <Typography component="h1" variant="h5">
          Select Milestone To Award
        </Typography>
        {(project)?
        <List>
          {project.milestones.map((val=>(
            <ListItem key={val.name} secondaryAction={
              <Checkbox checked={milestone==val.name}></Checkbox>
            }>
              <ListItemButton onClick={()=>{setMilestone(val.name)}}>
                <ListItemText primary={val.name} secondary={(val.required)?"Required":"Optional"}></ListItemText>
              </ListItemButton>
            </ListItem>
          )))}
        </List>:
        <div></div>}
      </CardContent>
      <CardActions>
        <Button
          fullWidth
          variant="contained"
          sx={{ mb: 2 }}
          onClick={()=>{
            navigate("/manage-projects")
          }}
        >
          Previous
        </Button>
        <Button
          fullWidth
          variant="contained"
          sx={{ mb: 2 }}
          onClick={()=>{
            setMilestoneToAward(milestone)
            nextStage()
          }}
        >
          Next
        </Button>
      </CardActions>
      
    </Card>
  )
}

const SelectUser = ({previousStage, nextStage, setUserIds})=> {
  const [users, setUsers] = useState([])
  useEffect(()=>{
    fetch("http://localhost:8000/users/")
      .then((res)=>{
        if(res.ok)
        {
          return res.json()
        }
      })
      .then((data)=>{
        // console.log(data)
        setUsers(data)
      })
  },[])
  
  const [usersToAward, setUsersToAward] = useState([]) 
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState("")

  return (
    <Card sx={{width:500}}>
      <CardContent>
        <Typography component="h1" variant="h5">
          Select Users To Award
        </Typography>
        <TextField
          margin="normal"
          fullWidth
          id="Search Bar"
          label="Search"
          name="search-bar"
          value = {searchTerm}
          onChange={(e)=>{setSearchTerm(e.target.value)}}
          autoFocus
        />
        <List>
          {users.filter((u)=>(u.username.includes(searchTerm))).map((val=>(
            <ListItem key={val.id} secondaryAction={
              <Checkbox checked={usersToAward.includes(val.id)}></Checkbox>
            }>
              <ListItemButton onClick={()=>{
                if(usersToAward.includes(val.id))
                {
                  console.log("Remove")
                  setUsersToAward(usersToAward.filter(u=>(u!=val.id)))
                }
                else
                {
                  console.log("Add")
                  setUsersToAward([...usersToAward, val.id])
                }
              }}>
                <ListItemText primary={val.username} secondary={"#"+val.id}></ListItemText>
              </ListItemButton>
            </ListItem>
          )))}
        </List>
      </CardContent>
      <CardActions>
        <Button
          fullWidth
          variant="contained"
          sx={{ mb: 2 }}
          onClick={()=>{
            previousStage()
          }}
        >
          Previous
        </Button>
        <Button
          fullWidth
          variant="contained"
          sx={{ mb: 2 }}
          onClick={()=>{
            setUserIds(usersToAward)
            nextStage()
          }}
        >
          Next
        </Button>
      </CardActions>
      
    </Card>
  )
}

const SuccessScreen = () => {

  const navigate = useNavigate()
  
  return (
    <Card sx={{width:500}}>
      <CardContent>
        <Typography component="h1" variant="h5">
          Milestoned Awarded
        </Typography>
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <DoneIcon></DoneIcon>   
        </Avatar>
      </CardContent>
      <CardActions>
        <Button
          fullWidth
          variant="contained"
          sx={{ mb: 2 }}
          onClick={()=>{
            navigate("/")
          }}
        >
          Done
        </Button>
      </CardActions>
      
    </Card>
  )
}

const AwardMilestones = () => {

  const {projectId} = useParams()
  const [stage, setStage] = useState(0);
  const nextStage = ()=>{
    setStage(stage+1);
  }
  const previousStage = ()=>{
    setStage(stage-1);
  }

  const awardUsers = () => {
    for(const userId of userIds){
      fetch("http://localhost:8000/users/"+userId)
        .then((res)=>{
          if(res.ok)
          {
            return res.json()
          }
        })
        .then((data)=>{
          var i = 0;
          while(i< data.projectsEnrolled.length)
          {
            if(data.projectsEnrolled[i].id == projectId)
            {
              data.projectsEnrolled[i].milestonesAchieved.push(milestoneToAward)
              break
            }
          }
          fetch("http://localhost:8000/users/"+userId,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
          })
          .then((res1)=>{
            if(res1.ok)
            {
              return res1.json()
            }
          })
          .then((data1)=>{
            console.log(data1)
          })
        })
    }
  }

  const [userIds, setUserIds] = useState([])
  const [milestoneToAward, setMilestoneToAward] = useState("")
  
  const showForm = (s,previousStage, nextStage, setMilestoneToAward)=>{
    if(s === 0)
      return (<SelectMilestone nextStage={nextStage} setMilestoneToAward={setMilestoneToAward} projectId={projectId}></SelectMilestone>)
    else if(s === 1)
      return (<SelectUser previousStage={previousStage} nextStage={nextStage} setUserIds={setUserIds}></SelectUser>)
    else if(s === 2)
    {
      awardUsers()
      return (<SuccessScreen></SuccessScreen>)
    }
  }

  return (
    <div>
      <CssBaseline></CssBaseline>
      <Box sx={{margin: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', 
              }}>
        {showForm(stage, previousStage, nextStage, setMilestoneToAward)}
      </Box>
    </div>
  )
}

export default AwardMilestones