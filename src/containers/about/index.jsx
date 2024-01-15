import React from 'react'
import { Helmet } from 'react-helmet'
import Markdown from '../../components/markdown'
import { PATREON_BECOME_PATRON_URL } from '../../config'

const aboutContent = `# About VRCArena

VRCArena is a completely community and volunteer-maintained catalogue of assets for the popular VR social games like VRChat, ChilloutVR and Resonite.

It was created in May 2020 by me (PeanutBuddha) to make it easier to find avatars and accessories scattered on different websites like Gumroad and deep inside Discord servers. 

The site works like a wiki - anyone can submit an asset to the site on behalf of the original author. This is to ensure our content is up-to-date and accurate. Any changes are reviewed by a volunteer moderator.

:::button{url=/users/staff}
  View our staff team
:::

## How can I support the site?

Become a patron to support us financially:

:::button{url="${PATREON_BECOME_PATRON_URL}"}
  Become a Patron
:::

All of our costs are explained in our transparency page:

:::button{url="/transparency"}
  View our costs
:::

## Submit assets and amendments

Anyone can submit an asset to the site on behalf of the actual author. Anyone can amend an asset to fix up any mistakes.

## Post reviews and comments

Any asset can be reviewed and commented on. Please do so to help our community find high quality assets.

## Closing

Thank you to the community and volunteers for helping me run this site. Without you this site wouldn't be as awesome as it is!

![My avatar](https://firebasestorage.googleapis.com/v0/b/shiba-world.appspot.com/o/avatars%2F04D3yeAUxTMWo8MxscQImHJwtLV2%2Fexport%20200.png?alt=media&token=9aa3d803-e91c-4711-b0bb-f4afc9ad52e6)

**- Peanut**

[View my Twitter](https://twitter.com/@HiPeanutBuddha)`

export default () => (
  <>
    <Helmet>
      <title>Why I made the site | VRCArena</title>
      <meta name="description" content="Read about why I made the site." />
    </Helmet>
    <Markdown source={aboutContent} />
  </>
)
