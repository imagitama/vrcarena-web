import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles({
  item: {
    width: '50%',
    padding: '0.5rem',
    position: 'relative'
  },
  contentsWrapper: {
    display: 'flex'
  },
  media: {
    width: '200px',
    height: '200px',
    flexShrink: 0
  },
  thumbnail: {
    width: '100%',
    height: '100%'
  },
  content: {
    flex: 1
  },
  // TODO: Invert theme and share components with species selector
  isSelected: {
    backgroundColor: 'grey',
    boxShadow: '0px 0px 10px #FFF'
  }
})

export default ({
  category: { name, nameSingular, optimizedImageUrl, shortDescription },
  onClick,
  isSelected = false
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
