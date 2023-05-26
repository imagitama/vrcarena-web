import React from 'react'
import EmojiEventsIcon from '@material-ui/icons/EmojiEvents'
import { makeStyles } from '@material-ui/core/styles'
import Link from '../../components/link'
import { getNameForAwardId } from '../../awards'
import * as routes from '../../routes'

const yellowColor = '#ffdd00'

const useStyles = makeStyles({
  root: {
    width: '90px',
    marginRight: '0.5rem',
    fontSize: '10px',

    cursor: 'default',
    '& svg': {
      fontSize: '2rem',
      marginBottom: '5px'
    },
    '& a': {
      width: '100%',
      textAlign: 'center',
      marginBottom: '-10px',
      color: yellowColor,
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
  },
  large: {
    width: '180px',
    fontSize: '20px',
    '& svg': {
      fontSize: '5rem'
    }
  }
})

export default ({ awardId, isLarge = false }) => {
  const classes = useStyles()
  const awardName = getNameForAwardId(awardId)

  return (
    <div
      className={`${classes.root} ${isLarge ? classes.large : ''}`}
      title={awardName}>
      <Link
        to={routes.viewAwardWithVar.replace(':awardId', awardId)}
        className={classes.icon}>
        <EmojiEventsIcon />

        {awardName}
      </Link>
    </div>
  )
}
