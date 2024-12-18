import React, { useState } from 'react'
import PanToolIcon from '@material-ui/icons/PanTool'
import Button from '../button'
import Heading from '../heading'
import Dialog from '../dialog'
import WarningMessage from '../warning-message'
import { messages } from '../../config'
import ClaimForm from '../claim-form'

const ClaimButton = <TData,>({
  parentTable,
  parentId,
  parentData,
}: {
  parentTable: string
  parentId: string
  parentData: TData
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        icon={<PanToolIcon />}
        onClick={() => setIsOpen((currentVal) => !currentVal)}>
        Claim
      </Button>
      {isOpen ? (
        <Dialog onClose={() => setIsOpen(false)}>
          <Heading variant="h1" noMargin>
            Claim
          </Heading>
          <WarningMessage>{messages.howClaimsWork}</WarningMessage>
          <ClaimForm<TData>
            parentTable={parentTable}
            parentId={parentId}
            parentData={parentData}
            onDone={() => setIsOpen(false)}
          />
        </Dialog>
      ) : null}
    </>
  )
}

export default ClaimButton
