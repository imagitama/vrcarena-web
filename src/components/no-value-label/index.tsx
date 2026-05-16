import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { colorGreyedOut } from '@/themes'

const NoValueLabel = styled.span<{ small?: boolean }>`
  color: ${colorGreyedOut};
  cursor: default;
  ${({ small }) =>
    small &&
    css`
      font-size: 75%;
    `}
`

export default NoValueLabel
