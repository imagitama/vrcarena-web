import React, { lazy, Suspense, useEffect } from 'react'
import {
  Route,
  Switch,
  useLocation,
  useHistory,
  Redirect,
} from 'react-router-dom'
import ThemeProvider from '@material-ui/styles/ThemeProvider'
import CssBaseline from '@material-ui/core/CssBaseline'
import { makeStyles } from '@material-ui/core/styles'
import { useMediaQuery } from 'react-responsive'

import * as routes from './routes'
import { darkTheme } from './themes'

// Do not lazy load these routes as they are very popular so they should load fast
import Home from './containers/home'
import ViewAsset from './containers/view-asset'
import ViewSpecies from './containers/view-species'
import ViewCategory from './containers/view-category'
import ViewAvatars from './containers/view-avatars'
import ViewAllSpecies from './containers/view-all-species'
import VsScreen from './containers/vs-screen'

import PageHeader from './components/header'
import PageFooter from './components/footer'
import SearchResults from './components/search-results'
import Notices from './components/notices'
import ErrorBoundary from './components/error-boundary'
import LoadingIndicator from './components/loading-indicator'
import UnapprovedAssetsMessage from './components/unapproved-assets-message'
import BannedNotice from './components/banned-notice'
import Banner from './components/banner'
import DraftAssetsMessage from './components/draft-assets-message'

import useSearchTerm from './hooks/useSearchTerm'

import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
  queryForMobiles,
  mediaQueryForTabletsOrAbove,
} from './media-queries'
import useUserRecord from './hooks/useUserRecord'
import useFirebaseUserId from './hooks/useFirebaseUserId'
import useSupabaseUserId from './hooks/useSupabaseUserId'
import useBannerUrl from './hooks/useBannerUrl'
import DeprecatedRouteView from './containers/deprecated-route'
import ErrorMessage from './components/error-message'

const catchChunkDeaths = (functionToImport: () => Promise<any>) =>
  functionToImport().catch((err) => {
    if (err.message.includes('Loading chunk')) {
      // Warning: this could cause an infinite loop :)
      window.location.reload()

      // we dont want these errors cluttering up Sentry
      return
    }
    throw err
  })

const useStyles = makeStyles({
  mainContainer: {
    padding: '2rem',
    [mediaQueryForTabletsOrBelow]: {
      maxWidth: '100vw',
      overflow: 'hidden',
    },
    [mediaQueryForMobiles]: {
      padding: '0.5rem',
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
const Login = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "login" */ './containers/login')
  )
)
const SignUp = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "signup" */ './containers/signup')
  )
)
const Logout = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "logout" */ './containers/logout')
  )
)
const CreateAsset = lazy(() =>
  catchChunkDeaths(
    () =>
      import(/* webpackChunkName: "create-asset" */ './containers/create-asset')
  )
)
const EditAsset = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "edit-asset" */ './containers/edit-asset')
  )
)
const MyAccount = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "my-account" */ './containers/my-account')
  )
)
const Admin = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "admin" */ './containers/admin')
  )
)
const ErrorContainer = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "error" */ './containers/error')
  )
)
const Tags = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "tags" */ './containers/tags')
  )
)
const EditTag = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "edit-tag" */ './containers/edit-tag')
  )
)
const ViewTag = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "view-tag" */ './containers/view-tag')
  )
)
const Search = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "search" */ './containers/search')
  )
)
const ViewUser = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "view-user" */ './containers/view-user')
  )
)
const Stats = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "stats" */ './containers/stats')
  )
)
const Users = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "users" */ './containers/users')
  )
)
const Activity = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "activity" */ './containers/activity')
  )
)
const Streams = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "streams" */ './containers/streams')
  )
)
const About = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "about" */ './containers/about')
  )
)
const AdultAssets = lazy(() =>
  catchChunkDeaths(
    () =>
      import(/* webpackChunkName: "adult-assets" */ './containers/adult-assets')
  )
)
const ViewAuthor = lazy(() =>
  catchChunkDeaths(
    () =>
      import(/* webpackChunkName: "view-author" */ './containers/view-author')
  )
)
const EditAuthor = lazy(() =>
  catchChunkDeaths(
    () =>
      import(/* webpackChunkName: "edit-author" */ './containers/edit-author')
  )
)
const Authors = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "authors" */ './containers/authors')
  )
)
const EditUser = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "edit-user" */ './containers/edit-user')
  )
)
const DiscordServers = lazy(() =>
  catchChunkDeaths(
    () =>
      import(
        /* webpackChunkName: "discord-servers" */ './containers/discord-servers'
      )
  )
)
const ViewDiscordServer = lazy(() =>
  catchChunkDeaths(
    () =>
      import(
        /* webpackChunkName: "view-discord-server" */ './containers/view-discord-server'
      )
  )
)
const EditDiscordServer = lazy(() =>
  catchChunkDeaths(
    () =>
      import(
        /* webpackChunkName: "edit-discord-server" */ './containers/edit-discord-server'
      )
  )
)
const EditSpecies = lazy(() =>
  catchChunkDeaths(
    () =>
      import(/* webpackChunkName: "edit-species" */ './containers/edit-species')
  )
)
const Patreon = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "patreon" */ './containers/patreon')
  )
)
const ResetPassword = lazy(() =>
  catchChunkDeaths(
    () =>
      import(
        /* webpackChunkName: "reset-password" */ './containers/reset-password'
      )
  )
)
const MemoryGame = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "memory" */ './containers/memory')
  )
)
const GuessTheAvatarGame = lazy(() =>
  catchChunkDeaths(
    () =>
      import(
        /* webpackChunkName: "guess-the-avatar" */ './containers/guess-the-avatar'
      )
  )
)
const LaunchWorld = lazy(() =>
  catchChunkDeaths(
    () =>
      import(/* webpackChunkName: "launch-world" */ './containers/launch-world')
  )
)
const SetupProfile = lazy(() =>
  catchChunkDeaths(
    () =>
      import(
        /* webpackChunkName: "setup-profile" */ './containers/setup-profile'
      )
  )
)
const CreateReport = lazy(() =>
  catchChunkDeaths(
    () =>
      import(
        /* webpackChunkName: "create-report" */ './containers/create-report'
      )
  )
)
const ViewReport = lazy(() =>
  catchChunkDeaths(
    () =>
      import(/* webpackChunkName: "view-report" */ './containers/view-report')
  )
)
const DmcaPolicy = lazy(() =>
  catchChunkDeaths(
    () =>
      import(/* webpackChunkName: "dmca-policy" */ './containers/dmca-policy')
  )
)
const ViewAward = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "view-award" */ './containers/view-award')
  )
)
const TakedownPolicy = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "takedowns" */ './containers/takedowns')
  )
)
const ViewAmendment = lazy(() =>
  catchChunkDeaths(
    () =>
      import(
        /* webpackChunkName: "view-amendment" */ './containers/view-amendment'
      )
  )
)
const CreateAmendment = lazy(() =>
  catchChunkDeaths(
    () =>
      import(
        /* webpackChunkName: "create-amendment" */ './containers/create-amendment'
      )
  )
)
const Brand = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "brand" */ './containers/brand')
  )
)
const Accessorize = lazy(() =>
  catchChunkDeaths(
    () =>
      import(/* webpackChunkName: "accessorize" */ './containers/accessorize')
  )
)
// events
const Events = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "events" */ './containers/events')
  )
)
const EditEvent = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "edit-event" */ './containers/edit-event')
  )
)
const ViewEvent = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "view-event" */ './containers/view-event')
  )
)
const ViewArea = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "view-area" */ './containers/view-area')
  )
)
const Dev = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "dev" */ './containers/dev')
  )
)
const NewAssets = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "new-assets" */ './containers/new-assets')
  )
)
const Reviews = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "reviews" */ './containers/reviews')
  )
)
// collections
const ViewAllCollections = lazy(() =>
  catchChunkDeaths(
    () =>
      import(/* webpackChunkName: "collections" */ './containers/collections')
  )
)
const ViewCollection = lazy(() =>
  catchChunkDeaths(
    () =>
      import(
        /* webpackChunkName: "view-collection" */ './containers/view-collection'
      )
  )
)
const EditCollection = lazy(() =>
  catchChunkDeaths(
    () =>
      import(
        /* webpackChunkName: "edit-collection" */ './containers/edit-collection'
      )
  )
)
const Query = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "query" */ './containers/query')
  )
)
const Transparency = lazy(() =>
  catchChunkDeaths(
    () =>
      import(/* webpackChunkName: "transparency" */ './containers/transparency')
  )
)
const Unsubscribe = lazy(() =>
  catchChunkDeaths(
    () =>
      import(/* webpackChunkName: "unsubscribe" */ './containers/unsubscribe')
  )
)
// pages
const Pages = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "pages" */ './containers/pages')
  )
)
const EditPage = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "edit-page" */ './containers/edit-page')
  )
)
const CreatePage = lazy(() =>
  catchChunkDeaths(
    () =>
      import(/* webpackChunkName: "create-page" */ './containers/create-page')
  )
)
const RandomAvatars = lazy(() =>
  catchChunkDeaths(
    () =>
      import(
        /* webpackChunkName: "random-avatars" */ './containers/random-avatars'
      )
  )
)
const BulkAdd = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "bulk-add" */ './containers/bulk-add')
  )
)
const QueryCheatsheetContainer = lazy(() =>
  catchChunkDeaths(
    () =>
      import(
        /* webpackChunkName: "query-cheatsheet" */ './containers/query-cheatsheet'
      )
  )
)
const Social = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "social" */ './containers/social')
  )
)
const WorldBuilder = lazy(() =>
  catchChunkDeaths(
    () =>
      import(
        /* webpackChunkName: "world-builder" */ './containers/world-builder'
      )
  )
)
const Promos = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "promos" */ './containers/promos')
  )
)
const ImageAtlas = lazy(() =>
  catchChunkDeaths(
    () =>
      import(/* webpackChunkName: "image-atlas" */ './containers/image-atlas')
  )
)
const ViewAttachment = lazy(() =>
  catchChunkDeaths(
    () =>
      import(
        /* webpackChunkName: "view-attachment" */ './containers/view-attachment'
      )
  )
)
const EditAttachment = lazy(() =>
  catchChunkDeaths(
    () =>
      import(
        /* webpackChunkName: "edit-attachment" */ './containers/edit-attachment'
      )
  )
)
const Compare = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "compare" */ './containers/compare')
  )
)
const Cart = lazy(() =>
  catchChunkDeaths(
    () => import(/* webpackChunkName: "cart" */ './containers/cart')
  )
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
    <Suspense fallback={<LoadingIndicator message="Loading..." />}>
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
        <Route exact path={routes.cart} component={Cart} />
        <Route exact path={routes.worldBuilder} component={WorldBuilder} />
        <Route exact path={routes.social} component={Social} />
        <Route exact path={routes.login} component={Login} />
        <Route exact path={routes.signUp} component={SignUp} />
        <Route exact path={routes.logout} component={Logout} />
        <Route exact path={routes.createAsset} component={CreateAsset} />
        <Route exact path={routes.oldEditAssetWithVar} component={EditAsset} />
        <Route exact path={routes.editAssetWithVar} component={EditAsset} />
        <Route
          exact
          path={[routes.viewAssetWithVar, routes.viewAssetWithVarAndTabVar]}
          component={ViewAsset}
        />
        <Route exact path={routes.launchWorldWithVar} component={LaunchWorld} />
        <Route
          exact
          path={routes.adminWithTabNameVarAndPageNumberVar}
          component={Admin}
        />
        <Route exact path={routes.adminWithTabNameVar} component={Admin} />
        <Route exact path={routes.admin} component={Admin} />
        <Route
          exact
          path={routes.myAccountWithTabNameVarAndPageNumberVar}
          component={MyAccount}
        />
        <Route
          exact
          path={routes.myAccountWithTabNameVar}
          component={MyAccount}
        />
        <Route exact path={routes.myAccount} component={MyAccount} />
        <Route exact path={routes.randomAvatars} component={RandomAvatars} />
        <Route
          exact
          path={routes.viewAvatarsWithPageVar}
          component={ViewAvatars}
        />
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
          path={routes.viewCategoryWithVar}
          component={ViewCategory}
        />
        <Route
          exact
          path={routes.viewCategoryWithPageNumberVar}
          component={ViewCategory}
        />
        <Route exact path={routes.searchWithVar} component={Search} />
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
        <Route exact path={routes.stats} component={Stats} />
        <Route exact path={routes.users} component={Users} />
        <Route exact path={routes.activity} component={Activity} />
        <Route
          exact
          path={routes.activityWithPageNumberVar}
          component={Activity}
        />
        <Route exact path={routes.streams} component={Streams} />
        <Route exact path={routes.about} component={About} />
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
        <Route exact path={routes.vsScreen} component={VsScreen} />
        <Route
          exact
          path={[routes.createTag, routes.editTagWithVar]}
          component={EditTag}
        />
        <Route exact path={routes.viewTagWithVar} component={ViewTag} />
        <Route exact path={routes.tags} component={Tags} />
        <Route exact path={routes.memoryGame} component={MemoryGame} />
        <Route
          exact
          path={routes.guessTheAvatar}
          component={GuessTheAvatarGame}
        />
        <Route exact path={routes.setupProfile} component={SetupProfile} />
        <Route
          exact
          path={routes.createReportWithVar}
          component={CreateReport}
        />
        <Route exact path={routes.viewReportWithVar} component={ViewReport} />
        <Route exact path={routes.dmcaPolicy} component={DmcaPolicy} />
        <Route exact path={routes.viewAwardWithVar} component={ViewAward} />
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
        <Route exact path={routes.accessorizeWithVar} component={Accessorize} />
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
        <Route exact path={routes.bulkAdd} component={BulkAdd} />
        <Route exact path={routes.promos} component={Promos} />
        <Route exact path={routes.imageAtlas} component={ImageAtlas} />
        <Route
          exact
          path={[routes.compareWithVars, routes.compareWithVar]}
          component={Compare}
        />
        <Route
          exact
          path={routes.viewAttachmentWithVar}
          component={ViewAttachment}
        />
        <Route
          exact
          path={routes.editAttachmentWithVar}
          component={EditAttachment}
        />
        <Route
          exact
          path={routes.createPageWithParentAndPageVar}
          component={CreatePage}
        />
        <Route
          exact
          path={routes.editPageWithParentAndPageVar}
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
  const location = useLocation()
  const isMobile = useMediaQuery({ query: queryForMobiles })
  const hasBannerSet = useBannerUrl()!!

  const isHome = location.pathname === '/'

  return (
    <ErrorBoundary>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Banner />
        <PageHeader />
        <main className="main">
          <div className={`${isHome ? '' : classes.mainContainer}`}>
            <BannedNotice />
            <Notices isHome={isHome} />
            <UnapprovedAssetsMessage />
            <DraftAssetsMessage />
            <ErrorBoundary>
              <MainContent />
            </ErrorBoundary>
          </div>
        </main>
        {/* <ErrorMessage hintText="">
          Website will be unavailable for a couple of hours (since 6:00 UTC) as
          I upgrade the database -PB
        </ErrorMessage> */}
        <PageFooter />
      </ThemeProvider>
    </ErrorBoundary>
  )
}
