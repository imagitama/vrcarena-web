import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useSearching from '../../hooks/useSearching'
import TextInput from '../text-input'
import Button from '../button'
import {
  AssetFieldNames,
  AuthorFieldNames,
  CollectionNames,
  DiscordServerFieldNames,
  SpeciesFieldNames,
  UserFieldNames,
} from '../../hooks/useDatabaseQuery'
import { CollectionNames as SpeciesCollectionNames } from '../../modules/species'
import { ViewNames } from '../../modules/discordservers'

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
    display: 'flex',
    flexWrap: 'wrap',
  },
})

// TODO: Use enums and types
const getSearchStatementForCollectionName = (collectionName: string) => {
  switch (collectionName) {
    case CollectionNames.Assets:
      return `${AssetFieldNames.title}, ${AssetFieldNames.description}, ${AssetFieldNames.thumbnailUrl}, ${AssetFieldNames.tags}, ${AssetFieldNames.isAdult}`
    case CollectionNames.Users:
      return `${UserFieldNames.username}, ${UserFieldNames.avatarUrl}`
    case CollectionNames.Authors:
      return `${AuthorFieldNames.name}, ${AuthorFieldNames.avatarUrl}`
    case CollectionNames.DiscordServers:
      return DiscordServerFieldNames.name
    case SpeciesCollectionNames.Species:
      return `${SpeciesFieldNames.pluralName}`
    default:
      throw new Error(
        `Cannot get search statement: index ${collectionName} not configured!`
      )
  }
}

// TODO: Use enums and types
const getFieldsToSearchForCollectionName = (collectionName: string) => {
  switch (collectionName) {
    case CollectionNames.Assets:
      return [AssetFieldNames.title]
    case CollectionNames.Users:
      return [UserFieldNames.username]
    case CollectionNames.Authors:
      return [AuthorFieldNames.name]
    case CollectionNames.DiscordServers:
      return [DiscordServerFieldNames.name]
    case SpeciesCollectionNames.Species:
      return [SpeciesFieldNames.pluralName]
    default:
      throw new Error(
        `Cannot get search statement: index ${collectionName} not configured!`
      )
  }
}

// TODO: Use enums and types
const getTableOrViewNameForCollectionName = (collectionName: string) => {
  switch (collectionName) {
    case CollectionNames.Authors:
      return 'getpublicauthors'
    case CollectionNames.DiscordServers:
      return ViewNames.GetPublicDiscordServers
    case CollectionNames.Comments:
      return 'getpubliccomments'
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
  const [isSearching, lastErrorCode, results] = useSearching<SearchResult>(
    getTableOrViewNameForCollectionName(collectionName),
    searchTerm,
    getSearchStatementForCollectionName(collectionName),
    getFieldsToSearchForCollectionName(collectionName)
  )

  const classes = useStyles()

  if (isSearching) {
    return <>Searching...</>
  }

  if (lastErrorCode !== null) {
    return <>Error: {lastErrorCode}</>
  }

  if (!results) {
    return null
  }

  if (!results.length) {
    return <>No results!</>
  }

  return (
    <>
      Select a result:
      <div className={classes.results}>
        {results.map((result) =>
          Renderer ? (
            <Renderer
              key={result.id}
              result={result}
              onClick={() => onClickWithIdAndDetails(result.id, result)}
            />
          ) : (
            <Button
              key={result.id}
              onClick={() => onClickWithIdAndDetails(result.id, result)}
              color="default"
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
