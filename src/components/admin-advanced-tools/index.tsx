import React, { useState, Fragment } from 'react'

import Button from '../button'
import Paper from '../paper'
import NoPermissionMessage from '../no-permission-message'

import { callFunction } from '../../firebase'
import useUserRecord from '../../hooks/useUserRecord'
import { UserRoles } from '../../hooks/useDatabaseQuery'

interface FunctionMeta {
  name: string
  label: string
  description: string
}

const functions: FunctionMeta[] = [
  {
    name: 'syncFeaturedAssets',
    label: 'Sync Featured Assets',
    description:
      'The homepage featured asset is cached and updated daily. If someone edits the asset it wont be automatically updated. Manually trigger it here.'
  },
  {
    name: 'syncHomepage',
    label: 'Sync Homepage',
    description:
      'Stats and assets on homepage (except featured) are updated daily. Force refreshes.'
  },
  {
    name: 'syncIndex',
    label: 'Sync Index',
    description:
      'Retrieves every asset, author and user and inserts into the search engine index.'
  },
  {
    name: 'syncTags',
    label: 'Sync Tags',
    description:
      'Acculumates every tag in every asset and stores it for the tag list at the bottom of some pages.'
  },
  {
    name: 'tallyPolls',
    label: 'Tally Polls',
    description:
      'What is rendered on the homepage is a tally of the poll responses as searching for every response is slow.'
  }
]

const FunctionCaller = ({
  name,
  label,
  description
}: {
  name: string
  label: string
  description: string
}) => {
  const [isExecuting, setIsExecuting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)

  const onExecute = async () => {
    try {
      setIsExecuting(true)
      setIsSuccess(false)
      setIsError(false)

      const resp = await callFunction(name, {})

      console.debug(`Response from function ${name}`, resp)

      setIsExecuting(false)
      setIsSuccess(true)
      setIsError(false)
    } catch (err) {
      console.error(err)
      setIsExecuting(false)
      setIsSuccess(false)
      setIsError(true)
    }
  }

  return (
    <Paper>
      <strong>{label}</strong>
      <br />
      <p>{description}</p>
      {isExecuting ? (
        'Executing...'
      ) : isError ? (
        'Error! Check console'
      ) : isSuccess ? (
        'Success. Response in console'
      ) : (
        <Button onClick={onExecute}>Execute</Button>
      )}
    </Paper>
  )
}

export default () => {
  const [, , user] = useUserRecord()

  if (!user || user.role !== UserRoles.Admin) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <p>These tools are for advanced usage only.</p>
      {functions.map(func => (
        <Fragment key={func.name}>
          <FunctionCaller {...func} />
          <br />
        </Fragment>
      ))}
    </>
  )
}
