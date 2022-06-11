
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

const register = (username, password, setUser) => {
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
        login(username, password,setUser)
      }
    })
}



export {login, register}