import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@mui/styles'

import CheckIcon from '@mui/icons-material/Check'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'

import * as routes from '../../routes'

import Button from '../../components/button'
import NoPermissionMessage from '../../components/no-permission-message'

import Link from '../../components/link'
import FormControls from '../../components/form-controls'
import { handleError } from '../../error-handling'
import { CollectionNames, Asset, FullAsset } from '../../modules/assets'
import { AssetSyncQueueItem, ViewNames } from '../../modules/assetsyncqueue'
import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '../../hooks/useDatabaseQuery'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import ExperimentalMessage from '../../components/experimental-message'
import useHistory from '../../hooks/useHistory'
import useMyDrafts from '../../hooks/useMyDrafts'
import useSupabaseClient from '../../hooks/useSupabaseClient'
import { insertRecord } from '../../data-store'
import AssetResults from '../../components/asset-results'
import AssetSyncQueue from '../../components/asset-sync-queue'
import usePermissions from '../../hooks/usePermissions'
import Heading from '@/components/heading'
import Message from '@/components/message'
import InfoMessage from '@/components/info-message'

const useStyles = makeStyles({
  heading: {
    textAlign: 'center',
    padding: '2rem 0',
    fontWeight: 'bold',
  },
  // rules
  acceptRulesButton: {
    textAlign: 'center',
    padding: '2rem 0',
  },
})

const RulesForm = ({ onAccept }: { onAccept: () => void }) => {
  const classes = useStyles()

  return (
    <div>
      <div className={classes.heading}>
        By clicking "I accept" you understand and agree to our{' '}
        <Link to={routes.termsOfService}>Terms of Service</Link> and our{' '}
        <Link to={routes.takedownPolicy}>Takedown Policy</Link>.
      </div>
      <div className={classes.acceptRulesButton}>
        <Button size="large" icon={<CheckIcon />} onClick={onAccept}>
          I accept
        </Button>
      </div>
    </div>
  )
}

const ManualCreateView = () => {
  const [isCreating, setIsCreating] = useState(false)

  // TODO: Store last error code
  const [isError, setIsError] = useState(false)
  const classes = useStyles()
  const [isLoadingDrafts, lastErrorCodeLoadingDrafts, drafts] = useMyDrafts()
  const { push } = useHistory()
  const supabase = useSupabaseClient()
  const isLoggedIn = useIsLoggedIn()

  const createDraft = async () => {
    try {
      setIsCreating(true)
      setIsError(false)

      const newDraftRecord = await insertRecord<{ title: string }, Asset>(
        supabase,
        CollectionNames.Assets,
        {
          title: 'My draft asset',
        },
        true
      )

      if (!newDraftRecord) {
        throw new Error('Did not return a draft')
      }

      push(routes.editAssetWithVar.replace(':assetId', newDraftRecord.id))
    } catch (err) {
      console.error(err)
      handleError(err)

      setIsCreating(false)
      setIsError(true)
    }
  }

  if (isLoadingDrafts) {
    return <LoadingIndicator message="Checking for existing drafts..." />
  }

  if (lastErrorCodeLoadingDrafts !== null) {
    return (
      <ErrorMessage>
        Failed to load existing drafts (code {lastErrorCodeLoadingDrafts})
      </ErrorMessage>
    )
  }

  if (drafts && drafts.length) {
    const onClickWithEventAndAsset = (
      e: React.SyntheticEvent,
      asset: FullAsset
    ) => {
      e.preventDefault()

      push(routes.editAssetWithVar.replace(':assetId', asset.id))

      return false
    }

    return (
      <>
        <div className={classes.heading}>We have detected these drafts:</div>
        <AssetResults
          assets={drafts}
          // @ts-ignore
          onClickWithEventAndAsset={onClickWithEventAndAsset}
        />
        <div className={classes.heading}>
          You can continue editing an existing draft or you can make a new one.
        </div>
        <FormControls>
          <Button
            size="large"
            icon={<ChevronRightIcon />}
            onClick={() => createDraft()}>
            Create New Draft
          </Button>
        </FormControls>
      </>
    )
  }

  if (!isLoggedIn) {
    return <NoPermissionMessage />
  }

  if (isCreating) {
    return <LoadingIndicator message="Creating draft..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to create draft</ErrorMessage>
  }

  return <>Waiting</>
}

const oneWeekAgo = new Date()
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

const View = () => {
  const [isCreatingManually, setIsCreatingManually] = useState(false)
  const [showRules, setShowRules] = useState(true)
  const [isOldItemsShown, setIsOldItemsShown] = useState(false)
  const [isLoading, lastErrorCode, queuedItems, hydrate] =
    useDatabaseQuery<AssetSyncQueueItem>(
      ViewNames.GetMyAssetSyncQueuedItems,
      isOldItemsShown
        ? []
        : [['createdat', Operators.GREATER_THAN, oneWeekAgo.toISOString()]],
      {
        queryName: 'get-my-asset-sync-queued-items',
        orderBy: ['createdat', OrderDirections.DESC],
      }
    )

  const acceptRules = () => setShowRules(false)

  if (showRules) {
    return <RulesForm onAccept={acceptRules} />
  }

  return (
    <>
      {isCreatingManually ? (
        <ManualCreateView />
      ) : (
        <>
          <Button
            onClick={() => setIsOldItemsShown((currentVal) => !currentVal)}
            size="small"
            color="secondary"
            icon={
              isOldItemsShown ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />
            }>
            Show Old Queued Assets
          </Button>{' '}
          <Button
            onClick={() => setIsCreatingManually(true)}
            color="secondary"
            size="small">
            Create Asset Manually
          </Button>
          <AssetSyncQueue
            items={queuedItems}
            isLoading={isLoading}
            lastErrorCode={lastErrorCode}
            hydrate={hydrate}
          />
        </>
      )}
    </>
  )
}

export default () => {
  if (!usePermissions(routes.createAsset)) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Helmet>
        <title>Upload a new asset to the site | VRCArena</title>
        <meta
          name="description"
          content="Complete the form, submit it for approval and your asset will be visible on the site."
        />
      </Helmet>
      <Heading variant="h1">Create Asset</Heading>
      <InfoMessage hideId="create-asset-intro">
        Anyone can add any product from Gumroad, Jinxxy, Booth and Itch.io using
        the form below (even if you aren't the creator of the product!). If the
        asset is not on one of those sites (or you must log in to see it like{' '}
        <em>some</em> Jinxxy products) you can create it manually.
      </InfoMessage>
      <View />
    </>
  )
}
