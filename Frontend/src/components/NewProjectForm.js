import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router';
import {Box, Button, Card, CardActions, CardContent, Checkbox, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemText,ListSubheader, Stack, TextField, Typography} from "@mui/material"
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { getToken, getUser, refresh } from '../utilities/LoginService';
import MyAppBar from './MyAppBar';
import SideMenu from './SideMenu';

const SetTitle = ({setProjectTitle, nextStage}) => {

  const [title, setTitle] = useState("")

  return (
    <Card sx={{width:500}}>
      <CardContent>
        <Typography component="h1" variant="h5">
          Create a new Project
        </Typography>
        <TextField
          margin="normal"
          fullWidth
          id="Project Title"
          label="Project Title"
          name="title"
          autoComplete="Title 1"
          value = {title}
          onChange={(e)=>{setTitle(e.target.value)}}
          autoFocus
        />
      </CardContent>
      <CardActions>
        <Button
          fullWidth
          variant="contained"
          sx={{ mb: 2 }}
          onClick={()=>{
            setProjectTitle(title)
            nextStage()
          }}
        >
          Next
        </Button>
      </CardActions>
      
    </Card>
  )
}

const SetAdmins = ({setProjectAdmins, nextStage, previousStage, creator}) => {

  const [searchTerm, setSearchTerm] = useState("")
  const [admins, setAdmins] = useState([creator,])
  const [suggestions, setSuggestions] = useState([])

  useEffect(()=>{
    fetch("http://localhost:8000/users",
    {
      mode: "cors",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": getToken(), 
        "Access-Control-Allow-Origin": "*"
      },
    })
    .then((res)=>res.json())
    .then((data)=>{
      console.log("Users")
      console.log(data)
      data = data.filter(s=>s._id!==creator._id)
      setSuggestions(data)
    })
  }, [creator,])

  return (
    <Card sx={{width:500}}>
      <CardContent>
        <Typography component="h1" variant="h5">
          Select project administrators
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
          {suggestions.filter((val)=>(val.username.includes(searchTerm))).map((val=>(
            <ListItem key={val._id} secondaryAction={
              <IconButton onClick={()=>{
                setAdmins([...admins, val])
                setSuggestions(suggestions.filter((suggestion)=>(suggestion._id !== val._id)))
              }}>
                <AddIcon color='success'></AddIcon>
              </IconButton>
            }>
              <ListItemText primary={val.username} secondary={"#"+val._id}></ListItemText>
            </ListItem>
          )))}
        </List>
        <Divider></Divider>
        <List>
          {admins.map((val=>(
            <ListItem key={val._id} secondaryAction={
              <IconButton onClick={()=>{
                setSuggestions([...suggestions, val])
                setAdmins(admins.filter((admin)=>(admin._id !== val._id)))
              }}>
                <RemoveIcon sx={{color:"red"}}></RemoveIcon>
              </IconButton>
            }>
              <ListItemText primary={val.username} secondary={"#"+val._id}></ListItemText>
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
          Back
        </Button>
        <Button
          fullWidth
          variant="contained"
          sx={{ mb: 2 }}
          onClick={()=>{
            setProjectAdmins(admins)
            nextStage()
          }}
        >
          Next
        </Button>
      </CardActions>
      
    </Card>
  )
}


const MilestoneForm = ({otherMilestones, setToggle, setMilestones, otherRequiredMilestones, setRequiredMilestones}) => {

  const [milestoneName, setMilestoneName] = useState("")
  const [milestoneRequired, setMilestoneRequired] = useState(false)
  const [milestonePrerequisites, setMilestonePrerequisites] = useState([])

  const saveMilestone = ()=>{

    fetch("http://localhost:8000/milestones/",{
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "x-access-token": getToken(),
      },
      body: JSON.stringify({
        name: milestoneName,
        prerequisites: milestonePrerequisites.map((m)=>m._id)
      })
    })
    .then((res)=>{
      if(res.ok)
        return res.json()
      else
        throw Error("Refresh Error")
    })
    .then((data)=>{
      console.log("Milestone")
      console.log(data)
      setMilestones([...otherMilestones, data])
      if(milestoneRequired)
      {
        setRequiredMilestones([...otherRequiredMilestones, data])
      }
    })
    .catch((err)=>{
      console.log(err.message)
    })
    return true
  }

  return (
    <Card sx={{width:500}}>
      <CardContent>
        <Typography component="h1" variant="h5">
          New Milestone
        </Typography>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Milestone Name"
          name="name"
          autoFocus
          value={milestoneName}
          onChange={(e)=>{setMilestoneName(e.target.value)}}
        />
        <Button
          fullWidth
          variant={(milestoneRequired)?"contained":"outlined"}
          onClick={()=>{
            setMilestoneRequired(!milestoneRequired)
          }}
        >
          Required
        </Button>
        <List subheader={
          <ListSubheader component="div">
            Prerequisites
          </ListSubheader>
        }>
          {otherMilestones.map((val=>(
            <ListItem key={val._id} secondaryAction={
              <Checkbox value={milestonePrerequisites.includes(val.name)} onChange={()=>{
                  if(milestonePrerequisites.includes(val._id))
                  {
                    setMilestonePrerequisites(milestonePrerequisites.filter((prerequisite)=>(prerequisite !== val.name)))
                  }
                  else
                  {
                    setMilestonePrerequisites([...milestonePrerequisites, val.name])
                  }
                }
              }></Checkbox>
            }>
              <ListItemText primary={val.name} secondary={(otherRequiredMilestones.includes(val))?"Required":"Optional"} ></ListItemText>
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
            setToggle(false)
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          sx={{ mb: 2 }}
          onClick={()=>{
            if(saveMilestone())
              setToggle(false)
          }}
        >
          Save
        </Button>
      </CardActions>
      
    </Card>
  )
}



const SetMilestones = ({setProjectMilestones, setProjectRequiredMilestones, nextStage, previousStage}) => {
  const [milestones, setMilestones] = useState([])
  const [requiredMilestones, setRequiredMilestone] = useState([])
  const [toggle, setToggle] = useState(false)
  return (
    (!toggle)?
    <Card sx={{width:500}}>
      <CardContent>
        <Typography component="h1" variant="h5">
          Create Milestones for the Project
        </Typography>
        <Button fullWidth variant='outlined' sx={{mt:2}} onClick={()=>setToggle(true)}> Add Milestone</Button>
        <List>
          {milestones.map((val=>(
            <ListItem key={val.name} secondaryAction={
              <IconButton onClick={()=>{
                setMilestones(milestones.filter((milestone)=>(milestone.name !== val.name)))
              }}>
                <RemoveIcon sx={{color:"red"}}></RemoveIcon>
              </IconButton>
            }>
              <ListItemText primary={val.name + " #" + val._id} secondary={(requiredMilestones.includes(val))?"Required":"Optional"}></ListItemText>
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
            setProjectMilestones(milestones)
            setProjectRequiredMilestones(requiredMilestones)
            nextStage()
          }}
        >
          Next
        </Button>
      </CardActions>
      
    </Card>:
    <MilestoneForm otherMilestones={milestones} setToggle={setToggle} setMilestones={setMilestones} otherRequiredMilestones={requiredMilestones} setRequiredMilestones={setRequiredMilestone}></MilestoneForm>
  )
}

const Preview = ({title, admins, milestones, requiredMilestones, previousStage, creator}) => {

  const navigate = useNavigate();

  return (
    <Card sx={{width:500}}>
      <CardContent>
        <Typography component="h1" variant="h5">
          {title}
        </Typography>
        <Stack direction="row" justifyContent="space-evenly">
          <List subheader={
            <ListSubheader component="div">
              Admins
            </ListSubheader>
          }>
            {admins.map((val=>(
              <ListItem key={val._id} divider="true">
                <ListItemText primary={val.username} secondary={"#"+val._id}></ListItemText>
              </ListItem>
            )))}
          </List>
          <List subheader={
            <ListSubheader component="div">
              Milestones
            </ListSubheader>
          }>
            {milestones.map((val=>(
              <ListItem key={val._id} divider="true">
                <ListItemText primary={val.name} secondary={(requiredMilestones.includes(val))?"Required":"Optional"}></ListItemText>
              </ListItem>
            )))}
          </List>
        </Stack>
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
            const project = {
              title, 
              admins: admins.map((a)=>(a._id)), 
              milestones : milestones.map((m)=>(m._id)),
              requiredMilestones: requiredMilestones.map((m)=>(m._id))
            }
            console.log(project)
            fetch("http://localhost:8000/projects",
            {
              mode: "cors",
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-access-token": getToken(), 
                "Access-Control-Allow-Origin": "*"
              },
              body: JSON.stringify(project)
            })
            .then((res)=>{
              if(res.ok)
              {
                return res.json()
              }
            })
            .then((data)=>{
              console.log("Created Project")
              console.log(data)
              navigate("/")
            })

          }}
        >
          Next
        </Button>
      </CardActions>
      
    </Card>
  )
}





const NewProjectForm = () => {

  const [isDrawerOpen, setDrawer] = useState(false);
  const toggleDrawer = ()=>{
    setDrawer(!isDrawerOpen)
  }

  const [user, setLocalUser] = useState(getUser())
  const [stage, setStage] = useState(0);
  const nextStage = ()=>{
    setStage(stage+1);
  }
  const previousStage = ()=>{
    setStage(stage-1);
  }

  useEffect(()=>{
    refresh(setLocalUser)
  },[])

  const showForm = (s)=>{
    if(s === 0)
      return (<SetTitle setProjectTitle = {setProjectTitle} nextStage = {nextStage}></SetTitle>)
    else if (s === 1)
      return (<SetAdmins setProjectAdmins={setProjectAdmins} nextStage = {nextStage} previousStage = {previousStage} creator = {user}></SetAdmins>)
    else if (s === 2)
      return (<SetMilestones setProjectMilestones={setProjectMilestones} setProjectRequiredMilestones={setProjectRequiredMilestones} nextStage = {nextStage} previousStage = {previousStage}></SetMilestones>)
    else if (s === 3)
      return (<Preview title={projectTitle} admins = {projectAdmins} milestones = {projectMilestones} requiredMilestones = {projectRequiredMilestones} previousStage = {previousStage} creator={user}></Preview>)
  }

  const [projectTitle, setProjectTitle] = useState("")
  const [projectAdmins, setProjectAdmins] = useState([])
  const [projectMilestones, setProjectMilestones] = useState([])
  const [projectRequiredMilestones, setProjectRequiredMilestones] = useState([])

  return (
    <div>
      <CssBaseline></CssBaseline>
      <MyAppBar title="New Project" logoutFun={()=>{}} toggleDrawer={toggleDrawer}></MyAppBar>
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
        {showForm(stage)}
      </Box>
    </div>
  )
}

export default NewProjectForm