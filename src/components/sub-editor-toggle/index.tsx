import React from 'react'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

import useUserRecord from '@/hooks/useUserRecord'
import { SubEditorStatus } from '@/modules/users'

import SuccessMessage from '../success-message'
import InfoMessage from '../info-message'
import Heading from '../heading'
import Link from '../link'
import { routes } from '@/routes'
import ErrorMessage from '../error-message'

const Status = ({}) => {
  const [, , user] = useUserRecord()

  switch (user!.subeditorstatus) {
    case SubEditorStatus.Accepted:
      return (
        <SuccessMessage icon={<CheckIcon />}>
          You are a community editor ❤️
        </SuccessMessage>
      )
    case SubEditorStatus.Declined:
      return (
        <ErrorMessage icon={<CloseIcon />}>
          You declined being a community editor 😢
        </ErrorMessage>
      )
    case SubEditorStatus.Unknown:
      return (
        <InfoMessage>
          You have not accepted or declined being a community editor. Only users
          with enough reputation will be asked to become one.
        </InfoMessage>
      )
  }
}

const SubEditorToggle = () => {
  return (
    <>
      <InfoMessage title="What is a community editor?">
        <p>
          You can help our editorial team by becoming a community editor -
          someone who reviews new assets and amendments to help our staff out.
        </p>
        <Heading variant="h4">What do I have to do?</Heading>
        <ol>
          <li>
            Monitor the{' '}
            <Link
              to={routes.queue}
              onClick={() => {
                close()
              }}>
              queue
            </Link>{' '}
            when you feel like it
          </li>
          <li>Approve or decline assets as you feel like it</li>
          <li>That's it!</li>
        </ol>
        <p>
          How much work you put into this is entirely up to you. When actually
          approving or declining, our staff will take into consideration your
          submission.
        </p>
      </InfoMessage>
      <Status />
    </>
  )
}

export default SubEditorToggle
