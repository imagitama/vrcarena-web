import React from 'react'
import { Link as ReactRouterLink, LinkProps } from 'react-router-dom'
import { scrollToTop } from '../../utils'
import { OpenExternalLink } from '../../icons'

// this hook exists because on tab click we want to push() but we dont want to scroll which is annoying
// but we still want to perform a scroll to top on nav

type Props = Omit<LinkProps, 'onClick' | 'children'> & {
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => false | void
  children: any
  inNewTab?: boolean
}

const Link = (props: Props) =>
  props.inNewTab ? (
    <a
      href={props.to as string}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (props.onClick) {
          const result = props.onClick(e)

          if (result !== false) {
            scrollToTop(false)
          }
        }
      }}>
      {props.children} <OpenExternalLink />
    </a>
  ) : (
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
