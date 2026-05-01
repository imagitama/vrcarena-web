import React, { useContext } from 'react'
import { makeStyles } from '@mui/styles'

import { isMobile, mediaQueryForTabletsOrBelow } from '@/media-queries'

import Markdown from '@/components/markdown'
import SketchfabEmbed from '@/components/sketchfab-embed'
import Expander from '@/components/expander'

import TabContext from '../../context'

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

export default () => {
  const { asset } = useContext(TabContext)
  const classes = useStyles()

  var content = (
    <div>
      {asset && asset.sketchfabembedurl ? (
        <div className={classes.sketchfabWrapper}>
          <SketchfabEmbed
            url={asset.sketchfabembedurl}
            className={classes.sketchfab}
          />
        </div>
      ) : null}
      <div className={classes.description}>
        <Markdown
          source={asset ? asset.description : ''}
          replaceImagesWithButtons
        />
      </div>
    </div>
  )

  if (isMobile)
    return (
      <Expander isLoaded={asset !== null} message="Tap to expand description">
        {content}
      </Expander>
    )

  return content
}
