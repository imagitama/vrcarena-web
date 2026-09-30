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
import Login from './containers/login'
import SignUp from './containers/signup'
import Logout from './containers/logout'
import ErrorContainer from './containers/error'
import ViewUser from './containers/view-user'
import Users from './containers/users'

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
import SurveyMessage from './components/survey-message'
import { useSelector } from 'react-redux'
import { RootState } from './slices'
import SubEditorMessage from './components/sub-editor-message'
import { loadSecondary, Secondary } from './secondary-loader'

const cache = new Map<string, React.ComponentType<any>>()

export const Lazy = new Proxy(
  {} as { [K in keyof Secondary]: React.ComponentType<any> },
  {
    get: (_, name: string) => {
      if (!cache.has(name)) {
        cache.set(
          name,
          lazy(async () => ({
            default: (await loadSecondary())[
              name as keyof Secondary
            ] as React.ComponentType<any>,
          }))
        )
      }
      return cache.get(name)
    },
  }
)

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
    background: 'rgba(0, 0, 0, 0.25)',
    zIndex: 999,
  },
})

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
  const isLoadingFirebaseUser = useSelector<RootState, boolean>(
    ({ firebase }) => firebase.isLoading
  )

  if (searchTerm) {
    return <SearchResults />
  }

  return (
    <Suspense fallback={<LoadingIndicator message={getLoadingNiceness()} />}>
      {(firebaseUserId && !supabaseUserId) || isLoadingFirebaseUser ? (
        <div className={classes.floatingLoadingIndicator}>
          <LoadingIndicator message="Waiting for auth..." />
        </div>
      ) : null}
      <Switch>
        <Redirect from={'/guidelines'} to={routes.termsOfService} />
        <Redirect from={'/privacy-policy'} to={routes.privacyPolicy} />
        <Redirect from={'/dcma-policy'} to={routes.dmcaPolicy} />
        <Route exact path={routes.home} component={Home} />
        <Route exact path={routes.stats} component={Lazy.Stats} />
        <Route exact path={routes.searchWithVar} component={Search} />
        <Route exact path={routes.cart} component={DeprecatedRouteView} />
        <Route exact path={routes.social} component={DeprecatedRouteView} />
        <Route exact path={routes.login} component={Login} />
        <Route exact path={routes.signUp} component={SignUp} />
        <Route exact path={routes.logout} component={Logout} />
        <Route exact path={routes.createAsset} component={Lazy.CreateAsset} />
        <Route
          exact
          path={routes.editAssetWithVarAndTabNameVar}
          component={Lazy.EditAsset}
        />
        <Route
          exact
          path={routes.editAssetWithVar}
          component={Lazy.EditAsset}
        />
        <Route
          exact
          path={[routes.viewAssetWithVar, routes.viewAssetWithVarAndTabVar]}
          component={ViewAsset}
        />
        <Route path={routes.admin} component={Lazy.Admin} />
        <Route
          exact
          path={[
            routes.myAccountWithTabNameVarAndSubViewNameVarAndPageNumberVar,
            routes.myAccountWithTabNameVarAndSubViewNameVar,
            routes.myAccountWithTabNameVarAndPageNumberVar,
            routes.myAccountWithTabNameVar,
            routes.myAccount,
          ]}
          component={Lazy.MyAccount}
        />
        <Route
          exact
          path={routes.randomAvatars}
          component={Lazy.RandomAvatars}
        />
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
          component={Lazy.Attachments}
        />
        <Route
          exact
          path={routes.editAttachmentWithVar}
          component={Lazy.EditAttachment}
        />
        <Route
          exact
          path={routes.viewAttachmentWithVar}
          component={Lazy.ViewAttachment}
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
          component={Lazy.EditSpecies}
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
        <Route exact path={routes.editUserWithVar} component={Lazy.EditUser} />
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
        <Route exact path={routes.activity} component={Lazy.Activity} />
        <Route
          exact
          path={routes.activityWithPageNumberVar}
          component={Lazy.Activity}
        />
        <Route exact path={routes.streams} component={DeprecatedRouteView} />
        <Route
          exact
          path={[routes.nsfw, routes.nsfwWithPageNumberVar]}
          component={Lazy.AdultAssets}
        />
        <Route
          exact
          path={[routes.authors, routes.viewAuthorsWithPageNumberVar]}
          component={Lazy.Authors}
        />
        <Route
          exact
          path={[routes.createAuthor, routes.editAuthorWithVar]}
          component={Lazy.EditAuthor}
        />
        <Route
          exact
          path={routes.viewAuthorWithVar}
          component={Lazy.ViewAuthor}
        />
        <Route
          exact
          path={[routes.createDiscordServer, routes.editDiscordServerWithVar]}
          component={Lazy.EditDiscordServer}
        />
        <Route
          exact
          path={routes.viewDiscordServerWithVar}
          component={Lazy.ViewDiscordServer}
        />
        <Route
          exact
          path={[
            routes.discordServers,
            routes.viewDiscordServersWithPageNumberVar,
          ]}
          component={Lazy.DiscordServers}
        />
        <Route exact path={routes.patreon} component={Lazy.Patreon} />
        <Route
          exact
          path={routes.resetPassword}
          component={Lazy.ResetPassword}
        />
        <Route
          exact
          path={[routes.createTag, routes.editTagWithVar]}
          component={Lazy.EditTag}
        />
        <Route
          exact
          path={[routes.viewTagWithPageNumberVar, routes.viewTagWithVar]}
          component={Lazy.ViewTag}
        />
        <Route exact path={routes.tags} component={Lazy.Tags} />
        <Route exact path={routes.setupProfile} component={Lazy.SetupProfile} />
        <Route
          exact
          path={routes.createReportWithVar}
          component={Lazy.CreateReport}
        />
        <Route
          exact
          path={routes.viewReportWithVar}
          component={Lazy.ViewReport}
        />
        <Route
          exact
          path={[routes.createSupportTicketWithVar, routes.createSupportTicket]}
          component={Lazy.CreateSupportTicket}
        />
        <Route
          exact
          path={routes.viewSupportTicketWithVar}
          component={Lazy.ViewSupportTicket}
        />
        <Route exact path={routes.dmcaPolicy} component={Lazy.DmcaPolicy} />
        <Route
          exact
          path={routes.createAmendmentWithVar}
          component={Lazy.CreateAmendment}
        />
        <Route
          exact
          path={routes.viewAmendmentWithVar}
          component={Lazy.ViewAmendment}
        />
        <Route exact path={routes.brand} component={Lazy.Brand} />
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
          component={Lazy.EditEvent}
        />
        <Route
          exact
          path={routes.viewEventWithVar}
          component={Lazy.ViewEvent}
        />
        <Route exact path={routes.events} component={Lazy.Events} />
        <Route
          exact
          path={[
            routes.viewCollections,
            routes.viewCollectionsWithPageNumberVar,
          ]}
          component={Lazy.ViewAllCollections}
        />
        <Route
          exact
          path={routes.editCollectionWithVar}
          component={Lazy.EditCollection}
        />
        <Route
          exact
          path={routes.viewCollectionWithVar}
          component={Lazy.ViewCollection}
        />
        <Route
          exact
          path={[routes.viewAreaWithPageNumberVar, routes.viewAreaWithVar]}
          component={Lazy.ViewArea}
        />
        <Route
          exact
          path={routes.newAssetsWithPageNumberVar}
          component={Lazy.NewAssets}
        />
        <Route
          exact
          path={[
            routes.subEditorResponses,
            routes.subEditorResponsesWithPageNumberVar,
          ]}
          component={Lazy.SubEditorResponses}
        />
        <Route exact path={routes.newAssets} component={Lazy.NewAssets} />
        <Route exact path={'/dev'} component={Lazy.Dev} />
        <Route
          exact
          path={[routes.createReview, routes.editReviewWithVar]}
          component={Lazy.EditReview}
        />
        <Route
          exact
          path={routes.viewReviewWithVar}
          component={Lazy.ViewReview}
        />
        <Route exact path={routes.reviews} component={Lazy.Reviews} />
        <Route exact path={routes.transparency} component={Lazy.Transparency} />
        <Route exact path={routes.unsubscribe} component={Lazy.Unsubscribe} />
        <Route
          exact
          path={[routes.backlog, routes.backlogWithSubViewNameAndPageNumberVar]}
          component={Lazy.Backlog}
        />
        {/* tag suggestions */}
        <Route
          exact
          path={[routes.editTagSuggestionWithVar, routes.createTagSuggestion]}
          component={Lazy.EditTagSuggestion}
        />
        <Route
          exact
          path={[routes.viewTagSuggestionWithVar]}
          component={Lazy.ViewTagSuggestion}
        />
        <Route
          exact
          path={[routes.tagSuggestions, routes.tagSuggestionsWithPageNumberVar]}
          component={Lazy.TagSuggestions}
        />
        {/* articles */}
        <Route
          exact
          path={[routes.editArticleWithVar, routes.createArticle]}
          component={Lazy.EditArticle}
        />
        <Route
          exact
          path={[routes.viewArticleWithVar]}
          component={Lazy.ViewArticle}
        />
        <Route
          exact
          path={[routes.articles, routes.articlesWithPageNumberVar]}
          component={Lazy.Articles}
        />
        {/* queries */}
        <Route
          exact
          path={routes.queryCheatsheet}
          component={Lazy.QueryCheatsheetContainer}
        />
        <Route
          exact
          path={[
            routes.query,
            routes.queryWithVar,
            routes.queryWithVarAndPageVar,
          ]}
          component={Lazy.Query}
        />
        <Route exact path={routes.queue} component={Lazy.Queue} />
        <Route exact path={routes.promos} component={DeprecatedRouteView} />
        <Route
          exact
          path={[routes.compareWithVars, routes.compareWithVar]}
          component={DeprecatedRouteView}
        />
        {/* pages - these must always be at the end as catch all */}
        <Route
          exact
          path={[
            routes.createPageWithPageVar,
            routes.createPageWithParentAndPageVar,
          ]}
          component={Lazy.CreatePage}
        />
        <Route
          exact
          path={[
            routes.editPageWithPageVar,
            routes.editPageWithParentAndPageVar,
          ]}
          component={Lazy.EditPage}
        />
        <Route
          exact
          path={[routes.pagesWithParentVar, routes.pagesWithParentAndPageVar]}
          component={Lazy.Pages}
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
            <SurveyMessage />
            <BannedNotice />
            <Notices />
            <AccountVerificationMessage />
            <EditorQueueMessage />
            <MyQueuedAssetsMessage />
            <SubEditorMessage />
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
