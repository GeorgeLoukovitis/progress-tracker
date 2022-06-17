import {React, useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom";
import MyAppBar from './MyAppBar'
import ProjectList from './ProjectList'
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import AddIcon from '@mui/icons-material/Add';
import {Box, Card, CardContent, CssBaseline, List, ListItem, ListItemText, ListSubheader, Stack } from '@mui/material';
import SideMenu from './SideMenu';

const MyProjects = ({logoutFun, user}) => {

  const [isDrawerOpen, setDrawer] = useState(false);
  const toggleDrawer = ()=>{
    setDrawer(!isDrawerOpen)
  }
  const navigate = useNavigate()

  const [projects, setProjects] = useState([]);

  useEffect(()=>{
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
      <MyAppBar title="My Projects" logoutFun={logoutFun} toggleDrawer={toggleDrawer}></MyAppBar>
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
                  <ListItem secondaryAction={(
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