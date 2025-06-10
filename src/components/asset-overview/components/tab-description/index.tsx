import React, { useContext } from 'react'
import { makeStyles } from '@mui/styles'

import { mediaQueryForTabletsOrBelow } from '../../../../media-queries'
import Markdown from '../../../markdown'
import SketchfabEmbed from '../../../sketchfab-embed'
import Expander from '../../../expander'
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
    '& A': { textDecoration: 'underline' },
  },
})

export default () => {
  const { asset } = useContext(TabContext)
  const classes = useStyles()

  return (
    <Expander isLoaded={asset !== null} message="Click to expand description">
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
    </Expander>
  )
}
