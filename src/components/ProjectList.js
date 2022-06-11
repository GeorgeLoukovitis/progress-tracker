import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ProjectItem from './ProjectItem';

const ProjectList = ({user}) => {

  const [projects, setProjects] = useState([]);

  useEffect(()=>{
    fetch("http://localhost:8000/projects")
    .then((res)=>res.json())
    .then((data)=>{
      let projectFilter = data.filter((project)=>(project.ownerId === user.id))
      console.log(projectFilter)
      if(projectFilter.length !== 0)
      {
        setProjects(projectFilter)
      }
    })
  },[])
  

  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      
      <List>
        {projects.map((project)=>(<ProjectItem project={project} key={project.id}></ProjectItem>))}
        
      </List>
      
    </Box>
  )
}

export default ProjectList