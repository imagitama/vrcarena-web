import React from 'react'
import { Helmet } from 'react-helmet'

import Markdown from '../../components/markdown'
import { BUSINESS_NAME, EMAIL } from '../../config'

const content = `
Digital Millennium Copyright Act ("DMCA")

${BUSINESS_NAME} respects the intellectual property rights of others.
Per the DMCA, ${BUSINESS_NAME} will respond expeditiously to claims of copyright infringement on the Site.
Upon receipt of a notice alleging copyright infringement, ${BUSINESS_NAME} will take whatever action it deems appropriate within its sole discretion, including removal of the allegedly infringing materials and termination of access for repeat infringers of copyright protected content.

If you believe that your intellectual property rights have been violated by ${BUSINESS_NAME} or by a third party
who has uploaded materials to our website, please provide the following information to the designated website administrator listed below:

A description of the copyrighted work or other intellectual property that you claim has been infringed;  
A description of where the material that you claim is infringing is located on the Site;  
An address, telephone number, and email address where we can contact you and, if different, an email address where the alleged infringing party, if not ${BUSINESS_NAME}, can contact you;  
A statement that you have a good-faith belief that the use is not authorized by the copyright owner or other intellectual property rights owner, by its agent, or by law;  
A statement by you under penalty of perjury that the information in your notice is accurate and that you are the copyright or intellectual property owner or are authorized to act on the owner's behalf;  
Your electronic or physical signature.

${BUSINESS_NAME} may request additional information before removing any allegedly infringing material. In the event ${BUSINESS_NAME} removes the allegedly infringing materials, ${BUSINESS_NAME} will immediately notify the person responsible for posting such materials that ${BUSINESS_NAME} removed or disabled access to the materials. ${BUSINESS_NAME} may also provide the responsible person with your email address so that the person may respond to your allegations.

**To submit a DMCA request to ${BUSINESS_NAME} please email ${EMAIL}**`

export default () => (
  <>
    <Helmet>
      <title>View our DMCA policy | VRCArena</title>
      <meta name="description" content="View the policy." />
    </Helmet>
    <Markdown source={content} />
  </>
)
