import {React, useState} from 'react'
import { Link, useNavigate } from "react-router-dom";
import MyAppBar from './MyAppBar'
import ProjectList from './ProjectList'
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import AddIcon from '@mui/icons-material/Add';
import { CssBaseline } from '@mui/material';
import SideMenu from './SideMenu';
import {getUser} from "../utilities/LoginService"

const Home = ({logoutFun}) => {

  const user = getUser()

  const [isDrawerOpen, setDrawer] = useState(false);
  const toggleDrawer = ()=>{
    setDrawer(!isDrawerOpen)
  }

  const navigate = useNavigate()

  return (
    <div>
      <CssBaseline></CssBaseline>
      <MyAppBar title="Enrolled Projects" logoutFun={logoutFun} toggleDrawer={toggleDrawer}></MyAppBar>
      <Container maxWidth="sm">
        <Drawer
          anchor={"left"}
          open={isDrawerOpen}
          onClose={toggleDrawer}
        >
          <SideMenu></SideMenu>
        </Drawer>
        <ProjectList user = {user}></ProjectList>
        
        <Button onClick={()=>navigate("/all-projects")} variant="contained" startIcon={<AddIcon />}>EnrolL</Button>
        
      </Container>
    </div>
  )
}

export default Home