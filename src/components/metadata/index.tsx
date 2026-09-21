import styled from '@emotion/styled'
import FormattedDate from '../formatted-date'
import UsernameLink from '../username-link'

interface RecordWithMetadata {
  // actual cols
  lastmodifiedby: string | null
  lastmodifiedat: string | null
  createdby: string
  createdat: string
  // joined
  lastmodifiedbyusername: string | null
  lastmodifiedbyavatarurl: string | null
  createdbyusername: string
  createdbyavatarurl: string
}

export const StyledMetadata = styled.div`
  font-size: 75%;
`

const Metadata = ({
  item,
  showModified = true,
}: {
  item: RecordWithMetadata
  showModified?: boolean
}) => (
  <StyledMetadata>
    Created <FormattedDate date={item.createdat} /> by{' '}
    {item.createdby ? (
      <UsernameLink
        id={item.createdby}
        username={item.createdbyusername}
        avatarUrl={item.createdbyavatarurl}
      />
    ) : (
      'system'
    )}
    {showModified &&
      item.lastmodifiedby &&
      item.lastmodifiedat &&
      item.lastmodifiedat !== item.createdat && (
        <>
          <br />
          Modified <FormattedDate date={item.lastmodifiedat} /> by{' '}
          <UsernameLink
            id={item.lastmodifiedby}
            username={item.lastmodifiedbyusername!}
            avatarUrl={item.lastmodifiedbyavatarurl}
          />
        </>
      )}
  </StyledMetadata>
)

export default Metadata
