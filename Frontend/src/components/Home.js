import {React, useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom";
import MyAppBar from './MyAppBar'
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import AddIcon from '@mui/icons-material/Add';
import { Box, Card, CardActions, CardContent, CssBaseline, List, ListItem, ListItemButton, ListItemText, ListSubheader, Stack, TextField } from '@mui/material';
import SideMenu from './SideMenu';
import {getUser, refresh} from "../utilities/LoginService"

const Home = ({logoutFun}) => {

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
      let projectFilter = data
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
      <MyAppBar title="Enrolled Projects" logoutFun={logoutFun} toggleDrawer={toggleDrawer}></MyAppBar>
      <Container maxWidth="sm">
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
                <ListSubheader>Enrolled Projects</ListSubheader>
              }>
                {projects.map((project)=>(
                  <ListItem disablePadding key={project.id}>
                    <ListItemButton onClick={()=>{
                      navigate("/projects/"+project.id)
                    }}>
                      <ListItemText primary={project.title} />
                    </ListItemButton>
                  </ListItem>
                ))}
                
              </List>
              <Stack direction="row" justifyContent="flex-end">
                <Button onClick={()=>navigate("/all-projects")} variant="contained" startIcon={<AddIcon />}>EnrolL</Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        
        
        
      </Container>
    </div>
  )
}

export default Home