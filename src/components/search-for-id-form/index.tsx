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
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import { CollectionNames as SpeciesCollectionNames } from '../../modules/species'

const useStyles = makeStyles({
  textInput: {
    width: '100%'
  },
  row: {
    marginTop: '1rem'
  },
  assets: {
    display: 'flex'
  },
  button: {
    margin: '0 0.5rem 0.5rem 0'
  },
  results: {
    display: 'flex',
    flexWrap: 'wrap'
  }
})

const getSearchStatementForCollectionName = (collectionName: string) => {
  switch (collectionName) {
    case CollectionNames.Assets:
      return `${AssetFieldNames.title}, ${AssetFieldNames.description}, ${
        AssetFieldNames.thumbnailUrl
      }, ${AssetFieldNames.tags}, ${AssetFieldNames.isAdult}`
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

const getTableOrViewNameForCollectionName = (collectionName: string) => {
  switch (collectionName) {
    case CollectionNames.Authors:
      return 'getpublicauthors'
    case CollectionNames.DiscordServers:
      return 'getpublicdiscordservers'
    case CollectionNames.Comments:
      return 'getpubliccomments'
    default:
      return collectionName
  }
}

type SearchResult = { [prop: string]: any }

function SearchForm({
  existingId,
  collectionName,
  searchTerm,
  fieldAsLabel,
  onClickWithIdAndDetails,
  renderer: Renderer = undefined
}: {
  existingId?: string
  collectionName: string
  searchTerm: string
  fieldAsLabel: string
  onClickWithIdAndDetails: (id: string, details: any) => void
  renderer?: (props: { result: any; onClick: () => void }) => React.ReactElement
}) {
  const [isSearching, isErrored, results] = useSearching<SearchResult[]>(
    getTableOrViewNameForCollectionName(collectionName),
    searchTerm,
    getSearchStatementForCollectionName(collectionName),
    getFieldsToSearchForCollectionName(collectionName)
  )

  const classes = useStyles()

  if (isSearching) {
    return <>Searching...</>
  }

  if (isErrored) {
    return <>Errored</>
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
        {results.map(result =>
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
              {result[fieldAsLabel]}
            </Button>
          )
        )}
      </div>
    </>
  )
}

export default ({
  collectionName,
  fieldAsLabel,
  onClickWithIdAndDetails,
  renderer = undefined
}: {
  collectionName: string
  fieldAsLabel: string
  onClickWithIdAndDetails: (id: string, details: any) => void
  renderer?: (props: { result: any }) => React.ReactElement
}) => {
  const [searchTerm, setSearchTerm] = useState<string | null>(null)
  const classes = useStyles()

  return (
    <>
      <div className={classes.row}>
        {searchTerm && (
          <>
            <SearchForm
              collectionName={collectionName}
              searchTerm={searchTerm}
              fieldAsLabel={fieldAsLabel}
              onClickWithIdAndDetails={onClickWithIdAndDetails}
              renderer={renderer}
            />
          </>
        )}
      </div>

      <div className={classes.row}>
        Search:
        <TextInput
          onChange={e => setSearchTerm(e.target.value)}
          value={searchTerm || ''}
          className={classes.textInput}
        />
      </div>
    </>
  )
}
