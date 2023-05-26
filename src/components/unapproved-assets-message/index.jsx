import React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import { Link, useLocation } from 'react-router-dom'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  CollectionNames,
  Operators,
  AssetMetaFieldNames,
  ApprovalStatuses,
  PublishStatuses,
  AccessStatuses,
  options
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2, 2),
    marginBottom: '1rem'
  }
}))

function isUserStaff(user) {
  return user.isAdmin || user.isEditor
}

export default () => {
  const [, , user] = useUserRecord()
  const classes = useStyles()
  let [, , results] = useDatabaseQuery(
    CollectionNames.AssetMeta,
    user && isUserStaff(user)
      ? [
          [
            AssetMetaFieldNames.approvalStatus,
            Operators.EQUALS,
            ApprovalStatuses.Waiting
          ],
          [
            AssetMetaFieldNames.accessStatus,
            Operators.EQUALS,
            AccessStatuses.Public
          ],
          [
            AssetMetaFieldNames.publishStatus,
            Operators.EQUALS,
            PublishStatuses.Published
          ]
        ]
      : false,
    {
      [options.queryName]: 'unapproved-asset-message',
      [options.subscribe]: true
    }
  )
  const location = useLocation()

  if (
    !user ||
    !isUserStaff(user) ||
    !results ||
    !results.length ||
    location === '/'
  ) {
    return null
  }

  return (
    <Paper className={classes.paper}>
      There are {results ? results.length : '-'} assets waiting to be approved.
      Click <Link to={routes.admin}>here</Link> to approve (via tab).
    </Paper>
  )
}
