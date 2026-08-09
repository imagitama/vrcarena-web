import React, { useCallback, useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { Helmet } from '@unhead/react/helmet'
import ClearIcon from '@mui/icons-material/Clear'
import CheckIcon from '@mui/icons-material/Check'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import AddIcon from '@mui/icons-material/Add'

import * as routes from '@/routes'
import {
  BacklogItemType,
  CollectionNames,
  BacklogItem,
} from '@/modules/backlog'
import { getIsUrl } from '@/utils'

import useQueryParam from '@/hooks/useQueryParam'
import useDataStoreCreate from '@/hooks/useDataStoreCreate'

import Button from '@/components/button'
import Paper from '@/components/paper'
import Heading from '@/components/heading'
import Select, { MenuItem } from '@/components/select'
import UrlInput from '@/components/url-input'
import FormControls from '@/components/form-controls'
import ErrorMessage from '@/components/error-message'
import LoadingIndicator from '@/components/loading-indicator'
import SuccessMessage from '@/components/success-message'
import { PostgresErrorCode } from '@/data-store'

const URL_QUERY_PARAM_NAME = 'url'

const Form = ({ onDone }: { onDone: () => void }) => {
  const urlFromQueryParam = useQueryParam(URL_QUERY_PARAM_NAME)
  const [selectedType, setSelectedType] = useState(BacklogItemType.Asset)
  const [urlTextVal, setUrlTextVal] = useState(urlFromQueryParam || '')
  const [isCreating, isSuccess, lastErrorCode, create, clear] =
    useDataStoreCreate<BacklogItem>(CollectionNames.BacklogItems)
  const [isInvalid, setIsInvalid] = useState(false)

  const onClickSubmit = async () => {
    setIsInvalid(false)

    let urlToUse = urlTextVal.trim()

    if (!getIsUrl(urlToUse)) {
      setIsInvalid(true)
      return
    }

    await create({
      type: selectedType,
      url: urlToUse,
    })
  }

  const isBusy = isCreating

  const reset = () => {
    setIsInvalid(false)
    setSelectedType(BacklogItemType.Asset)
    setUrlTextVal('')
    clear()
  }

  return (
    <Paper>
      <Heading variant="h2" noTopMargin>
        Add To Backlog
      </Heading>
      {/* TODO: move FormControl stuff to <Select> */}
      <FormControl>
        <InputLabel>Type</InputLabel>
        <Select
          label="Type"
          onChange={(e) => setSelectedType(e.target.value as BacklogItemType)}
          value={selectedType}>
          <MenuItem value={BacklogItemType.Asset}>Asset</MenuItem>
          <MenuItem value={BacklogItemType.Author}>Author</MenuItem>
        </Select>
      </FormControl>
      <br />
      <br />
      <UrlInput value={urlTextVal} onChange={(val) => setUrlTextVal(val)} />
      {isInvalid && (
        <ErrorMessage>
          URL is not valid. It should look something like
          "https://gumroad.com/xyz" (with http/https).
        </ErrorMessage>
      )}
      <FormControls>
        <Button icon={<ClearIcon />} color="secondary" isDisabled={isBusy}>
          Cancel
        </Button>
        <Button
          icon={<CheckIcon />}
          onClick={onClickSubmit}
          isDisabled={isBusy}>
          Submit
        </Button>
      </FormControls>
      {isCreating ? (
        <LoadingIndicator message="Adding to backlog..." />
      ) : isSuccess ? (
        <SuccessMessage
          controls={[
            <Button onClick={reset} color="secondary">
              Add Another
            </Button>,
            <Button onClick={onDone}>Close Form</Button>,
          ]}>
          Added to backlog successfully!
        </SuccessMessage>
      ) : lastErrorCode !== null ? (
        <ErrorMessage>
          Failed to add to backlog:{' '}
          {lastErrorCode === PostgresErrorCode.UniqueViolation
            ? 'URL is already in the backlog'
            : `code ${lastErrorCode}`}
        </ErrorMessage>
      ) : null}
    </Paper>
  )
}

export default Form
