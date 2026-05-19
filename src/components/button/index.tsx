import React, { SyntheticEvent, forwardRef } from 'react'
import Link from '@/components/link'
import MaterialButton, {
  ButtonProps as MaterialButtonProps,
} from '@mui/material/Button'
import { makeStyles } from '@mui/styles'
import classnames from 'classnames'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'

import Tooltip from '@/components/tooltip'
import { VRCArenaTheme } from '@/themes'

export interface ButtonProps {
  children?: React.ReactNode
  onClick?: (e: SyntheticEvent) => Promise<void> | void
  url?: string
  icon?: React.ReactElement
  isDisabled?: boolean
  className?: string
  switchIconSide?: boolean
  isLoading?: boolean
  size?: 'small' | 'medium' | 'large'
  // everything after undefined is not standard
  color?: 'inherit' | 'primary' | 'secondary' | undefined | 'tertiary' | 'ai'
  title?: string
  iconOnly?: boolean
  checked?: boolean
  hollow?: boolean
  margin?: boolean // mainly for asset overview
}

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    whiteSpace: 'nowrap',
    minWidth: 0,
    height: '34px',
    '&&': {
      textTransform: 'none',
    },
  },
  icon: {
    marginLeft: '0.25rem',
    display: 'flex', // fix line height issue
    '& svg': {
      fontSize: '150%',
      width: '1em',
      height: '1em',
      fill: 'currentColor', // fix custom icons (MUI icons work fine)
    },
  },
  small: {
    height: '24px',
    '&&': {
      paddingLeft: '8px',
      paddingRight: '8px',
    },
  },
  large: {
    height: '40px',
    '&&': {
      paddingLeft: '12px',
      paddingRight: '12px',
    },
  },
  smallIcon: {
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
  ai: {
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
  iconOnly: {
    minWidth: 'auto !important',
    paddingLeft: '0.25rem !important',
    paddingRight: '0.25rem !important',
  },
  hollow: {
    '&&': {
      border: '1px solid rgba(255,255,255,0.25)',
      color: '#FFF',
      backgroundColor: 'rgba(255,255,255,0)',
      '&:hover': {
        backgroundColor: 'rgba(255,255,255,0.15)',
      },
    },
    '&&:hover': {
      borderRightColor: 'rgba(255,255,255,0.25) !important', // tried overriding but failed
    },
  },
  margin: {
    '&&': {
      margin: '0 0.25rem 0.25rem 0',
    },
  },
}))

// when provided as LinkComponent is given all props the Button root element would usually get (no type for it)
const Anchor = ({
  href: url,
  children,
  ...props
}: {
  href: string
  children: React.ReactNode
}) =>
  url.startsWith('/') ? (
    <Link to={url} {...props}>
      {children}
    </Link>
  ) : (
    <a href={url} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  )

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      onClick = undefined,
      url = '',
      icon = undefined,
      isDisabled = false,
      className = '',
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
        LinkComponent={Anchor}
        variant="contained"
        // @ts-ignore
        color="primary"
        onClick={onClick}
        disabled={isDisabled}
        className={classnames({
          [classes.root]: true,
          [classes.tertiary]: props.color === 'tertiary',
          [classes.ai]: props.color === 'ai',
          [classes.iconOnly]: iconOnly,
          [classes.hollow]: props.hollow,
          [classes.small]: props.size === 'small',
          [classes.large]: props.size === 'large',
          [classes.margin]: props.margin,
          [className]: true,
        })}
        href={url}
        {...props}>
        <span
          className={`${classes.label} ${isLoading ? classes.loading : ''}`}>
          {!switchIconSide && children ? <>{children} </> : null}
          {iconToUse && (
            <span
              className={classnames({
                [classes.icon]: true,
                [classes.smallIcon]: props.size === 'small',
                [classes.switchIconSide]: switchIconSide,
                [classes.noChildren]: !children,
              })}>
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

    return contentsWithTitle
  }
)

export default Button
