import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Tweet from '../tweet'

const useStyles = makeStyles({
  root: {
    width: '550px' // max width of twitter embed
  }
})

export default ({ tweetIds }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {tweetIds.map(tweetId => (
        <Tweet tweetId={tweetId} />
      ))}
    </div>
  )
}
