import React from 'react'
import { makeStyles } from '@mui/styles'
import useSupabaseView from '../../../../hooks/useSupabaseView'
import { FullUser, ViewNames } from '../../../../modules/users'
import Avatar, { sizes } from '../../../../components/avatar'
import UsernameLink from '../../../../components/username-link'
import { shuffle } from '../../../../utils'

const useStyles = makeStyles({
  items: {
    marginTop: '0.5rem',
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    '& > *': {
      margin: '0.25rem',
      transition: 'all 100ms',
      '&:hover': {
        transform: 'scale(1.05)',
      },
    },
  },
  date: {
    fontSize: '75%',
    marginLeft: '0.5rem',
  },
})

const EditorTeam = () => {
  const [isLoading, lastErrorCode, users] = useSupabaseView<FullUser>(
    ViewNames.GetStaffUsers
  )
  const classes = useStyles()

  const isPlaceholder =
    isLoading || lastErrorCode !== null || !Array.isArray(users)

  return (
    <div className={classes.items}>
      {isPlaceholder
        ? Array(7)
            .fill(undefined)
            .map(() => (
              <span>
                <Avatar size={sizes.TINY} />
              </span>
            ))
        : shuffle<FullUser[]>(users).map((user) => (
            <UsernameLink id={user.id} username={user.username}>
              <Avatar url={user.avatarurl} size={sizes.TINY} />
            </UsernameLink>
          ))}
    </div>
  )
}

export default EditorTeam
