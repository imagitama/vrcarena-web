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
  UserFieldNames
} from '../../hooks/useDatabaseQuery'

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

const getSearchStatementForIndex = indexName => {
  switch (indexName) {
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
    default:
      throw new Error(
        `Cannot get search statement: index ${indexName} not configured!`
      )
  }
}

const getFieldsToSearchForIndex = indexName => {
  switch (indexName) {
    case CollectionNames.Assets:
      // return [AssetFieldNames.title, AssetFieldNames.tags]
      return [AssetFieldNames.title]
    case CollectionNames.Users:
      return [UserFieldNames.username]
    case CollectionNames.Authors:
      return [AuthorFieldNames.name]
    case CollectionNames.DiscordServers:
      return [DiscordServerFieldNames.name]
    default:
      throw new Error(
        `Cannot get search statement: index ${indexName} not configured!`
      )
  }
}

const getTableOrViewNameForIndex = indexName => {
  switch (indexName) {
    case CollectionNames.Authors:
      return 'getpublicauthors'
    case CollectionNames.DiscordServers:
      return 'getpublicdiscordservers'
    case CollectionNames.Comments:
      return 'getpubliccomments'
    default:
      return indexName
  }
}

function SearchForm({
  indexName,
  searchTerm,
  fieldAsLabel,
  onClickWithIdAndDetails,
  renderer: Renderer = null
}) {
  const [isSearching, isErrored, results] = useSearching(
    getTableOrViewNameForIndex(indexName),
    searchTerm,
    getSearchStatementForIndex(indexName),
    getFieldsToSearchForIndex(indexName)
    // getQuery
  )
  const classes = useStyles()

  if (isSearching) {
    return 'Searching...'
  }

  if (isErrored) {
    return 'Errored'
  }

  if (!results) {
    return null
  }

  if (!results.length) {
    return 'No results!'
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

// TODO: Rename onDone to onClickWithIdAndDetails
export default ({ indexName, fieldAsLabel, onDone, renderer }) => {
  const [searchTerm, setSearchTerm] = useState(null)
  const classes = useStyles()

  return (
    <>
      <div className={classes.row}>
        {searchTerm && (
          <>
            <SearchForm
              indexName={indexName}
              searchTerm={searchTerm}
              fieldAsLabel={fieldAsLabel}
              onClickWithIdAndDetails={onDone}
              renderer={renderer}
            />
          </>
        )}
      </div>

      <div className={classes.row}>
        Search:
        <TextInput
          onChange={e => setSearchTerm(e.target.value)}
          value={searchTerm}
          variant="filled"
          className={classes.textInput}
        />
      </div>
    </>
  )
}
