import React from 'react'
import { Helmet } from 'react-helmet'
import { colors } from '../../brand'
import Markdown from '../../components/markdown'
import logoSvgUrl from './assets/logo-v1/logo-v1.svg'
import twitterAvatarUrl from './assets/logo-v1/twitter-avatar.png'

const rules = `# VRCArena Brand Guide

This guide explains what VRCArena is and how it appears for the purposes of branding and marketing.

## Naming

The website is called "VRCArena" (without a space). Not "VRC Arena" or "Vrc Arena" or anything else.

## Description

### Short (97)

"A website that has info about avatars, accessories, tutorials and tools for VR games like VRChat."

### Medium (146)

"A website that provides info about avatars, accessories, tutorials and tools separated by species for VR games like VRChat, NeosVR and ChilloutVR."

### Long (291)

"A website that provides in-depth information about avatars, accessories, tutorials, tools for VR social games such as VRChat, NeosVR and ChilloutVR. Every asset is organised into a species to help people find assets they want. Every asset is reviewed and approved by staff to ensure quality."

## Logo

<img src="${logoSvgUrl}" width="100px" height="100px" />

The logo is completely white (#FFF) for dark backgrounds.

It has the letters "VRC ARENA". The space is not part of our name and is just there to help read the logo.

You can download the vector (SVG) from [here](${logoSvgUrl}).

## Fonts

The font used in the logo is Arial Black - Bold. View it [here](https://docs.microsoft.com/en-us/typography/font-list/arial-black).

The font used in the website and all marketing materials is Roboto. View it [here](https://fonts.google.com/specimen/Roboto).

## Colors

- <span style="color: ${colors.Brand}">${
  colors.Brand
}</span> - Brand (Buttons - Primary)
- <span style="color: ${colors.BrandLight}">${
  colors.BrandLight
}</span> - Brand Light (Links)
- <span style="color: ${colors.BrandDark}">${
  colors.BrandDark
}</span> - Brand Dark (Buttons - Primary - Hover)
- <span style="color: ${colors.BrandVeryDark}">${
  colors.BrandVeryDark
}</span> - Brand Very Dark (Header Gradient)
- <span style="color: ${colors.Highlight}">${
  colors.Highlight
}</span> - Highlight (Price Tag, Editor)
- <span style="color: ${colors.HighlightDark}">${
  colors.HighlightDark
}</span> - Highlight Dark
- <span style="color: ${colors.Grey1}">${
  colors.Grey1
}</span> - Grey 1 (Default Background)
- <span style="color: ${colors.Grey2}">${
  colors.Grey2
}</span> - Grey 2 (Quotations)
- <span style="color: ${colors.Grey3}">${
  colors.Grey3
}</span> - Grey 3 (Quotations Border)
- <span style="color: ${colors.Grey9}">${
  colors.Grey9
}</span> - Grey 9 (Buttons - Secondary)
- <span style="color: ${colors.Grey10}">${
  colors.Grey10
}</span> - Grey 10 (Body Text)

## Social Media

<img src="${twitterAvatarUrl}" width="100px" height="100px" />

The icons used for social media (Twitter, Discord, etc.) is a square image with the white logo positioned in the center:

- 20% from the top and bottom
- 5% from the left and right

The background is a linear gradient from Brand (0% bottom left) to Brand Very Dark (75% top right).

## Extra

- [Memory Game](./memory)  
- [Guess The Avatar](./guess-the-avatar)`

export default () => (
  <>
    <Helmet>
      <title>View our brand | VRCArena</title>
      <meta
        name="description"
        content="Read about what the VRCArena brand is including our colors, logo, fonts and more."
      />
    </Helmet>
    <Markdown source={rules} enableHtml />
  </>
)
