import React from 'react'
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utilities/LoginService';
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@mui/material';

const MyAppBar = ({toggleDrawer, title}) => {

  const navigate = useNavigate()

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick = {toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Button color="inherit" onClick={()=>{
            logout()
            navigate("/")
            window.location.reload(false);
          }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default MyAppBar