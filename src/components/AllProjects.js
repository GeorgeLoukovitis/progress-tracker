import {React, useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom";
import MyAppBar from './MyAppBar'
import ProjectList from './ProjectList'
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import AddIcon from '@mui/icons-material/Add';
import {Box, Card, CardContent, CssBaseline, List, ListItem, ListItemText, ListSubheader, Stack, TextField } from '@mui/material';
import SideMenu from './SideMenu';

const AllProjects = ({logoutFun, user}) => {

  const [isDrawerOpen, setDrawer] = useState(false);
  const toggleDrawer = ()=>{
    setDrawer(!isDrawerOpen)
  }
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState("")
  const [projects, setProjects] = useState([]);

  useEffect(()=>{
    fetch("http://localhost:8000/projects")
    .then((res)=>res.json())
    .then((data)=>{
      if(data !== null)
      {
        setProjects(data)
      }
    })
  },[])

  const enrollToProject = (project)=>{
    user.projectsEnrolled.push(project.id)
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
      console.log(data)
    })
  }

  return (
    <div>
      <CssBaseline></CssBaseline>
      <MyAppBar title="Select Project" logoutFun={logoutFun} toggleDrawer={toggleDrawer}></MyAppBar>
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
                  <ListItem secondaryAction={(
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined">Details</Button>
                      <Button variant={(project.id in user.projectsEnrolled)?"contained":"outlined"} color='success' onClick={()=>{enrollToProject(project)}}>Enroll</Button>
                    </Stack>
                  )}>
                    <ListItemText primary={project.title}></ListItemText>
                  </ListItem>
                ))
              }
            </List>
            
            <Button onClick={()=>{navigate("/create-project")}} variant="contained">Back</Button>
          </CardContent>
          
        </Card>
      </Box>
    </div>
  )
}

export default AllProjects