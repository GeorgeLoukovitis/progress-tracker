import {React, useState} from 'react'
import AddProject from './AddProject'
import MyAppBar from './MyAppBar'
import ProjectList from './ProjectList'
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import AddIcon from '@mui/icons-material/Add';

const Home = ({logoutFun, user}) => {

  const [isDrawerOpen, setDrawer] = useState(false);
  const toggleDrawer = ()=>{
    setDrawer(!isDrawerOpen)
  }

  return (
    <div>
      <MyAppBar logoutFun={logoutFun} toggleDrawer={toggleDrawer}></MyAppBar>
      <Container maxWidth="sm">
        <Drawer
          anchor={"left"}
          open={isDrawerOpen}
          onClose={toggleDrawer}
        >
          {"Poutsa"}
        </Drawer>
        <ProjectList user = {user}></ProjectList>
        <Button variant="contained" startIcon={<AddIcon />}>Create Project</Button>
      </Container>
    </div>
  )
}

export default Home