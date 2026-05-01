import React, { useState } from 'react'

import { messages } from '@/config'
import useSearching from '@/hooks/useSearching'
import {
  Author,
  CollectionNames as AuthorCollectionNames,
} from '@/modules/authors'

import InfoMessage from '@/components/info-message'
import WarningMessage from '@/components/warning-message'
import TextInput from '@/components/text-input'
import { cleanupSearchTerm } from '@/components/../utils'
import AuthorResults from '@/components/author-results'
import Heading from '@/components/heading'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import ClaimForm from '@/components/claim-form'
import Dialog from '@/components/dialog'

const AuthorClaims = () => {
  const [selectedAuthorId, setSelectedAuthorId] = useState<null | string>(null)
  const [userInput, setUserInput] = useState('')
  const [isLoading, lastErrorCode, hits] = useSearching<Author>(
    AuthorCollectionNames.Authors,
    cleanupSearchTerm(userInput),
    '*',
    ['name']
  )

  // const performSearch = () => {
  //   set
  // }

  const selectedAuthor: Author | undefined =
    selectedAuthorId && hits
      ? hits.find((hit) => hit.id === selectedAuthorId)
      : undefined

  return (
    <>
      {selectedAuthorId ? (
        <Dialog onClose={() => setSelectedAuthorId(null)}>
          <ClaimForm
            parentTable={AuthorCollectionNames.Authors}
            parentId={selectedAuthorId}
            parentData={selectedAuthor}
            onDone={() => setSelectedAuthorId(null)}
          />
        </Dialog>
      ) : null}
      <InfoMessage>
        Has someone else posted assets on this site on your behalf? We encourage
        it to help people find your assets! You can claim any authors here
        (optional).
      </InfoMessage>
      <WarningMessage>{messages.howClaimsWork}</WarningMessage>
      <Heading variant="h2">Search Authors</Heading>
      <TextInput
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        fullWidth
        placeholder="Type an author name"
        // button={<Button onClick={performSearch}>Search</Button>}
      />
      {isLoading ? (
        <LoadingIndicator message="Searching authors..." />
      ) : lastErrorCode !== null ? (
        <ErrorMessage>
          Failed to search: error code {lastErrorCode}
        </ErrorMessage>
      ) : hits ? (
        <AuthorResults
          authors={hits}
          onClick={(e, authorId) => {
            setSelectedAuthorId((currentId) =>
              currentId === authorId ? null : authorId
            )
            e.preventDefault()
            return false
          }}
        />
      ) : null}
    </>
  )
}

export default AuthorClaims
