import React from 'react'
import { makeStyles } from '@mui/styles'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MaterialSelect, { SelectProps } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import classNames from 'classnames'

export { MenuItem }

const useStyles = makeStyles({
  root: {},
  inputGroup: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    height: '40px', // to match 100%
  },
  withButton: {
    '& $select': {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    '& $button': {
      borderLeft: 'none',
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
  },
  select: {},
  topMargin: {
    marginTop: '0.5rem',
  },
  label: {
    '&&': {
      fontSize: '0.875rem', // copied from button
    },
  },
})

const Select = ({
  label,
  id,
  button,
  topMargin,
  ...props
}: SelectProps & {
  button?: React.ReactElement
  label?: React.ReactNode
  topMargin?: boolean
}) => {
  const classes = useStyles()
  const labelId = id ? `${id}-label` : undefined
  return (
    <FormControl
      variant="outlined"
      fullWidth={props.fullWidth}
      size="small"
      className={classNames({
        [classes.root]: true,
        [classes.withButton]: button !== undefined,
        [classes.topMargin]: topMargin !== undefined,
      })}>
      {label && (
        <InputLabel id={labelId} className={classes.label}>
          {label}
        </InputLabel>
      )}
      <div className={classes.inputGroup}>
        <MaterialSelect
          labelId={labelId}
          id={id}
          label={label}
          style={{ minWidth: '200px' }}
          className={classes.select}
          size="small"
          {...props}
        />
        {button
          ? React.cloneElement(button, {
              className: classes.button,
              size: 'small',
            })
          : null}
      </div>
    </FormControl>
  )
}

export default Select
