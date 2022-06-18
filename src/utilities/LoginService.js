
const login = (username, password, setUser) => {
    fetch("http://localhost:8000/users")
      .then((res)=>res.json())
      .then((data)=>{
        let userFilter = data.filter((usr)=>(usr.username === username && usr.password === password))
        console.log(userFilter)
        if(userFilter.length !== 0)
        {
          localStorage.setItem("user", JSON.stringify(userFilter[0]))
          setUser(userFilter[0])
        }
      })
}

const logout = () => {
  setUser(null)
}

const register = (username, password, setUser) => {
  fetch("http://localhost:8000/users",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({username, password, projectsEnrolled:[]})
    })
    .then((res)=>{
      if(res.ok)
      {
        login(username, password,setUser)
      }
    })
}

const getUser = () =>{
  return JSON.parse(localStorage.getItem("user"))
}

const setUser = (usr) => {
  localStorage.setItem("user", JSON.stringify(usr))
}

const refresh = (updateState) => {
  if(JSON.parse(localStorage.getItem("user")))
  {
    const uid = JSON.parse(localStorage.getItem("user")).id
    fetch("http://localhost:8000/users/"+uid)
      .then((res)=>{
        if(res.ok)
        {
          return res.json()
        }
      })
      .then((data)=>{
        setUser(data)
        updateState(data)
      })
  }

}



export {login, logout, register, getUser, setUser, refresh}