import  {React, useState, useEffect } from 'react'
import { BrowserRouter,Routes, Route } from "react-router-dom";
import AllProjects from './components/AllProjects';
import AwardMilestones from './components/AwardMilestones';
import Home from './components/Home';
import Login from './components/Login';
import ManageProject from './components/ManageProject';
import MyProjects from './components/MyProjects';
import NewProjectForm from './components/NewProjectForm';
import ProjectScreen from './components/ProjectScreen';
import Register from './components/Register';
import { refresh } from './utilities/LoginService';

const App = () => {

  console.log("Created App")

  const [user, setLocalUser] = useState(null)
  const [registerScreen, setRegisterScreen] = useState(false)
  
  const switchLoginRegister = () =>
  {
    setRegisterScreen(registerScreen=>!registerScreen)
  }

  useEffect(()=>{
    refresh(setLocalUser)
  },[])

  

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          (user)?
          <Home></Home>:
          (
            (registerScreen)?
            <Register loginFun={setLocalUser} switchToLogin={switchLoginRegister}></Register>:
            <Login loginFun={setLocalUser} switchToRegister={switchLoginRegister}></Login>
          )
        }/>
        <Route exact path="/create-project" element={
          <NewProjectForm></NewProjectForm>
        }/>
        <Route exact path="/manage-projects" element={
          <MyProjects></MyProjects>
        }/>
        <Route exact path="/all-projects" element={
          <AllProjects></AllProjects>
        }/>
        <Route exact path="/manage-projects/:projectId" element={
          <ManageProject></ManageProject>
        }/>
        <Route exact path="/projects/:projectId" element={
          <ProjectScreen></ProjectScreen>
        }/>
        <Route exact path="/award-milestones/:projectId" element={
          <AwardMilestones></AwardMilestones>
        }/>
      </Routes>
    </BrowserRouter>
  );
}

export default App