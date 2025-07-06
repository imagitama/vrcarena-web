import React from 'react'
import { DISCORD_URL } from '../../config'
import Link from '../link'
import WarningMessage from '../warning-message'

export default ({
  children = 'This feature of the site has been deprecated (removed) because of low usage or interest.',
}: {
  children: string
}) => (
  <WarningMessage>
    {children}
    <br />
    <br />
    If you think it should return, please drop us a message in our{' '}
    <Link to={DISCORD_URL}>Discord server</Link>
  </WarningMessage>
)
