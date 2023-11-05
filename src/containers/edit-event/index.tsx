import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import Message from '../../components/message'

import { CollectionNames } from '../../data-store'
import * as routes from '../../routes'
import * as config from '../../config'
import { EditableFields } from '../../modules/events'

import useIsLoggedIn from '../../hooks/useIsLoggedIn'

const HowToPromoteMessage = ({ isLoggedIn }: { isLoggedIn?: boolean }) => (
  <Message>
    <Heading variant="h1" noTopMargin>
      How to promote your event
    </Heading>
    {isLoggedIn ? (
      <></>
    ) : (
      <>
        <p>1. Create an account on the site and log in</p>
        <p>2. Visit this page again</p>
      </>
    )}
    <p>
      {isLoggedIn ? 'Just' : '3. Then'} submit the form, join our Discord (
      <a href={config.DISCORD_URL} target="_blank" rel="noopener noreferrer">
        {config.DISCORD_URL}
      </a>
      ) then in #general ask our team to feature your event (and paste a link to
      the event you created)
    </p>
    <p>
      Our team will review your event and decide if to feature the event (which
      will probably happen).
    </p>
  </Message>
)

export default () => {
  const { eventId } = useParams<{ eventId?: string }>()
  const isCreating = !eventId || eventId === 'create'
  const isLoggedIn = useIsLoggedIn()

  if (!isLoggedIn) {
    return <HowToPromoteMessage isLoggedIn={false} />
  }

  return (
    <>
      <HowToPromoteMessage isLoggedIn={true} />
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
        fields={EditableFields}
        collectionName={CollectionNames.Events}
        id={eventId}
        analyticsCategory={`${eventId ? 'Edit' : 'Create'}Event`}
        saveBtnAction="Click save button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        getSuccessUrl={newId =>
          newId
            ? routes.viewEventWithVar.replace(':eventId', newId)
            : routes.events
        }
        cancelUrl={
          eventId
            ? routes.viewEventWithVar.replace(':eventId', eventId)
            : routes.events
        }
      />
    </>
  )
}
