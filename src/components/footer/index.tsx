import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { makeStyles } from '@mui/styles'

import * as routes from '../../routes'
import { scrollToTop } from '../../utils'
import { trackAction } from '../../analytics'
import useUserId from '../../hooks/useUserId'

// dev tools
import { alreadyOver18Key } from '../../config'
import useStorage from '../../hooks/useStorage'
import { auth as firebaseAuth } from '../../firebase'

import Button from '../button'
import BulkEditButton from '../bulk-edit-button'
import useSupabaseUserId from '../../hooks/useSupabaseUserId'
import useIsEditor from '../../hooks/useIsEditor'
import useDataStoreFunction from '../../hooks/useDataStoreFunction'
import useAccountVerification from '@/hooks/useAccountVerification'
import useIsBanned from '@/hooks/useIsBanned'

const useStyles = makeStyles({
  footer: {
    margin: '3rem 0 0 0',
    padding: '1rem 2rem',
    fontSize: '16px',
    display: 'flex',
  },
  col: {
    width: '50%',
  },
  colRight: {
    textAlign: 'right',
  },
  scrollToTopBtnWrapper: {
    marginTop: '3rem',
    textAlign: 'center',
  },
})

function ScrollToTopBtn() {
  const classes = useStyles()
  const { pathname } = useLocation()

  if (pathname === '/') {
    return null
  }

  return (
    <div className={classes.scrollToTopBtnWrapper}>
      <Button
        onClick={() => {
          scrollToTop()
          trackAction('Footer', 'Click scroll to top button')
        }}
        color="secondary">
        Scroll To Top
      </Button>
    </div>
  )
}

const footerLinks = [
  {
    url: routes.takedownPolicy,
    label: 'Takedowns',
  },
  {
    url: routes.privacyPolicy,
    label: 'Privacy Policy',
  },
  {
    url: routes.termsOfService,
    label: 'Terms of Service',
  },
  {
    url: routes.dmcaPolicy,
    label: 'DMCA',
  },
  {
    url: routes.brand,
    label: 'Brand',
  },
  {
    url: routes.transparency,
    label: 'Transparency',
  },
]

function DevelopmentTools() {
  const [isAlreadyOver18, setIsAlreadyOver18] = useStorage(alreadyOver18Key)
  const firebaseUserId = useUserId()
  const supabaseUserId = useSupabaseUserId()
  const isEditor = useIsEditor()
  const [isCalling, lastErrorCode, result, callFunc] = useDataStoreFunction<
    {},
    boolean
  >('get_is_current_user_editor_or_admin')
  useEffect(() => {
    callFunc()
  }, [firebaseUserId, supabaseUserId])
  const isVerified = useAccountVerification()
  const isBanned = useIsBanned()

  return (
    <table>
      <tbody>
        <tr>
          <td>Is already over 18</td>
          <td>
            {isAlreadyOver18 === true ? 'Yes' : 'No'}{' '}
            <Button onClick={() => setIsAlreadyOver18(!isAlreadyOver18)}>
              Toggle
            </Button>
          </td>
        </tr>
        <tr>
          <td>Auth</td>
          <td>
            FB: {firebaseUserId}
            <br />
            SB: {supabaseUserId}
            <br />
            Editor: {isEditor ? 'Yes' : 'No'}
            <br />
            <Button onClick={() => firebaseAuth.signOut()}>
              Sign out of FB
            </Button>
            <br />
            Is backend editor:{' '}
            {isCalling
              ? 'Calling...'
              : lastErrorCode !== null
              ? `code: ${lastErrorCode}`
              : JSON.stringify(result)}
            <br />
            Is verified: {isVerified ? 'Yes' : 'No'}
            <br />
            Is banned: {isBanned ? 'Yes' : 'No'}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default () => {
  const uid = useUserId()
  const classes = useStyles()

  return (
    <>
      {process.env.NODE_ENV === 'development' && <DevelopmentTools />}
      <ScrollToTopBtn />
      <BulkEditButton />
      <footer className={classes.footer}>
        <div className={classes.col}>
          {uid ? (
            <span title={uid}>You are logged in</span>
          ) : (
            'You are logged out'
          )}
        </div>
        <div className={`${classes.col} ${classes.colRight}`}>
          &copy; {new Date().getFullYear()}{' '}
          <a href="https://www.jaredwilliams.com.au">Jared Williams</a> &ndash;{' '}
          {footerLinks.map(({ url, label }, idx) => (
            <span key={url}>
              {idx !== 0 ? <> &ndash; </> : null}
              <Link to={url}>{label}</Link>
            </span>
          ))}
        </div>
      </footer>
    </>
  )
}
