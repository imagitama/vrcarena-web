import React, { useState } from 'react'
import PanToolIcon from '@mui/icons-material/PanTool'

import { messages } from '@/config'

import Button from '@/components/button'
import Heading from '@/components/heading'
import Dialog from '@/components/dialog'
import WarningMessage from '@/components/warning-message'
import ClaimForm from '@/components/claim-form'

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
