import React, { useContext } from 'react'
import { makeStyles } from '@mui/styles'

import { RelationItem, RelationsItems } from '@/components/relations'

import TabContext from '../../context'
import NoResultsMessage from '@/components/no-results-message'

const useStyles = makeStyles({
  item: { margin: '0.5rem' },
})

export default () => {
  const { assetExtra } = useContext(TabContext)
  const classes = useStyles()

  if (!assetExtra) {
    return null
  }

  if (!assetExtra.mentionsdata.length)
    return <NoResultsMessage>No mentions yet</NoResultsMessage>

  return (
    <RelationsItems>
      {assetExtra.mentionsdata.map(({ asset, relation }) => {
        return (
          <div key={asset.id} className={classes.item}>
            {relation ? (
              <RelationItem
                relation={{
                  type: relation.type,
                  asset: relation.asset,
                  comments: '',
                }}
                asset={asset}
                showRelation
              />
            ) : null}
          </div>
        )
      })}
    </RelationsItems>
  )
}
