import React, { useState } from 'react'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import { makeStyles } from '@material-ui/core/styles'

import { CollectionNames as OldCollectionNames } from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import Link from '../../components/link'

import FormattedDate from '../formatted-date'
import Button from '../button'
import ShortDiff from '../short-diff'
import { FullAmendment } from '../../modules/amendments'
import SuccessMessage from '../success-message'
import AmendmentEditorRecordManager from '../amendment-editor-record-manager'
import useIsEditor from '../../hooks/useIsEditor'
import AssetResultsItem from '../asset-results-item'
import AuthorResultsItem from '../author-results-item'

const useStyles = makeStyles({
  mainCell: {
    borderBottom: 'none',
  },
})

const ParentRenderer = ({ table, data }: { table: string; data: any }) => {
  switch (table) {
    case OldCollectionNames.Assets:
      return <AssetResultsItem asset={data} />
    case OldCollectionNames.Authors:
      return <AuthorResultsItem author={data} />
    default:
      return <>Unknown table "{table}"</>
  }
}

export default ({
  result,
  showParentDetails = true,
}: {
  result: FullAmendment
  showParentDetails?: boolean
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const {
    id: amendmentId,
    parenttable: parentTable,
    // parent: parentId,
    fields: fields,
    comments: comments,
    createdat: createdAt,
    createdby: createdBy,
    parentdata: parentData,
    createdbyusername: createdByUsername,
  } = result

  const classes = useStyles()
  const isEditor = useIsEditor()

  const onDone = () => setIsSuccess(true)

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
          <Button
            url={routes.viewAmendmentWithVar.replace(
              ':amendmentId',
              amendmentId
            )}>
            View Amendment
          </Button>
        </TableCell>
        <TableCell className={classes.mainCell}>
          <FormattedDate date={createdAt} /> by{' '}
          <Link to={routes.viewUserWithVar.replace(':userId', createdBy)}>
            {createdByUsername}
          </Link>
        </TableCell>
        {isEditor ? (
          <TableCell className={classes.mainCell}>
            {isSuccess ? (
              <SuccessMessage>
                Amendment has been updated successfully
              </SuccessMessage>
            ) : null}
            <AmendmentEditorRecordManager amendment={result} onDone={onDone} />
          </TableCell>
        ) : null}
      </TableRow>
      <TableRow>
        <TableCell colSpan={999} style={{ marginBottom: '1rem' }}>
          {isExpanded ? (
            <ShortDiff
              type={parentTable}
              oldFields={parentData}
              newFields={fields}
              onlyNewFields={fields}
            />
          ) : (
            <Button onClick={() => setIsExpanded((currentVal) => !currentVal)}>
              Show Fields
            </Button>
          )}
        </TableCell>
      </TableRow>
    </>
  )
}
