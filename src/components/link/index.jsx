import React from 'react'
import { Link } from 'react-router-dom'
import { scrollToTop } from '../../utils'

// this hook exists because on tab click we want to push() but we dont want to scroll which is annoying
// but we still want to perform a scroll to top on nav

export default props => (
  <Link
    {...props}
    onClick={e => {
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
