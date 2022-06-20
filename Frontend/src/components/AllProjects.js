import {React, useState, useEffect} from 'react'
import {useNavigate } from "react-router-dom";
import MyAppBar from './MyAppBar'
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import {Box, Card, CardContent, CssBaseline, List, ListItem, ListItemText, ListSubheader, Stack, TextField } from '@mui/material';
import SideMenu from './SideMenu';
import { enrollToProject, isEnrolled } from '../utilities/ProjectService';
import { getToken, getUser, refresh} from '../utilities/LoginService';

const AllProjects = () => {

  const [isDrawerOpen, setDrawer] = useState(false);
  const toggleDrawer = ()=>{
    setDrawer(!isDrawerOpen)
  }
  const navigate = useNavigate()
  const [user, setLocalUser] = useState(getUser())
  const [searchTerm, setSearchTerm] = useState("")
  const [projects, setProjects] = useState([]);

  useEffect(()=>{
    refresh(setLocalUser)
    fetch("http://localhost:8000/projects",
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
      else
      {
        throw Error("Refresh Error")
      }
      
    })
    .then((data)=>{
      console.log("Projects")
      console.log(data)
      setProjects(data)
    })
    .catch((err)=>{
      console.log(err.message)
    })
  },[])

  return (
    <div>
      <CssBaseline></CssBaseline>
      <MyAppBar title="Select Project" toggleDrawer={toggleDrawer}></MyAppBar>
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
        <Card sx={{width:500}}>
          <CardContent>
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
            <List subheader={
              <ListSubheader>All projects</ListSubheader>
            }>
              {
                projects.filter((project)=>(project.title.includes(searchTerm))).map((project)=>(
                  <ListItem key={project._id} secondaryAction={(
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" onClick={()=>{navigate("/projects/"+project._id)}}>Details</Button>
                      <Button variant={(isEnrolled(user, project._id))?"contained":"outlined"} color='success' disabled={isEnrolled(user,project._id)} onClick={()=>{enrollToProject(project._id, setLocalUser)}}>{(isEnrolled(user,project._id))?"Enrolled":"Enroll"}</Button>
                    </Stack>
                  )}>
                    <ListItemText primary={project.title}></ListItemText>
                  </ListItem>
                ))
              }
            </List>
            
            <Button onClick={()=>{navigate("/")}} variant="contained">Back</Button>
          </CardContent>
          
        </Card>
      </Box>
    </div>
  )
}

export default AllProjects