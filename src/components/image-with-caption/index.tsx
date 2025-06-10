import React, { ImgHTMLAttributes, useState } from 'react'
import { makeStyles } from '@mui/styles'
import LazyLoad from 'react-lazyload'
import Lightbox from 'react-image-lightbox-custom'

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
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={classes.root}>
      <LazyLoad>
        <img {...props} onClick={() => setIsOpen(true)} />
      </LazyLoad>
      <div className={classes.caption}>{caption || props.alt}</div>
      {isOpen ? (
        <Lightbox
          mainSrc={props.src!}
          onCloseRequest={() => setIsOpen(false)}
        />
      ) : null}
    </div>
  )
}
