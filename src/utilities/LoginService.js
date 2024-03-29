
const login = (email, password, updateState, setError) => {
    fetch("http://localhost:8000/login",
    {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({email, password})
    })
      .then((res)=>{
        if(res.ok)
        {
          return res.json()
        }
        else
        {
          throw Error(res.statusText)
        }
      })
      .then((data)=>{
        if(data)
        {
          // console.log(data)
          setUser(data)
          updateState(data)
          setToken(data.token)
        }
      })
      .catch((err)=>
      {
        console.log(err.message)
        setError(err.message)
      })
}

const logout = () => {
  localStorage.removeItem("user")
  localStorage.removeItem("token")
}

const register = (firstName, lastName, email, password, updateState, setError) => {
  fetch("http://localhost:8000/register",
    {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({email, password, firstName, lastName})
    })
    .then((res)=>{
      if(res.ok)
      {
        return res.json()
      }
      else
      {
        throw Error(res.statusText)
      }
    })
    .then((data)=>{
      // console.log(data)
      updateState(data)
      setUser(data)
      setToken(data.token)
    })
    .catch((err)=>
    {
      setError(err.message)
      console.log(err.message)
    })
}

const getUser = () =>{
  return JSON.parse(localStorage.getItem("user"))
}

const setUser = (usr) => {
  localStorage.setItem("user", JSON.stringify(usr))
}

const getToken = () => {
  return localStorage.getItem("token")
}

const setToken = (tkn) => {
  localStorage.setItem("token", tkn)
}

const refresh = (updateState) => {
  if(localStorage.getItem("user"))
  {
    const uid = getUser()._id
    const token = getToken()
    console.log("Refresh user " + uid)
    fetch("http://localhost:8000/users/"+uid,
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token, 
          "Access-Control-Allow-Origin": "*"
        },
      })
      .then((res)=>{
        if(res.ok)
        {
          return res.json()
        }
        else
        {
          throw Error("Refresh Error")
        }
        
      })
      .then((data)=>{
        setUser(data)
        updateState(data)
      })
      .catch((err)=>{
        console.log(err.message)
      })
  }

}

export {login, logout, register, getUser, setUser, refresh, getToken}