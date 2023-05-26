import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'

import useSearching from '../../hooks/useSearching'
import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import AssetResults from '../asset-results'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'
import useAssetSearch from '../../hooks/useAssetSearch'

const useStyles = makeStyles({
  input: {
    width: '100%'
  },
  controls: {
    textAlign: 'center',
    margin: '0.5rem 0'
  }
})

export default ({ categoryName, onDone }) => {
  const [searchTerm, setSearchTerm] = useState()
  const [isSearching, isError, hits] = useAssetSearch(searchTerm)
  const classes = useStyles()

  return (
    <>
      <p>Enter the title of the asset below:</p>
      <TextField
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        variant="outlined"
        className={classes.input}
      />
      {isSearching ? (
        <LoadingIndicator message="Finding if it has already been uploaded..." />
      ) : isError ? (
        <ErrorMessage>
          Failed to perform search
          {searchTerm && (
            <Button onClick={() => onDone(searchTerm)}>Continue</Button>
          )}
        </ErrorMessage>
      ) : searchTerm ? (
        hits && hits.length ? (
          <>
            <p>
              <strong>
                We found the follow assets for category "{categoryName}". Are
                you sure your asset hasn't already been uploaded?
              </strong>
            </p>
            <div className={classes.controls}>
              {searchTerm && !isSearching && (
                <Button onClick={() => onDone(searchTerm)}>
                  I'm sure - let's continue
                </Button>
              )}
            </div>
            <AssetResults assets={hits} />
          </>
        ) : (
          <>
            No results found
            <div className={classes.controls}>
              {<Button onClick={() => onDone(searchTerm)}>Continue</Button>}
            </div>
          </>
        )
      ) : null}
    </>
  )
}
