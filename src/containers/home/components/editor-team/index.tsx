import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useSupabaseView from '../../../../hooks/useSupabaseView'
import { FullUser } from '../../../../modules/users'
import Avatar, { sizes } from '../../../../components/avatar'
import UsernameLink from '../../../../components/username-link'
import { shuffle } from '../../../../utils'

const useStyles = makeStyles({
  items: {
    marginTop: '2rem',
    display: 'flex',
    justifyContent: 'flex-end',
    '& > a': {
      marginLeft: '0.5rem',
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
  const [isLoading, isError, users] =
    useSupabaseView<FullUser[]>('getstaffusers')
  const classes = useStyles()

  if (isLoading || isError || !Array.isArray(users)) {
    return null
  }

  return (
    <div className={classes.items}>
      {shuffle<FullUser[]>(users).map((user) => (
        <UsernameLink id={user.id} username={user.username}>
          <Avatar url={user.avatarurl} size={sizes.TINY} />
        </UsernameLink>
      ))}
    </div>
  )
}

export default EditorTeam
