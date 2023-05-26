import React from 'react'
import { Helmet } from 'react-helmet'
import Markdown from '../../components/markdown'
import { nsfwRules } from '../../config'

const rules = `# Guidelines for using VRCArena

**Note these guidelines are separate to our Privacy Policy and Terms of Service (available via a link in our footer).**

## General usage

- do not spam such as:
  - sending the same comment many times for no reason
  - submitting the same asset many times for no reason

- do not abuse other people such as:
  - racism, homophobic remarks, etc.
  - sending threats

## Submitting assets (avatars, accessories, etc.)

- do not submit adult (NSFW) assets without flagging the asset as adult (NSFW) content (there is a button in the asset editor to toggle this)

- do not submit assets with the aim of deceiving people (such as claiming it is your own work when it isn't)
  - you *can* post assets on behalf of other people (assuming you have permission)

- do not submit assets that are intended to abuse people such as:
  - "crasher" avatars that intend to crash other players in VRChat, etc.
  - racist, homophobic, etc.
  - ones that intend to induce a medical condition such as seizures

- do not submit assets that are "rips" of other video games (this violates the original game's copyright)
  - for example do not rip a model from Second Life and submit it here without the original author's permission
  - another example is do not rip a model from a Unity game (such as Phasmophobia) and submit it here

## NSFW Content

${nsfwRules}
  
## FAQ

**I found an asset or comment or whatever on this site which violates these guidelines (or our Terms of Service). What should I do?**  
You can report an asset by using the Report button when viewing the asset. For any other content please message our staff via our Discord server.

**I found an asset on the site where the source violates the Terms of Service of the platform it is uploaded to (such as Gumroad or Discord). Should I report it?**  
No. You should contact the platform directly. Then if anything is done about it, you can report it here so we can update it.`

export default () => (
  <>
    <Helmet>
      <title>Rules | VRCArena</title>
      <meta
        name="description"
        content="Rules for posting assets and using the site."
      />
    </Helmet>
    <Markdown source={rules} />
  </>
)
