import React, { SyntheticEvent, forwardRef } from 'react'
import Link from '../../components/link'
import MaterialButton from '@mui/material/Button'
import { makeStyles } from '@mui/styles'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import Tooltip from '../tooltip'
import { VRCArenaTheme } from '../../themes'

export interface ButtonProps {
  children?: React.ReactNode
  onClick?: (e: SyntheticEvent) => Promise<void> | void
  url?: string
  icon?: React.ReactElement
  isDisabled?: boolean
  className?: string
  openInNewTab?: boolean
  switchIconSide?: boolean
  isLoading?: boolean
  size?: 'small' | 'medium' | 'large'
  // tertiary does not exist
  color?: 'inherit' | 'primary' | 'secondary' | undefined | 'tertiary'
  title?: string
  iconOnly?: boolean
  checked?: boolean
}

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  icon: {
    marginLeft: '0.5rem',
    display: 'flex', // fix line height issue
    '& svg': {
      fontSize: '150%',
      fill: (props: ButtonProps) =>
        props.color === 'secondary'
          ? theme.palette.common.black
          : theme.palette.common.white,
      width: '1em',
      height: '1em',
    },
  },
  small: {
    marginLeft: '0.25rem',
  },
  switchIconSide: {
    marginLeft: 0,
    marginRight: '0.5rem',
    '&$small': {
      marginRight: '0.25rem',
    },
  },
  tertiary: {
    color: '#FFF',
    // @ts-ignore
    backgroundColor: theme.palette.tertiary
      ? // @ts-ignore
        theme.palette.tertiary.main
      : '#000',
    '&:hover': {
      // @ts-ignore
      backgroundColor: theme.palette.tertiary
        ? // @ts-ignore
          theme.palette.tertiary.dark
        : '#111',
    },
  },
  label: {
    display: 'flex',
    alignItems: 'center',
  },
  loading: {
    filter: 'blur(2px)',
  },
  noChildren: {
    marginLeft: 0,
  },
  noMargin: {
    margin: 0,
    '& svg': {
      margin: 0,
    },
  },
}))

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      onClick = undefined,
      url = '',
      icon = undefined,
      isDisabled = false,
      className = '',
      openInNewTab = true,
      switchIconSide = false,
      isLoading = false,
      title,
      iconOnly,
      checked,
      ...props
    }: ButtonProps,
    ref
  ) => {
    const classes = useStyles(props)

    const iconToUse =
      checked === true ? (
        <CheckBoxIcon />
      ) : checked === false ? (
        <CheckBoxOutlineBlankIcon />
      ) : (
        icon
      )

    const contents = (
      <MaterialButton
        ref={ref}
        variant="contained"
        color="primary"
        onClick={onClick}
        disabled={isDisabled}
        className={`${classes.root} ${url ? '' : className} ${
          // @ts-ignore
          props.color === 'tertiary' ? classes.tertiary : ''
        }`}
        {...props}>
        {/* > */}
        <span
          className={`${classes.label} ${isLoading ? classes.loading : ''}`}>
          {!switchIconSide && children ? <>{children} </> : null}
          {iconToUse && (
            <span
              className={`${classes.icon} ${iconOnly ? classes.noMargin : ''} ${
                props.size === 'small' ? classes.small : ''
              } ${switchIconSide ? classes.switchIconSide : ''} ${
                children ? '' : classes.noChildren
              }`}>
              {iconToUse}
            </span>
          )}
          {switchIconSide && children ? <>{children} </> : null}
        </span>
      </MaterialButton>
    )

    const contentsWithTitle = title ? (
      <Tooltip title={title}>{contents}</Tooltip>
    ) : (
      contents
    )

    if (url) {
      if (url.substring(0, 1) === '/') {
        return (
          <Link to={url} className={className}>
            {contentsWithTitle}
          </Link>
        )
      } else {
        return (
          <a
            href={url}
            className={className}
            {...(openInNewTab
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}>
            {contentsWithTitle}
          </a>
        )
      }
    }

    return contentsWithTitle
  }
)

export default Button
