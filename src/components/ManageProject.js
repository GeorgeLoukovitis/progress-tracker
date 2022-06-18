import React from 'react'
import { useParams } from 'react-router-dom'
import { getUser } from '../utilities/LoginService'

const ManageProject = () => {

  const {projectId} = useParams()
  const user = getUser()

  return (
    <div>ManageProject</div>
  )
}

export default ManageProject