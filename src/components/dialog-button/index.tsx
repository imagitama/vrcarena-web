import { useState } from 'react'
import Button, { ButtonProps } from '../button'
import Dialog, { DialogProps } from '../dialog'

type Props = {
  dialog: React.ReactElement
  dialogProps?: DialogProps
} & ButtonProps

const DialogButton = (buttonProps: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      {isOpen && (
        <Dialog
          onClose={() => setIsOpen(false)}
          {...(buttonProps.dialogProps || {})}>
          {buttonProps.dialog}
        </Dialog>
      )}
      <Button onClick={() => setIsOpen(!isOpen)} {...buttonProps} />
    </>
  )
}

export default DialogButton
