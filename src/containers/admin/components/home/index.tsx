import React from 'react'
import EditIcon from '@material-ui/icons/Edit'

import Markdown from '../../../../components/markdown'
import LoadingIndicator from '../../../../components/loading-indicator'
import ErrorMessage from '../../../../components/error-message'
import useDataStoreItem from '../../../../hooks/useDataStoreItem'
import {
  CollectionNames as PagesCollectionNames,
  Page,
} from '../../../../modules/pages'
import Button from '../../../../components/button'
import * as routes from '../../../../routes'
import Heading from '../../../../components/heading'
import RecentAdminHistory from '../recent-admin-history'
import { Column, Columns } from '../../../../components/column'

const parentName = 'admin'
const pageName = 'notepad'

const Controls = () => (
  <Button
    url={routes.editPageWithParentAndPageVar
      .replace(':parentName', parentName)
      .replace(':pageName', pageName)}
    color="default"
    size="small"
    icon={<EditIcon />}
    iconOnly
  />
)

export default () => {
  const [isLoading, isError, page] = useDataStoreItem<Page>(
    PagesCollectionNames.Pages,
    pageName,
    'admin-home'
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isError || !page) {
    return <ErrorMessage>Failed to load page</ErrorMessage>
  }

  return (
    <Columns padding>
      <Column width={50}>
        <Heading variant="h2">Recent Staff Activity</Heading>
        <RecentAdminHistory />
      </Column>
      <Column width={50}>
        <Heading variant="h2">
          Notepad <Controls />
        </Heading>
        <Markdown source={page.content} />
        <Controls />
      </Column>
    </Columns>
  )
}
