import React from 'react'
import { makeStyles } from '@mui/styles'
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

const useStyles = makeStyles({
  title: {
    fontSize: '150%',
    '& > *': {
      margin: '5px 0 0 !important',
    },
  },
  requiredLabel: {
    marginLeft: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginRight: '0.25rem',
    },
  },
})

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
}) => {
  const classes = useStyles()

  return isAccordion ? (
    <Accordion defaultExpanded={startExpanded}>
      <AccordionSummary className={classes.title}>
        {editableField.label || '(no label)'}{' '}
        {editableField.isRequired && (
          <StatusText positivity={-1} className={classes.requiredLabel}>
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
}
