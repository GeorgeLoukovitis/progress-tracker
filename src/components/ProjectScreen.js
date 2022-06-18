import {Box, Button, Card, CardContent, Checkbox, Container, CssBaseline, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Typography } from '@mui/material'
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import {React, useState} from 'react'
import {useParams} from "react-router-dom"
import MyAppBar from './MyAppBar';
import SideMenu from './SideMenu';
import { useEffect } from 'react';
import { getUser, refresh } from '../utilities/LoginService';
import { isEnrolled, isMilestoneAchieved, enrollToProject } from '../utilities/ProjectService';

const ProjectScreen = () => {

  const {projectId} = useParams()
  const [user, setLocalUser] = useState(getUser())
  const [project, setProject] = useState(null)

  useEffect(()=>{
    refresh(setLocalUser)
    fetch("http://localhost:8000/projects/")
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
        setProject(data.filter((p)=>(p.id == projectId))[0])
      })
  }, [])

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
                  <ListItem divider={true} key={milestone.name} secondaryAction={
                    <Checkbox
                      edge="end"
                      checked={isMilestoneAchieved(user,projectId,milestone)}
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