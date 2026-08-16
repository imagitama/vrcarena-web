import styled from '@emotion/styled'

import { BanStatus, FullUser, PatreonStatus } from '@/modules/users'
import { VRCArenaTheme } from '@/themes'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
} from '@/media-queries'
import Avatar from '../avatar'
import UsernameLink from '../username-link'
import { BannedBadge, PatronBadge, StaffBadge } from '../badge'
import { getIsUserBanned, getUserIsStaffMember } from '@/utils/users'
import DeletedBadge from '../deleted-badge'
import { AccessStatus } from '@/modules/common'
import SocialMediaList from '../social-media-list'
import Rep from '../rep'
import RepMilestones from '../rep-milestones'
import Heading from '../heading'
import Link from '../link'
import { routes } from '@/routes'
import {
  fixAccessingImagesUsingToken,
  getPrefersBritishSpelling,
} from '@/utils'
import Markdown from '../markdown'
import NoResultsMessage from '../no-results-message'
import Image from '../image'
import useIsEditor from '@/hooks/useIsEditor'
import UserEditorControls from './components/editor-controls'

import UserOverviewContext from './context'

const Sections = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const StyledSection = styled.div`
  width: calc(50% - 0.5rem);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }: { theme?: VRCArenaTheme }) =>
    theme!.shape.borderRadius}px;
  padding: 0.5rem;
  margin: 0.25rem;
  ${mediaQueryForTabletsOrBelow} {
    padding: 0.25rem;
  }
  ${mediaQueryForMobiles} {
    width: 100%;
  }
`

const PrimaryStyledSection = styled(StyledSection)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Badges = styled.div`
  display: flex;
  justify-content: center;
  margin-left: 0.5rem;
  & > * {
    margin-left: 0.1rem;
  }
`

const StyledHeading = styled(Heading)`
  margin: 0.5rem 0 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ isBanned }: { isBanned: boolean }) =>
    isBanned && 'text-decoration: line-through;'}
`

const StatRow = styled.div``

const StatNum = styled.span`
  font-size: 125%;
  font-weight: bold;
`

const Section = (
  props: { isPrimary?: boolean } & React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
) => (
  <StyledSection {...props} title={undefined}>
    {props.title && (
      <Heading variant="h2" noMargin>
        {props.title}
      </Heading>
    )}
    {props.children}
  </StyledSection>
)

const FavSpecies = styled.div`
  display: flex;
  justify-content: center;
  text-align: center;
`

const RepWrapper = styled.div`
  display: flex;
  justify-content: center;
  text-align: center;
`

const UserOverview = ({ user }: { user: FullUser }) => {
  const isEditor = useIsEditor()

  const {
    bio,
    reputation,
    repchanges,
    banstatus: banStatus,
    accessstatus: accessStatus,
    patreonstatus: patreonStatus,
    ispatronpublic: isPatronPublic,
    favoritespeciesdata: favSpeciesData,
    stats,
  } = user

  const isBanned = banStatus === BanStatus.Banned
  const isDeleted = accessStatus === AccessStatus.Deleted
  const isPatron = patreonStatus === PatreonStatus.Patron && isPatronPublic

  const socialMedia = {
    vrchatUsername: user.vrchatusername,
    neosVrUsername: user.neosvrusername,
    chilloutVrUsername: user.chilloutvrusername,
    vrchatUserId: user.vrchatuserid,
    discordUsername: user.discordusername,
    twitterUsername: user.twitterusername,
    telegramUsername: user.telegramusername,
    youtubeChannelId: user.youtubechannelid,
    twitchUsername: user.twitchusername,
    patreonUsername: user.patreonusername,
  }

  return (
    <UserOverviewContext.Provider value={{ userId: user.id, user }}>
      <Sections>
        <PrimaryStyledSection>
          <div>
            <Avatar url={user.avatarurl} />{' '}
            <StyledHeading variant="h1" isBanned={isBanned}>
              <Link to={routes.viewUserWithVar.replace(':userId', user.id)}>
                {user.username}
              </Link>
              <Badges>
                {isPatron && <PatronBadge />}
                {getUserIsStaffMember(user) && <StaffBadge />}
                {getIsUserBanned(user) && <BannedBadge />}
                {isDeleted && <DeletedBadge />}
              </Badges>
            </StyledHeading>
          </div>
        </PrimaryStyledSection>
        <Section title="Bio">
          {bio ? (
            <Markdown source={bio} />
          ) : (
            <NoResultsMessage>No bio set</NoResultsMessage>
          )}
        </Section>
        <Section title="Social Media">
          <SocialMediaList socialMedia={socialMedia} />
        </Section>
        <Section title="Reputation">
          <RepWrapper>
            <Rep reputation={reputation} />
          </RepWrapper>
          <RepMilestones repChanges={repchanges} />
        </Section>
        <Section
          title={`Favo${getPrefersBritishSpelling() ? 'u' : ''}rite Species`}>
          {favSpeciesData ? (
            <FavSpecies>
              <Link
                to={routes.viewSpeciesWithVar.replace(
                  ':speciesIdOrSlug',
                  favSpeciesData.id
                )}>
                <Image
                  src={fixAccessingImagesUsingToken(
                    favSpeciesData.thumbnailurl
                  )}
                  alt={`Image for species ${favSpeciesData.pluralname}`}
                  width="100px"
                />
                {favSpeciesData.pluralname}
              </Link>
            </FavSpecies>
          ) : (
            <NoResultsMessage>
              No favo{getPrefersBritishSpelling() ? 'u' : ''}rite species set
            </NoResultsMessage>
          )}
        </Section>
        <Section title="Stats">
          <div>
            <StatRow>
              <StatNum>{stats.assetcount}</StatNum> assets
            </StatRow>
            <StatRow>
              <StatNum>{stats.amendmentcount}</StatNum> amendments
            </StatRow>
            <StatRow>
              <StatNum>{stats.commentcount}</StatNum> comments
            </StatRow>
          </div>
        </Section>
        {isEditor && (
          <Section title="Staff Only">
            <UserEditorControls />
          </Section>
        )}
      </Sections>
    </UserOverviewContext.Provider>
  )
}

export default UserOverview
