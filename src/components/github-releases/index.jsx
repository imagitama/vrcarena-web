import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import GetAppIcon from '@material-ui/icons/GetApp'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import { handleError } from '../../error-handling'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'
import { trackAction } from '../../analytics'

const useStyles = makeStyles({
  root: {
    marginBottom: '10px'
  },
  details: {
    '& a': {
      display: 'block',
      padding: '10px',
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'inherit',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.15)'
      }
    }
  },
  button: {
    marginTop: '10px'
  },
  icon: {
    fontSize: 'inherit'
  }
})

// source: https://www.seancdavis.com/posts/extract-github-repo-name-from-url-using-javascript/
const getGitHubAuthorAndRepoName = url => {
  if (!url) return null
  const match = url.match(
    /^https?:\/\/(www\.)?github.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+)/
  )
  if (!match || !match.groups || !match.groups.owner || !match.groups.name)
    return null
  return `${match.groups.owner}/${match.groups.name}`
}

const getButtonLabelFromAssetName = name => `.${name.split('.').pop()}`

const ReleaseAsset = ({ asset: { name, browser_download_url } }) => {
  const classes = useStyles()
  return (
    <Button
      url={browser_download_url}
      icon={<GetAppIcon />}
      onClick={() => trackAction('ViewAsset', 'Download GitHub asset', name)}
      className={classes.button}>
      Download {getButtonLabelFromAssetName(name)}
    </Button>
  )
}

const getBestNameForRelease = ({ name, tag_name }) => tag_name || name

const mimeTypesSortedByBest = [
  'application/x-gzip', // .unitypackage
  'application/vnd.microsoft.portable-executable',
  'application/zip',
  'application/x-rar-compressed',
  'application/octet-stream', // dll and some .exe
  'application/x-msdownload' // exe
]

const getBestAsset = assets => {
  if (!assets.length) {
    return null
  }

  return assets.reduce((bestAsset, asset) => {
    const mimeType = asset.content_type
    const indexOfThisMimeType = mimeTypesSortedByBest.indexOf(mimeType)
    const indexOfBestMimeType = mimeTypesSortedByBest.indexOf(
      bestAsset.content_type
    )

    if (
      indexOfThisMimeType !== -1 &&
      indexOfThisMimeType < indexOfBestMimeType
    ) {
      return asset
    }

    return bestAsset
  }, assets[0])
}

export default ({ gitHubUrl, showErrorOnNotFound = true }) => {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isErrored, setIsErrored] = useState(false)
  const classes = useStyles()

  useEffect(() => {
    if (!gitHubUrl) {
      return
    }

    ;(async () => {
      try {
        const authorAndRepoName = getGitHubAuthorAndRepoName(gitHubUrl)

        if (!authorAndRepoName) {
          throw new Error(
            `Could not get author and repo name from GitHub URL: ${gitHubUrl}`
          )
        }

        // https://docs.github.com/en/rest/releases/releases
        const resp = await fetch(
          `https://api.github.com/repos/${authorAndRepoName}/releases`,
          {
            method: 'GET',
            headers: new Headers({
              Accept: 'application/vnd.github.v3+json'
            })
          }
        )

        if (!resp.ok) {
          if (
            (resp.status === 404 && showErrorOnNotFound) ||
            resp.status !== 404
          ) {
            throw new Error(
              `Response not ok! Status ${resp.status} ${resp.statusText}`
            )
          } else {
            return
          }
        }

        const newData = await resp.json()

        setResult(newData)
        setIsLoading(false)
        setIsErrored(false)
      } catch (err) {
        setIsErrored(true)
        setIsLoading(false)
        console.error(err)

        // ignore this useless error
        if (err.message === 'Failed to fetch') {
          return
        }

        handleError(err)
      }
    })()
  }, [gitHubUrl])

  if (!gitHubUrl || (result && result.length === 0)) {
    return null
  }

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get details from GitHub</ErrorMessage>
  }

  const latestRelease = result[0]

  const { html_url: url, assets } = latestRelease

  const bestAsset = getBestAsset(assets)

  return (
    <div className={classes.root}>
      <div className={classes.details}>
        <a href={url} target="_blank" rel="noopener noreferrer">
          View release details: {getBestNameForRelease(latestRelease)}{' '}
          <OpenInNewIcon className={classes.icon} />
        </a>
      </div>
      {bestAsset ? <ReleaseAsset asset={bestAsset} /> : null}
    </div>
  )
}
