import {React, useState, useEffect} from 'react'
import {useNavigate } from "react-router-dom";
import MyAppBar from './MyAppBar'
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import {Box, Card, CardContent, CssBaseline, List, ListItem, ListItemText, ListSubheader, Stack, TextField } from '@mui/material';
import SideMenu from './SideMenu';
import { enrollToProject, isEnrolled } from '../utilities/ProjectService';
import { getUser, refresh} from '../utilities/LoginService';

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
    fetch("http://localhost:8000/projects")
    .then((res)=>res.json())
    .then((data)=>{
      if(data !== null)
      {
        setProjects(data)
      }
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
                  <ListItem key={project.id} secondaryAction={(
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" onClick={()=>{navigate("/projects/"+project.id)}}>Details</Button>
                      <Button variant={(isEnrolled(user, project.id))?"contained":"outlined"} color='success' disabled={isEnrolled(user,project.id)} onClick={()=>{enrollToProject(project, setLocalUser)}}>{(isEnrolled(user,project.id))?"Enrolled":"Enroll"}</Button>
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