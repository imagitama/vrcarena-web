import React from 'react'
import { makeStyles } from '@mui/styles'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Endorsement } from '../../modules/endorsements'

const useStyles = makeStyles({
  // TODO: parent handle this
  root: {
    marginBottom: '1rem',
    position: 'relative',
  },
})

const EndorsementListItem = ({
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

export default EndorsementListItem
