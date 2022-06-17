import {Box, Button, Card, CardActions, CardContent, Checkbox, CssBaseline, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'


const SelectMilestone = ({projectId, nextStage, milestoneToAward, setMilestoneToAward}) => {

  
  const navigate = useNavigate()
  const [milestone, setMilestone] = useState(milestoneToAward)
  const [project, setProject] = useState(null)

  console.log(projectId)

  useEffect(()=>{
    fetch("http://localhost:8000/projects/"+projectId)
    .then((res)=>{
      if(res.ok)
      {
        return res.json()
      }
    })
    .then((data)=>{
      console.log(data)
      setProject(data)
    })
  },[])

  return (
    <Card sx={{width:500}}>
      <CardContent>
        <Typography component="h1" variant="h5">
          Select Milestone To Award
        </Typography>
        <List>
          {project.milestones.map((val=>(
            <ListItem key={val.name} secondaryAction={
              <Checkbox value={milestone===val.name}></Checkbox>
            }>
              <ListItemButton onClick={(val)=>{setMilestone(val.name)}}>
                <ListItemText primary={val.name} secondary={(val.required)?"Required":"Optional"}></ListItemText>
              </ListItemButton>
            </ListItem>
          )))}
        </List>
      </CardContent>
      <CardActions>
        <Button
          fullWidth
          variant="contained"
          sx={{ mb: 2 }}
          onClick={()=>{
            navigate("/my-projects")
          }}
        >
          Previous
        </Button>
        <Button
          fullWidth
          variant="contained"
          sx={{ mb: 2 }}
          onClick={()=>{
            nextStage()
          }}
        >
          Next
        </Button>
      </CardActions>
      
    </Card>
  )
}

const AwardMilestones = () => {

  const [stage, setStage] = useState(0);
  const nextStage = ()=>{
    setStage(stage+1);
  }
  const previousStage = ()=>{
    setStage(stage-1);
  }

  const [userId, setUserId] = useState(0)
  const [milestoneToAward, setMilestoneToAward] = useState("")

  const showForm = (s)=>{
    if(s === 0)
      return (<SelectMilestone nextStage={nextStage} milestoneToAward={milestoneToAward} setMilestoneToAward={setMilestoneToAward} projectId={projectId}></SelectMilestone>)
  }

  const {projectId} = useParams()

  return (
    <div>
      <CssBaseline></CssBaseline>
      <Box sx={{margin: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', 
              }}>
        {showForm(stage)}
      </Box>
    </div>
  )
}

export default AwardMilestones