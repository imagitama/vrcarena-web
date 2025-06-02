import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@material-ui/core/styles'

import CheckIcon from '@material-ui/icons/Check'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'

import * as routes from '../../routes'

import Button from '../../components/button'
import NoPermissionMessage from '../../components/no-permission-message'

import Link from '../../components/link'
import FormControls from '../../components/form-controls'
import { handleError } from '../../error-handling'
import {
  AssetSyncQueueItem,
  CollectionNames,
  ViewNames,
  Asset,
  FullAsset,
} from '../../modules/assets'
import useDataStoreCreateBulk from '../../hooks/useDataStoreCreateBulk'
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

const useStyles = makeStyles((theme) => ({
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
}))

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
  const [isError, setIsError] = useState(false)
  const classes = useStyles()
  const [isLoadingDrafts, isErrorLoadingDrafts, drafts] = useMyDrafts()
  const [showRules, setShowRules] = useState(false)
  const { push } = useHistory()
  const supabase = useSupabaseClient()
  const isLoggedIn = useIsLoggedIn()

  useEffect(() => {
    if (isLoadingDrafts || !drafts) {
      return
    }

    if (!drafts.length) {
      console.debug('No drafts detected, showing rules...')
      setShowRules(true)
    }
  }, [isLoadingDrafts, drafts ? drafts.length : null])

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
        false
      )

      push(routes.editAssetWithVar.replace(':assetId', newDraftRecord.id))
    } catch (err) {
      console.error(err)
      handleError(err)

      setIsCreating(false)
      setIsError(true)
    }
  }

  const acceptRules = () => createDraft()

  const onCreateNewDraft = () => setShowRules(true)

  if (isLoadingDrafts) {
    return <LoadingIndicator message="Checking for existing drafts..." />
  }

  if (isErrorLoadingDrafts) {
    return <ErrorMessage>Failed to load existing drafts</ErrorMessage>
  }

  if (drafts && drafts.length && !showRules) {
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
            onClick={() => onCreateNewDraft()}>
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

  if (showRules) {
    return <RulesForm onAccept={acceptRules} />
  }

  return <>Waiting</>
}

const oneWeekAgo = new Date()
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

const View = () => {
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
      <AssetSyncQueue
        items={queuedItems}
        isLoading={isLoading}
        lastErrorCode={lastErrorCode}
        hydrate={hydrate}
      />
      <Button
        onClick={() => setIsOldItemsShown((currentVal) => !currentVal)}
        size="small"
        color="default"
        icon={
          isOldItemsShown ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />
        }>
        Show Old Queued Assets
      </Button>
    </>
  )
}

export default () => {
  const isLoggedIn = useIsLoggedIn()
  const [isCreatingManually, setIsCreatingManually] = useState(false)

  if (!isLoggedIn) {
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
      {isCreatingManually ? (
        <ManualCreateView />
      ) : (
        <>
          <ExperimentalMessage title="Asset Queue">
            This is the new way of syncing assets with Gumroad, Itch.io, Jinxxy
            and Booth. It now happens <em>in the background</em>, you can add
            multiple at a time and syncs more fields.
            <br />
            <br />
            Please DM me on Discord: @nutterbuddha with any feedback about the
            new system.
            <br />
            <br />
            <strong>NSFW assets on sites like Jinxxy are not supported</strong>
            <br />
            <br />
            <Button
              onClick={() => setIsCreatingManually(true)}
              color="default"
              size="small">
              Create Asset Manually (old way)
            </Button>
          </ExperimentalMessage>
          <View />
        </>
      )}
    </>
  )
}
