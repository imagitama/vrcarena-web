import React, { useState, useEffect, useCallback, Fragment } from 'react'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'

import * as routes from '../../routes'

import AssetResults from '../../components/asset-results'
import Heading from '../../components/heading'
import Paper from '../../components/paper'
import Button from '../../components/button'
import PaginatedView from '../../components/paginated-view'

import { alreadyOver18Key } from '../../config'
import { AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useStorage from '../../hooks/useStorage'
import { trackAction } from '../../analytics'
import categoryMeta from '../../category-meta'
import useUserPreferences from '../../hooks/useUserPreferences'
import { UserPreferencesFieldNames } from '../../modules/user'

const Renderer = ({ items }) => {
  const assetsByCategory = items.reduce((newObj, asset) => {
    const cat = asset[AssetFieldNames.category]
    if (cat in newObj) {
      newObj[cat] = newObj[cat].concat([asset])
    } else {
      newObj[cat] = [asset]
    }
    return newObj
  }, {})

  return (
    <>
      {Object.entries(assetsByCategory).map(([categoryName, assets]) =>
        categoryName in categoryMeta ? (
          <Fragment key={categoryName}>
            <Heading variant="h2">{categoryMeta[categoryName].name}</Heading>
            <AssetResults assets={assets} />
          </Fragment>
        ) : null
      )}
    </>
  )
}

const Assets = () => {
  const getQuery = useCallback(
    (query) => query.is(AssetFieldNames.isAdult, true),
    []
  )
  return (
    <PaginatedView
      viewName={`getPublicAssets`}
      getQuery={getQuery}
      sortKey="view-adult-assets"
      sortOptions={[
        {
          label: 'Submission date',
          fieldName: AssetFieldNames.createdAt,
        },
        {
          label: 'Title',
          fieldName: AssetFieldNames.title,
        },
      ]}
      defaultFieldName={AssetFieldNames.title}
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

export default () => {
  const [, , userPreferences] = useUserPreferences()
  const [isAdult, setIsAdult] = useState(false)
  const classes = useStyles()
  const [isAlreadyOver18, setIsAlreadyOver18] = useStorage(alreadyOver18Key)

  useEffect(() => {
    if (!userPreferences) {
      return
    }

    if (userPreferences[UserPreferencesFieldNames.enabledAdultContent]) {
      setIsAdult(userPreferences[UserPreferencesFieldNames.enabledAdultContent])
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
