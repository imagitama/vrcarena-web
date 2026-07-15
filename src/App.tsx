import React, { lazy, Suspense, useEffect } from 'react'
import {
  Route,
  Switch,
  useLocation,
  useHistory,
  Redirect,
} from 'react-router-dom'
import { makeStyles } from '@mui/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useHead } from '@unhead/react'

import * as routes from './routes'

// Do not lazy load these routes as they are very popular so they should load fast
import Home from './containers/home'
import ViewAsset from './containers/view-asset'
import ViewSpecies from './containers/view-species'
import ViewCategory from './containers/view-category'
import ViewAvatars from './containers/view-avatars'
import ViewAllSpecies from './containers/view-all-species'
import Search from './containers/search'

import Header from './components/header'
import Footer from './components/footer'
import SearchResults from './components/search-results'
import Notices from './components/notices'
import ErrorBoundary from './components/error-boundary'
import LoadingIndicator from './components/loading-indicator'
import BannedNotice from './components/banned-notice'
import MyQueuedAssetsMessage from './components/my-queued-assets-message'

import useSearchTerm from './hooks/useSearchTerm'

import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
  mediaQueryForTabletsOrAbove,
} from './media-queries'
import useUserRecord from './hooks/useUserRecord'
import useFirebaseUserId from './hooks/useFirebaseUserId'
import useSupabaseUserId from './hooks/useSupabaseUserId'
import DeprecatedRouteView from './containers/deprecated-route'
import AccountVerificationMessage from './components/account-verification-message'
import { DEFAULT_PAGE_DESC } from './config'
import WelcomeMessage from './components/welcome-message'
import FeaturedEvent from './components/featured-event'
import EditorQueueMessage from './components/editor-queue-message'

const catchChunkDeaths = (functionToImport: () => Promise<any>) =>
  functionToImport().catch((err) => {
    if (err.message.includes('error loading dynamically imported module')) {
      // Warning: this could cause an infinite loop :)
      window.location.reload()

      // we dont want these errors cluttering up Sentry
      return
    }
    throw err
  })

const useStyles = makeStyles({
  mainContainer: {
    padding: '0 2rem 2rem',
    [mediaQueryForTabletsOrBelow]: {
      maxWidth: '100vw',
      padding: '0 1rem 1rem',
      overflow: 'hidden',
    },
    [mediaQueryForMobiles]: {
      padding: '0 0.5rem 0.5rem',
    },
  },
  homeNotices: {
    padding: '2rem',
  },
  homepage: {
    [mediaQueryForTabletsOrAbove]: {
      top: '37%',
    },
  },
  floatingLoadingIndicator: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-25%, -25%)',
    padding: '2rem',
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
})

// Lazy load these to improve performance (downloading and processing JS)
const Stats = lazy(() => catchChunkDeaths(() => import('./containers/stats')))
const Login = lazy(() => catchChunkDeaths(() => import('./containers/login')))
const SignUp = lazy(() => catchChunkDeaths(() => import('./containers/signup')))
const Logout = lazy(() => catchChunkDeaths(() => import('./containers/logout')))
const CreateAsset = lazy(() =>
  catchChunkDeaths(() => import('./containers/create-asset'))
)
const EditAsset = lazy(() =>
  catchChunkDeaths(() => import('./containers/edit-asset'))
)
const MyAccount = lazy(() =>
  catchChunkDeaths(() => import('./containers/my-account'))
)
const Admin = lazy(() => catchChunkDeaths(() => import('./containers/admin')))
const ErrorContainer = lazy(() =>
  catchChunkDeaths(() => import('./containers/error'))
)
const Tags = lazy(() => catchChunkDeaths(() => import('./containers/tags')))
const EditTag = lazy(() =>
  catchChunkDeaths(() => import('./containers/edit-tag'))
)
const ViewTag = lazy(() =>
  catchChunkDeaths(() => import('./containers/view-tag'))
)
const ViewUser = lazy(() =>
  catchChunkDeaths(() => import('./containers/view-user'))
)
const Users = lazy(() => catchChunkDeaths(() => import('./containers/users')))
const Activity = lazy(() =>
  catchChunkDeaths(() => import('./containers/activity'))
)
const AdultAssets = lazy(() =>
  catchChunkDeaths(() => import('./containers/adult-assets'))
)
const ViewAuthor = lazy(() =>
  catchChunkDeaths(() => import('./containers/view-author'))
)
const EditAuthor = lazy(() =>
  catchChunkDeaths(() => import('./containers/edit-author'))
)
const Authors = lazy(() =>
  catchChunkDeaths(() => import('./containers/authors'))
)
const EditUser = lazy(() =>
  catchChunkDeaths(() => import('./containers/edit-user'))
)
const DiscordServers = lazy(() =>
  catchChunkDeaths(() => import('./containers/discord-servers'))
)
const ViewDiscordServer = lazy(() =>
  catchChunkDeaths(() => import('./containers/view-discord-server'))
)
const EditDiscordServer = lazy(() =>
  catchChunkDeaths(() => import('./containers/edit-discord-server'))
)
const EditSpecies = lazy(() =>
  catchChunkDeaths(() => import('./containers/edit-species'))
)
const Patreon = lazy(() =>
  catchChunkDeaths(() => import('./containers/patreon'))
)
const ResetPassword = lazy(() =>
  catchChunkDeaths(() => import('./containers/reset-password'))
)
const SetupProfile = lazy(() =>
  catchChunkDeaths(() => import('./containers/setup-profile'))
)
const CreateReport = lazy(() =>
  catchChunkDeaths(() => import('./containers/create-report'))
)
const ViewReport = lazy(() =>
  catchChunkDeaths(() => import('./containers/view-report'))
)
const CreateSupportTicket = lazy(() =>
  catchChunkDeaths(() => import('./containers/create-support-ticket'))
)
const ViewSupportTicket = lazy(() =>
  catchChunkDeaths(() => import('./containers/view-support-ticket'))
)
const DmcaPolicy = lazy(() =>
  catchChunkDeaths(() => import('./containers/dmca-policy'))
)
const ViewAmendment = lazy(() =>
  catchChunkDeaths(() => import('./containers/view-amendment'))
)
const CreateAmendment = lazy(() =>
  catchChunkDeaths(() => import('./containers/create-amendment'))
)
const Brand = lazy(() => catchChunkDeaths(() => import('./containers/brand')))
// events
const Events = lazy(() => catchChunkDeaths(() => import('./containers/events')))
const EditEvent = lazy(() =>
  catchChunkDeaths(() => import('./containers/edit-event'))
)
const ViewEvent = lazy(() =>
  catchChunkDeaths(() => import('./containers/view-event'))
)
const ViewArea = lazy(() =>
  catchChunkDeaths(() => import('./containers/view-area'))
)
const Dev = lazy(() => catchChunkDeaths(() => import('./containers/dev')))
const NewAssets = lazy(() =>
  catchChunkDeaths(() => import('./containers/new-assets'))
)
const Reviews = lazy(() =>
  catchChunkDeaths(() => import('./containers/reviews'))
)
// collections
const ViewAllCollections = lazy(() =>
  catchChunkDeaths(() => import('./containers/collections'))
)
const ViewCollection = lazy(() =>
  catchChunkDeaths(() => import('./containers/view-collection'))
)
const EditCollection = lazy(() =>
  catchChunkDeaths(() => import('./containers/edit-collection'))
)
const Query = lazy(() => catchChunkDeaths(() => import('./containers/query')))
const Transparency = lazy(() =>
  catchChunkDeaths(() => import('./containers/transparency'))
)
const Unsubscribe = lazy(() =>
  catchChunkDeaths(() => import('./containers/unsubscribe'))
)
// pages
const Pages = lazy(() => catchChunkDeaths(() => import('./containers/pages')))
const EditPage = lazy(() =>
  catchChunkDeaths(() => import('./containers/edit-page'))
)
const CreatePage = lazy(() =>
  catchChunkDeaths(() => import('./containers/create-page'))
)
const RandomAvatars = lazy(() =>
  catchChunkDeaths(() => import('./containers/random-avatars'))
)
const QueryCheatsheetContainer = lazy(() =>
  catchChunkDeaths(() => import('./containers/query-cheatsheet'))
)
const ImageAtlas = lazy(() =>
  catchChunkDeaths(() => import('./containers/image-atlas'))
)
const ViewAttachment = lazy(() =>
  catchChunkDeaths(() => import('./containers/view-attachment'))
)
const EditAttachment = lazy(() =>
  catchChunkDeaths(() => import('./containers/edit-attachment'))
)
const Attachments = lazy(() =>
  catchChunkDeaths(() => import('./containers/attachments'))
)
const ViewReview = lazy(() =>
  catchChunkDeaths(() => import('./containers/view-review'))
)
const EditReview = lazy(() =>
  catchChunkDeaths(() => import('./containers/edit-review'))
)

const useSetupProfileRedirect = () => {
  const [, , user] = useUserRecord()
  const { push } = useHistory()
  const location = useLocation()

  useEffect(() => {
    // username will be "null" if not created yet
    if (user && !user.username) {
      push(routes.setupProfile)
    }
  }, [user ? user.username !== null : null, location.pathname])
}

const items = [
  'Reticulating splines...',
  'Sharpening our spears...',
  'Loading...',
  'Loading...',
  'Loading...',
]
const getLoadingNiceness = () => {
  return items[Math.floor(Math.random() * items.length)]
}

const MainContent = () => {
  const searchTerm = useSearchTerm()
  useSetupProfileRedirect()
  const firebaseUserId = useFirebaseUserId()
  const supabaseUserId = useSupabaseUserId()
  const classes = useStyles()

  if (searchTerm) {
    return <SearchResults />
  }

  return (
    <Suspense fallback={<LoadingIndicator message={getLoadingNiceness()} />}>
      {firebaseUserId && !supabaseUserId ? (
        <div className={classes.floatingLoadingIndicator}>
          <LoadingIndicator message="Waiting for auth..." />
        </div>
      ) : null}
      <Switch>
        <Redirect from={'/guidelines'} to={routes.termsOfService} />
        <Redirect from={'/privacy-policy'} to={routes.privacyPolicy} />
        <Redirect from={'/dcma-policy'} to={routes.dmcaPolicy} />
        <Route exact path={routes.home} component={Home} />
        <Route exact path={routes.stats} component={Stats} />
        <Route exact path={routes.searchWithVar} component={Search} />
        <Route exact path={routes.cart} component={DeprecatedRouteView} />
        <Route exact path={routes.social} component={DeprecatedRouteView} />
        <Route exact path={routes.login} component={Login} />
        <Route exact path={routes.signUp} component={SignUp} />
        <Route exact path={routes.logout} component={Logout} />
        <Route exact path={routes.createAsset} component={CreateAsset} />
        <Route
          exact
          path={routes.editAssetWithVarAndTabNameVar}
          component={EditAsset}
        />
        <Route exact path={routes.editAssetWithVar} component={EditAsset} />
        <Route
          exact
          path={[routes.viewAssetWithVar, routes.viewAssetWithVarAndTabVar]}
          component={ViewAsset}
        />
        <Route
          exact
          path={[
            routes.adminWithTabNameVarAndSubViewNameVarAndPageNumberVar,
            routes.adminWithTabNameVarAndSubViewNameVar,
            routes.adminWithTabNameVarAndPageNumberVar,
            routes.adminWithTabNameVar,
            routes.admin,
          ]}
          component={Admin}
        />
        <Route
          exact
          path={[
            routes.myAccountWithTabNameVarAndSubViewNameVarAndPageNumberVar,
            routes.myAccountWithTabNameVarAndSubViewNameVar,
            routes.myAccountWithTabNameVarAndPageNumberVar,
            routes.myAccountWithTabNameVar,
            routes.myAccount,
          ]}
          component={MyAccount}
        />
        <Route exact path={routes.randomAvatars} component={RandomAvatars} />
        <Route
          exact
          path={routes.viewAvatarsWithPageVar}
          component={ViewAvatars}
        />
        <Route exact path={routes.tutorials} component={DeprecatedRouteView} />
        <Route
          exact
          path={routes.viewCategoryWithVar.replace(':categoryName', 'world')}
          component={DeprecatedRouteView}
        />
        <Route
          exact
          path={`${routes.viewCategoryWithVar.replace(
            ':categoryName',
            'world'
          )}/*`}
          component={DeprecatedRouteView}
        />
        <Route
          exact
          path={routes.viewCategoryWithVar.replace(':categoryName', 'news')}
          component={DeprecatedRouteView}
        />
        <Route
          exact
          path={`${routes.viewCategoryWithVar.replace(
            ':categoryName',
            'article'
          )}/*`}
          component={DeprecatedRouteView}
        />
        <Route
          exact
          path={`${routes.viewCategoryWithVar.replace(
            ':categoryName',
            'content'
          )}/*`}
          component={DeprecatedRouteView}
        />
        <Route exact path={routes.viewAvatars} component={ViewAvatars} />
        <Route
          exact
          path={[routes.attachments, routes.attachmentsWithPageNumberVar]}
          component={Attachments}
        />
        <Route
          exact
          path={routes.editAttachmentWithVar}
          component={EditAttachment}
        />
        <Route
          exact
          path={routes.viewAttachmentWithVar}
          component={ViewAttachment}
        />
        <Route
          exact
          path={routes.viewCategoryWithVar}
          component={ViewCategory}
        />
        <Route
          exact
          path={routes.viewCategoryWithPageNumberVar}
          component={ViewCategory}
        />
        <Route
          exact
          path={[routes.createSpecies, routes.editSpeciesWithVar]}
          component={EditSpecies}
        />
        <Route
          exact
          path={[routes.viewAllSpeciesWithPageNumberVar, routes.viewAllSpecies]}
          component={ViewAllSpecies}
        />
        <Route
          exact
          path={[
            routes.viewSpeciesCategoryWithVar,
            routes.viewSpeciesCategoryWithVarAndPageNumberVar,
            routes.viewSpeciesWithVar,
          ]}
          component={ViewSpecies}
        />
        <Route exact path={routes.editUserWithVar} component={EditUser} />
        <Route exact path={routes.staffUsers} component={Users} />
        <Route
          exact
          path={routes.viewUsersWithPageNumberVar}
          component={Users}
        />
        <Route
          exact
          path={[routes.viewUserWithVar, routes.viewUserWithVarAndTabVar]}
          component={ViewUser}
        />
        <Route exact path={routes.users} component={Users} />
        <Route exact path={routes.activity} component={Activity} />
        <Route
          exact
          path={routes.activityWithPageNumberVar}
          component={Activity}
        />
        <Route exact path={routes.streams} component={DeprecatedRouteView} />
        <Route exact path={routes.nsfw} component={AdultAssets} />
        <Route
          exact
          path={routes.nsfwWithPageNumberVar}
          component={AdultAssets}
        />
        <Route exact path={routes.authors} component={Authors} />
        <Route
          exact
          path={routes.viewAuthorsWithPageNumberVar}
          component={Authors}
        />
        <Route exact path={routes.createAuthor} component={EditAuthor} />
        <Route exact path={routes.editAuthorWithVar} component={EditAuthor} />
        <Route exact path={routes.viewAuthorWithVar} component={ViewAuthor} />
        <Route
          exact
          path={routes.createDiscordServer}
          component={EditDiscordServer}
        />
        <Route
          exact
          path={routes.editDiscordServerWithVar}
          component={EditDiscordServer}
        />
        <Route
          exact
          path={routes.viewDiscordServerWithVar}
          component={ViewDiscordServer}
        />
        <Route exact path={routes.discordServers} component={DiscordServers} />
        <Route
          exact
          path={routes.viewDiscordServersWithPageNumberVar}
          component={DiscordServers}
        />
        <Route exact path={routes.patreon} component={Patreon} />
        <Route exact path={routes.resetPassword} component={ResetPassword} />
        <Route
          exact
          path={[routes.createTag, routes.editTagWithVar]}
          component={EditTag}
        />
        <Route
          exact
          path={routes.viewTagWithPageNumberVar}
          component={ViewTag}
        />
        <Route exact path={routes.viewTagWithVar} component={ViewTag} />
        <Route exact path={routes.tags} component={Tags} />
        <Route exact path={routes.setupProfile} component={SetupProfile} />
        <Route
          exact
          path={routes.createReportWithVar}
          component={CreateReport}
        />
        <Route exact path={routes.viewReportWithVar} component={ViewReport} />
        <Route
          exact
          path={routes.createSupportTicketWithVar}
          component={CreateSupportTicket}
        />
        <Route
          exact
          path={routes.createSupportTicket}
          component={CreateSupportTicket}
        />
        <Route
          exact
          path={routes.viewSupportTicketWithVar}
          component={ViewSupportTicket}
        />
        <Route exact path={routes.dmcaPolicy} component={DmcaPolicy} />
        <Route
          exact
          path={routes.createAmendmentWithVar}
          component={CreateAmendment}
        />
        <Route
          exact
          path={routes.viewAmendmentWithVar}
          component={ViewAmendment}
        />
        <Route exact path={routes.brand} component={Brand} />
        <Route
          exact
          path={routes.accessorizeWithVar}
          component={DeprecatedRouteView}
        />
        <Route
          exact
          path={routes.avatarTutorialWithVar}
          component={DeprecatedRouteView}
        />
        <Route
          exact
          path={routes.avatarTutorial}
          component={DeprecatedRouteView}
        />
        <Route
          exact
          path={[routes.editEventWithVar, routes.createEvent]}
          component={EditEvent}
        />
        <Route exact path={routes.viewEventWithVar} component={ViewEvent} />
        <Route exact path={routes.events} component={Events} />
        <Route
          exact
          path={routes.viewCollections}
          component={ViewAllCollections}
        />
        <Route
          exact
          path={routes.viewCollectionsWithPageNumberVar}
          component={ViewAllCollections}
        />
        <Route
          exact
          path={routes.editCollectionWithVar}
          component={EditCollection}
        />
        <Route
          exact
          path={routes.viewCollectionWithVar}
          component={ViewCollection}
        />
        <Route
          exact
          path={routes.viewAreaWithPageNumberVar}
          component={ViewArea}
        />
        <Route exact path={routes.viewAreaWithVar} component={ViewArea} />
        <Route
          exact
          path={routes.newAssetsWithPageNumberVar}
          component={NewAssets}
        />
        <Route exact path={routes.newAssets} component={NewAssets} />
        <Route exact path={'/dev'} component={Dev} />
        <Route exact path={routes.createReview} component={EditReview} />
        <Route exact path={routes.editReviewWithVar} component={EditReview} />
        <Route exact path={routes.viewReviewWithVar} component={ViewReview} />
        <Route exact path={routes.reviews} component={Reviews} />
        <Route exact path={routes.transparency} component={Transparency} />
        <Route exact path={routes.unsubscribe} component={Unsubscribe} />
        <Route
          exact
          path={routes.queryCheatsheet}
          component={QueryCheatsheetContainer}
        />
        <Route
          exact
          path={[
            routes.query,
            routes.queryWithVar,
            routes.queryWithVarAndPageVar,
          ]}
          component={Query}
        />
        <Route exact path={routes.promos} component={DeprecatedRouteView} />
        <Route exact path={routes.imageAtlas} component={ImageAtlas} />
        <Route
          exact
          path={[routes.compareWithVars, routes.compareWithVar]}
          component={DeprecatedRouteView}
        />
        {/* these must always be at the end as catch all */}
        <Route
          exact
          path={[
            routes.createPageWithPageVar,
            routes.createPageWithParentAndPageVar,
          ]}
          component={CreatePage}
        />
        <Route
          exact
          path={[
            routes.editPageWithPageVar,
            routes.editPageWithParentAndPageVar,
          ]}
          component={EditPage}
        />
        <Route
          exact
          path={[routes.pagesWithParentVar, routes.pagesWithParentAndPageVar]}
          component={Pages}
        />
        <Route
          component={() => (
            <ErrorContainer code={404} message="Page not found" />
          )}
        />
      </Switch>
    </Suspense>
  )
}

export default () => {
  const classes = useStyles()
  useHead({
    titleTemplate: (title) =>
      `${title || DEFAULT_PAGE_DESC} | The VRCArena Project`,
  })
  return (
    <ErrorBoundary>
      <CssBaseline />
      <ErrorBoundary>
        <FeaturedEvent />
      </ErrorBoundary>
      <ErrorBoundary>
        <Header />
        <WelcomeMessage />
      </ErrorBoundary>
      <main className="main">
        <div className={classes.mainContainer}>
          <ErrorBoundary>
            <BannedNotice />
            <Notices />
            <AccountVerificationMessage />
            <EditorQueueMessage />
            <MyQueuedAssetsMessage />
          </ErrorBoundary>
          <ErrorBoundary>
            <MainContent />
          </ErrorBoundary>
        </div>
      </main>
      <Footer />
    </ErrorBoundary>
  )
}
