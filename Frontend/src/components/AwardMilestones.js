import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, Box, Button, Card, CardActions, CardContent, Checkbox, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemText, TextField, Typography } from '@mui/material'
import DoneIcon from '@mui/icons-material/Done';
import MyAppBar from './MyAppBar';
import { getToken } from '../utilities/LoginService';
import SideMenu from './SideMenu';


const SelectMilestone = ({nextStage, setMilestoneToAward, projectId}) => {

  const [project, setProject] = useState(null)
  useEffect(()=>{
    fetch("http://localhost:8000/projects/"+projectId,
    {
      mode: "cors",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": getToken(), 
        "Access-Control-Allow-Origin": "*"
      },
    })
    .then((res)=>{
      if(res.ok)
      {
        return res.json()
      }
    })
    .then((data)=>{
      console.log("Project")
      console.log(data)
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
            <ListItem key={val._id} secondaryAction={
              <Checkbox checked={milestone==val}></Checkbox>
            }>
              <ListItemButton onClick={()=>{setMilestone(val)}}>
                <ListItemText primary={val.name} secondary={(project.requiredMilestones.includes(val._id))?"Required":"Optional"}></ListItemText>
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
  const {projectId} = useParams()
  const [users, setUsers] = useState([])
  useEffect(()=>{
    
    fetch("http://localhost:8000/enrolledUsers/"+projectId,
    {
      mode: "cors",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": getToken(), 
        "Access-Control-Allow-Origin": "*"
      },
    })
      .then((res)=>{
        if(res.ok)
        {
          return res.json()
        }
      })
      .then((data)=>{
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
            <ListItem key={val._id} secondaryAction={
              <Checkbox checked={usersToAward.includes(val._id)}></Checkbox>
            }>
              <ListItemButton onClick={()=>{
                if(usersToAward.includes(val.id))
                {
                  console.log("Remove")
                  setUsersToAward(usersToAward.filter(u=>(u!=val._id)))
                }
                else
                {
                  console.log("Add")
                  setUsersToAward([...usersToAward, val._id])
                }
              }}>
                <ListItemText primary={val.username} secondary={"#"+val._id}></ListItemText>
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

  const [isDrawerOpen, setDrawer] = useState(false);
  const toggleDrawer = ()=>{
    setDrawer(!isDrawerOpen)
  }

  const [stage, setStage] = useState(0);
  const nextStage = ()=>{
    setStage(stage+1);
  }
  const previousStage = ()=>{
    setStage(stage-1);
  }

  const awardUsers = () => {
    console.log("Award")
    console.log(milestoneToAward)
    console.log(userIds)
    fetch("http://localhost:8000/awardMilestone/",
    {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": getToken(), 
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({milestoneId:milestoneToAward._id, userIds})
    })
  }

  const [userIds, setUserIds] = useState([])
  const [milestoneToAward, setMilestoneToAward] = useState(null)
  
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
      <MyAppBar title="Award Milestone" logoutFun={()=>{}} toggleDrawer={toggleDrawer}></MyAppBar>
      <CssBaseline></CssBaseline>
      <Drawer
          anchor={"left"}
          open={isDrawerOpen}
          onClose={toggleDrawer}
        >
          <SideMenu></SideMenu>
      </Drawer>
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