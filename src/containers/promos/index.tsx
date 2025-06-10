import React from 'react'
import { makeStyles } from '@mui/styles'

import ErrorMessage from '../../components/error-message'
import Link from '../../components/link'
import LoadingIndicator from '../../components/loading-indicator'
import { viewVrchatAvatarUrlWithVar } from '../../config'
import useSupabaseView from '../../hooks/useSupabaseView'
import * as routes from '../../routes'
import Paper from '../../components/paper'

interface GetPublicAuthorsWithVrchatAvatarsResult {
  id: string
  name: string
  promourl: string
  assetsdata: {
    id: string
    thumbnailurl: string
    avatardata: {
      id: string
      imageurl: string
    }[]
  }[]
}

const useStyles = makeStyles({
  items: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  item: {
    margin: '0.25rem',
    width: '512px',
    height: '512px',
    '& img': {
      display: 'block',
      width: '100%',
      height: '100%',
    },
  },
  assets: {
    marginTop: '0.25rem',
  },
  asset: {
    width: '128px',
    height: '128px',
  },
  avatar: {
    width: '64px',
    height: '64px',
  },
})

const AuthorPromo = ({
  result,
}: {
  result: GetPublicAuthorsWithVrchatAvatarsResult
}) => {
  const classes = useStyles()
  return (
    <div className={classes.item}>
      <Link to={routes.viewAuthorWithVar.replace(':authorId', result.id)}>
        <Paper>
          <img src={result.promourl} />
        </Paper>
      </Link>
      <Paper className={classes.assets}>
        {result.assetsdata.map((assetData) => (
          <div key={assetData.id}>
            <div className={classes.asset}>
              <Link
                to={routes.viewAssetWithVar.replace(':assetId', assetData.id)}>
                <img src={assetData.thumbnailurl} />
              </Link>
            </div>
            {assetData.avatardata.map((avatarData) => (
              <div key={avatarData.id} className={classes.avatar}>
                <a
                  href={viewVrchatAvatarUrlWithVar.replace(
                    ':avatarId',
                    avatarData.id
                  )}
                  target="_blank"
                  rel="noopener noreferrer">
                  <img src={avatarData.imageurl} />
                </a>
              </div>
            ))}
          </div>
        ))}
      </Paper>
    </div>
  )
}

const PromosContainer = () => {
  const [isLoading, lastErrorCode, results] =
    useSupabaseView<GetPublicAuthorsWithVrchatAvatarsResult>(
      'getAuthorsForVrchatWorld'
    )
  const classes = useStyles()

  if (isLoading || !Array.isArray(results)) {
    return <LoadingIndicator message="Loading authors..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load authors (code {lastErrorCode})</ErrorMessage>
    )
  }

  return (
    <div className={classes.items}>
      {results.map((result) => (
        <AuthorPromo key={result.id} result={result} />
      ))}
    </div>
  )
}

export default PromosContainer
