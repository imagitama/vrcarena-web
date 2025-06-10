import React from 'react'
import { makeStyles } from '@mui/styles'
import ActivityItemLabel from '../../components/activity-item-label'
import FormattedDate from '../../components/formatted-date'
import { FullActivityEntry } from '../../modules/activity'

const useStyles = makeStyles({
  items: {},
  item: {
    marginBottom: '0.25rem',
  },
  date: {
    fontSize: '75%',
    marginLeft: '0.5rem',
  },
})

const ActivityResults = ({
  activityEntries,
}: {
  activityEntries: FullActivityEntry[]
}) => {
  const classes = useStyles()
  return (
    <div className={classes.items}>
      {activityEntries.map(
        ({
          id,
          message,
          parent,
          parenttable: parentTable,
          createdat: createdAt,
          moredata: moreData,
          createdby: createdBy,
          createdbyusername: createdByUsername,
        }) => (
          <div key={id} className={classes.item}>
            <ActivityItemLabel
              message={message}
              parent={parent}
              parentTable={parentTable}
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

export default ActivityResults
