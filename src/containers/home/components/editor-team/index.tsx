import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useSupabaseView from '../../../../hooks/useSupabaseView'
import { FullUser } from '../../../../modules/users'
import Avatar, { sizes } from '../../../../components/avatar'
import UsernameLink from '../../../../components/username-link'
import { shuffle } from '../../../../utils'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '2rem',
  },
  items: {
    marginLeft: '0.5rem',
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    '& > a': {
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
  const [isLoading, isError, users] =
    useSupabaseView<FullUser[]>('getstaffusers')
  const classes = useStyles()

  if (isLoading || isError || !Array.isArray(users)) {
    return null
  }

  return (
    <div className={classes.root}>
      Our volunteer staff team:
      <div className={classes.items}>
        {shuffle<FullUser[]>(users).map((user) => (
          <UsernameLink id={user.id} username={user.username}>
            <Avatar url={user.avatarurl} size={sizes.TINY} />
          </UsernameLink>
        ))}
      </div>
    </div>
  )
}

export default EditorTeam
