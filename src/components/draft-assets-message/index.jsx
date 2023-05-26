import React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import { Link, useLocation } from 'react-router-dom'
import { matchPath } from 'react-router'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  Operators,
  AssetMetaFieldNames,
  ApprovalStatuses,
  AccessStatuses,
  PublishStatuses
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import { createRef } from '../../utils'

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
    user
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
            PublishStatuses.Draft
          ],
          [
            AssetFieldNames.createdBy,
            Operators.EQUALS,
            createRef(CollectionNames.Users, user.id)
          ]
        ]
      : false
  )
  const location = useLocation()

  if (
    !user ||
    !isUserStaff(user) ||
    !results ||
    !results.length ||
    location.pathname === '/'
  ) {
    return null
  }

  // hide it if viewing an asset because 9 times out of 10 they are looking at their draft
  const match = matchPath(location.pathname, {
    path: routes.viewAssetWithVar,
    exact: true
  })

  if (match) {
    return null
  }

  return (
    <Paper className={classes.paper}>
      You have a draft asset waiting for you to edit. Click{' '}
      <Link to={routes.editAssetWithVar.replace(':assetId', results[0].id)}>
        here
      </Link>{' '}
      to edit it.
    </Paper>
  )
}
