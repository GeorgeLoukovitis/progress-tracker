import  {React, useState, useEffect } from 'react'
import { BrowserRouter,Routes, Route, Switch } from "react-router-dom";
import AllProjects from './components/AllProjects';
import AwardMilestones from './components/AwardMilestones';
import Home from './components/Home';
import Login from './components/Login';
import ManageProject from './components/ManageProject';
import MyProjects from './components/MyProjects';
import NewProjectForm from './components/NewProjectForm';
import ProjectScreen from './components/ProjectScreen';
import Register from './components/Register';
import UserInfo from './components/UserInfo';


const App = () => {

  const [user, setUser] = useState(null)
  const loginUser = (usr) =>
  {
    setUser(usr)
  }
  const logout = () => 
  {
    setUser(null)
    localStorage.removeItem("user")
  }
  const [registerScreen, setRegisterScreen] = useState(false)
  const switchLoginRegister = () =>
  {
    setRegisterScreen(registerScreen=>!registerScreen)
  }

  useEffect(()=>{
    if(localStorage.getItem("user")!==null)
    {      
      setUser(JSON.parse(localStorage.getItem("user")))
    }
  },[])

  

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          (user)?
          <Home logoutFun={logout} user = {user}></Home>:
          (
            (registerScreen)?
            <Register loginFun={loginUser} switchToLogin={switchLoginRegister}></Register>:
            <Login loginFun={loginUser} switchToRegister={switchLoginRegister}></Login>
          )
        }/>
        <Route exact path="/create-project" element={
          <NewProjectForm logoutFun={logout} user = {user}></NewProjectForm>
        }/>
        <Route exact path="/manage-projects" element={
          <MyProjects logoutFun={logout} user = {user}></MyProjects>
        }/>
        <Route exact path="/all-projects" element={
          <AllProjects logoutFun={logout} user = {user}></AllProjects>
        }/>
        <Route exact path="/manage-projects/:projectId" element={
          <ManageProject logoutFun={logout} user = {user}></ManageProject>
        }/>
        <Route exact path="/projects/:projectId" element={
          <ProjectScreen logoutFun={logout} user = {user}></ProjectScreen>
        }/>
        <Route exact path="/award-milestones/:projectId" element={
          <AwardMilestones logoutFun={logout} user = {user}></AwardMilestones>
        }/>
      </Routes>
    </BrowserRouter>
  );
}

export default App