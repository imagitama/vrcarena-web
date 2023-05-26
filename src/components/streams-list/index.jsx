import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import StreamsListItem from '../streams-list-item'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow
} from '../../media-queries'

const useStyles = makeStyles({
  items: {
    display: 'flex',
    marginTop: '2rem',
    flexWrap: 'wrap',
    '& > *': {
      width: '15%',
      [mediaQueryForTabletsOrBelow]: {
        width: '20%'
      },
      [mediaQueryForMobiles]: {
        width: '33.3%'
      }
    }
  }
})

export default ({ users }) => {
  const classes = useStyles()
  return (
    <div className={classes.items}>
      {users.map(user => (
        <StreamsListItem key={user.id} user={user} />
      ))}
    </div>
  )
}
