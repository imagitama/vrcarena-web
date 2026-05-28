import { useParams } from 'react-router'
import { Helmet } from '@unhead/react/helmet'
import EditIcon from '@mui/icons-material/Edit'

import useIsEditor from '@/hooks/useIsEditor'
import { routes } from '@/routes'

import Heading from '@/components/heading'
import Button from '@/components/button'
import { CollectionNames, Page } from '@/modules/pages'
import Markdown from '@/components/markdown'
import useDataStoreItem from '@/hooks/useDataStoreItem'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'

const EditorControls = () => {
  const { parentName: incomingParentName, pageName: incomingPageName } =
    useParams<{
      parentName: string
      pageName?: string
    }>()

  const parentName = incomingPageName ? incomingParentName : incomingPageName
  const pageName = incomingPageName || incomingParentName

  const isEditor = useIsEditor()
  if (!isEditor) return null
  return (
    <>
      <Button
        url={
          parentName
            ? routes.editPageWithParentAndPageVar
                .replace(':parentName', parentName || '')
                .replace(':pageName', pageName)
            : routes.editPageWithPageVar.replace(':pageName', pageName)
        }
        icon={<EditIcon />}>
        Edit Page
      </Button>
    </>
  )
}

const PageRenderer = ({
  parent,
  page,
}: {
  parent: Page | null
  page: Page
}) => {
  return (
    <>
      <Helmet>
        <title>{page.title}</title>
        <meta name="description" content={page.description} />
      </Helmet>
      <Heading variant="h1">{page.title}</Heading>
      <Markdown source={page.content} />
      <EditorControls />
    </>
  )
}

const PagesContainer = () => {
  const { parentName: incomingParentName, pageName: incomingPageName } =
    useParams<{
      parentName: string
      pageName?: string
    }>()

  const parentName = incomingPageName ? incomingParentName : incomingPageName
  const pageName = incomingPageName || incomingParentName

  const [isLoading, lastErrorCode, page] = useDataStoreItem<Page>(
    CollectionNames.Pages,
    pageName
  )
  const isEditor = useIsEditor()

  if (isLoading) {
    return <LoadingIndicator message="Loading page..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load page (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (!page) {
    return (
      <ErrorMessage>
        Page does not exist
        {isEditor && (
          <>
            <br />
            <Button
              url={(parentName
                ? routes.createPageWithParentAndPageVar
                : routes.createPageWithPageVar
              )
                .replace(':parentName', parentName || '')
                .replace(':pageName', pageName || '')}
              color="secondary">
              Create Page
            </Button>
          </>
        )}
      </ErrorMessage>
    )
  }

  return <PageRenderer parent={null} page={page} />
}

export default PagesContainer
