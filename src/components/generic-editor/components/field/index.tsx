import React from 'react'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Heading from '../../../heading'
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'

export default ({
  label,
  children,
  hint = '',
  isAccordion,
}: {
  label: string
  children: React.ReactNode
  hint?: string
  isAccordion?: boolean
}) =>
  isAccordion ? (
    <Accordion>
      <AccordionSummary>{label}</AccordionSummary>
      <AccordionDetails>
        <FormControl fullWidth>
          {children}
          {hint && <FormHelperText>{hint}</FormHelperText>}
        </FormControl>
      </AccordionDetails>
    </Accordion>
  ) : (
    <FormControl fullWidth style={{ marginBottom: '2rem' }}>
      <Heading variant="h3" noTopMargin>
        {label}
      </Heading>
      {children}
      {hint && <FormHelperText>{hint}</FormHelperText>}
    </FormControl>
  )
