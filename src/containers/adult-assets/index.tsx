import React, { useState, useEffect, useCallback, Fragment } from 'react'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'
import { makeStyles } from '@mui/styles'

import * as routes from '../../routes'

import AssetResults from '../../components/asset-results'
import Heading from '../../components/heading'
import Paper from '../../components/paper'
import Button from '../../components/button'
import PaginatedView, { GetQueryFn } from '../../components/paginated-view'

import { alreadyOver18Key } from '../../config'
import useStorage from '../../hooks/useStorage'
import { trackAction } from '../../analytics'
import { getCategoryMeta } from '../../category-meta'
import useUserPreferences from '../../hooks/useUserPreferences'
import { AssetCategory, PublicAsset, ViewNames } from '../../modules/assets'

const Renderer = ({ items }: { items?: PublicAsset[] }) => {
  const assetsByCategory = items
    ? items.reduce<{ [categoryName: string]: PublicAsset[] }>(
        (newObj, asset) => {
          if (asset.category in newObj) {
            newObj[asset.category] = newObj[asset.category].concat([asset])
          } else {
            newObj[asset.category] = [asset]
          }
          return newObj
        },
        {}
      )
    : []

  return (
    <>
      {Object.entries(assetsByCategory).map(([categoryName, assets]) => (
        <Fragment key={categoryName}>
          <Heading variant="h2">
            {getCategoryMeta(categoryName as AssetCategory).name}
          </Heading>
          <AssetResults assets={assets} />
        </Fragment>
      ))}
    </>
  )
}

const Assets = () => {
  const getQuery = useCallback<GetQueryFn<PublicAsset>>(
    (query) => query.is('isadult', true),
    []
  )
  return (
    <PaginatedView<PublicAsset>
      viewName={ViewNames.GetPublicAssets}
      getQuery={getQuery}
      name="view-adult-assets"
      sortOptions={[
        {
          label: 'Submission date',
          fieldName: 'createdat',
        },
        {
          label: 'Title',
          fieldName: 'title',
        },
      ]}
      defaultFieldName="title"
      urlWithPageNumberVar={routes.nsfwWithPageNumberVar}>
      <Renderer />
    </PaginatedView>
  )
}

const useStyles = makeStyles({
  over18message: {
    padding: '5rem 0',
    textAlign: 'center',
  },
})

const AdultAssetsView = () => {
  const [, , userPreferences] = useUserPreferences()
  const [isAdult, setIsAdult] = useState(false)
  const classes = useStyles()
  const [isAlreadyOver18, setIsAlreadyOver18] = useStorage(alreadyOver18Key)

  useEffect(() => {
    if (!userPreferences) {
      return
    }

    if (userPreferences.enabledadultcontent) {
      setIsAdult(userPreferences.enabledadultcontent)
    }
  }, [userPreferences !== null])

  const onOver18ButtonClick = () => {
    setIsAdult(true)
    setIsAlreadyOver18(true)

    trackAction('Nsfw', 'Click I am over 18 button')
  }

  return (
    <>
      <Helmet>
        <title>View adult assets | VRCArena</title>
        <meta name="description" content="View a list of adult assets" />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.nsfw}>NSFW Content</Link>
      </Heading>
      {isAdult || isAlreadyOver18 ? (
        <Assets />
      ) : (
        <Paper className={classes.over18message}>
          <Heading variant="h2">Over 18 Check</Heading>
          <p>This area requires that you are over the age of 18.</p>
          <Button onClick={onOver18ButtonClick}>
            I am over 18 please show me this content
          </Button>
        </Paper>
      )}
    </>
  )
}

export default AdultAssetsView
