import React, { useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { AssetFieldNames } from '../../../../hooks/useDatabaseQuery'
import { isUrlAnImage } from '../../../../utils'
import { mediaQueryForTabletsOrBelow } from '../../../../media-queries'

import Markdown from '../../../markdown'
import SketchfabEmbed from '../../../sketchfab-embed'
import TutorialSteps from '../../../tutorial-steps'
import ImageGallery from '../../../image-gallery'
import Expander from '../../../expander'

import TabContext from '../../context'

const useStyles = makeStyles({
  sketchfabWrapper: {
    width: '100%',
    textAlign: 'center'
  },
  sketchfab: {
    width: '50%',
    margin: '0 auto',
    height: '500px',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%'
    }
  },
  description: {
    '& A': { textDecoration: 'underline' }
  }
})

const maxNumberOfImagesShownInPrimaryGallery = 3

export default () => {
  const { asset } = useContext(TabContext)
  const classes = useStyles()

  const nonImageFileUrls =
    asset && asset[AssetFieldNames.fileUrls]
      ? asset[AssetFieldNames.fileUrls].filter(url => !isUrlAnImage(url))
      : []

  // pedestal replaces main image gallery so we need to show them all
  const hasPedestal = asset && asset[AssetFieldNames.pedestalVideoUrl]

  return (
    <Expander isLoaded={asset !== null} message="Click to expand description">
      <div>
        {asset && asset[AssetFieldNames.sketchfabEmbedUrl] ? (
          <div className={classes.sketchfabWrapper}>
            <SketchfabEmbed
              url={asset[AssetFieldNames.sketchfabEmbedUrl]}
              className={classes.sketchfab}
            />
          </div>
        ) : null}
        <div className={classes.description}>
          <Markdown source={asset ? asset[AssetFieldNames.description] : ''} />
        </div>
        {hasPedestal ||
        nonImageFileUrls.length > maxNumberOfImagesShownInPrimaryGallery ? (
          <ImageGallery
            urls={
              hasPedestal
                ? nonImageFileUrls
                : nonImageFileUrls.slice(maxNumberOfImagesShownInPrimaryGallery)
            }
          />
        ) : null}
        {asset && asset[AssetFieldNames.tutorialSteps] ? (
          <TutorialSteps steps={asset[AssetFieldNames.tutorialSteps]} />
        ) : null}
      </div>
    </Expander>
  )
}
