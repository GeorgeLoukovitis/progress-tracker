import {React, useState, useEffect} from 'react'
import { useNavigate } from "react-router-dom";
import { Box, Button, Card, CardActions, CardContent, Container, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemText, ListSubheader, Stack, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MyAppBar from './MyAppBar'
import SideMenu from './SideMenu';
import {getToken, getUser, refresh} from "../utilities/LoginService"

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
    fetch("http://localhost:8000/joinedProjects",
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
                  <ListItem disablePadding key={project._id}>
                    <ListItemButton onClick={()=>{
                      navigate("/projects/"+project._id)
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