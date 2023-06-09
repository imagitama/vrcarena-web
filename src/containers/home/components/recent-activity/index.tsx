import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LoadingShimmer from '../../../../components/loading-shimmer'
import useSupabaseView from '../../../../hooks/useSupabaseView'
import { FullActivityEntry } from '../../../../modules/activity'
import ActivityItemLabel from '../../../../components/activity-item-label'
import { colors } from '../../../../brand'
import FormattedDate from '../../../../components/formatted-date'
import { CommonFieldNames } from '../../../../data-store'
import { OrderDirections } from '../../../../hooks/useDatabaseQuery'

const useStyles = makeStyles({
  items: {},
  item: {
    marginBottom: '0.25rem'
  },
  date: {
    fontSize: '75%',
    marginLeft: '0.5rem'
  }
})

export default () => {
  const getQuery = useCallback(
    (query: any): any =>
      query.order(CommonFieldNames.createdAt, { ascending: false }),
    []
  )
  const [isLoading, isError, activityEntries] = useSupabaseView<
    FullActivityEntry[]
  >('fullActivity', getQuery)
  const classes = useStyles()

  if (isLoading) {
    return <LoadingShimmer height="20px" />
  }

  if (isError || !Array.isArray(activityEntries)) {
    return null
  }

  return (
    <div className={classes.items}>
      {activityEntries.map(
        ({
          id,
          message,
          parent,
          parenttable: parentTable,
          createdat: createdAt,
          parentdata: parentData,
          moredata: moreData,
          createdby: createdBy,
          createdbyusername: createdByUsername
        }) => (
          <div key={id} className={classes.item}>
            <ActivityItemLabel
              message={message}
              parent={parent}
              parentTable={parentTable}
              parentData={parentData}
              extraData={moreData}
              createdBy={createdBy}
              createdByUsername={createdByUsername}
            />
            <span className={classes.date}>
              <FormattedDate date={createdAt} />
            </span>
          </div>
        )
      )}
    </div>
  )
}
