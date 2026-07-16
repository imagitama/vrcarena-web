import React from 'react'
import { makeStyles } from '@mui/styles'
import AuthorResultsItem from '@/components/author-results-item'
import { Author, AuthorForList } from '@/modules/authors'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' },
})

const AuthorResults = ({
  authors,
  onClick,
}: {
  authors?: AuthorForList[]
  onClick?: (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    authorId: string,
    author: AuthorForList
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
