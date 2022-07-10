import {Box, Button, Card, CardContent, Checkbox, CssBaseline, Divider, Drawer, List, ListItem, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material'
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import {React, useState} from 'react'
import {useParams} from "react-router-dom"
import MyAppBar from './MyAppBar';
import SideMenu from './SideMenu';
import { useEffect } from 'react';
import { getToken, getUser, refresh } from '../utilities/LoginService';
import { isEnrolled, isMilestoneAchieved, enrollToProject } from '../utilities/ProjectService';

const ProjectScreen = () => {

  const {projectId} = useParams()
  const [user, setLocalUser] = useState(getUser())
  const [project, setProject] = useState(null)

  console.log(user);

  useEffect(()=>{
    refresh(setLocalUser)
    fetch("http://localhost:8000/projects/"+projectId,{
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
      else{
        throw Error()
      }
    })
    .then((data)=>{
      console.log("Project")
      console.log(data)
      setProject(data)
    })
  }, [projectId,])

  const [isDrawerOpen, setDrawer] = useState(false);
  const toggleDrawer = ()=>{
    setDrawer(!isDrawerOpen)
  }

  return (
    <div>
      <CssBaseline></CssBaseline>
      <MyAppBar toggleDrawer={toggleDrawer}></MyAppBar>
      <Drawer
        anchor={"left"}
        open={isDrawerOpen}
        onClose={toggleDrawer}
      >
        <SideMenu></SideMenu>
      </Drawer>
      <Box sx={{margin: 4}}>
        <Card>
          {
            (project)?
            <Stack padding={4}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant='h3'>{project.title}</Typography>
                <Card>
                  <CardContent>
                    <Typography variant='h5'>Details:</Typography>
                    <Divider></Divider>
                    <Stack direction="row" spacing={1}>
                      <Typography>creator:</Typography>
                      <Typography>{project.creator.username}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Typography>date:</Typography>
                      <Typography>{Date(project.date)}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
              <List>
                {project.milestones.map((milestone)=>(
                  <ListItem divider={true} key={milestone._id} secondaryAction={
                    <Checkbox
                      edge="end"
                      checked={isMilestoneAchieved(user,milestone)}
                    />
                  }>
                    <ListItemIcon>
                      <AssignmentLateIcon color='yellow'></AssignmentLateIcon>
                    </ListItemIcon>
                    <ListItemText primary = {milestone.name}></ListItemText>
                  </ListItem>
                ))}
              </List>
              <Stack direction="row" justifyContent="end">
              <Button variant={(isEnrolled(user,projectId))?"contained":"outlined"} disabled={isEnrolled(user,projectId)} color='success' onClick={()=>{enrollToProject(projectId,setLocalUser)}}>{(isEnrolled(user,projectId))?"Enrolled":"Enroll"}</Button>
              </Stack>
            </Stack>:
            <div></div>
          }
        </Card>
      </Box>
    </div>
  )
}

export default ProjectScreen