import { List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import React from 'react'
import {useNavigate} from 'react-router-dom'

const SideMenu = () => {

  const navigate = useNavigate()
  const routes = [
    {name: "Home", route:"/"},
    {name: "My Projects", route:"/manage-projects"},
    {name: "Create a Project", route:"/create-project"},
  ]
  return (
    <List>
      {
        routes.map((route)=>(
          <ListItem key={route.name}>
              <ListItemButton onClick={()=>{navigate(route.route)}}>
                <ListItemText primary={route.name}></ListItemText>
              </ListItemButton>
          </ListItem>
        ))
      }
    </List>
  )
}

export default SideMenu