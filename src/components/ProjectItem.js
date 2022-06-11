import React from 'react'
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

const ProjectItem = ({project}) => {
  return (
    <ListItem disablePadding>
      <ListItemButton>
        <ListItemText primary={project.title} />
      </ListItemButton>
    </ListItem>
  )
}

export default ProjectItem