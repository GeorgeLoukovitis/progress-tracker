import React, { useState } from 'react'
import login from '../utilities/LoginService';

const Login = ({loginFun, switchToRegister}) => {
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


  const formHandler = (e) => {
    e.preventDefault();
    const name = username;
    const pass = password;
    setUsername("")
    setPassword("")
    login(name, pass, loginFun);
  }
  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={formHandler}>
        <label htmlFor="username">Username: </label>
        <input required name='username' type="text" value={username} onChange={(input)=>{setUsername(input.target.value)}} />
        <br />
        <label htmlFor="password">Password:  </label>
        <input required name='password' type="password" value={password} onChange={(input)=>{setPassword(input.target.value)}} />
        <button>Login</button>
      </form>
      <button onClick={switchToRegister}>Register</button>
    </div>
  )
}

export default Login