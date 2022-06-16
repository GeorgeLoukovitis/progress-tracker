import React from 'react'
import { useParams } from 'react-router-dom'

const ManageProject = () => {

  const {projectId} = useParams()

  return (
    <div>ManageProject</div>
  )
}

export default ManageProject