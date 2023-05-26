import React, { createContext, useContext, useState } from 'react'
import Markdown from 'react-markdown'
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

import { trackAction } from '../../analytics'
import * as routes from '../../routes'

import Button from '../button'
import SlimMessage from '../slim-message'
import ImageWithCaption from '../image-with-caption'

const getLabel = node => {
  try {
    return node.children.pop().children[0].value
  } catch (err) {
    return ''
  }
}

const getUrlFromAttributes = attributes => {
  if (attributes.url) {
    return attributes.url
  }

  if (attributes.asset) {
    return `${routes.viewAssetWithVar.replace(':assetId', attributes.asset)}`
  }

  return '#unknown'
}

const onContainerDirective = node => {
  switch (node.name) {
    case 'button':
      node.data.hName = 'button'
      node.data.hProperties = {
        url: getUrlFromAttributes(node.attributes),
        label: getLabel(node)
      }
      break
    case 'warning':
      node.data.hName = 'warning'
      node.data.hProperties = {
        message: getLabel(node)
      }
      break
    case 'info':
      node.data.hName = 'info'
      node.data.hProperties = {
        message: getLabel(node)
      }
      break
    case 'image':
      node.data.hName = 'image'
      node.data.hProperties = {
        url: getUrlFromAttributes(node.attributes),
        caption: getLabel(node)
      }
      break
    case 'tab':
      node.data.hName = 'tab'
      node.data.hProperties = {
        label: getLabel(node)
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
  return tree => {
    visit(tree, node => {
      node.data = node.data || {}

      if (node.type == 'containerDirective') {
        onContainerDirective(node)
      }
    })
  }
}

const getIconFromUrl = url =>
  url.includes('http') ? <LaunchIcon /> : <ChevronRight />

const ComponentReplacement = ({ type, props, onClickLineWithContent }) =>
  React.createElement(type, {
    ...props,
    onClick: onClickLineWithContent
      ? () => onClickLineWithContent(getTextFromProps(props))
      : null,
    className: onClickLineWithContent ? 'clickable' : ''
  })

const getTextFromProps = props => {
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

const TabContext = createContext()
const useTabs = idx => {
  const [tabState, setTabState] = useContext(TabContext)
  const selectedIdx = tabState[idx] || 0
  const setSelectedIdx = newIdx =>
    setTabState({
      ...tabState,
      [idx]: newIdx
    })
  return [selectedIdx, setSelectedIdx]
}

const Tab = ({ label, idx, groupIdx }) => {
  const [selectedIdx, setSelectedIdx] = useTabs(groupIdx)
  return (
    <MaterialTab
      label={label}
      onClick={() => setSelectedIdx(idx)}
      selected={selectedIdx === idx}
    />
  )
}

const TabContents = ({ contents, idx, groupIdx }) => {
  const [selectedIdx] = useTabs(groupIdx)
  return (
    <div style={{ display: selectedIdx === idx ? 'block' : 'none' }}>
      {contents}
    </div>
  )
}

export default ({
  source = '',
  analyticsCategory = '',
  enableHtml = false,
  onClickLineWithContent = null
}) => {
  const [tabState, setTabState] = useState({})
  let tabIdx = 0
  let tabContentsIdx = 0
  let groupIdx = -1
  return (
    <TabContext.Provider value={[tabState, setTabState]}>
      <Markdown
        children={source}
        rehypePlugins={enableHtml ? [rehypeRaw] : []}
        remarkPlugins={[remarkDirective, myRemarkDirectivePlugin, gfm]}
        components={{
          button: props => (
            <Button
              url={props.url}
              icon={getIconFromUrl(props.url)}
              onClick={
                onClickLineWithContent
                  ? () => onClickLineWithContent(props.label)
                  : null
              }
              className={onClickLineWithContent ? 'clickable' : ''}>
              {props.label}
            </Button>
          ),
          warning: props => (
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
          info: props => (
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
          image: props => (
            <div
              onClick={
                onClickLineWithContent
                  ? e => {
                      onClickLineWithContent(props.caption)
                      e.preventDefault()
                      e.stopPropagation()
                      return false
                    }
                  : null
              }
              className={onClickLineWithContent ? 'clickable' : ''}>
              <ImageWithCaption caption={props.caption} src={props.url} />
            </div>
          ),
          link: props => (
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
          h1: props => (
            <ComponentReplacement
              type="h1"
              props={props}
              onClickLineWithContent={onClickLineWithContent}
            />
          ),
          h2: props => (
            <ComponentReplacement
              type="h2"
              props={props}
              onClickLineWithContent={onClickLineWithContent}
            />
          ),
          h3: props => (
            <ComponentReplacement
              type="h3"
              props={props}
              onClickLineWithContent={onClickLineWithContent}
            />
          ),
          p: props => (
            <ComponentReplacement
              type="p"
              props={props}
              onClickLineWithContent={onClickLineWithContent}
            />
          ),
          table: props => (
            <div>
              <Table size="small" className="markdown-table">
                {props.children}
              </Table>
            </div>
          ),
          tr: props => <TableRow>{props.children}</TableRow>,
          tbody: props => <TableBody>{props.children}</TableBody>,
          td: props => <TableCell>{props.children}</TableCell>,
          thead: props => <TableHead>{props.children}</TableHead>,
          tab: props => {
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
          tabContents: props => {
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
          }
        }}
      />
    </TabContext.Provider>
  )
}

// | Some header | Another header |
// | --- | --- |
// | A cell. | Another cell. |
