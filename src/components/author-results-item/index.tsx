import React from 'react'
import Link from '../../components/link'
import { makeStyles } from '@mui/styles'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'

import * as routes from '../../routes'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import { getCategoryMeta } from '../../category-meta'
import { Author } from '../../modules/authors'
import DefaultAvatar from '../default-avatar'
import { AssetCategory } from '../../modules/assets'

const useStyles = makeStyles({
  root: {
    width: '200px',
    margin: '0.5rem',
    position: 'relative',
    [mediaQueryForTabletsOrBelow]: {
      width: '160px',
      margin: '0.25rem',
    },
  },
  media: {
    height: '200px',
    [mediaQueryForTabletsOrBelow]: {
      height: '160px',
    },
  },
  content: {
    '&, &:last-child': {
      padding: 16,
    },
  },
  cats: {
    marginTop: '0.35rem',
  },
})

export default ({
  author: { id, name, categories = [], avatarurl },
  onClick = undefined,
}: {
  author: Author
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
}) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Card>
        <CardActionArea>
          <Link
            to={routes.viewAuthorWithVar.replace(':authorId', id)}
            onClick={onClick}>
            <CardMedia
              className={classes.media}
              image={avatarurl || undefined}
              title={`Avatar for author ${name}`}>
              {!avatarurl && (
                <DefaultAvatar stringForDecision={name || undefined} />
              )}
            </CardMedia>
            <CardContent className={classes.content}>
              <Typography variant="h5" component="h2">
                {name}
              </Typography>
              <div className={classes.cats}>
                {categories && categories.length
                  ? categories
                      .map(
                        (categoryName) =>
                          getCategoryMeta(categoryName as AssetCategory).name
                      )
                      .join(', ')
                  : '\u00A0'}
              </div>
            </CardContent>
          </Link>
        </CardActionArea>
      </Card>
    </div>
  )
}
