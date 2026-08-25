import React from 'react'
import { Helmet } from '@unhead/react/helmet'
import { useParams } from 'react-router'

import * as routes from '@/routes'
import { CollectionNames, Report } from '@/modules/reports'
import usePermissions from '@/hooks/usePermissions'

import Link from '@/components/link'
import WarningMessage from '@/components/warning-message'
import NoPermissionMessage from '@/components/no-permission-message'
import Heading from '@/components/heading'
import GenericEditor from '@/components/generic-editor'
import editableFields from '@/editable-fields/reports'
import { EMAIL } from '@/config'

const View = () => {
  const { parentTable, parentId } = useParams<{
    parentTable: string
    parentId: string
  }>()

  if (!usePermissions(routes.createReportWithVar)) {
    return <NoPermissionMessage />
  }

  return (
    <GenericEditor<Report>
      itemTypeSingular="report"
      collectionName={CollectionNames.Reports}
      fields={editableFields}
      overrideFields={{
        parenttable: parentTable,
        parent: parentId,
      }}
      successMessage={
        <>
          Our staff have been notified of your report and we aim to resolve them
          quickly. If it has been longer than 7 days, please enquire about it
          via Discord or email ({EMAIL}).
        </>
      }
    />
  )
}

export default () => (
  <>
    <Helmet>
      <title>Create a new report</title>
      <meta
        name="description"
        content="Use this form to create a new report."
      />
    </Helmet>
    <Heading variant="h1">Create Report</Heading>
    <WarningMessage>
      Do you want to submit a DMCA copyright claim? Please read our{' '}
      <Link to={routes.dmcaPolicy}>DMCA policy</Link>.
    </WarningMessage>
    <View />
  </>
)
