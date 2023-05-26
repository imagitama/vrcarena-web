import React, {
  useEffect,
  useState,
  useContext,
  createContext,
  Suspense
} from 'react'
import { useMediaQuery } from 'react-responsive'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'
import { useParams } from 'react-router'

import useHistory from '../../hooks/useHistory'
import {
  mediaQueryForTabletsOrBelow,
  queryForTabletsOrBelow
} from '../../media-queries'
import LoadingIndicator from '../loading-indicator'

const useStyles = makeStyles({
  tabsContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: '1rem 0',
    [mediaQueryForTabletsOrBelow]: {
      display: 'block'
    }
  },
  tabs: {
    marginRight: '2rem',
    [mediaQueryForTabletsOrBelow]: {
      margin: 0
    }
  },
  tabPanels: {
    flex: 1,
    [mediaQueryForTabletsOrBelow]: {
      margin: '1rem 0'
    }
  },
  root: {},
  vertical: {
    display: 'flex'
  }
})

const tabsContext = createContext()
export const useTabs = () => useContext(tabsContext)

/**
 * Tab:
 * {
 *   name: string, (used for :tabName in URL)
 *   label: string,
 *   contents: () => React
 * }
 */

const TabPanel = ({ activeTabIdx, index, children, item }) =>
  activeTabIdx === index ? (
    item.noLazy ? (
      children
    ) : (
      <LazyLoad placeholder={<LoadingIndicator message="Scroll down..." />}>
        {children}
      </LazyLoad>
    )
  ) : null

const getInitialTabIdx = (tabName, items) => {
  const idx = items.findIndex(item => item.name === tabName)

  if (idx === -1) {
    return 0
  }

  return idx
}

/**
 * items: Array<Tab>
 *
 * type Tab = {
 *   name: string // used in URL
 *   label: string
 *   contents: () => React.Element
 * }
 */

export default ({
  items,
  urlWithTabNameVar = '',
  horizontal = false,
  overrideInitialTabIdx = undefined,
  children
}) => {
  const enabledItems = items
    .filter(item => item)
    .filter(({ isEnabled }) => isEnabled !== false)

  const { tabName } = useParams()
  const { push } = useHistory()
  const isMobile = useMediaQuery({ query: queryForTabletsOrBelow })
  const [activeTabIdx, setActiveTabIdx] = useState(0)
  const classes = useStyles()

  useEffect(() => {
    setActiveTabIdx(getInitialTabIdx(tabName, enabledItems))
  }, [items.length])

  const next = () => setActiveTabIdx(currentIdx => currentIdx + 1)
  const back = () => setActiveTabIdx(currentIdx => currentIdx - 1)

  const isHorizontal = isMobile || horizontal

  return (
    <Suspense fallback={null}>
      <tabsContext.Provider
        value={{ activeTabIdx, setActiveTabIdx, next, back }}>
        <div
          className={`${classes.root} ${
            isHorizontal ? classes.horizontal : classes.vertical
          }`}>
          <div className={classes.tabsContainer}>
            <Tabs
              orientation={isHorizontal ? 'horizontal' : 'vertical'}
              variant="scrollable"
              scrollButtons="auto"
              value={activeTabIdx}
              onChange={(event, newIdx) => {
                setActiveTabIdx(newIdx)

                if (urlWithTabNameVar) {
                  push(
                    urlWithTabNameVar.replace(
                      ':tabName',
                      enabledItems[newIdx].name
                    ),
                    false
                  )
                }
              }}
              className={classes.tabs}>
              {enabledItems.map(({ name, label }, index) => (
                <Tab key={name} label={label} index={index} />
              ))}
            </Tabs>
          </div>
          <div className={classes.tabPanels}>
            {enabledItems.map((item, index) => (
              <TabPanel
                key={item.name}
                activeTabIdx={activeTabIdx}
                index={index}
                item={item}>
                <Suspense fallback={null}>{item.contents}</Suspense>
              </TabPanel>
            ))}
          </div>
          {children}
        </div>
      </tabsContext.Provider>
    </Suspense>
  )
}
