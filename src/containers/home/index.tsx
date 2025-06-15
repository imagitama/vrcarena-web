import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@mui/styles'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import useSearchTerm from '../../hooks/useSearchTerm'
import { mediaQueryForMobiles } from '../../media-queries'
import * as routes from '../../routes'
import Button from '../../components/button'
import SpeciesBrowser from '../../components/species-browser'

const contentMaxWidth = '900px'

const useStyles = makeStyles({
  contentBlock: {
    fontWeight: 200, // 100 for message titles, 400 for body
    width: 'calc(100% - 2rem)',
    padding: '2rem 0.5rem',
    borderRadius: '0.5rem',
    background: '#202020',
    fontSize: '120%',
    margin: '0 auto',
    '& p:first-of-type': {
      marginTop: 0,
    },
    '& p:last-of-type': {
      marginBottom: 0,
    },
    '& > div': {
      maxWidth: contentMaxWidth,
      margin: '0 auto',
    },
    '& .controls': {
      marginTop: '2rem',
    },
    [mediaQueryForMobiles]: {
      padding: '1rem',
      '& .controls': {
        marginTop: '1rem',
      },
    },
  },
  controls: {
    width: '100%',
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'right',
  },
})

const ContentBlock = ({
  buttonUrl,
  buttonLabel,
  children,
}: {
  buttonUrl: string
  buttonLabel: string
  children: React.ReactNode
}) => {
  const classes = useStyles()
  return (
    <div className={classes.contentBlock}>
      <div>
        {children}
        <div className={classes.controls}>
          <Button url={buttonUrl} icon={<ChevronRightIcon />} color="secondary">
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default () => {
  const searchTerm = useSearchTerm()

  if (searchTerm) {
    return null
  }

  return (
    <>
      <Helmet>
        <title>
          Browse avatars, accessories, shaders and more for games VR games like
          VRChat | VRCArena
        </title>
        <meta
          name="description"
          content="A website that has info about avatars, accessories, tutorials and tools for VR games like VRChat."
        />
      </Helmet>
      <ContentBlock buttonUrl={routes.about} buttonLabel="Learn More">
        <p>
          A free, community-driven, wiki-style collection of VR avatars,
          accessories, retextures and tutorials categorized and tagged to help
          you find what you're after.
        </p>
        <p>
          We are <strong>not for profit</strong> and run entirely by our awesome{' '}
          <strong>volunteers</strong> since May 2020!
        </p>
      </ContentBlock>
      <br />
      <SpeciesBrowser />
    </>
  )
}
