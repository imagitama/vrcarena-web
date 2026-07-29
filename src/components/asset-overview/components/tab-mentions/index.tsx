import React, { useContext, useEffect } from 'react'
import { makeStyles } from '@mui/styles'

import { Asset, FunctionNames } from '@/modules/assets'

import useIsAdultContentEnabled from '@/hooks/useIsAdultContentEnabled'
import useDataStoreFunction from '@/hooks/useDataStoreFunction'

import { RelationItem, RelationsItems } from '@/components/relations'

import TabContext from '../../context'

const useStyles = makeStyles({
  item: { margin: '0.5rem' },
})

export default () => {
  const { assetExtra } = useContext(TabContext)
  const classes = useStyles()

  if (!assetExtra) {
    return null
  }

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
