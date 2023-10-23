export const home = '/'
export const login = '/login'
export const loginWithVar = '/login?from=:currentPath'
export const logout = '/logout'
export const logoutWithVar = '/logout?from=:currentPath'
export const createAsset = '/assets/create'
export const editAssetWithVar = '/assets/:assetId/edit'
export const oldEditAssetWithVar = '/assets/:assetId/?edit'
export const viewAssetWithVar = '/assets/:assetId'
export const admin = '/admin'
export const adminWithTabNameVar = '/admin/:tabName'
export const adminWithTabNameVarAndPageNumberVar =
  '/admin/:tabName/page/:pageNumber'
export const myAccount = '/my-account'
export const myAccountWithTabNameVar = '/my-account/:tabName'
export const myAccountWithTabNameVarAndPageNumberVar =
  '/my-account/:tabName/page/:pageNumber'
export const privacyPolicy = '/privacy-policy'
export const signUp = '/sign-up'
export const contributors = '/contributors'
export const unapproved = '/unapproved'
export const viewAllSpecies = '/species'
export const viewAllSpeciesWithPageNumberVar = '/species/page/:pageNumber'
export const viewSpeciesWithVar = '/species/:speciesIdOrSlug'
export const viewSpeciesCategoryWithVar =
  '/species/:speciesIdOrSlug/:categoryName'
export const viewSpeciesCategoryWithVarAndPageNumberVar =
  '/species/:speciesIdOrSlug/:categoryName/page/:pageNumber'
export const viewCategoryWithVar = '/category/:categoryName'
export const viewCategoryWithPageNumberVar =
  '/category/:categoryName/page/:pageNumber'
export const viewAreaWithVar = '/category/:categoryName/areas/:areaName'
export const viewAreaWithPageNumberVar =
  '/category/:categoryName/areas/:areaName/page/:pageNumber'
export const viewAvatars = '/category/avatar'
export const viewAvatarsWithPageVar = '/category/avatar/:pageNumber'
export const news = '/news'
export const searchWithVarOld = '/search/:searchTerm'
export const searchWithVar = '/search/:indexName/:searchTerm'
export const viewUserWithVar = '/users/:userId'
export const editUserWithVar = '/users/:userId/edit'
export const viewUserWithVarAndTabVar = '/users/:userId/:tabName'
export const stats = '/stats'
export const users = '/users'
export const staffUsers = '/users/staff'
export const viewUsersWithPageNumberVar = '/users/page/:pageNumber'
export const activity = '/activity'
export const activityWithPageNumberVar = '/activity/page/:pageNumber'
export const streams = '/streams'
export const about = '/about'
export const nsfw = '/nsfw'
export const nsfwWithPageNumberVar = '/nsfw/page/:pageNumber'
export const authors = '/authors'
export const viewAuthorsWithPageNumberVar = '/authors/page/:pageNumber'
export const viewAuthorWithVar = '/authors/:authorId'
export const editAuthorWithVar = '/authors/:authorId/edit'
export const createAuthor = '/authors/create'
export const discordServers = '/discord-servers'
export const viewDiscordServersWithPageNumberVar =
  '/discord-servers/page/:pageNumber'
export const viewDiscordServerWithVar = '/discord-servers/:discordServerId'
export const editDiscordServerWithVar = '/discord-servers/:discordServerId/edit'
export const createDiscordServer = '/discord-servers/create'
export const editSpeciesWithVar = '/species/:speciesId/edit'
export const createSpecies = '/species/create'
export const patreon = '/patreon'
export const resetPassword = '/reset-password'
export const pedestals = '/pedestals'
export const vsScreen = '/vs-screen'
export const tags = '/tags'
export const viewTagWithVar = '/tags/:tag'
export const createTag = '/tags/create'
export const editTagWithVar = '/tags/:tag/edit'
export const memoryGame = '/memory'
export const guessTheAvatar = '/guess-the-avatar'
export const launchWorldWithVar = '/assets/:assetId/launch'
export const setupProfile = '/setup-profile'
export const createReportWithVar = '/reports/create/:parentTable/:parentId'
export const editReportWithVar = '/reports/edit/:reportId'
export const viewReportWithVar = '/reports/:reportId'
export const dmcaPolicy = '/dcma-policy'
export const avatarTutorial = '/avatar-tutorial'
export const avatarTutorialWithVar = '/avatar-tutorial/:pageName'
export const viewAwardWithVar = '/awards/:awardId'
export const rules = '/guidelines'
export const takedownPolicy = '/takedown-policy'
export const viewAmendments = '/amendments'
export const createAmendmentWithVar =
  '/amendments/create/:parentTable/:parentId'
export const viewAmendmentWithVar = '/amendments/:amendmentId'
export const editAmendmentWithVar = '/amendments/:amendmentId/edit'
export const brand = '/brand'
export const accessorizeWithVar = '/accessorize/:assetId'
export const viewEventWithVar = '/events/:eventName'
export const newAssets = '/new'
export const newAssetsWithPageNumberVar = '/new/page/:pageNumber'
export const reviews = '/reviews'
export const viewAssetWithVarAndCommentVar =
  '/assets/:assetId/comments?comment=:commentId'
export const viewAssetWithVarAndTabVar = '/assets/:assetId/:tabName'
export const playlistsWithPageNumberVar = '/playlists/page/:pageNumber'
export const editPlaylistWithVar = '/playlists/:playlistId/edit'
export const createPlaylist = '/playlists/create'
export const viewPlaylistWithVar = '/playlists/:playlistId'
export const query = '/query'
export const queryWithVar = '/query/:query'
export const queryWithVarAndPageVar = '/query/:query/page/:pageNumber'
export const queryCheatsheet = '/query/cheatsheet'
export const transparency = '/transparency'
export const viewCollections = '/collections'
export const viewCollectionWithVar = '/collections/:collectionId'
export const viewCollectionsWithPageNumberVar = '/collections/page/:pageNumber'
export const pagesWithParentVar = '/:parentName'
export const pagesWithParentAndPageVar = '/:parentName/:pageName'
export const editPageWithParentAndPageVar = '/:parentName/:pageName/edit'
export const unsubscribe = '/unsubscribe'
export const randomAvatars = '/category/avatar/random'
export const bulkAdd = '/bulk-add'
export const ranks = '/ranks'
export const ranksWithQueryParams =
  '/ranks?rankIds=:rankIds&primaryRankId=:primaryRankId'
export const viewRankWithVar = '/ranks/:rankId'
export const furality = '/furality'
