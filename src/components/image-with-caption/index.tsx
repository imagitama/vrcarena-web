import React, { ImgHTMLAttributes } from 'react'
import { makeStyles } from '@mui/styles'
import LazyLoad from '@/components/lazy-load'

const useStyles = makeStyles({
  root: {
    display: 'inline-block',
    '& img': {
      maxWidth: '100%',
      maxHeight: '400px',
      boxShadow: '2px 2px 5px #000',
      cursor: 'pointer',
    },
  },
  caption: {
    fontStyle: 'italic',
    fontSize: '75%',
    textAlign: 'right',
  },
})

export default ({
  caption,
  ...props
}: {
  caption: string
} & ImgHTMLAttributes<HTMLImageElement>) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <LazyLoad>
        <img {...props} />
      </LazyLoad>
      <div className={classes.caption}>{caption || props.alt}</div>
    </div>
  )
}
