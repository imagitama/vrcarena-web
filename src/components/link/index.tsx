import React from 'react'
import { Link as ReactRouterLink, LinkProps } from 'react-router-dom'
import { scrollToTop } from '../../utils'

// this hook exists because on tab click we want to push() but we dont want to scroll which is annoying
// but we still want to perform a scroll to top on nav

type Props = Omit<LinkProps, 'onClick' | 'children'> & {
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => false | void
  children: any
}

const Link = (props: Props) => (
  <ReactRouterLink
    {...props}
    onClick={(e) => {
      if (props.onClick) {
        const result = props.onClick(e)

        if (result !== false) {
          scrollToTop(false)
        }
      }
    }}
  />
)

export default Link
