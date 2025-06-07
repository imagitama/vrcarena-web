import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { Endorsement } from '../../modules/endorsements'

const useStyles = makeStyles({
  root: {
    marginBottom: '1rem',
    position: 'relative',
  },
})

export default ({
  endorsement: { createdby },
}: {
  endorsement: Endorsement
}) => {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography gutterBottom component="p">
          <strong>{createdby}</strong> endorsed this asset
        </Typography>
      </CardContent>
    </Card>
  )
}
