import React, { createContext, useContext, useState } from 'react'
import { makeStyles } from '@mui/styles'
import { useParams } from 'react-router'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import TocIcon from '@mui/icons-material/Toc'
import { Helmet } from 'react-helmet'
import InfoIcon from '@mui/icons-material/Info'
import EditIcon from '@mui/icons-material/Edit'
import HistoryIcon from '@mui/icons-material/History'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import Markdown from '../../components/markdown'
import Button from '../../components/button'

import useDataStoreItem from '../../hooks/useDataStoreItem'
import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '../../hooks/useDatabaseQuery'

import * as routes from '../../routes'
import { Link } from 'react-router-dom'
import useIsEditor from '../../hooks/useIsEditor'
import Message from '../../components/message'
import { DISCORD_URL } from '../../config'
import TextInput from '../../components/text-input'
import CopyButton from '../../components/copy-button'
import { CollectionNames, Page } from '../../modules/pages'
import NoResultsMessage from '../../components/no-results-message'
import FormControls from '../../components/form-controls'
import { HistoryEntry } from '../../modules/history'
import HistoryRevisions from '../../components/history-revisions'
import { CollectionNames as HistoryCollectionNames } from '../../modules/history'
import { handleError } from '../../error-handling'

interface PageContext {
  pagesInParent: Page[]
  parentName: string
  pageName: string
  description: string
  toggleHelpMode: () => void
  selectedLineOfText: string
  setSelectedLineOfText: (newText: string) => void
  isInHelpMode: boolean
}

const PageContext = createContext<PageContext>({
  pagesInParent: [],
  parentName: '',
  pageName: '',
  description: '',
  toggleHelpMode: () => undefined,
  selectedLineOfText: '',
  setSelectedLineOfText: () => undefined,
  isInHelpMode: false,
})
const usePageContext = () => useContext(PageContext)

const useStyles = makeStyles({
  root: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  headings: {
    textAlign: 'center',
  },
  pageControls: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.5)',
  },
  control: {
    width: '33.3%',
    '&:last-child': {
      textAlign: 'right',
    },
  },
  tableOfContentsBtn: {
    margin: '0 auto',
    textAlign: 'center',
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '0.5rem',
  },
  helpInputWrapper: {
    display: 'flex',
    '& > *:first-child': {
      marginRight: '0.5rem',
    },
  },
})

const PageControls = () => {
  const { pagesInParent, pageName, toggleHelpMode } = usePageContext()
  const classes = useStyles()

  const pageNames = pagesInParent.map(({ id }) => id)
  const parentName = pagesInParent[0].parent
  const currentPageIdx = pagesInParent.findIndex(({ id }) => id === pageName)

  if (currentPageIdx === -1) {
    throw new Error('Page index out of bounds')
  }

  const prevPageName = pageNames[currentPageIdx - 1]
  const nextPageName = pageNames[currentPageIdx + 1]

  return (
    <div className={classes.pageControls}>
      <div className={classes.control}>
        {prevPageName && (
          <Button
            url={routes.pagesWithParentAndPageVar
              .replace(':parentName', parentName)
              .replace(':pageName', prevPageName)}
            icon={<ChevronLeftIcon style={{ marginLeft: '-5px' }} />}
            size="small"
            switchIconSide>
            Back
          </Button>
        )}
      </div>

      <div className={`${classes.control} ${classes.tableOfContentsBtn}`}>
        <Button
          url={routes.avatarTutorial}
          icon={<TocIcon />}
          size="small"
          switchIconSide>
          Table of Contents
        </Button>
      </div>
      <div className={classes.control}>
        <Button
          onClick={toggleHelpMode}
          icon={<InfoIcon style={{ marginRight: '-5px' }} />}
          size="small"
          color="secondary">
          Help
        </Button>{' '}
        {nextPageName && (
          <Button
            url={routes.pagesWithParentAndPageVar
              .replace(':parentName', parentName)
              .replace(':pageName', nextPageName)}
            icon={<ChevronRightIcon style={{ marginRight: '-5px' }} />}
            size="small">
            Next
          </Button>
        )}
      </div>
    </div>
  )
}

const TableOfContents = () => {
  const { pagesInParent } = usePageContext()
  const classes = useStyles()
  return (
    <>
      <div className={classes.headings}>
        <Heading variant="h2" className={classes.heading}>
          <span className={classes.icon}>
            <TocIcon />
          </span>{' '}
          Table of Contents
        </Heading>
      </div>
      {pagesInParent.map(({ id, title, parent: parentName }, idx) => (
        <Heading variant="h3" key={id}>
          <Link
            to={routes.pagesWithParentAndPageVar
              .replace(':parentName', parentName)
              .replace(':pageName', id)}>
            {idx + 1}. {title}
          </Link>
        </Heading>
      ))}
    </>
  )
}

const EditorControls = ({
  parentName,
  pageName,
}: {
  parentName: string
  pageName: string
}) => {
  const isEditor = useIsEditor()

  if (!isEditor) {
    return null
  }

  return (
    <FormControls>
      <Button
        url={routes.editPageWithParentAndPageVar
          .replace(':parentName', parentName)
          .replace(':pageName', pageName)}
        icon={<EditIcon />}>
        Edit Page
      </Button>
    </FormControls>
  )
}

const HelpModeInfo = () => {
  const { selectedLineOfText, pagesInParent, pageName, toggleHelpMode } =
    usePageContext()
  const classes = useStyles()

  const thisPage = pagesInParent.find(({ id }) => id === pageName)

  const textToCopy = selectedLineOfText
    ? `I need help with this section of the avatar tutorial page "${
        thisPage ? thisPage.title : pageName
      }": ${selectedLineOfText.substring(0, 50)}`
    : ''

  return (
    <Message>
      To get help with this tutorial please
      <ol>
        <li>
          <strong>click on the line of text</strong> you need help with
        </li>
        <li>
          join our <a href={DISCORD_URL}>Discord server</a>
        </li>
        <li>
          go to the <strong>#vrchat-help</strong> channel
        </li>
        <li>copy and paste this text into it:</li>
      </ol>
      <div className={classes.helpInputWrapper}>
        <TextInput value={textToCopy} fullWidth />
        <CopyButton text={textToCopy} />
      </div>
      <br />
      <Button onClick={toggleHelpMode}>Done</Button>
    </Message>
  )
}

const PageHistoryOutput = ({ pageName }: { pageName: string }) => {
  const [isLoading, lastErrorCode, entries] = useDatabaseQuery<HistoryEntry>(
    HistoryCollectionNames.History,
    [
      ['parenttable', Operators.EQUALS, CollectionNames.Pages],
      ['parent', Operators.EQUALS, pageName],
    ],
    undefined,
    ['createdat', OrderDirections.ASC]
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading history..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load history (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (!entries || !entries.length) {
    return <NoResultsMessage />
  }

  return <HistoryRevisions<Page> entries={entries} fieldNameToDiff="content" />
}

const PageHistory = ({ pageName }: { pageName: string }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <br />
      <FormControls>
        <Button
          icon={<HistoryIcon />}
          onClick={() => setIsExpanded(!isExpanded)}
          color="secondary">
          View Revision History
        </Button>
      </FormControls>
      {isExpanded && <PageHistoryOutput pageName={pageName} />}
    </>
  )
}

const PageView = ({ page }: { page: Page }) => {
  const {
    parentName,
    pageName,
    description: parentDescription,
    isInHelpMode,
    setSelectedLineOfText,
  } = usePageContext()
  const classes = useStyles()
  const { title, description, content } = page
  return (
    <>
      <Helmet>
        <title>{title} | VRCArena</title>
        <meta name="description" content={description || parentDescription} />
      </Helmet>
      {parentName === 'avatar-tutorial' && <PageControls />}
      <div className={classes.headings}>
        <Heading variant="h2">{title}</Heading>
      </div>
      {isInHelpMode && <HelpModeInfo />}
      <Markdown
        source={content}
        // @ts-ignore
        onClickLineWithContent={isInHelpMode ? setSelectedLineOfText : null}
      />
      {parentName === 'avatar-tutorial' && <PageControls />}
      {parentName === 'help' && <PageHistory pageName={pageName} />}
    </>
  )
}

const ViewContents = () => {
  const { pagesInParent, pageName } = usePageContext()

  if (!pageName) {
    return <TableOfContents />
  }

  const thisPage = pagesInParent.find(({ id }) => id === pageName)

  if (!thisPage) {
    console.error(`Failed to find page with pagename "${pageName}"`)
    return (
      <ErrorMessage>
        Could not find any page named "{pageName}". It might have been removed
        or it might never existed.
      </ErrorMessage>
    )
  }

  return <PageView page={thisPage} />
}

const Pages = () => {
  const classes = useStyles()
  const { parentName, pageName } = useParams<{
    parentName: string
    pageName: string
  }>()
  const [isLoading, lastErrorCodeLoadingParent, parent] =
    useDataStoreItem<Page>(
      CollectionNames.PageParents,
      parentName,
      'parent-overview'
    )
  const [isLoadingPages, lastErrorCodeLoadingPages, pagesInParent] =
    useDatabaseQuery<Page>(
      CollectionNames.Pages,
      [['parent', Operators.EQUALS, parentName]],
      {
        orderBy: ['pageorder', OrderDirections.ASC],
      }
    )
  const [selectedLineOfText, setSelectedLineOfText] = useState<string>('')
  const [isInHelpMode, setIsInHelpMode] = useState<boolean>(false)

  const toggleHelpMode = () => setIsInHelpMode((currentVal) => !currentVal)

  if (
    isLoading ||
    isLoadingPages ||
    !parent ||
    !pagesInParent ||
    !pagesInParent.length
  ) {
    return <LoadingIndicator message="Loading page..." />
  }

  if (lastErrorCodeLoadingParent !== null) {
    return (
      <ErrorMessage>
        Failed to load page parents (code {lastErrorCodeLoadingParent})
      </ErrorMessage>
    )
  }

  if (lastErrorCodeLoadingPages !== null) {
    return (
      <ErrorMessage>
        Failed to load pages (code {lastErrorCodeLoadingPages})
      </ErrorMessage>
    )
  }

  const { title, description } = parent

  const pageContent = pagesInParent[pagesInParent.length - 1].content

  return (
    <div className={classes.root}>
      <Helmet>
        <title>{title} | VRCArena</title>
        <meta name="description" content={description} />
      </Helmet>
      <EditorControls parentName={parentName} pageName={pageName} />
      {parentName === 'avatar-tutorial' && (
        <>
          <Heading variant="h1" style={{ textAlign: 'center' }}>
            {title}
          </Heading>
          <p style={{ textAlign: 'center' }}>{description}</p>
        </>
      )}
      <PageContext.Provider
        value={{
          pagesInParent,
          parentName,
          pageName,
          description,
          toggleHelpMode,
          selectedLineOfText,
          setSelectedLineOfText,
          isInHelpMode,
        }}>
        {pageContent ? (
          <ViewContents />
        ) : (
          <NoResultsMessage>Page has no content</NoResultsMessage>
        )}
      </PageContext.Provider>
    </div>
  )
}

export default Pages
