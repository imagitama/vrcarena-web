import React, { forwardRef } from 'react'
import Typography, { TypographyProps } from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'

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

const useStyles = makeStyles(theme => ({
  heading: ({ variant }: { variant?: string }) => ({
    fontSize: getFontSizeForVariant(variant),
    margin: '2rem 0 1rem',
    [mediaQueryForTabletsOrBelow]: {
      marginTop: '1rem'
    }
  }),
  noTopMargin: {
    marginTop: '0 !important'
  },
  noMargin: {
    margin: '0 !important'
  },
  fakeLink: {
    color: theme.palette.primary.light
  }
}))

interface Props extends TypographyProps {
  noTopMargin?: boolean
  noMargin?: boolean
  className?: string
  id?: string
  fakeLink?: boolean
  style?: Object
}

export default forwardRef<{}, Props>(
  (
    {
      children,
      variant,
      noTopMargin = false,
      noMargin = false,
      className = '',
      id,
      fakeLink,
      style = {}
    },
    ref
  ) => {
    const classes = useStyles({ variant })

    return (
      // @ts-ignore
      <Typography
        variant={variant}
        className={`${classes.heading} ${
          noTopMargin ? classes.noTopMargin : ''
        } ${noMargin ? classes.noMargin : ''} ${className} ${
          fakeLink ? classes.fakeLink : ''
        }`}
        ref={ref}
        id={id}
        style={style}>
        {children}
      </Typography>
    )
  }
)
