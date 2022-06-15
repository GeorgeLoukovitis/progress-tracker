import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router';
import {Box, Button, Card, CardActions, CardContent, Checkbox, CssBaseline, Divider, IconButton, List, ListItem, ListItemText,ListSubheader, Stack, TextField, Typography} from "@mui/material"
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

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
    fetch("http://localhost:8000/users")
      .then((res)=>res.json())
      .then((data)=>{
        data = data.filter(s=>s.id!==creator.id)
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
            <ListItem key={val.id} secondaryAction={
              <IconButton onClick={()=>{
                setAdmins([...admins, val])
                setSuggestions(suggestions.filter((suggestion)=>(suggestion.id !== val.id)))
              }}>
                <AddIcon color='success'></AddIcon>
              </IconButton>
            }>
              <ListItemText primary={val.username} secondary={"#"+val.id}></ListItemText>
            </ListItem>
          )))}
        </List>
        <Divider></Divider>
        <List>
          {admins.map((val=>(
            <ListItem key={val.id} secondaryAction={
              <IconButton onClick={()=>{
                setSuggestions([...suggestions, val])
                setAdmins(admins.filter((admin)=>(admin.id !== val.id)))
              }}>
                <RemoveIcon sx={{color:"red"}}></RemoveIcon>
              </IconButton>
            }>
              <ListItemText primary={val.username} secondary={"#"+val.id}></ListItemText>
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


const MilestoneForm = ({otherMilestones, setToggle, setMilestones}) => {

  const [milestoneName, setMilestoneName] = useState("")
  const [milestoneRequired, setMilestoneRequired] = useState(false)
  const [milestonePrerequisites, setMilestonePrerequisites] = useState([])

  const saveMilestone = ()=>{
    const milestone = {
      name: milestoneName,
      required: milestoneRequired,
      prerequisites: milestonePrerequisites
    }
    if(otherMilestones.map(m=>m.name).includes(milestone.name))
    {
      console.log("Already Exists")
      return false
    }
    setMilestones([...otherMilestones, milestone])
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
            <ListItem key={val.id} secondaryAction={
              <Checkbox value={milestonePrerequisites.includes(val.name)} onChange={()=>{
                  if(milestonePrerequisites.includes(val.id))
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
              <ListItemText primary={val.name}></ListItemText>
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



const SetMilestones = ({setProjectMilestones, nextStage, previousStage}) => {
  const [milestones, setMilestones] = useState([])
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
              <ListItemText primary={val.name} secondary={(val.required)?"Required":"Optional"}></ListItemText>
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
            nextStage()
          }}
        >
          Next
        </Button>
      </CardActions>
      
    </Card>:
    <MilestoneForm otherMilestones={milestones} setToggle={setToggle} setMilestones={setMilestones}></MilestoneForm>
  )
}

const Preview = ({title, admins, milestones, previousStage, creator}) => {

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
              <ListItem key={val.id} divider="true">
                <ListItemText primary={val.username} secondary={"#"+val.id}></ListItemText>
              </ListItem>
            )))}
          </List>
          <List subheader={
            <ListSubheader component="div">
              Milestones
            </ListSubheader>
          }>
            {milestones.map((val=>(
              <ListItem key={val.name} divider="true">
                <ListItemText primary={val.name} secondary={(val.required)?"Required":"Optional"}></ListItemText>
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
            const project = {title, admins, milestones, creator, date: Date.now()}
            console.log(project)
            fetch("http://localhost:8000/projects",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
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
              console.log("Response")
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





const NewProjectForm = ({user}) => {
  const [stage, setStage] = useState(0);
  const nextStage = ()=>{
    setStage(stage+1);
  }
  const previousStage = ()=>{
    setStage(stage-1);
  }

  const showForm = (s)=>{
    if(s === 0)
      return (<SetTitle setProjectTitle = {setProjectTitle} nextStage = {nextStage}></SetTitle>)
    else if (s === 1)
      return (<SetAdmins setProjectAdmins={setProjectAdmins} nextStage = {nextStage} previousStage = {previousStage} creator = {user}></SetAdmins>)
    else if (s === 2)
      return (<SetMilestones setProjectMilestones={setProjectMilestones} nextStage = {nextStage} previousStage = {previousStage}></SetMilestones>)
    else if (s === 3)
      return (<Preview title={projectTitle} admins = {projectAdmins} milestones = {projectMilestones} previousStage = {previousStage} creator={user}></Preview>)
  }

  const [projectTitle, setProjectTitle] = useState("")
  const [projectAdmins, setProjectAdmins] = useState([])
  const [projectMilestones, setProjectMilestones] = useState([])

  return (
    <div>
      <CssBaseline></CssBaseline>
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