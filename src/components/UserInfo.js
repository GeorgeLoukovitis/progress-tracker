import React from 'react'

const UserInfo = ({user, logoutFun}) => {
  return (
    <div className="userInfo">
      <h2>Name: {user.username}</h2>
      <h2>Password: {user.password}</h2>
      <button onClick={()=>{logoutFun()}}>Logout</button>
    </div>
  )
}

export default UserInfo