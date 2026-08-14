import React, { useContext } from 'react'
import { makeStyles } from '@mui/styles'

import { isMobile, mediaQueryForTabletsOrBelow } from '@/media-queries'

import Markdown from '@/components/markdown'
import SketchfabEmbed from '@/components/sketchfab-embed'
import Expander from '@/components/expander'

import TabContext from '../../context'
import Tabs from '@/components/tabs'
import useStorage from '@/hooks/useStorage'
import useLocale from '@/hooks/useLocale'
import { allowedLocales } from '@/config'
import InfoMessage from '@/components/info-message'

const useStyles = makeStyles({
  sketchfabWrapper: {
    width: '100%',
    textAlign: 'center',
  },
  sketchfab: {
    width: '50%',
    margin: '0 auto',
    height: '500px',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
    },
  },
  description: {
    fontSize: '125%',
    '& a': { textDecoration: 'underline' },
  },
})

const Desc = ({ desc, showNotice }: { desc: string; showNotice?: boolean }) => {
  const classes = useStyles()
  return (
    <>
      {showNotice && (
        <InfoMessage noTopMargin>
          Automatically translated by{' '}
          <a
            href="https://docs.cloud.google.com/translate/docs/reference/rest"
            target="_blank"
            rel="noopener noreferrer">
            Google Translate
          </a>
        </InfoMessage>
      )}
      <Markdown
        source={desc}
        replaceImagesWithButtons
        className={classes.description}
      />
    </>
  )
}

export default () => {
  const { asset } = useContext(TabContext)
  const [storedLocale, setStoredLocale] = useLocale()

  if (!asset) return null

  return (
    <Expander
      isLoaded={asset !== null}
      message={`${isMobile ? 'Tap' : 'Click'} to expand description`}>
      {asset.translations !== null ? (
        <Tabs
          defaultTabName={storedLocale || undefined}
          onSelectTab={(tabName) => setStoredLocale(tabName)}
          items={[
            {
              name: 'source',
              label: 'Source',
              contents: <Desc desc={asset.description} />,
            },
          ].concat(
            Object.entries(asset.translations).map(([locale, fields]) => ({
              name: locale,
              label:
                locale in allowedLocales
                  ? allowedLocales[locale as keyof typeof allowedLocales]
                  : locale,
              contents: (
                <Desc key={locale} desc={fields.description} showNotice />
              ),
            }))
          )}
        />
      ) : (
        <Desc desc={asset.description} />
      )}
    </Expander>
  )
}
