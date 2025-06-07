import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { matchPath } from 'react-router'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, { Operators } from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import {
  AccessStatus,
  ApprovalStatus,
  PublishStatus,
} from '../../modules/common'
import { AssetMeta, CollectionNames } from '../../modules/assets'
import WarningMessage from '../warning-message'

const DraftAssetsMessage = () => {
  const [, , user] = useUserRecord()
  let [, , results] = useDatabaseQuery<AssetMeta>(
    CollectionNames.AssetsMeta,
    user
      ? // TODO: Create view for this
        [
          ['approvalstatus', Operators.EQUALS, ApprovalStatus.Declined],
          ['accessstatus', Operators.EQUALS, AccessStatus.Public],
          ['publishstatus', Operators.EQUALS, PublishStatus.Draft],
          ['createdby', Operators.EQUALS, user.id],
        ]
      : false
  )
  const location = useLocation()

  // hide it if viewing an asset because 9 times out of 10 they are looking at their draft
  const match = matchPath(location.pathname, {
    path: routes.viewAssetWithVar,
    exact: true,
  })

  if (match || !results || !results.length) {
    return null
  }

  return (
    <WarningMessage title="Declined Assets">
      You have {results.length} assets that have been declined by our editorial
      team and require your input before it is visible to everyone. Click{' '}
      <Link to={routes.myAccountWithTabNameVar.replace(':tabName', 'assets')}>
        here
      </Link>{' '}
      to view your assets.
    </WarningMessage>
  )
}

export default DraftAssetsMessage
