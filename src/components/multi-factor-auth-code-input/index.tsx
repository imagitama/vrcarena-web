import { useState } from 'react'
import CheckIcon from '@mui/icons-material/Check'

import TextInput, { Props as TextInputProps } from '../text-input'
import Button from '../button'
import ErrorMessage from '../error-message'

const TOTP_LENGTH = 6

enum ErrorCode {
  NoCode,
  InvalidSymbols,
  InvalidLength,
}

const getMessageForErrorCode = (code: ErrorCode): string => {
  switch (code) {
    case ErrorCode.NoCode:
      return 'You need to enter a code'
    case ErrorCode.InvalidSymbols:
      return 'You must enter digits only'
    case ErrorCode.InvalidLength:
      return 'You must enter 6 digits'
    default:
      return `Unknown error code: ${code}`
  }
}

const MultiFactorAuthCodeInput = ({
  onCode,
  ...textInputProps
}: { onCode: (code: string) => void | Promise<void> } & TextInputProps) => {
  const [codeTextVal, setCodeTextVal] = useState('')
  const [lastErrorCode, setLastErrorCode] = useState<null | ErrorCode>(null)

  const submit = () => {
    const code = codeTextVal.trim()

    if (!code) {
      setLastErrorCode(ErrorCode.NoCode)
      return
    }

    if (!/^\d+$/.test(code)) {
      setLastErrorCode(ErrorCode.InvalidSymbols)
      return
    }

    if (code.length !== TOTP_LENGTH) {
      setLastErrorCode(ErrorCode.InvalidLength)
      return
    }

    onCode(code)
  }

  return (
    <>
      <TextInput
        {...textInputProps}
        value={codeTextVal}
        onChange={(e) => setCodeTextVal(e.target.value)}
        inputProps={{
          inputMode: 'numeric',
          pattern: '[0-9]*',
          maxLength: TOTP_LENGTH,
          autoComplete: 'one-time-code', // some devices will be smart and suggest a copied code
        }}
        onKeyDown={(e) => {
          if (e.key == 'Enter') {
            submit()
          }
        }}
        button={
          <Button icon={<CheckIcon />} onClick={submit}>
            Submit
          </Button>
        }
      />
      {lastErrorCode !== null && (
        <ErrorMessage>{getMessageForErrorCode(lastErrorCode)}</ErrorMessage>
      )}
    </>
  )
}

export default MultiFactorAuthCodeInput
