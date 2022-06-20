import {React, useState, useEffect} from 'react'
import { useNavigate } from "react-router-dom";
import {Box, Button, Card, CardContent, CssBaseline, Drawer, List, ListItem, ListItemText, ListSubheader, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MyAppBar from './MyAppBar'
import SideMenu from './SideMenu';
import { getToken, getUser, refresh } from '../utilities/LoginService';

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
    fetch("http://localhost:8000/myProjects",
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
      console.log("Joined Projects")
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
                  <ListItem key={project._id} secondaryAction={(
                    <Stack direction="row">
                      <Button onClick={()=>{navigate("/award-milestones/"+project._id)}}>Award Milestones</Button>
                      <Button onClick={()=>{navigate("/manage-projects/"+project._id)}}>Manage</Button>
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