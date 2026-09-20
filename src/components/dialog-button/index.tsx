import React, { useEffect, useState } from 'react'
import Button, { ButtonProps } from '../button'
import Dialog, { DialogProps } from '../dialog'

type Props = {
  dialog:
    | React.ReactElement<{ close?: () => void }>
    | React.ComponentType<{ close: () => void }>
  dialogProps?: DialogProps
} & ButtonProps

function renderDialog(dialog: Props['dialog'], close: () => void) {
  if (React.isValidElement(dialog)) {
    return React.cloneElement(dialog, { close })
  }
  const Dialog = dialog // narrowed to ComponentType
  return <Dialog close={close} />
}

const DialogButton = (buttonProps: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      {isOpen && (
        <Dialog
          onClose={() => setIsOpen(false)}
          {...(buttonProps.dialogProps || {})}>
          {renderDialog(buttonProps.dialog, () => setIsOpen(false))}
        </Dialog>
      )}
      <Button onClick={() => setIsOpen(!isOpen)} {...buttonProps} />
    </>
  )
}

export default DialogButton
