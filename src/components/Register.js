import React, {useState} from 'react'
import login from '../utilities/LoginService';

const Register = ({loginFun, switchToLogin}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


  const formHandler = (e) => {
    e.preventDefault();
    
    fetch("http://localhost:8000/users",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({username, password})
    })
    .then((res)=>{
      if(res.ok)
      {
        login(username, password,loginFun)
      }
    })
  }
  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={formHandler}>
        <label htmlFor="username">Username: </label>
        <input required name='username' type="text" value={username} onChange={(input)=>{setUsername(input.target.value)}} />
        <br />
        <label htmlFor="password">Password:  </label>
        <input required name='password' type="password" value={password} onChange={(input)=>{setPassword(input.target.value)}} />
        <button>Register</button>
      </form>
      <button onClick={switchToLogin}>Login</button>
    </div>
  )
}

export default Register