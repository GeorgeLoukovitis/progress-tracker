import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, Box, Button, Card, CardActions, CardContent, Checkbox, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemText, TextField, Typography } from '@mui/material'
import DoneIcon from '@mui/icons-material/Done';
import MyAppBar from './MyAppBar';
import { getToken } from '../utilities/LoginService';
import {isMilestoneAchieved} from "../utilities/ProjectService"
import SideMenu from './SideMenu';


const SelectMilestone = ({previousStage, nextStage, setMilestoneToAward, projectId, userToAward}) => {

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
      // console.log(data)
      setProject(data)
    })
  },[projectId,])
  
  const [milestone, setMilestone] = useState("")

  return (
    <Card sx={{width:500}}>
      <CardContent>
        <Typography component="h1" variant="h5">
          Select Milestone To Award
        </Typography>
        {(project)?
        <List>
          {project.milestones.filter((m)=>(!isMilestoneAchieved(userToAward, m))).map((val=>(
            <ListItem key={val._id} secondaryAction={
              <Checkbox checked={milestone===val}></Checkbox>
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
            previousStage()
          }}
        >
          Previous
        </Button>
        <Button
          fullWidth
          disabled = {!milestone}
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

const SelectUser = ({previousStage, nextStage, setUserToAward})=> {
  const {projectId} = useParams()
  const [users, setUsers] = useState([])
  const [errorMessage, setErrorMessage] = useState(null);

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
          return res.json()
        else
          throw Error(res.statusText)
      })
      .then((data)=>{
        setUsers(data)
      })
      .catch((err)=>{
        console.log(err.message)
        setErrorMessage(err.message)
      })
  },[projectId,])
  
  const navigate = useNavigate()
  const [selectedUser, setSelectedUser] = useState({_id:0}) 
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
        {
          (errorMessage)?
          errorMessage:
          <List>
            {users.filter((u)=>(u.username.includes(searchTerm))).map((val=>(
              <ListItem key={val._id} secondaryAction={
                <Checkbox checked={selectedUser._id === val._id}></Checkbox>
              }>
                <ListItemButton onClick={()=>{
                  if(selectedUser._id === val._id)
                  {
                    console.log("Remove")
                    setSelectedUser(null)
                  }
                  else
                  {
                    console.log("Add")
                    setSelectedUser(val)
                  }
                }}>
                  <ListItemText primary={val.username} secondary={"#"+val._id}></ListItemText>
                </ListItemButton>
              </ListItem>
            )))}
          </List>
        }
        
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
          disabled = {selectedUser._id == 0}
          fullWidth
          variant="contained"
          sx={{ mb: 2 }}
          onClick={()=>{
            setUserToAward(selectedUser)
            nextStage()
          }}
        >
          Next
        </Button>
      </CardActions>
      
    </Card>
  )
}

const SelectSupport = ({previousStage, nextStage, setAwardSupport, userToAward}) => {

  const {projectId} = useParams();
  const [milestones, setMilestones] = useState([])

  useEffect(()=>{
    fetch("http://localhost:8000/projects/"+projectId,{
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
      else{
        throw Error()
      }
    })
    .then((data)=>{
      console.log("Project")
      console.log(data)
      setMilestones(data.milestones)
    })
  }, [projectId,])

  const [support, setSupport] = useState([]) 
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <Card sx={{width:500}}>
      <CardContent>
        <Typography component="h1" variant="h5">
          Why is the User Awarded
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
          {milestones.filter((m)=>(m.name.includes(searchTerm) && isMilestoneAchieved(userToAward, m))).map((val=>(
            <ListItem key={val._id} secondaryAction={
              <Checkbox checked={support.includes(val._id)}></Checkbox>
            }>
              <ListItemButton onClick={()=>{
                if(support.includes(val._id))
                {
                  console.log("Remove")
                  setSupport(support.filter(m=>(m!==val._id)))
                }
                else
                {
                  console.log("Add")
                  setSupport([...support, val._id])
                }
              }}>
                <ListItemText primary={val.name} secondary={"#"+val._id}></ListItemText>
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
            setAwardSupport(support)
            nextStage()
          }}
        >
          Next
        </Button>
      </CardActions>
      
    </Card>
  )
}

const SetData = ({setAwardData, previousStage, nextStage}) => {

  const [data, setData] = useState("")

  return (
    <Card sx={{width:500}}>
      <CardContent>
        <Typography component="h1" variant="h5">
          Enter achievement comments
        </Typography>
        <TextField
          margin="normal"
          fullWidth
          id="Comments"
          label="Comments (optional)"
          name="comments"
          autoComplete=""
          value = {data}
          onChange={(e)=>{setData(e.target.value)}}
          autoFocus
        />
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
            setAwardData(data)
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

  const awardUser = () => {
    console.log("Award")
    console.log(milestoneToAward)
    console.log(userToAward)
    fetch("http://localhost:8000/awardMilestone/",
    {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": getToken(), 
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({milestoneId:milestoneToAward._id, userId: userToAward._id, data: awardData, support: awardSupport})
    })
  }

  const [userToAward, setUserToAward] = useState(null)
  const [milestoneToAward, setMilestoneToAward] = useState(null)
  const [awardSupport, setAwardSupport] = useState([])
  const [awardData, setAwardData] = useState("")
  
  const showForm = (s,previousStage, nextStage, setMilestoneToAward)=>{
    if(s === 0)
      return (<SelectUser nextStage={nextStage} setUserToAward={setUserToAward}></SelectUser>)
    else if(s === 1)
      return (<SelectMilestone previousStage={previousStage} nextStage={nextStage} setMilestoneToAward={setMilestoneToAward} projectId={projectId} userToAward={userToAward}></SelectMilestone>)
    else if(s ===2)
      return (<SelectSupport previousStage={previousStage} nextStage={nextStage} setAwardSupport={setAwardSupport} userToAward={userToAward}></SelectSupport>)
    else if(s ===3)
      return (<SetData previousStage={previousStage} nextStage={nextStage} setAwardData={setAwardData}></SetData>)
    else if(s === 4)
    {
      awardUser()
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