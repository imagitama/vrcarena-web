import React from 'react'
import UsernameLink from '../../components/username-link'
import { ActivityEvents } from '../../activity'
import Link from '../../components/link'
import {
  Asset,
  CollectionNames as AssetCollectionNames,
} from '../../modules/assets'
import {
  User,
  CollectionNames as UserCollectionNames,
} from '../../modules/users'
import * as routes from '../../routes'

const ActivityItemLabel = ({
  message,
  parent,
  parentTable,
  extraData,
  createdBy,
  createdByUsername,
}: {
  message: string
  parent: string
  parentTable: string
  extraData: { [collectionName: string]: any }
  createdBy: string
  createdByUsername: string
}) => {
  let asset: Asset, user: User

  if (!extraData) {
    console.warn(`Cannot render activity label: no extra data found`, {
      message,
      parent,
      parentTable,
    })
    return null
  }

  switch (message) {
    case ActivityEvents.ASSET_APPROVED:
      asset = extraData[AssetCollectionNames.Assets]
      return (
        <>
          Asset{' '}
          <Link
            to={routes.viewAssetWithVar.replace(
              ':assetId',
              asset.slug || asset.id
            )}>
            {asset.title}
          </Link>{' '}
          was approved
        </>
      )
    case ActivityEvents.COMMENT_CREATED:
      if (extraData[AssetCollectionNames.Assets]) {
        asset = extraData[AssetCollectionNames.Assets]
        return (
          <>
            {' '}
            <UsernameLink id={createdBy} username={createdByUsername} />{' '}
            commented on asset{' '}
            <Link
              to={routes.viewAssetWithVar.replace(
                ':assetId',
                asset.slug || asset.id
              )}>
              {asset.title}
            </Link>
          </>
        )
      } else if (extraData[UserCollectionNames.Users]) {
        user = extraData[UserCollectionNames.Users]
        return (
          <>
            {' '}
            <UsernameLink id={createdBy} username={createdByUsername} />{' '}
            commented on the profile of{' '}
            <Link to={routes.viewUserWithVar.replace(':userId', user.id)}>
              {user.username}
            </Link>
          </>
        )
      } else {
        console.warn(
          `Cannot render comment: only assets and users are supported`,
          { message, parent, parentTable, extraData }
        )
        return null
      }
    default:
      throw new Error(`Unknown message ${message}`)
  }
}

export default ActivityItemLabel
