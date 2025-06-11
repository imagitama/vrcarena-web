import React from 'react'
import { makeStyles } from '@mui/styles'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const useStyles = makeStyles({
  item: {
    width: '50%',
    padding: '0.5rem',
    position: 'relative',
  },
  contentsWrapper: {
    display: 'flex !important',
  },
  media: {
    width: '200px',
    height: '200px',
    flexShrink: 0,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
  },
  // TODO: Invert theme and share components with species selector
  isSelected: {
    backgroundColor: 'grey !important',
    boxShadow: '0px 0px 10px #FFF !important',
  },
})

export default ({
  category: { name, nameSingular, optimizedImageUrl, shortDescription },
  onClick,
  isSelected = false,
}: {
  category: any
  onClick?: () => void
  isSelected?: boolean
}) => {
  const classes = useStyles()
  return (
    <div className={classes.item}>
      <Card className={isSelected ? classes.isSelected : ''}>
        <CardActionArea className={classes.contentsWrapper} onClick={onClick}>
          <div className={classes.media}>
            <img
              src={optimizedImageUrl}
              alt={`Thumbnail for category ${name}`}
              className={classes.thumbnail}
            />
          </div>

          <CardContent className={classes.content}>
            <Typography variant="h5" component="h2">
              {nameSingular}
            </Typography>
            <Typography component="p">{shortDescription}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </div>
  )
}
