import React from 'react'
import Link from '../../components/link'
import * as routes from '../../routes'

export default ({
  id,
  username = undefined,
  children = undefined
}: {
  id: string
  username?: string
  children?: React.ReactNode
}) => (
  <Link to={routes.viewUserWithVar.replace(':userId', id)}>
    {username || children}
  </Link>
)
