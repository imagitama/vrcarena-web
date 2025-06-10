import React from 'react'
import Chip from '@mui/material/Chip'

export default ({ isSmall }: { isSmall?: boolean }) => (
  <span title="This user is a staff member. They can approve assets and resolve issues with assets and users.">
    <Chip label="Staff" size={isSmall ? 'small' : undefined} />
  </span>
)
