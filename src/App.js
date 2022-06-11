import  {React, useState, useEffect } from 'react'
import { BrowserRouter,Routes, Route, Switch } from "react-router-dom";
import Home from './components/Home';
import Login from './components/Login';
import NewProjectForm from './components/NewProjectForm';
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
          <NewProjectForm></NewProjectForm>
        }/>
      </Routes>
    </BrowserRouter>
  );
}

export default App