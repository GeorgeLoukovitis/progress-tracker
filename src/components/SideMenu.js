import { List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import React from 'react'
import {Link} from 'react-router-dom'

const SideMenu = () => {
  return (
    <List>
      <ListItem>
        <Link to="/">
          <ListItemButton>
            <ListItemText>Home</ListItemText>
          </ListItemButton>
        </Link>
      </ListItem>
    </List>
  )
}

export default SideMenu