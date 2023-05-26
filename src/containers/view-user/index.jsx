import React from 'react'
import { useParams } from 'react-router'
import UserOverview from '../../components/user-overview'

export default () => {
  const { userId } = useParams()
  return <UserOverview userId={userId} />
}
