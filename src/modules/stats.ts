import { AssetCategory } from './assets'

interface GetAssetsStats {
  assetcount: number // public
  adultassetcount: number // public isadult=true
  categorycount: {
    [AssetCategory.Avatar]: number
    [AssetCategory.Accessory]: number
    [AssetCategory.Animation]: number
    [AssetCategory.Tutorial]: number
    [AssetCategory.Shader]: number
    [AssetCategory.Retexture]: number
    [AssetCategory.WorldAsset]: number
    [AssetCategory.Tool]: number
  }
  assetsperday: number | null // null on no assets in time period
  assetsperweek: number | null // null on no assets in time period
}

interface GetPatreonStats {
  activepatroncount: number
  totalpatroncount: number
}

interface GetAuthorsStats {
  authorcount: number // public
}

interface GetUsersStats {
  usercount: number // unbanned with username
}

interface GetAmendmentsStats {
  amendmentcount: number // approved
  amendmentsperday: number | null // null on no amendments in time period
  amendmentsperweek: number | null // null on no amendments in time period
}

interface GetSpeciesStats {
  speciescount: number
}

export interface FullStats {
  assets: GetAssetsStats
  authors: GetAuthorsStats
  users: GetUsersStats
  amendments: GetAmendmentsStats
  species: GetSpeciesStats
  patreon: GetPatreonStats
}

export enum ViewNames {
  GetFullStats = 'getfullstats',
}
