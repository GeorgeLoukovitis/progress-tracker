import {React, useState, useEffect} from 'react'
import { useNavigate } from "react-router-dom";
import {Avatar, Box, Button, Card, CardContent, CssBaseline, Drawer, List, ListItem, ListItemText, ListSubheader, Stack, Typography } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import MyAppBar from './MyAppBar'
import SideMenu from './SideMenu';
import { getToken, getUser, refresh } from '../utilities/LoginService';

const MyAchievements = () => {

  const [isDrawerOpen, setDrawer] = useState(false);
  const toggleDrawer = ()=>{
    setDrawer(!isDrawerOpen)
  }
  const navigate = useNavigate()

  const [user, setLocalUser] = useState(getUser())
  const [achievements, setAchievements] = useState([]);
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(()=>{
    refresh(setLocalUser)
    fetch("http://localhost:8000/achievements",
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
        throw Error(res.statusText)
      }
      
    })
    .then((data)=>{
      console.log("Achievements")
      console.log(data)
      setAchievements(data)
    })
    .catch((err)=>{
      console.log(err.message)
      setErrorMessage(err.message)
    })
  },[])

  return (
    <div>
      <CssBaseline></CssBaseline>
      <MyAppBar title="My Achievements" toggleDrawer={toggleDrawer}></MyAppBar>
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
          {
            (errorMessage)?
            <CardContent sx={{display: 'flex', flexDirection: 'column',alignItems: 'center'}}>
              <Avatar sx={{ m: 1, bgcolor: 'red' }}>
                <ErrorIcon></ErrorIcon>   
              </Avatar>
              <Typography variant="subtitle1">{errorMessage}</Typography>
            </CardContent>:
            <CardContent>
              <List subheader={
                <ListSubheader>My Achievements</ListSubheader>
              }>
                {
                  achievements.map((achievement)=>(
                    <ListItem key={achievement._id} secondaryAction={(
                      <Stack direction="row">
                        <Button onClick={()=>{
                          if(achievement.cardanoTx)
                          {
                            window.open("https://preprod.cexplorer.io/tx/"+achievement.cardanoTx+"/metadata#data", '_blank');
                          }
                        }}>Show In Explorer</Button>
                      </Stack>
                    )}>
                      <ListItemText primary={achievement.milestoneName} secondary={achievement.data}></ListItemText>
                    </ListItem>
                  ))
                }
              </List>
            </CardContent>
          }
          
        </Card>
      </Box>
    </div>
  )
}

export default MyAchievements