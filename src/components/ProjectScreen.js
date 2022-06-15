

import {Box, Button, Card, CardContent, Checkbox, Container, CssBaseline, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Typography } from '@mui/material'
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import {React, useState} from 'react'
import {useParams} from "react-router-dom"
import MyAppBar from './MyAppBar';
import SideMenu from './SideMenu';
import { useEffect } from 'react';

const ProjectScreen = ({logoutFun, user}) => {

  const {projectId} = useParams()

  // const project = {
  //   name: "Kill Him",
  //   creator: "MegaGeorge",
  //   date: "Tuesday, 21/1/2000",
  //   milestones:[
  //     {title:"Wake up", completed:true},
  //     {title: "Get your weapon", completed:false}, 
  //     {title: "Kill", completed:true}
  //   ]

  // }
  
  const [project, setProject] = useState({
    title: "ProjectTitle",
    creator: "-",
    date: "-", 
    milestones: []
  })

  useEffect(()=>{
    fetch("http://localhost:8000/projects/"+projectId)
      .then((res)=>{
        if(res.ok)
        {
          return res.json()
        }
        else
        {
          throw Error()
        }
      })
      .then((data)=>{
        console.log(data)
        setProject(data)
        
      })
      .catch((err)=>{
        console.log(err)
      })
  }, [])

  const [isDrawerOpen, setDrawer] = useState(false);
  const toggleDrawer = ()=>{
    setDrawer(!isDrawerOpen)
  }

  return (
    <div>
      <CssBaseline></CssBaseline>
      <MyAppBar logoutFun={logoutFun} toggleDrawer={toggleDrawer}></MyAppBar>
      <Drawer
        anchor={"left"}
        open={isDrawerOpen}
        onClose={toggleDrawer}
      >
        <SideMenu></SideMenu>
      </Drawer>
      <Box sx={{margin: 4}}>
        <Card>
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
                    checked={milestone.completed}
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
                <Button>Request Enrollment</Button>
            </Stack>
          </Stack>
        </Card>
      </Box>
    </div>
  )
}

export default ProjectScreen