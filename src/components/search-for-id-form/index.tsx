import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'

import useSearching from '../../hooks/useSearching'
import TextInput from '../text-input'
import Button from '../button'
import { CollectionNames as SpeciesCollectionNames } from '../../modules/species'
import {
  ViewNames as DiscordServersViewNames,
  CollectionNames as DiscordServersCollectionNames,
} from '../../modules/discordservers'
import {
  ViewNames as UsersViewNames,
  CollectionNames as UsersCollectionNames,
} from '../../modules/users'
import {
  ViewNames as AuthorsViewNames,
  CollectionNames as AuthorsCollectionNames,
} from '../../modules/authors'
import {
  ViewNames as AssetsViewNames,
  CollectionNames as AssetsCollectionNames,
} from '../../modules/assets'
import {
  ViewNames as CommentsViewNames,
  CollectionNames as CommentsCollectionNames,
} from '../../modules/comments'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import NoResultsMessage from '../no-results-message'

const useStyles = makeStyles({
  textInput: {
    width: '100%',
  },
  row: {
    marginTop: '1rem',
    '&:first-child': {
      marginTop: 0,
    },
  },
  assets: {
    display: 'flex',
  },
  button: {
    margin: '0 0.5rem 0.5rem 0',
  },
  results: {
    marginTop: '0.25rem',
    display: 'flex',
    flexWrap: 'wrap',
  },
})

// TODO: Use enums and types
const getSearchStatementForCollectionName = (collectionName: string) => {
  switch (collectionName) {
    case AssetsCollectionNames.Assets:
      return `title, description, thumbnailUrl, tags, isAdult`
    case UsersCollectionNames.Users:
      return `username, avatarurl`
    case AuthorsCollectionNames.Authors:
      return `name, avatarurl`
    case DiscordServersCollectionNames.DiscordServers:
      return 'name'
    case SpeciesCollectionNames.Species:
      return `pluralname`
    default:
      throw new Error(
        `Cannot get search statement: index ${collectionName} not configured!`
      )
  }
}

// TODO: Use enums and types
const getFieldsToSearchForCollectionName = (
  collectionName: string
): string[] => {
  switch (collectionName) {
    case AssetsCollectionNames.Assets:
      return ['title']
    case UsersCollectionNames.Users:
      return ['username']
    case AuthorsCollectionNames.Authors:
      return ['name']
    case DiscordServersCollectionNames.DiscordServers:
      return ['name']
    case SpeciesCollectionNames.Species:
      return ['pluralname']
    default:
      throw new Error(
        `Cannot get search statement: index ${collectionName} not configured!`
      )
  }
}

const getTableOrViewNameForCollectionName = (collectionName: string) => {
  switch (collectionName) {
    case AuthorsCollectionNames.Authors:
      return AuthorsViewNames.GetPublicAuthors
    case DiscordServersCollectionNames.DiscordServers:
      return DiscordServersViewNames.GetPublicDiscordServers
    case CommentsCollectionNames.Comments:
      return CommentsViewNames.GetPublicComments
    default:
      return collectionName
  }
}

type SearchResult = { [prop: string]: any }

function SearchForm({
  collectionName,
  searchTerm,
  fieldAsLabel,
  onClickWithIdAndDetails,
  renderer: Renderer = undefined,
}: {
  existingId?: string
  collectionName: string
  searchTerm: string
  fieldAsLabel?: string
  onClickWithIdAndDetails: (id: string, details: any) => void
  renderer?: (props: { result: any; onClick: () => void }) => React.ReactElement
}) {
  const [isSearching, lastErrorCode, results, clear] =
    useSearching<SearchResult>(
      getTableOrViewNameForCollectionName(collectionName),
      searchTerm,
      getSearchStatementForCollectionName(collectionName),
      getFieldsToSearchForCollectionName(collectionName)
    )

  const classes = useStyles()

  if (isSearching) {
    return <LoadingIndicator message="Searching..." />
  }

  if (lastErrorCode !== null) {
    return <ErrorMessage>Faileld to search (code {lastErrorCode})</ErrorMessage>
  }

  if (!results) {
    return null
  }

  if (!results.length) {
    return <NoResultsMessage>No results found</NoResultsMessage>
  }

  return (
    <>
      <strong>Select a search result:</strong>
      <div className={classes.results}>
        {results.map((result) =>
          Renderer ? (
            <Renderer
              key={result.id}
              result={result}
              onClick={() => {
                onClickWithIdAndDetails(result.id, result)
                clear()
              }}
            />
          ) : (
            <Button
              key={result.id}
              onClick={() => {
                onClickWithIdAndDetails(result.id, result)
                clear()
              }}
              color="secondary"
              className={classes.button}>
              {fieldAsLabel ? result[fieldAsLabel] : '(no label)'}
            </Button>
          )
        )}
      </div>
    </>
  )
}

export default ({
  label = 'Search',
  collectionName,
  fieldAsLabel,
  onClickWithIdAndDetails,
  renderer = undefined,
}: {
  label?: string
  collectionName: string
  fieldAsLabel?: string
  onClickWithIdAndDetails: (id: string, details: any) => void
  renderer?: (props: { result: any; onClick: () => void }) => React.ReactElement
}) => {
  const [searchTerm, setSearchTerm] = useState<string | null>(null)
  const classes = useStyles()

  return (
    <>
      {searchTerm && (
        <div className={classes.row}>
          <SearchForm
            collectionName={collectionName}
            searchTerm={searchTerm}
            fieldAsLabel={fieldAsLabel}
            onClickWithIdAndDetails={onClickWithIdAndDetails}
            renderer={renderer}
          />
        </div>
      )}

      <div className={classes.row}>
        <TextInput
          label={label}
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm || ''}
          className={classes.textInput}
          placeholder="Enter a search term"
        />
      </div>
    </>
  )
}
