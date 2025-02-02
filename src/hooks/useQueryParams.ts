import { useLocation } from 'react-router-dom'

export default function() {
  // handle legacy browsers
  if (!window.URLSearchParams) {
    return {
      get: () => ''
    }
  }
  return new URLSearchParams(useLocation().search)
}
