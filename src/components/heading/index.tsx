import React, { forwardRef } from 'react'
import Typography, { TypographyProps } from '@mui/material/Typography'
import { makeStyles } from '@mui/styles'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import { VRCArenaTheme } from '../../themes'

function getFontSizeForVariant(variant?: string) {
  switch (variant) {
    case 'h1':
      return '3rem'
    case 'h2':
      return '1.5rem'
    case 'h3':
      return '1.25rem'
    default:
      return '1rem'
  }
}

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  heading: ({ variant }: { variant?: string }) => ({
    fontSize: getFontSizeForVariant(variant),
    margin: '2rem 0 1rem',
    [mediaQueryForTabletsOrBelow]: {
      marginTop: '1rem',
    },
  }),
  noTopMargin: {
    marginTop: '0 !important',
  },
  noMargin: {
    margin: '0 !important',
  },
  fakeLink: {
    color: theme.palette.primary.light,
  },
  inline: {
    display: 'inline',
  },
}))

interface Props extends TypographyProps {
  noTopMargin?: boolean
  noMargin?: boolean
  className?: string
  id?: string
  fakeLink?: boolean
  style?: Object
  inline?: boolean
}

export default forwardRef<HTMLHeadingElement, Props>(
  (
    {
      children,
      variant,
      noTopMargin = false,
      noMargin = false,
      className = '',
      id,
      fakeLink,
      style = {},
      inline,
    },
    ref
  ) => {
    const classes = useStyles({ variant })

    return (
      <Typography
        variant={variant}
        className={`${classes.heading} ${
          noTopMargin ? classes.noTopMargin : ''
        } ${noMargin ? classes.noMargin : ''} ${className} ${
          fakeLink ? classes.fakeLink : ''
        } ${inline ? classes.inline : ''}`}
        ref={ref}
        id={id}
        style={style}>
        {children}
      </Typography>
    )
  }
)
