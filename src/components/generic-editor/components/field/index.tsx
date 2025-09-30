import React from 'react'
import FormControl from '@mui/material/FormControl'
import Heading from '../../../heading'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormHelperText,
} from '@mui/material'
import Markdown from '@/components/markdown'
import { EditableField } from '@/editable-fields'
import { Warning as WarningIcon } from '@/icons'
import StatusText from '@/components/status-text'

export default ({
  editableField,
  children,
  isAccordion,
  isRequired,
  startExpanded,
}: {
  editableField: EditableField<any>
  children: React.ReactNode
  isAccordion?: boolean
  isRequired?: boolean
  startExpanded?: boolean
}) =>
  isAccordion ? (
    <Accordion defaultExpanded={startExpanded}>
      <AccordionSummary>
        {editableField.label || '(no label)'}{' '}
        {editableField.isRequired && (
          <StatusText positivity={-1}>
            {' '}
            <WarningIcon /> Required
          </StatusText>
        )}
      </AccordionSummary>
      <AccordionDetails>
        <FormControl fullWidth>{children}</FormControl>
        {editableField.hint && (
          <FormHelperText>
            <Markdown source={editableField.hint} />
          </FormHelperText>
        )}
      </AccordionDetails>
    </Accordion>
  ) : (
    <FormControl fullWidth style={{ marginBottom: '2rem' }}>
      <Heading variant="h3" noTopMargin>
        {editableField.label || '(no label)'}
      </Heading>
      {children}
      {editableField.hint && (
        <FormHelperText>
          <Markdown source={editableField.hint} />
        </FormHelperText>
      )}
    </FormControl>
  )
