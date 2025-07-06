import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Endorsement } from '../../modules/endorsements'

const EndorsementListItem = ({
  endorsement: { createdby },
  className = '',
}: {
  endorsement: Endorsement
  className?: string
}) => {
  return (
    <Card className={className}>
      <CardContent>
        <Typography gutterBottom component="p">
          <strong>{createdby}</strong> endorsed this asset
        </Typography>
      </CardContent>
    </Card>
  )
}

export default EndorsementListItem
