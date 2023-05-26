import React from 'react'
import { Helmet } from 'react-helmet'

import Markdown from '../../components/markdown'
import { EMAIL } from '../../config'
import * as routes from '../../routes'

const rules = `# Takedown Policy

## How do I takedown an asset from this site?

VRCArena is intended to be a not-for-profit **search engine** and **wiki** of 3D models and materials for VR video games such as VRChat, ChilloutVR and NeosVR.

We rarely host the actual source files of any asset and encourage users to link directly to publically available store pages such as Gumroad.

Copyrighted material such as thumbnails, screenshots and videos of your asset are permitted on this website under [copyright fair use](https://www.copyright.gov/fair-use/more-info.html) because:

1. This website is not for profit and is meant for educational purposes
2. Each asset is a technical description of the asset and re-uses existing texts from the source
3. We rarely host the actual 3D asset so we only use a small amount of copyrighted material such as images
4. Assets on this site are designed to market and promote the source instead of hurt its sales and market value 

The only way to truly remove an asset from this site is you can **prove you are the original creator of the asset** and you either:

1. Submit a valid and legal DMCA claim ([do it here](https://www.vrcarena.com${
  routes.dmcaPolicy
}))
2. Can prove the source of your asset has been removed from public access (such as the Gumroad store page has been removed or a direct link should not be accessible)

In the case of point 2 please use the standard "Report" button available on every asset and select the "Takedown" option.

## Questions about this policy

You can forward any and all questions about this policy to the website owner and administrator via email at ${EMAIL}`

export default () => (
  <>
    <Helmet>
      <title>View takedown policy | VRCArena</title>
      <meta
        name="description"
        content="Read our policy on taking down assets from the site."
      />
    </Helmet>
    <Markdown source={rules} />
  </>
)
