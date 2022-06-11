
const login = (username, password, setUser) => {
  fetch("http://localhost:8000/users")
    .then((res)=>res.json())
    .then((data)=>{
      let userFilter = data.filter((usr)=>(usr.username === username && usr.password === password))
      console.log(userFilter)
      if(userFilter.length !== 0)
      {
        setUser(userFilter[0])
      }
    })
}

export default login