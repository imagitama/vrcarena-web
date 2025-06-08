import React from 'react'
import { useParams } from 'react-router'
import UserOverview from '../../components/user-overview'

export default () => {
  const { userId } = useParams<{ userId: string }>()
  return <UserOverview userId={userId} />
}
