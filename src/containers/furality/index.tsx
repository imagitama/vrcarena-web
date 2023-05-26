import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import furalitySylvaLogoUrl from '../../assets/images/furality-sylva-logo-md.png'
import { authorsAtFuralitySylva } from '../../furality'
import Paper from '../../components/paper'
import Header from '../../components/header'
import Link from '../../components/link'
import * as routes from '../../routes'
import Heading from '../../components/heading'
import Button from '../../components/button'

const furalitySylvaHomepageUrl = 'https://go.furality.org/vrcarena'

const useStyles = makeStyles({
  topLink: {
    color: 'inherit',
    fontSize: '200%',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    textDecoration: 'underline',
    '& span': {
      width: '100%',
      textAlign: 'center'
    },
    '& img': {
      marginBottom: '1rem'
    }
  },
  notice: {
    textAlign: 'center',
    marginTop: '1rem',
    fontStyle: 'italic'
  },
  authorsAtFurality: {
    textAlign: 'center'
  },
  authors: {
    display: 'flex',
    justifyContent: 'center',
    '& a': {
      color: 'inherit'
    },
    '& > *': {
      marginRight: '1rem'
    }
  },
  boothNumber: {
    textAlign: 'center',
    fontSize: '150%',
    fontWeight: 'bold',
    marginTop: '1rem'
  }
})

const AuthorsAtFurality = () => {
  const classes = useStyles()
  return (
    <div className={classes.authorsAtFurality}>
      <Heading variant="h1">Authors At Furality</Heading>
      <div className={classes.authors}>
        {authorsAtFuralitySylva.map(authorAtFurality => (
          <Paper key={authorAtFurality.authorId}>
            <Link
              to={routes.viewAuthorWithVar.replace(
                ':authorId',
                authorAtFurality.authorId
              )}>
              <Heading noTopMargin>{authorAtFurality.authorName}</Heading>
              <div className={classes.boothNumber}>
                Booth #{authorAtFurality.boothNumber}
              </div>
              {authorAtFurality.assetIdsInBooth ? (
                <>
                  <br />
                  {authorAtFurality.assetIdsInBooth.map(assetId => (
                    <Button
                      key={assetId}
                      url={routes.viewAssetWithVar.replace(':assetId', assetId)}
                      color="default">
                      View asset in their booth
                    </Button>
                  ))}
                </>
              ) : null}
            </Link>
          </Paper>
        ))}
      </div>
    </div>
  )
}

export default () => {
  const classes = useStyles()
  return (
    <div>
      <a
        href={furalitySylvaHomepageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={classes.topLink}>
        <span>
          <img src={furalitySylvaLogoUrl} alt="Furality Sylva logo" />
        </span>
        <span>Click here to visit the Furality Sylva website</span>
      </a>
      <div className={classes.notice}>
        Please note we are not affiliated with Furality Sylva nor do we receive
        any compensation for this cross-promotion - we just love Furality!
      </div>
      <AuthorsAtFurality />
    </div>
  )
}
