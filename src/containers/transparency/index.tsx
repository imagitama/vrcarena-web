import React from 'react'
import { Helmet } from 'react-helmet'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Heading from '../../components/heading'
import { CachedPatreonMember } from '../../modules/patreonmembercache'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Message from '../../components/message'
import useSupabaseView from '../../hooks/useSupabaseView'
import { costs, patreonTax, totalCostPerMonth } from '../../costs'

const PatreonStatus = () => {
  const [isLoading, isError, members] = useSupabaseView<CachedPatreonMember>(
    'getAnonymousPatreonMembers'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading Patreon supporters..." />
  }

  if (isError || !Array.isArray(members)) {
    return <ErrorMessage>Failed to load Patreon supporters</ErrorMessage>
  }

  const incomeCents = members.reduce(
    (finalIncomeCents, { currentlyentitledamountcents }) =>
      finalIncomeCents + currentlyentitledamountcents,
    0
  )

  const incomeCentsAfterTaxes = incomeCents * (1 - patreonTax)

  return (
    <Message>
      <Heading variant="h3" noMargin>
        Approximate income from {members.length} Patreon supporters: $
        {(incomeCentsAfterTaxes / 100).toFixed(2)} USD per month
      </Heading>
    </Message>
  )
}

export default () => (
  <>
    <Helmet>
      <title>Transparency | VRCArena</title>
      <meta
        name="description"
        content={`An explanation of costs for the site and anything to improve transparency for the community.`}
      />
    </Helmet>
    <Heading variant="h1">Transparency Report</Heading>
    <p>
      I strongly believe that transparency is important when running this
      website. It encourages trust between you and me. So here is a report I
      have voluntarily made to keep you informed.
    </p>
    <p>
      <strong>Last updated 6 April 2023.</strong>
    </p>
    <Heading variant="h2">Running Costs</Heading>
    <p>
      Running a website isn't free. There are several costs: domain names,
      hosting, database, external APIs and more. Here are the costs of running
      this site:
    </p>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Cost (USD)</TableCell>
          <TableCell>Previous Months (USD)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {costs.map(({ id, label, monthlyCost, yearlyCost, olderCosts }) => (
          <TableRow key={id}>
            <TableCell>{label}</TableCell>
            <TableCell>
              {monthlyCost
                ? `$${monthlyCost} per month`
                : `$${yearlyCost} per year`}
            </TableCell>
            <TableCell>{olderCosts}</TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell>
            <strong>Total</strong>
          </TableCell>
          <TableCell>
            <strong>${totalCostPerMonth} per month</strong>
          </TableCell>
          <TableCell />
        </TableRow>
      </TableBody>
    </Table>
    <p>
      Thank you so much to our Patreon supporters! You help me pay for the above
      costs. If I don't get enough patrons it comes out of my own pocket.
    </p>
    <PatreonStatus />
    <Heading variant="h2">DMCA Claims</Heading>
    <p>
      We are targetted by some individuals claiming we have violated their
      copyright and they attempt to claim DMCA against us. DMCA claims including
      the individual and their contact details are public knowledge however I
      will only post the results of these claims to maintain privacy.
    </p>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Target</TableCell>
          <TableCell>Date (AU)</TableCell>
          <TableCell>Result</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>NeoYeen Furry Avatar by Maxwell Rodgers</TableCell>
          <TableCell>27/8/2021</TableCell>
          <TableCell>
            Gumroad page taken down so complied with takedown request
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Nexa'vali by Angelboy</TableCell>
          <TableCell>1/9/2021</TableCell>
          <TableCell>Contacted claimant and not taken down</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Mulakumo by Kuretadesu</TableCell>
          <TableCell>20/3/2023</TableCell>
          <TableCell>Contacted claimant and not taken down</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <Heading variant="h2">Other Interesting Things</Heading>
    <Heading variant="h3">Attempts To Purchase VRCArena</Heading>
    <p>
      I have been contacted by several individuals and companies (mainly in the
      VR industry) offering to buy the site. I declined - I don't make money off
      this site and don't need money. I don't plan on selling it.
    </p>
    <p>Attempts to buy the site or domain: 2</p>
    <Heading variant="h3">Offers To Advertise With Us</Heading>
    <p>
      I have been contacted by a couple of companies (specifically around VR
      hardware) asking to advertise with me on the site. I have declined - I
      don't plan on ever adding advertisements to this site.
    </p>
    <p>Attempts to advertise with us: 1</p>
    <Heading variant="h3">Collabs with other projects</Heading>
    <Heading variant="h4">Furality</Heading>
    <p>At Furality Legends we had a booth in their dealer's den :)</p>
  </>
)
