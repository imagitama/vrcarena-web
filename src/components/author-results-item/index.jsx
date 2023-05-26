import React from 'react'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

import * as routes from '../../routes'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import categoryMeta from '../../category-meta'
import Avatar from '../avatar'
import { AuthorFieldNames } from '../../hooks/useDatabaseQuery'

const useStyles = makeStyles({
  root: {
    width: '200px',
    margin: '0.5rem',
    position: 'relative',
    [mediaQueryForTabletsOrBelow]: {
      width: '160px',
      margin: '0.25rem'
    }
  },
  media: {
    height: '200px',
    [mediaQueryForTabletsOrBelow]: {
      height: '160px'
    }
  },
  content: {
    '&, &:last-child': {
      padding: 16
    }
  },
  cats: {
    marginTop: '0.35rem'
  }
})

export default ({
  author: {
    id,
    [AuthorFieldNames.name]: name,
    [AuthorFieldNames.categories]: categories = [],
    [AuthorFieldNames.avatarUrl]: avatarUrl = ''
  },
  onClick = undefined
}) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Card>
        <CardActionArea>
          <Link
            to={routes.viewAuthorWithVar.replace(':authorId', id)}
            onClick={onClick}>
            <Avatar url={avatarUrl} username={name} />
            <CardContent className={classes.content}>
              <Typography variant="h5" component="h2">
                {name}
              </Typography>
              <div className={classes.cats}>
                {categories && categories.length
                  ? categories
                      .map(categoryName => categoryMeta[categoryName].name)
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
