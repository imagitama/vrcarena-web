import React, { createContext, useContext, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkDirective from 'remark-directive'
import { visit } from 'unist-util-visit'
import rehypeRaw from 'rehype-raw'
import gfm from 'remark-gfm'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import WarningIcon from '@material-ui/icons/Warning'
import InfoIcon from '@material-ui/icons/Info'
import LaunchIcon from '@material-ui/icons/Launch'
import { ChevronRight } from '@material-ui/icons'
import Table from '@material-ui/core/Table'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableBody from '@material-ui/core/TableBody'
import MaterialTab from '@material-ui/core/Tab'
import { makeStyles } from '@material-ui/core/styles'
import ImageIcon from '@material-ui/icons/Image'

import { trackAction } from '../../analytics'
import * as routes from '../../routes'

import Button from '../button'
import SlimMessage from '../slim-message'
import ImageWithCaption from '../image-with-caption'

type ReactMarkdownNode = any

const useStyles = makeStyles({
  root: {
    '& h2': {
      marginTop: '2rem',
    },
    '& > p:first-child': {
      marginTop: 0,
    },
    '& > p:last-child': {
      marginBottom: 0,
    },
    '& blockquote img': {
      maxWidth: '100%',
    },
  },
})

const getLabel = (node: ReactMarkdownNode): string => {
  try {
    return node.children.pop().children[0].value
  } catch (err) {
    return ''
  }
}

const getUrlFromAttributes = (attributes: any): string => {
  if (attributes.url) {
    return attributes.url
  }

  if (attributes.asset) {
    return `${routes.viewAssetWithVar.replace(':assetId', attributes.asset)}`
  }

  return '#unknown'
}

const onContainerDirective = (node: ReactMarkdownNode): void => {
  switch (node.name) {
    case 'button':
      node.data.hName = 'button'
      node.data.hProperties = {
        url: getUrlFromAttributes(node.attributes),
        label: getLabel(node),
      }
      break
    case 'warning':
      node.data.hName = 'warning'
      node.data.hProperties = {
        message: getLabel(node),
      }
      break
    case 'info':
      node.data.hName = 'info'
      node.data.hProperties = {
        message: getLabel(node),
      }
      break
    case 'image':
      node.data.hName = 'image'
      node.data.hProperties = {
        url: getUrlFromAttributes(node.attributes),
        caption: getLabel(node),
      }
      break
    case 'tab':
      node.data.hName = 'tab'
      node.data.hProperties = {
        label: getLabel(node),
      }
      break
    case 'tabContents':
      node.data.hName = 'tabContents'
      break
    default:
      console.warn(`Unsupported container directive "${node.name}"`)
  }
}

function myRemarkDirectivePlugin() {
  return (tree: any) => {
    visit(tree, (node) => {
      node.data = node.data || {}

      if (node.type == 'containerDirective') {
        onContainerDirective(node)
      }
    })
  }
}

const getIconFromUrl = (url: string) =>
  url.includes('http') ? <LaunchIcon /> : <ChevronRight />

const ComponentReplacement = ({
  type,
  props,
  onClickLineWithContent,
}: {
  type: string
  props: any
  onClickLineWithContent?: (content: string) => void
}) =>
  React.createElement(type, {
    ...props,
    onClick: onClickLineWithContent
      ? () => onClickLineWithContent(getTextFromProps(props))
      : null,
    className: onClickLineWithContent ? 'clickable' : '',
  })

const getTextFromProps = (props: any) => {
  try {
    if (typeof props.children[0] === 'string') {
      return props.children[0]
    }
    return props.children[0].props.children[0]
  } catch (err) {
    console.error('Failed to get text from props', props)
    return 'Failed to get text from props'
  }
}

const TabContext =
  // @ts-ignore
  createContext<
    [
      { [tabIdx: number]: number },
      (newState: { [tabIdx: number]: number }) => void
    ]
  >()

const useTabs = (idx: number): [number, (newIdx: number) => void] => {
  const [tabState, setTabState] = useContext(TabContext)
  const selectedIdx = tabState[idx] || 0
  const setSelectedIdx = (newIdx: number) =>
    setTabState({
      ...tabState,
      [idx]: newIdx,
    })
  return [selectedIdx, setSelectedIdx]
}

const Tab = ({
  label,
  idx,
  groupIdx,
}: {
  label: string
  idx: number
  groupIdx: number
}) => {
  const [selectedIdx, setSelectedIdx] = useTabs(groupIdx)
  return (
    <MaterialTab
      label={label}
      onClick={() => setSelectedIdx(idx)}
      selected={selectedIdx === idx}
    />
  )
}

const TabContents = ({
  contents,
  idx,
  groupIdx,
}: {
  contents: React.ReactNode
  idx: number
  groupIdx: number
}) => {
  const [selectedIdx] = useTabs(groupIdx)
  return (
    <div style={{ display: selectedIdx === idx ? 'block' : 'none' }}>
      {contents}
    </div>
  )
}

const Image = (props: { src: string }) => {
  return (
    <Button url={props.src} icon={<ImageIcon />}>
      View Image
    </Button>
  )
}

const Markdown = ({
  source = '',
  analyticsCategory = '',
  enableHtml = false,
  onClickLineWithContent = undefined,
  replaceImagesWithButtons = false,
}: {
  source: string
  analyticsCategory?: string
  enableHtml?: boolean
  onClickLineWithContent?: (content: string) => void
  replaceImagesWithButtons?: boolean
}) => {
  const [tabState, setTabState] = useState({})
  const classes = useStyles()
  let tabIdx = 0
  let tabContentsIdx = 0
  let groupIdx = -1
  return (
    <TabContext.Provider value={[tabState, setTabState]}>
      <ReactMarkdown
        children={source}
        rehypePlugins={enableHtml ? [rehypeRaw] : []}
        remarkPlugins={[remarkDirective, myRemarkDirectivePlugin, gfm]}
        className={classes.root}
        components={{
          // @ts-ignore
          button: (props: { url: string; label: string }) => (
            <Button
              url={props.url}
              icon={getIconFromUrl(props.url)}
              onClick={
                onClickLineWithContent
                  ? () => onClickLineWithContent(props.label)
                  : undefined
              }
              className={onClickLineWithContent ? 'clickable' : ''}>
              {props.label}
            </Button>
          ),
          warning: (props: { message: string }) => (
            <SlimMessage
              onClick={
                onClickLineWithContent
                  ? () => onClickLineWithContent(props.message)
                  : null
              }
              className={onClickLineWithContent ? 'clickable' : ''}>
              <WarningIcon /> {props.message}
            </SlimMessage>
          ),
          info: (props: { message: string }) => (
            <SlimMessage
              onClick={
                onClickLineWithContent
                  ? () => onClickLineWithContent(props.message)
                  : null
              }
              className={onClickLineWithContent ? 'clickable' : ''}>
              <InfoIcon /> {props.message}
            </SlimMessage>
          ),
          // @ts-ignore
          image: (props: { caption: string; url: string }) => (
            <div
              onClick={
                onClickLineWithContent
                  ? (e) => {
                      onClickLineWithContent(props.caption)
                      e.preventDefault()
                      e.stopPropagation()
                      return false
                    }
                  : undefined
              }
              className={onClickLineWithContent ? 'clickable' : ''}>
              <ImageWithCaption caption={props.caption} src={props.url} />
            </div>
          ),
          // @ts-ignore
          link: (props: { href: string; children: React.ReactNode }) => (
            <a
              href={props.href}
              target="_blank"
              rel="noopener noreferrer"
              className={onClickLineWithContent ? 'clickable' : ''}
              onClick={() => {
                if (onClickLineWithContent) {
                  onClickLineWithContent(getTextFromProps(props))
                  return false
                }

                if (analyticsCategory) {
                  trackAction(
                    analyticsCategory,
                    'Click external link from markdown',
                    props.href
                  )
                }
              }}>
              {props.children} <OpenInNewIcon style={{ fontSize: '1em' }} />
            </a>
          ),
          h1: (props: { children: React.ReactNode }) => (
            <ComponentReplacement
              type="h1"
              props={props}
              onClickLineWithContent={onClickLineWithContent}
            />
          ),
          h2: (props: { children: React.ReactNode }) => (
            <ComponentReplacement
              type="h2"
              props={props}
              onClickLineWithContent={onClickLineWithContent}
            />
          ),
          h3: (props: { children: React.ReactNode }) => (
            <ComponentReplacement
              type="h3"
              props={props}
              onClickLineWithContent={onClickLineWithContent}
            />
          ),
          p: (props: { children: React.ReactNode }) => (
            <ComponentReplacement
              type="p"
              props={props}
              onClickLineWithContent={onClickLineWithContent}
            />
          ),
          table: (props: { children: React.ReactNode }) => (
            <div>
              <Table size="small" className="markdown-table">
                {props.children}
              </Table>
            </div>
          ),
          tr: (props: { children: React.ReactNode }) => (
            <TableRow>{props.children}</TableRow>
          ),
          tbody: (props: { children: React.ReactNode }) => (
            <TableBody>{props.children}</TableBody>
          ),
          td: (props: { children: React.ReactNode }) => (
            <TableCell>{props.children}</TableCell>
          ),
          thead: (props: { children: React.ReactNode }) => (
            <TableHead>{props.children}</TableHead>
          ),
          tab: (props: { label: string }) => {
            const oldTabIdx = tabIdx

            if (oldTabIdx === 0) {
              groupIdx++
            }

            tabIdx++
            tabContentsIdx = 0

            return (
              <Tab label={props.label} idx={oldTabIdx} groupIdx={groupIdx} />
            )
          },
          tabContents: (props: { children: React.ReactNode }) => {
            const oldTabContentsIdx = tabContentsIdx
            tabContentsIdx++

            tabIdx = 0

            return (
              <TabContents
                contents={props.children}
                idx={oldTabContentsIdx}
                groupIdx={groupIdx}
              />
            )
          },
          ...(replaceImagesWithButtons
            ? {
                img: (props: { src: string }) => <Image {...props} />,
              }
            : {}),
        }}
      />
    </TabContext.Provider>
  )
}

export default Markdown
