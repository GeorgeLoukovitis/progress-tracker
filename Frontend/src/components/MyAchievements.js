import {React, useState, useEffect} from 'react'
import { useNavigate } from "react-router-dom";
import {Box, Button, Card, CardContent, CssBaseline, Drawer, List, ListItem, ListItemText, ListSubheader, Stack } from '@mui/material';
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
        throw Error("Refresh Error")
      }
      
    })
    .then((data)=>{
      console.log("Achievements")
      console.log(data)
      setAchievements(data)
    })
    .catch((err)=>{
      console.log(err.message)
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
          
        </Card>
      </Box>
    </div>
  )
}

export default MyAchievements