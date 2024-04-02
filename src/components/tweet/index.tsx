import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Tweet } from 'react-twitter-widgets'

const useStyles = makeStyles({
  root: {
    width: '550px', // max width of twitter embed
  },
})

const getTweetIdFromUrl = (url: string): string => url.split('/').pop()!

export default ({
  url = undefined,
  tweetId = undefined,
}: {
  url?: string
  tweetId?: string
}) => {
  const classes = useStyles()

  if (!url && !tweetId) {
    return <>Need URL or tweet ID</>
  }

  return (
    <div className={classes.root}>
      <Tweet
        tweetId={url ? getTweetIdFromUrl(url) : tweetId ? tweetId : ''}
        options={{ width: '100%' }}
      />
    </div>
  )
}
