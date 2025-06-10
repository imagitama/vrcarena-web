import React from 'react'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@mui/styles'

import FormattedDate from '../../components/formatted-date'
import * as routes from '../../routes'
import Paper from '../../components/paper'
import PaginatedView from '../../components/paginated-view'
import { FullActivityEntry, ViewNames } from '../../modules/activity'
import ActivityItemLabel from '../../components/activity-item-label'
import { FullHistoryEntry } from '../../modules/history'

const useStyles = makeStyles({
  item: {},
  date: {
    marginTop: '0.25rem',
    fontSize: '75%',
  },
})

const Results = ({ results }: { results: FullActivityEntry[] }) => {
  const classes = useStyles()
  return (
    <>
      {results.map(
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
          <Paper key={id} margin className={classes.item}>
            <ActivityItemLabel
              message={message}
              parent={parent}
              parentTable={parentTable}
              extraData={moreData}
              createdBy={createdBy}
              createdByUsername={createdByUsername}
            />
            <div className={classes.date}>
              <FormattedDate date={createdAt} />
            </div>
          </Paper>
        )
      )}
    </>
  )
}

const Renderer = ({ items = [] }: { items?: FullActivityEntry[] }) => (
  <Results results={items} />
)

export default () => {
  return (
    <>
      <Helmet>
        <title>View the recent activity around the site | VRCArena</title>
        <meta
          name="description"
          content="Take a look at the actions performed by users on the site including editing assets, profiles and more."
        />
      </Helmet>
      Updated every 15 minutes
      <PaginatedView<FullHistoryEntry>
        viewName={ViewNames.FullActivity}
        sortKey="history"
        defaultFieldName="createdat"
        urlWithPageNumberVar={routes.activityWithPageNumberVar}>
        <Renderer />
      </PaginatedView>
    </>
  )
}
