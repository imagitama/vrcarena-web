import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles({
  root: {
    marginBottom: '1rem',
    position: 'relative',
  },
})

export default ({ endorsement: { createdBy } }) => {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <div className={classes.container}>
        <CardContent>
          <Typography gutterBottom component="p">
            <strong>{createdBy.username}</strong> endorsed this asset
          </Typography>
        </CardContent>
      </div>
    </Card>
  )
}
