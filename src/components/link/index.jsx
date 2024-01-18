import React from 'react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { scrollToTop } from '../../utils'

// this hook exists because on tab click we want to push() but we dont want to scroll which is annoying
// but we still want to perform a scroll to top on nav

const Link = (props) => (
  <ReactRouterLink
    {...props}
    onClick={(e) => {
      let result

      if (props.onClick) {
        result = props.onClick(e)
      }

      if (result !== false) {
        scrollToTop(false)
      }

      return result
    }}
  />
)

export default Link
