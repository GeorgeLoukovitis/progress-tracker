import {React, useState, useEffect} from 'react'
import { useNavigate } from "react-router-dom";
import MyAppBar from './MyAppBar'
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import AddIcon from '@mui/icons-material/Add';
import {Box, Card, CardContent, CssBaseline, List, ListItem, ListItemText, ListSubheader, Stack } from '@mui/material';
import SideMenu from './SideMenu';
import { getUser, refresh } from '../utilities/LoginService';

const MyProjects = () => {

  const [isDrawerOpen, setDrawer] = useState(false);
  const toggleDrawer = ()=>{
    setDrawer(!isDrawerOpen)
  }
  const navigate = useNavigate()

  const [user, setLocalUser] = useState(getUser())
  const [projects, setProjects] = useState([]);

  useEffect(()=>{
    refresh(setLocalUser)
    fetch("http://localhost:8000/projects")
      .then((res)=>res.json())
      .then((data)=>{
        let projectFilter = data.filter((project)=>(project.admins.map(admin=>admin.id).includes(user.id)))
        console.log(projectFilter)
        if(projectFilter.length !== 0)
        {
          setProjects(projectFilter)
        }
      })
  },[])

  return (
    <div>
      <CssBaseline></CssBaseline>
      <MyAppBar title="My Projects" toggleDrawer={toggleDrawer}></MyAppBar>
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
            <List subheader={
              <ListSubheader>My Projects</ListSubheader>
            }>
              {
                projects.map((project)=>(
                  <ListItem key={project.id} secondaryAction={(
                    <Stack direction="row">
                      <Button onClick={()=>{navigate("/award-milestones/"+project.id)}}>Award Milestones</Button>
                      <Button onClick={()=>{navigate("/manage-projects/"+project.id)}}>Manage</Button>
                    </Stack>
                  )}>
                    <ListItemText primary={project.title}></ListItemText>
                  </ListItem>
                ))
              }
            </List>
            <Button onClick={()=>{navigate("/create-project")}} variant="contained" startIcon={<AddIcon />}>Create Project</Button>
          </CardContent>
          
        </Card>
      </Box>
    </div>
  )
}

export default MyProjects