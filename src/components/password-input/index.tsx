import { useState } from 'react'
import styled from '@emotion/styled'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import TextInput, { Props } from '../text-input'

const Root = styled.span`
  width: 100%;
  position: relative;
  display: inline-block;
`

const Icon = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  font-size: 150%;
  cursor: pointer;
  aspect-ratio: 1 / 1;
  height: 40px; /* input height */
  display: flex;
  align-items: center;
  justify-content: center;
`

const PasswordInput = ({
  value,
  onChange,
  ...otherProps
}: { value: string; onChange: (val: string) => void } & Omit<
  Props,
  'onChange'
>) => {
  const [isRevealed, setIsRevealed] = useState(false)
  return (
    <Root>
      <TextInput
        topMargin
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label="Password"
        type={isRevealed ? 'text' : 'password'}
        autoComplete="current-password"
        {...otherProps}
      />
      <Icon onClick={() => setIsRevealed(!isRevealed)} title="Reveal password">
        {isRevealed ? <VisibilityIcon /> : <VisibilityOffIcon />}
      </Icon>
    </Root>
  )
}

export default PasswordInput
