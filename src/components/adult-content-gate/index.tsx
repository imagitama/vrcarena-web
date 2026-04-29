import React from 'react'
import useAdultContentToggle from '@/hooks/useAdultContentToggle'
import useAdultContentGate from '@/hooks/useAdultContentGate'
import Button from '@/components/button'
import WarningMessage from '@/components/warning-message'

const AdultContentGate = ({ toggleId }: { toggleId: string }) => {
  const [, toggleGate] = useAdultContentGate(toggleId)
  const [, toggleOver18] = useAdultContentToggle()

  const onPermaEnter = () => {
    toggleOver18()
  }

  return (
    <WarningMessage title="Adult Content">
      This has been flagged as adult content and is hidden by default.
      <br />
      <br />
      <Button onClick={toggleGate} size="large">
        View This Content
      </Button>{' '}
      <Button onClick={onPermaEnter} size="large">
        View All Adult Content Permanently
      </Button>
    </WarningMessage>
  )
}

export default AdultContentGate
