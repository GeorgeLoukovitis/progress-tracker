import React from 'react'
import {useNavigate} from "react-router-dom"
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

const ProjectItem = ({project}) => {

  const navigate = useNavigate()

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={()=>{
        navigate("/projects/"+project.id)
      }}>
        <ListItemText primary={project.title} />
      </ListItemButton>
    </ListItem>
  )
}

export default ProjectItem