import  {React, useState } from 'react'
import Home from './components/Home';
import Login from './components/Login';
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
  }
  const [registerScreen, setRegisterScreen] = useState(false)
  const switchLoginRegister = () =>
  {
    setRegisterScreen(registerScreen=>!registerScreen)
  }

  return (
    <div className="container">
      {
        (user)?
        <Home logoutFun={logout} user = {user}></Home>:
        (
          (registerScreen)?
          <Register loginFun={loginUser} switchToLogin={switchLoginRegister}></Register>:
          <Login loginFun={loginUser} switchToRegister={switchLoginRegister}></Login>
        )
      }
    </div>
  );
}

export default App