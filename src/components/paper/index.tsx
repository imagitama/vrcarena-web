import React from 'react'
import styled from '@emotion/styled'

import MaterialPaper from '@mui/material/Paper'

interface Props {
  children: React.ReactNode
  hover?: boolean
  selected?: boolean
  noPadding?: boolean
  noMargin?: boolean
  className?: string
}

const Paper = styled(MaterialPaper)<Props>`
  padding: ${({ noPadding }) => (noPadding ? '0' : '1rem 0')};
  transition: all 100ms;
  margin: ${({ noMargin }) => (noMargin ? '0' : '1rem 0')};
`

export default Paper
