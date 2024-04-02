import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  Operators,
  options,
} from '../../../../hooks/useDatabaseQuery'

import LoadingIndicator from '../../../../components/loading-indicator'
import ErrorMessage from '../../../../components/error-message'
import NoResultsMessage from '../../../../components/no-results-message'
import TextInput from '../../../../components/text-input'
import Heading from '../../../../components/heading'
import Button from '../../../../components/button'
import TagChip from '../../../../components/tag-chip'

import { callFunction } from '../../../../firebase'

const useStyles = makeStyles({
  table: {
    width: '100%',
  },
})

function AssetsTable({ assets }) {
  const classes = useStyles()

  return (
    <Paper>
      <Table className={classes.table}>
        <TableBody>
          {assets.map(({ id, title, thumbnailUrl, tags }) => (
            <TableRow key={id}>
              <TableCell>
                <img src={thumbnailUrl} width={50} height={50} alt="Thumb" />
              </TableCell>
              <TableCell>{title}</TableCell>
              <TableCell>
                {tags.map((tag) => (
                  <TagChip key={tag} tagName={tag} />
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}

const AssetsOutput = ({ tagToSearch, onConfirmWithIds }) => {
  let [isLoading, isErrored, assets] = useDatabaseQuery(
    CollectionNames.Assets,
    tagToSearch
      ? [[AssetFieldNames.tags, Operators.ARRAY_CONTAINS, tagToSearch]]
      : false,
    { [options.subscribe]: false }
  )

  if (!assets || isLoading) {
    return <LoadingIndicator message="Finding assets with those tags..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get assets</ErrorMessage>
  }

  if (!assets.length) {
    return <NoResultsMessage />
  }

  return (
    <>
      <AssetsTable assets={assets} />
      <Button onClick={() => onConfirmWithIds(assets.map(({ id }) => id))}>
        Yes - next step
      </Button>
    </>
  )
}

const Steps = {
  Search: 0,
  ConfirmAssets: 1,
  Operation: 2,
  ConfirmOperation: 3,
  Editing: 4,
  Done: 5,
}

const OperationNames = {
  Add: 'add',
  Remove: 'remove',
  Rename: 'rename',
}

export default () => {
  const [tagToSearch, setTagToSearch] = useState(null)
  const [stepIdx, setStepIdx] = useState(Steps.Search)
  const [operationName, setOperationName] = useState(OperationNames.Add)
  const [assetIds, setAssetIds] = useState([])
  const [tag, setTag] = useState(null)
  const [additionalTag, setAdditionalTag] = useState(null)

  const onConfirmWithIds = (ids) => {
    setAssetIds(ids)
    setTag(tagToSearch)
    setStepIdx(Steps.Operation)
  }

  const performOperation = async () => {
    try {
      setStepIdx(Steps.Editing)

      await callFunction('bulkEditTags', {
        assetIds,
        operationName,
        tag,
        additionalTag,
      })

      setStepIdx(Steps.Done)
    } catch (err) {
      console.error(err)
    }
  }

  switch (stepIdx) {
    case Steps.Search:
      return (
        <>
          <Heading variant="h2">Step 1: Search For Assets</Heading>
          <p>
            This form allows you to edit the tags of multiple assets at once.
          </p>
          <TextInput
            value={tagToSearch}
            onChange={(e) => setTagToSearch(e.target.value)}
          />
          <Button onClick={() => setStepIdx(Steps.ConfirmAssets)}>
            Perform Search
          </Button>
        </>
      )

    case Steps.ConfirmAssets:
      return (
        <>
          <Heading variant="h2">Step 2: Confirm Assets</Heading>
          <p>The operation will be applied to these assets.</p>
          <AssetsOutput
            tagToSearch={tagToSearch}
            onConfirmWithIds={onConfirmWithIds}
          />
          <Button
            onClick={() => {
              setTagToSearch(null)
              setStepIdx(Steps.Search)
            }}
            color="default">
            No - return to search
          </Button>
        </>
      )

    case Steps.Operation:
      return (
        <>
          <Heading variant="h2">Step 3: Operation</Heading>
          <p>Pick your operation:</p>
          <Select
            value={operationName}
            variant="outlined"
            onChange={(e) => setOperationName(e.target.value)}>
            {Object.entries(OperationNames).map(([label, value]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
          <br />
          <>
            Choose the tag:{' '}
            <TextInput value={tag} onChange={(e) => setTag(e.target.value)} />
            <br />
          </>
          {operationName === OperationNames.Rename && (
            <>
              Choose a new tag to rename to:{' '}
              <TextInput
                value={additionalTag}
                onChange={(e) => setAdditionalTag(e.target.value)}
              />
              <br />
            </>
          )}
          <Button onClick={() => setStepIdx(Steps.ConfirmOperation)}>
            Confirm
          </Button>
        </>
      )

    case Steps.ConfirmOperation:
      return (
        <>
          <Heading variant="h2">Step 4: Confirm Operation</Heading>
          <p>Confirm the bulk editing operation:</p>
          <strong>{assetIds.length} assets</strong> perform operation{' '}
          <strong>{operationName}</strong> with tag <strong>{tag}</strong>{' '}
          {additionalTag ? (
            <>
              to <strong>{additionalTag}</strong>
            </>
          ) : null}
          <p>
            <span style={{ color: 'red' }}>
              Warning this operation cannot be undone!
            </span>
          </p>
          <p>
            <span style={{ color: 'orange' }}>
              Warning this operation will trigger side-effects for each asset
              modified (for example it might send a notification or something)
            </span>
          </p>
          <p>
            <span style={{ color: 'orange' }}>
              Note that your name will be set as the person who last modified
              each asset
            </span>
          </p>
          <Button onClick={() => performOperation()}>Perform Operation</Button>
        </>
      )

    case Steps.Editing:
      return (
        <>
          <Heading variant="h2">Step 5: Editing</Heading>
          <p>Performing the operation...</p>
        </>
      )

    case Steps.Done:
      return (
        <>
          <Heading variant="h2">Done</Heading>
          <p>Operation has been complete!</p>
        </>
      )

    default:
      return 'Unknown step'
  }
}
