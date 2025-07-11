import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import GetAppIcon from '@mui/icons-material/GetApp'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { handleError } from '../../error-handling'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'
import { trackAction } from '../../analytics'

const useStyles = makeStyles({
  root: {
    marginBottom: '10px',
  },
  details: {
    '& a': {
      padding: '10px',
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'inherit',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.15)',
      },
    },
  },
  button: {
    marginTop: '10px',
  },
  icon: {
    fontSize: 'inherit',
  },
})

// source: https://www.seancdavis.com/posts/extract-github-repo-name-from-url-using-javascript/
const getGitHubAuthorAndRepoName = (url: string): string | null => {
  if (!url) return null
  const match = url.match(
    /^https?:\/\/(www\.)?github.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+)/
  )
  if (!match || !match.groups || !match.groups.owner || !match.groups.name)
    return null
  return `${match.groups.owner}/${match.groups.name}`
}

const getButtonLabelFromAssetName = (name: string): string =>
  `.${name.split('.').pop()}`

interface GitHubAsset {
  name: string
  browser_download_url: string
  content_type: string
}

const ReleaseAsset = ({
  asset: { name, browser_download_url },
}: {
  asset: GitHubAsset
}) => {
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

const getBestNameForRelease = ({ name, tag_name }: GitHubRelease): string =>
  tag_name || name

const mimeTypesSortedByBest = [
  'application/x-gzip', // .unitypackage
  'application/vnd.microsoft.portable-executable',
  'application/zip',
  'application/x-rar-compressed',
  'application/octet-stream', // dll and some .exe
  'application/x-msdownload', // exe
]

const getBestAsset = (assets: GitHubAsset[]): GitHubAsset | null => {
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

interface GitHubRelease {
  name: string
  tag_name: string
  prerelease: boolean
  assets: GitHubAsset[]
  html_url: string
}

enum ErrorCode {
  FailedToFetch,
  NotFound,
  Unknown,
}

class ResponseNotOkError extends Error {
  status: number
  statusText: string
  constructor(message: string, status: number, statusText: string) {
    super(message)
    this.status = status
    this.statusText = statusText
  }
}

export default ({
  gitHubUrl,
  showErrorOnNotFound = true,
}: {
  gitHubUrl: string
  showErrorOnNotFound: boolean
}) => {
  const [results, setResults] = useState<GitHubRelease[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastErrorCode, setLastErrorCode] = useState<null | ErrorCode>(null)
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
              Accept: 'application/vnd.github.v3+json',
            }),
          }
        )

        if (!resp.ok) {
          throw new ResponseNotOkError(
            `Response not ok`,
            resp.status,
            resp.statusText
          )
        }

        const newData = await resp.json()

        setResults(newData)
        setIsLoading(false)
        setLastErrorCode(null)
      } catch (err) {
        setIsLoading(false)
        console.error(err)

        // ignore this useless error
        if ((err as Error).message === 'Failed to fetch') {
          setLastErrorCode(ErrorCode.FailedToFetch)
          return
        }

        if (err instanceof ResponseNotOkError) {
          setLastErrorCode(
            err.status === 404 ? ErrorCode.NotFound : ErrorCode.Unknown
          )
          return
        }

        handleError(err)
        setLastErrorCode(ErrorCode.Unknown)
      }
    })()
  }, [gitHubUrl])

  if (!gitHubUrl || !results || (results && results.length === 0)) {
    return null
  }

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to get details from GitHub (
        {lastErrorCode === ErrorCode.NotFound
          ? 'repo not found'
          : `code ${lastErrorCode}`}
        )
      </ErrorMessage>
    )
  }

  const latestNonBetaRelease = results.find(
    (result) => result.prerelease !== true
  )

  if (!latestNonBetaRelease) {
    return null
  }

  const { html_url: url, assets } = latestNonBetaRelease

  const bestAsset = getBestAsset(assets)

  return (
    <div className={classes.root}>
      <div className={classes.details}>
        <a href={url} target="_blank" rel="noopener noreferrer">
          View release details: {getBestNameForRelease(latestNonBetaRelease)}{' '}
          <OpenInNewIcon className={classes.icon} />
        </a>
      </div>
      {bestAsset ? <ReleaseAsset asset={bestAsset} /> : null}
    </div>
  )
}
