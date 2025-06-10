import React from 'react'
import ReportIcon from '@mui/icons-material/Report'
import { trackAction } from '../../analytics'
import Button from '../button'
import * as routes from '../../routes'

export default ({
  type,
  id,
  small = false,
  analyticsCategoryName,
}: {
  type: string
  id: string
  small?: boolean
  analyticsCategoryName?: string
}) => {
  const onBtnClick = () => {
    if (analyticsCategoryName) {
      trackAction(analyticsCategoryName, 'Click report button', {
        type,
        id,
      })
    }
  }

  return (
    <Button
      color="secondary"
      icon={<ReportIcon />}
      onClick={onBtnClick}
      url={routes.createReportWithVar
        .replace(':parentTable', type)
        .replace(':parentId', id)}
      size={small ? 'small' : undefined}
      title="Report"
      iconOnly={small}>
      {small ? '' : 'Report'}
    </Button>
  )
}
