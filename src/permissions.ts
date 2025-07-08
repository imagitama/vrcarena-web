import { CommonRecordFields } from './data-store'
import { BanStatus, FullUser, User, UserRoles } from './modules/users'
import { routes } from './routes'

export const getHasPermissionForRecord = <TRecord extends CommonRecordFields>(
  user: FullUser | User | null,
  record: TRecord | null,
  allowEditingOwnRecord = false
): boolean => {
  if (user === null || record === null) {
    return false
  }

  if (user.banstatus === BanStatus.Banned) {
    return false
  }

  if (user.role === UserRoles.Editor || user.role === UserRoles.Admin) {
    return true
  }

  if (
    allowEditingOwnRecord &&
    record.createdby &&
    user.id === record.createdby
  ) {
    return true
  }

  return false
}

// TODO: Change routes to a more declarative thing instead of array:

// interface Route {
//   route: string
//   permissions: {
//     loggedIn: boolean
//     loggedOut: boolean
//     user: boolean
//     editor: boolean
//     admin: boolean
//   }
// }

const permissions = {
  [UserRoles.User]: [
    routes.home,
    routes.login,
    routes.loginWithVar,
    routes.logout,
    routes.logoutWithVar,
    routes.createAsset,
    routes.editAssetWithVar,
    routes.editAssetWithVarAndTabNameVar,
    routes.oldEditAssetWithVar,
    routes.viewAssetWithVar,
    routes.myAccount,
    routes.myAccountWithTabNameVar,
    routes.myAccountWithTabNameVarAndPageNumberVar,
    // help
    routes.privacyPolicy,
    routes.termsOfService,
    routes.takedownPolicy,
    routes.prices,
    // routes.signUp,
    routes.contributors,
    routes.unapproved,
    routes.viewAllSpecies,
    routes.viewAllSpeciesWithPageNumberVar,
    routes.viewSpeciesWithVar,
    routes.viewSpeciesCategoryWithVar,
    routes.viewSpeciesCategoryWithVarAndPageNumberVar,
    routes.viewCategoryWithVar,
    routes.viewCategoryWithPageNumberVar,
    routes.viewAreaWithVar,
    routes.viewAreaWithPageNumberVar,
    routes.viewAvatars,
    routes.viewAvatarsWithPageVar,
    routes.searchWithVarOld,
    routes.searchWithVar,
    routes.viewUserWithVar,
    // routes.editUserWithVar,
    routes.viewUserWithVarAndTabVar,
    routes.stats,
    routes.users,
    routes.staffUsers,
    routes.viewUsersWithPageNumberVar,
    routes.activity,
    routes.activityWithPageNumberVar,
    routes.streams,
    routes.about,
    routes.nsfw,
    routes.nsfwWithPageNumberVar,
    routes.authors,
    routes.viewAuthorsWithPageNumberVar,
    routes.viewAuthorWithVar,
    // routes.editAuthorWithVar,
    // routes.createAuthor,
    routes.discordServers,
    routes.viewDiscordServersWithPageNumberVar,
    routes.viewDiscordServerWithVar,
    // routes.editDiscordServerWithVar,
    // routes.createDiscordServer,
    routes.editSpeciesWithVar,
    // routes.createSpecies,
    routes.patreon,
    routes.resetPassword,
    routes.pedestals,
    routes.vsScreen,
    routes.tags,
    routes.viewTagWithPageNumberVar,
    routes.viewTagWithVar,
    // routes.createTag,
    // routes.editTagWithVar,
    routes.memoryGame,
    routes.guessTheAvatar,
    routes.launchWorldWithVar,
    routes.setupProfile,
    routes.createReportWithVar,
    // routes.editReportWithVar,
    routes.viewReportWithVar,
    routes.dmcaPolicy,
    routes.avatarTutorial,
    routes.avatarTutorialWithVar,
    routes.viewAwardWithVar,
    routes.viewAmendments,
    routes.createAmendmentWithVar,
    routes.viewAmendmentWithVar,
    // routes.editAmendmentWithVar,
    routes.brand,
    routes.accessorizeWithVar,
    routes.newAssets,
    routes.newAssetsWithPageNumberVar,
    routes.reviews,
    routes.viewAssetWithVarAndCommentVar,
    routes.viewAssetWithVarAndTabVar,
    routes.playlistsWithPageNumberVar,
    routes.editPlaylistWithVar,
    routes.createPlaylist,
    routes.viewPlaylistWithVar,
    routes.query,
    routes.queryWithVar,
    routes.queryWithVarAndPageVar,
    routes.queryCheatsheet,
    routes.transparency,
    routes.viewCollections,
    routes.viewCollectionWithVar,
    routes.editCollectionWithVar,
    routes.viewCollectionsWithPageNumberVar,
    routes.pagesWithParentVar,
    routes.pagesWithParentAndPageVar,
    // routes.editPageWithParentAndPageVar,
    // routes.createPageWithParentAndPageVar,
    routes.unsubscribe,
    routes.randomAvatars,
    routes.ranks,
    routes.ranksWithQueryParams,
    routes.viewRankWithVar,
    routes.furality,
    routes.events,
    routes.viewEventWithVar,
    routes.createEvent,
    routes.editEventWithVar,
    routes.social,
    routes.socialWithPostVar,
    routes.worldBuilder,
    routes.promos,
    routes.imageAtlas,
    routes.attachments,
    routes.attachmentsWithPageNumberVar,
    routes.viewAttachmentWithVar,
    // routes.editAttachmentWithVar,
    routes.compareWithVar,
    routes.compareWithVars,
    routes.cart,
    routes.tutorials,
  ],
  [UserRoles.Editor]: [
    routes.admin,
    routes.adminWithTabNameVar,
    routes.adminWithTabNameVarAndPageNumberVar,
    routes.editUserWithVar,
    routes.editAuthorWithVar,
    routes.createAuthor,
    routes.editDiscordServerWithVar,
    routes.createDiscordServer,
    routes.createSpecies,
    routes.createTag,
    routes.editTagWithVar,
    routes.editReportWithVar,
    routes.editAmendmentWithVar,
    routes.editPageWithParentAndPageVar,
    routes.createPageWithParentAndPageVar,
    routes.editAttachmentWithVar,
  ],
  [UserRoles.Admin]: [
    routes.admin,
    routes.adminWithTabNameVar,
    routes.adminWithTabNameVarAndPageNumberVar,
    routes.editUserWithVar,
    routes.editAuthorWithVar,
    routes.createAuthor,
    routes.editDiscordServerWithVar,
    routes.createDiscordServer,
    routes.createSpecies,
    routes.createTag,
    routes.editTagWithVar,
    routes.editReportWithVar,
    routes.editAmendmentWithVar,
    routes.editPageWithParentAndPageVar,
    routes.createPageWithParentAndPageVar,
    routes.editAttachmentWithVar,
  ],
}

export const getHasPermissionForRoute = (
  user: FullUser | User,
  route: string
): boolean => {
  if (user.banstatus === BanStatus.Banned) {
    return false
  }

  if (user.role === UserRoles.Editor || user.role === UserRoles.Admin) {
    return true
  }

  if (
    user.role &&
    (user.role as UserRoles) in permissions &&
    Object.values(permissions[user.role as UserRoles]).includes(route)
  ) {
    return true
  }

  return false
}
