import React from 'react'
import { useParams } from 'react-router-dom'

const ManageProject = () => {

  const {projectId} = useParams()

  return (
    <div>{"Manage " + projectId}</div>
  )
}

export default ManageProject