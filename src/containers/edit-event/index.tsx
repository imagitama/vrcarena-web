import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from '@unhead/react/helmet'

import * as routes from '@/routes'
import { CollectionNames, EditableFields, Event } from '@/modules/events'
import { addDays } from '@/utils/dates'
import useIsLoggedIn from '@/hooks/useIsLoggedIn'
import useQueryParam from '@/hooks/useQueryParam'

import GenericEditor from '@/components/generic-editor'
import Heading from '@/components/heading'
import NotLoggedInMessage from '@/components/not-logged-in-message'

export default () => {
  const { eventId } = useParams<{ eventId?: string }>()
  const isCreating = !eventId || eventId === 'create'
  const isLoggedIn = useIsLoggedIn()
  const providedDateIso = useQueryParam('date')
  const providedDateIsoEnd = providedDateIso
    ? addDays(new Date(providedDateIso), 1).toISOString()
    : undefined

  if (!isLoggedIn) {
    return <NotLoggedInMessage />
  }

  return (
    <>
      <Helmet>
        <title>{isCreating ? 'Create' : 'Edit'} an event</title>
        <meta
          name="description"
          content={`Use this form to ${
            isCreating ? 'create' : 'edit'
          } an event.`}
        />
      </Helmet>
      <Heading variant="h1">{isCreating ? 'Create' : 'Edit'} Event</Heading>
      <GenericEditor<Event>
        fields={EditableFields}
        collectionName={CollectionNames.Events}
        id={eventId}
        analyticsCategory={`${eventId ? 'Edit' : 'Create'}Event`}
        saveBtnAction="Click save button"
        cancelBtnAction="Click cancel button"
        getSuccessUrl={(newId) =>
          newId
            ? routes.viewEventWithVar.replace(':eventId', newId)
            : routes.events
        }
        cancelUrl={
          eventId
            ? routes.viewEventWithVar.replace(':eventId', eventId)
            : routes.events
        }
        overrideFields={
          providedDateIso
            ? { startsat: providedDateIso, endsat: providedDateIsoEnd }
            : undefined
        }
      />
    </>
  )
}
