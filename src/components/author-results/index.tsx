import React from 'react'
import { makeStyles } from '@mui/styles'
import AuthorResultsItem from '../author-results-item'
import { Author } from '../../modules/authors'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' },
})

const AuthorResults = ({
  authors,
  onClick,
}: {
  authors?: Author[]
  onClick?: (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    authorId: string,
    author: Author
  ) => void
}) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {authors
        ? authors.map((author) => (
            <AuthorResultsItem
              key={author.id}
              author={author}
              onClick={
                onClick ? (e) => onClick(e, author.id, author) : undefined
              }
            />
          ))
        : null}
    </div>
  )
}

export default AuthorResults
