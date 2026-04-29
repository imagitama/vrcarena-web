import React, { useState } from 'react'
import PanToolIcon from '@mui/icons-material/PanTool'
import Button from '@/components/button'
import {
  Author,
  CollectionNames as AuthorCollectionNames,
} from '@/modules/authors'
import {
  Claim,
  CollectionNames as ClaimCollectionNames,
} from '@/modules/claims'
import useDataStoreCreate from '@/hooks/useDataStoreCreate'
import { handleError } from '@/error-handling'
import useDataStoreExists from '@/hooks/useDataStoreExists'
import { Operators } from '@/hooks/useDatabaseQuery'
import useUserId from '@/hooks/useUserId'

import InfoMessage from '@/components/info-message'
import AuthorResultsItem from '@/components/author-results-item'
import SuccessMessage from '@/components/success-message'
import TextInput from '@/components/text-input'
import Heading from '@/components/heading'
import ErrorMessage from '@/components/error-message'
import FormControls from '@/components/form-controls'
import LoadingIndicator from '@/components/loading-indicator'

const Renderer = <TData,>({
  parentTable,
  parentId,
  parentData,
}: {
  parentTable: string
  parentId: string
  parentData: TData
}) => {
  switch (parentTable) {
    case AuthorCollectionNames.Authors:
      return <AuthorResultsItem author={parentData as unknown as Author} />
    default:
      return <>No renderer</>
  }
}

const ClaimForm = <TData,>({
  parentTable,
  parentId,
  parentData,
  onDone,
}: {
  parentTable: string
  parentId: string
  parentData: TData
  onDone: () => void
}) => {
  const userId = useUserId()
  const [isLoading, lastErrorCodeExists, doesExist] = useDataStoreExists<Claim>(
    ClaimCollectionNames.Claims,
    [
      ['parent', Operators.EQUALS, parentId],
      ['createdby', Operators.EQUALS, userId!],
    ]
  )
  const [comments, setComments] = useState('')
  const [isCreating, isSuccess, lastErrorCode, create] =
    useDataStoreCreate<Claim>(ClaimCollectionNames.Claims, {
      queryName: 'claim-form',
    })

  if (doesExist === true) {
    return (
      <InfoMessage onOkay={onDone}>You have already claimed this</InfoMessage>
    )
  }

  const onClickClaim = async () => {
    try {
      await create({
        parenttable: parentTable,
        parent: parentId,
        comments,
      })
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      <Renderer<TData>
        parentTable={parentTable}
        parentId={parentId}
        parentData={parentData}
      />
      <Heading variant="h2" noMargin>
        Comments
      </Heading>
      <p>
        Explain why you want to claim this. Include links to any supporting info
        such as your Bluesky page, etc.
      </p>
      <TextInput
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        isDisabled={isCreating}
        multiline
        rows={3}
        fullWidth
      />
      <FormControls>
        <Button
          onClick={onClickClaim}
          isDisabled={isCreating}
          size="large"
          icon={<PanToolIcon />}>
          Create Claim
        </Button>
        <Button
          onClick={onDone}
          isDisabled={isCreating}
          size="large"
          color="secondary">
          Cancel
        </Button>
      </FormControls>
      {isCreating ? (
        <LoadingIndicator message="Creating claim..." />
      ) : lastErrorCode !== null ? (
        <ErrorMessage>
          Failed to insert claim: error code {lastErrorCode}
        </ErrorMessage>
      ) : isSuccess ? (
        <SuccessMessage controls={<Button onClick={onDone}>Close This</Button>}>
          Your claim has been added! You can view your claims in My Account
          under tab "My Claims"
        </SuccessMessage>
      ) : null}
    </>
  )
}

export default ClaimForm
