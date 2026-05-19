import React from 'react'
import ReportIcon from '@mui/icons-material/Report'

import { trackAction } from '@/analytics'
import * as routes from '@/routes'
import Button, { ButtonProps } from '@/components/button'

const ReportButton = ({
  type,
  id,
  small = false,
  analyticsCategoryName,
  ...buttonProps
}: {
  type: string
  id: string
  small?: boolean
  analyticsCategoryName?: string
} & ButtonProps) => {
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
      iconOnly={small}
      {...buttonProps}>
      {small ? '' : 'Report'}
    </Button>
  )
}

export default ReportButton
