import React from 'react'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Link from '../../../../components/link'
import { makeStyles } from '@material-ui/core'
import * as routes from '../../../../routes'

const useStyles = makeStyles({
  root: {
    margin: '1rem 0'
  },
  link: {
    padding: '1rem',
    fontSize: '200%',
    color: '#FFF',
    textAlign: 'center'
  }
})

export default () => {
  const classes = useStyles()
  return (
    <Card className={classes.root}>
      <CardActionArea>
        <Link to={routes.avatarTutorial}>
          <div className={classes.link}>
            Want to upload your first avatar? Read our new avatar tutorial
          </div>
        </Link>
      </CardActionArea>
    </Card>
  )
}
