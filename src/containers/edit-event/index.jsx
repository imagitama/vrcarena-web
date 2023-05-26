import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import { CollectionNames } from '../../data-store'
import * as routes from '../../routes'

export default () => {
  const { eventId } = useParams()
  const isCreating = !eventId

  return (
    <>
      <Helmet>
        <title>{isCreating ? 'Create' : 'Edit'} an event | VRCArena</title>
        <meta
          name="description"
          content={`Use this form to ${
            isCreating ? 'create' : 'edit'
          } an event.`}
        />
      </Helmet>
      <Heading variant="h1">{isCreating ? 'Create' : 'Edit'} Event</Heading>
      <GenericEditor
        collectionName={CollectionNames.Events}
        id={eventId || false} /* use false to use generated id */
        changeMetaFields={false}
        analyticsCategory={`${eventId ? 'Edit' : 'Create'}Event`}
        saveBtnAction="Click save button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        successUrl={
          eventId ? routes.viewEventWithVar.replace(':eventId', eventId) : null
        }
        getSuccessUrl={result => {
          if (!result) {
            return routes.events
          }
          const createdEvent = result[0]
          return routes.viewEventWithVar.replace(':eventId', createdEvent.id)
        }}
        cancelUrl={
          eventId
            ? routes.viewEventWithVar.replace(':eventId', eventId)
            : routes.events
        }
      />
    </>
  )
}
