import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@material-ui/core/styles'

import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import CheckIcon from '@material-ui/icons/Check'

import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useMyDrafts from '../../hooks/useMyDrafts'

import * as routes from '../../routes'

import Button from '../../components/button'
import FormControls from '../../components/form-controls'
import NoPermissionMessage from '../../components/no-permission-message'
import ErrorMessage from '../../components/error-message'
import AssetResults from '../../components/asset-results'

import useUserRecord from '../../hooks/useUserRecord'
import { insertRecord } from '../../data-store'
import { Asset, FullAsset } from '../../modules/assets'
import { handleError } from '../../error-handling'

import Link from '../../components/link'
import LoadingIndicator from '../../components/loading-indicator'
import { useHistory } from 'react-router'

const useStyles = makeStyles((theme) => ({
  // global
  root: {
    position: 'relative',
  },
  hydratingIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '1rem',
  },
  fakeLink: {
    color: theme.palette.primary.light,
  },
  noValueMessage: {
    opacity: '0.5',
    fontSize: '110%',
    cursor: 'default',
    display: 'flex',
    alignItems: 'center',
  },
  heading: {
    textAlign: 'center',
    padding: '2rem 0',
    fontWeight: 'bold',
  },
  hydrating: {
    opacity: 0.5,
  },
  formControls: {
    marginTop: '4rem',
  },
  iconAndText: {
    display: 'flex',
    alignItems: 'center',
  },

  // rules
  acceptRulesButton: {
    textAlign: 'center',
    padding: '2rem 0',
  },

  // basics
  authorHeading: {
    fontSize: '50%',
  },
  banner: {
    width: '100%',
    '& img': {
      width: '100%',
    },
  },

  // patreon
  pedestalVideo: {
    width: '300px',
    height: '300px',
  },
  patreonMessage: {
    padding: '1rem',
    fontSize: '150%',
    textAlign: 'center',
    '& img': {
      maxWidth: '50%',
    },
  },

  // publish
  assetPreview: {
    marginTop: '1rem',
    padding: '1rem',
    borderRadius: '5px',
    border: '3px dashed rgba(255, 255, 255, 0.5)',
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

const View = () => {
  const [, , user] = useUserRecord()
  const [isCreating, setIsCreating] = useState(false)
  const [isError, setIsError] = useState(false)
  const classes = useStyles()
  const [isLoadingDrafts, isErrorLoadingDrafts, drafts] = useMyDrafts()
  const [showRules, setShowRules] = useState(false)
  const { push } = useHistory()

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

  if (!user) {
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

export default () => (
  <>
    <Helmet>
      <title>Upload a new asset to the site | VRCArena</title>
      <meta
        name="description"
        content="Complete the form, submit it for approval and your asset will be visible on the site."
      />
    </Helmet>
    <View />
  </>
)
