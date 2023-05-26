import React from 'react'
import Link from '../../components/link'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import Markdown from '../markdown'
import Heading from '../heading'
import FormattedDate from '../formatted-date'
import Button from '../button'
import AssetThumbnail from '../asset-thumbnail'
import * as routes from '../../routes'
import { trimDescription } from '../../utils/formatting'

const useStyles = makeStyles({
  root: {
    padding: '1rem',
    marginTop: '1rem'
  },
  heading: {
    fontSize: '200%',
    margin: '1.5rem 0 0.5rem 0'
  },
  description: {
    marginTop: '1.5rem'
  },
  controls: {
    marginTop: '1rem',
    textAlign: 'right'
  }
})

interface FullArticle extends Article {
  createdbyusername: string
}

interface Article {
  id: string
  title: string
  description: string
  createdby: string
  createdat: Date
  thumbnailurl: string
  slug: string
}

export default ({
  article: {
    id,
    title,
    description,
    createdby: createdBy,
    createdat: createdAt,
    thumbnailurl: thumbnailUrl,
    slug: slug,
    createdbyusername
  }
}: {
  article: FullArticle
}) => {
  const classes = useStyles()
  const readMoreUrl = routes.viewAssetWithVar.replace(':assetId', slug || id)
  return (
    <Paper className={classes.root}>
      <AssetThumbnail url={thumbnailUrl} />
      <Heading variant="h2" className={classes.heading}>
        <Link to={readMoreUrl}>{title}</Link>
      </Heading>
      Posted <FormattedDate date={createdAt} /> by{' '}
      <Link to={routes.viewUserWithVar.replace(':userId', createdBy)}>
        {createdbyusername}
      </Link>
      <div className={classes.description}>
        <Markdown source={trimDescription(description)} />
      </div>
      <div className={classes.controls}>
        <Button url={readMoreUrl}>Read More</Button>
      </div>
    </Paper>
  )
}
