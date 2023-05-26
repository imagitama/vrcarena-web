import React, { useEffect, useState } from 'react'
import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import { makeStyles } from '@material-ui/core/styles'

import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'
import useUserId from '../../hooks/useUserId'
import {
  CollectionNames,
  UserMetaFieldNames,
  options,
  PatreonStatuses
} from '../../hooks/useDatabaseQuery'

import Button from '../button'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Paper from '../paper'
import Heading from '../heading'
import useDataStoreItem from '../../hooks/useDataStoreItem'

const patreonOAuthUrl = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${
  process.env.REACT_APP_PATREON_CLIENT_ID
}&redirect_uri=${
  process.env.REACT_APP_PATREON_REDIRECT_URI
}&scope=identity%20campaigns.members`
let oauthCode

const getPatreonUserInfoWithCode = oauthCode => {
  return callFunction('getPatreonUserInfo', {
    code: oauthCode
  })
}

const useStyles = makeStyles({
  connectedMessage: {
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    fontSize: '150%',
    marginRight: '1rem'
  },
  rewardItem: {
    marginBottom: '0.5rem'
  }
})

const rewardMetaById = {
  '4508629': {
    title: 'Pedestals',
    description:
      'When you edit an asset you can upload a special 360 degree video of your asset to show it off. Instructions are in our Discord server under #patrons.'
  },
  '4508436': {
    title: 'Shout-out on the site',
    description:
      'Your name and avatar is listed on the Patreons page on this site (click More in navigation and click Patreon).'
  },
  '5934668': {
    title: 'Feature Asset',
    description:
      'When editing your assets you can click the Feature button and it will be randomly selected to be shown on the homepage.'
  }
}

export default () => {
  const userId = useUserId()
  const [
    isLoadingMeta,
    isErrorLoadingMeta,
    metaResult,
    hydrate
  ] = useDataStoreItem(CollectionNames.UserMeta, userId, 'usermeta-patreon')
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isErrored, setIsErrored] = useState(false)
  const classes = useStyles()

  useEffect(() => {
    async function main() {
      try {
        let queryParams = window.location.search

        if (!queryParams) {
          return
        }

        queryParams = queryParams.replace('?', '')
        queryParams = queryParams.split('&')
        queryParams = queryParams
          .map(paramWithEquals => paramWithEquals.split('='))
          .reduce((params, [key, val]) => ({ ...params, [key]: val }), {})

        if (!queryParams.code) {
          return
        }

        setIsLoading(true)
        setIsErrored(false)
        setIsComplete(false)

        oauthCode = queryParams.code

        const {
          data: { rewardIds }
        } = await getPatreonUserInfoWithCode(oauthCode)

        if (!rewardIds) {
          throw new Error(
            'Function failed to get patreon user info with code (maybe 401?)'
          )
        }

        setIsLoading(false)
        setIsErrored(false)

        setIsComplete(true)

        hydrate()
      } catch (err) {
        console.error(err)
        setIsLoading(false)
        setIsErrored(true)
        setIsComplete(false)
        handleError(err)
      }
    }

    main()
  }, [])

  const TryAgainButton = () => (
    <Button
      onClick={() => {
        setIsErrored(false)
        setIsLoading(false)
        setIsComplete(null)
      }}>
      Start Again
    </Button>
  )

  if (isLoading || isLoadingMeta) {
    return <LoadingIndicator message="Working..." />
  }

  if (isErrored || isErrorLoadingMeta) {
    return (
      <ErrorMessage>
        Failed to talk to Patreon <br />
        <br />
        <TryAgainButton />
      </ErrorMessage>
    )
  }

  const isPatron =
    metaResult &&
    metaResult[UserMetaFieldNames.patreonStatus] === PatreonStatuses.Patron

  if (isComplete || isPatron) {
    if (isPatron) {
      return (
        <>
          <Paper>
            <div className={classes.icon}>
              <CheckIcon />
            </div>
            <div>
              You have successfully connected your VRCArena account with
              Patreon!
            </div>
          </Paper>
          <p>
            You can click this button to refresh your account:{' '}
            <Button url={patreonOAuthUrl} openInNewTab={false}>
              Refresh with Patreon
            </Button>
          </p>
          <Heading variant="h3">Rewards</Heading>
          {metaResult[UserMetaFieldNames.patreonRewardIds].length
            ? metaResult[UserMetaFieldNames.patreonRewardIds]
                .filter(rewardId => rewardId in rewardMetaById)
                .map(rewardId => (
                  <Paper key={rewardId} className={classes.rewardItem}>
                    <strong>{rewardMetaById[rewardId].title}</strong>
                    <p>{rewardMetaById[rewardId].description}</p>
                  </Paper>
                ))
            : '(no rewards found)'}
        </>
      )
    } else {
      return (
        <>
          <Paper>
            <div className={classes.icon}>
              <CloseIcon />
            </div>
            <div>
              We successfully found your Patreon account but failed to identify
              you as a patreon of VRCArena. Please ensure you are a patron and
              try again. If it still doesn't work please contact our staff in
              our Discord.
            </div>
            <br />
            <TryAgainButton />
          </Paper>
        </>
      )
    }
  }

  return (
    <div>
      <p>
        Click the button below to open Patreon and connect your VRCArena
        account. Then depending on your pledge amount you will receive your
        benefits.
      </p>
      <Button url={patreonOAuthUrl} openInNewTab={false}>
        Connect with Patreon
      </Button>
    </div>
  )
}
