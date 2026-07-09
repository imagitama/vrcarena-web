import React, { useState } from 'react'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { makeStyles } from '@mui/styles'

import * as routes from '@/routes'
import Link from '@/components/link'
import useIsEditor from '@/hooks/useIsEditor'
import { CollectionNames as AssetsCollectionNames } from '@/modules/assets'
import { CollectionNames as AuthorsCollectionNames } from '@/modules/authors'
import { FullAmendment } from '@/modules/amendments'

import FormattedDate from '@/components/formatted-date'
import Button from '@/components/button'
import ShortDiff from '@/components/short-diff'
import SuccessMessage from '@/components/success-message'
import AmendmentEditorRecordManager from '@/components/amendment-editor-record-manager'
import AssetResultsItem from '@/components/asset-results-item'
import AuthorResultsItem from '@/components/author-results-item'
import UsernameLink from '@/components/username-link'
import { HydrateFn } from '@/hooks/useDataStore'
import useTimer from '@/hooks/useTimer'

const useStyles = makeStyles({
  mainCell: {
    borderBottom: 'none',
  },
})

const ParentRenderer = ({ table, data }: { table: string; data: any }) => {
  switch (table) {
    case AssetsCollectionNames.Assets:
      return <AssetResultsItem asset={data} />
    case AuthorsCollectionNames.Authors:
      return <AuthorResultsItem author={data} />
    default:
      return <>Unknown table "{table}"</>
  }
}

const AmendmentResultsItem = ({
  result,
  showParentDetails = true,
  hydrate,
}: {
  result: FullAmendment<any>
  showParentDetails?: boolean
  hydrate?: HydrateFn
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const {
    id: amendmentId,
    parenttable: parentTable,
    fields: fields,
    comments: comments,
    createdat: createdAt,
    createdby: createdBy,
    parentdata: parentData,
    createdbyusername: createdByUsername,
    createdbyreputation: createdByRep,
  } = result
  const hydrateAfterDelay = useTimer(hydrate)

  const classes = useStyles()
  const isEditor = useIsEditor()

  const onDone = () => {
    setIsSuccess(true)
    if (hydrate) hydrateAfterDelay()
  }

  return (
    <>
      <TableRow title={amendmentId}>
        {showParentDetails && (
          <TableCell className={classes.mainCell}>
            <ParentRenderer table={parentTable} data={parentData} />
          </TableCell>
        )}
        <TableCell className={classes.mainCell}>
          {Object.values(fields).length} fields modified <br />
          {comments ? (
            <>
              <strong>Comments:</strong> {comments}
            </>
          ) : (
            '(no comments)'
          )}
          <br />
          <br />
          <Link
            to={routes.viewAmendmentWithVar.replace(
              ':amendmentId',
              amendmentId
            )}
            color="secondary">
            Go To Amendment
          </Link>
          <br />
          <br />
          <Button onClick={() => setIsExpanded((currentVal) => !currentVal)}>
            Show Fields
          </Button>
        </TableCell>
        <TableCell className={classes.mainCell}>
          <FormattedDate date={createdAt} /> by{' '}
          <UsernameLink
            id={createdBy}
            username={createdByUsername}
            reputation={createdByRep}
          />
        </TableCell>
        {isEditor ? (
          <TableCell className={classes.mainCell}>
            {isSuccess ? (
              <SuccessMessage>
                Amendment has been updated successfully, refreshing...
              </SuccessMessage>
            ) : null}
            <AmendmentEditorRecordManager amendment={result} onDone={onDone} />
          </TableCell>
        ) : null}
      </TableRow>
      {isExpanded ? (
        <TableRow>
          <TableCell colSpan={999} style={{ marginBottom: '1rem' }}>
            <ShortDiff
              type={parentTable as any}
              oldFields={parentData}
              newFields={fields}
              onlyNewFields={fields}
            />
          </TableCell>
        </TableRow>
      ) : null}
    </>
  )
}

export default AmendmentResultsItem
