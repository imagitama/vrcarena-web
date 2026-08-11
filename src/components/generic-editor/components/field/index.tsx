import React from 'react'
import { makeStyles } from '@mui/styles'
import FormControl from '@mui/material/FormControl'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import FormHelperText from '@mui/material/FormHelperText'
import styled from '@emotion/styled'

import { EditableField } from '@/editable-fields'
import { ChevronDown as ChevronDownIcon, Warning as WarningIcon } from '@/icons'

import Heading from '@/components/heading'
import Markdown from '@/components/markdown'
import StatusText from '@/components/status-text'
import { fieldTypes } from '@/generic-forms'
import { mediaQueryForMobiles } from '@/media-queries'

const useStyles = makeStyles({
  root: {
    position: 'relative',
    display: 'flex',
    [mediaQueryForMobiles]: {
      flexWrap: 'wrap',
    },
    '& > *:nth-child(2)': {
      width: '70%',
      [mediaQueryForMobiles]: {
        width: '100%',
      },
    },
    '&&': {
      // TODO: replace inherited Paper somehow
      margin: 0,
      background: 'none',
      border: 'none',
      boxShadow: 'none',
      '&:nth-child(even)': {
        background: 'rgba(0,0,0,0.1)',
      },
      // borderBottom: '1px solid rgba(255,255,255,0.15)',
    },
  },
  title: {
    width: '30%',
    [mediaQueryForMobiles]: {
      width: '100%',
    },
    fontSize: '125%',
    '& > *': {
      display: 'flex',
      flexDirection: 'column',
    },
  },
  content: {
    '&&': {
      padding: '0.25rem',
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
  expanded: {
    '&&': {
      margin: '0 !important',
    },
  },
})

const ExpandHint = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  margin-top: 5px;
  right: 0;
  font-size: 150%;
`

const Field = ({
  editableField,
  children,
  isAccordion,
  isRequired,
  startExpanded,
  isExpanded,
  onExpandChange,
}: {
  editableField: EditableField<any>
  children: React.ReactNode
  isAccordion?: boolean
  isRequired?: boolean
  startExpanded?: boolean
  isExpanded?: boolean
  onExpandChange?: (newVal: boolean) => void
}) => {
  const classes = useStyles()

  return isAccordion ? (
    <Accordion
      expanded={isExpanded}
      defaultExpanded={startExpanded}
      onChange={(e, newVal) =>
        onExpandChange ? onExpandChange(newVal) : undefined
      }
      className={classes.root}
      classes={{
        expanded: classes.expanded,
      }}>
      <AccordionSummary className={classes.title}>
        <span>{editableField.label || ''} </span>
        {editableField.isRequired && (
          <StatusText positivity={-1} className={classes.requiredLabel}>
            {' '}
            <WarningIcon /> Required
          </StatusText>
        )}
        {isExpanded === false && (
          <ExpandHint>
            <ChevronDownIcon />
          </ExpandHint>
        )}
      </AccordionSummary>
      <AccordionDetails className={classes.content}>
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
      {editableField.type !== fieldTypes.checkbox && (
        <Heading variant="h3" noTopMargin>
          {editableField.label || ''}
        </Heading>
      )}
      {children}
      {editableField.hint && (
        <FormHelperText>
          <Markdown source={editableField.hint} />
        </FormHelperText>
      )}
    </FormControl>
  )
}

export default Field
