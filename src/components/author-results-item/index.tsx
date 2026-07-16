import React from 'react'
import Link from '@/components/link'
import { makeStyles } from '@mui/styles'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'

import * as routes from '@/routes'
import { mediaQueryForTabletsOrBelow } from '@/media-queries'
import { getCategoryMeta } from '@/category-meta'
import { Author, AuthorForList } from '@/modules/authors'
import { AssetCategory } from '@/modules/assets'
import { colorPalette } from '@/config'

import DefaultAvatar from '@/components/default-avatar'
import { AccessStatus } from '@/modules/common'
import Tooltip from '../tooltip'
import Chip from '../chip'

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
    position: 'relative',
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
  selectedCard: {
    backgroundColor: `${colorPalette.selectedBg} !important`,
    boxShadow: `${colorPalette.selectedBoxShadow} !important`,
  },
  deleted: {
    backgroundColor: 'rgb(100, 0, 0) !important',
  },
  chips: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: '0.25rem',
  },
})

const AuthorResultsItem = ({
  author: { id, name, avatarurl, accessstatus },
  onClick = undefined,
  isSelected = false,
}: {
  author: AuthorForList
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
  isSelected?: boolean
}) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Card className={isSelected ? classes.selectedCard : ''}>
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
              <div className={classes.chips}>
                {accessstatus === AccessStatus.Deleted && (
                  <Tooltip title="This author has been deleted and will not show up in search results">
                    <Chip className={classes.deleted} label="Deleted" />
                  </Tooltip>
                )}
              </div>
            </CardMedia>
            <CardContent className={classes.content}>
              <Typography variant="h5" component="h2">
                {name}
              </Typography>
            </CardContent>
          </Link>
        </CardActionArea>
      </Card>
    </div>
  )
}

export default AuthorResultsItem
