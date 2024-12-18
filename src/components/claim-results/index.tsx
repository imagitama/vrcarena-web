import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { FullClaim } from '../../modules/claims'
import {
  Author,
  CollectionNames as AuthorCollectionNames,
} from '../../modules/authors'
import AuthorResultsItem from '../author-results-item'
import Heading from '../heading'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' },
  item: {
    margin: '0.5rem',
    [mediaQueryForTabletsOrBelow]: {
      margin: '0.25rem',
    },
  },
})

const Renderer = <TData,>({
  parentTable,
  parentId,
  parentData,
}: {
  parentTable: string
  parentId: string
  parentData: TData
}) => {
  switch (parentTable) {
    case AuthorCollectionNames.Authors:
      return <AuthorResultsItem author={parentData as unknown as Author} />
    default:
      return <>No renderer</>
  }
}

const getTitleForClaim = (claim: FullClaim): string => {
  switch (claim.parenttable) {
    case AuthorCollectionNames.Authors:
      return 'Author'
    default:
      return claim.parenttable
  }
}

const ClaimResults = ({ claims }: { claims: FullClaim[] }) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      {claims.map((claim) => (
        <div key={claim.id} className={classes.item}>
          <Heading variant="h3">{getTitleForClaim(claim)}</Heading>
          <Renderer
            parentTable={claim.parenttable}
            parentId={claim.parent}
            parentData={claim.parentdata}
          />
        </div>
      ))}
    </div>
  )
}

export default ClaimResults
