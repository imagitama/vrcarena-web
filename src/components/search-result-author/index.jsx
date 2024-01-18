import React from 'react'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import * as routes from '../../routes'

const useStyles = makeStyles({
  root: {
    margin: '1rem',
    position: 'relative',
  },
  container: {
    display: 'flex',
  },
  media: {
    width: 200,
    height: 200,
    flex: 'none',
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
})

export default ({
  hit: { objectID: id, name, description }, // categories
}) => {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <Link to={routes.viewAuthorWithVar.replace(':authorId', id)}>
          <div className={classes.container}>
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                {name}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                {description}
              </Typography>
            </CardContent>
          </div>
        </Link>
      </CardActionArea>
    </Card>
  )
}
