import { AssetCategories } from './hooks/useDatabaseQuery'
import avatarAreas from './areas/avatar'
import accessoryAreas from './areas/accessory'
import animationAreas from './areas/animation'
import tutorialAreas from './areas/tutorial'
import shaderAreas from './areas/shader'
import retextureAreas from './areas/retexture'
import articleAreas from './areas/article'
import worldAreas from './areas/world'
import toolAreas from './areas/tool'
import { Asset, PublicAsset } from './modules/assets'
import worldAssetAreas from './areas/worldAsset'

export const areasByCategory = {
  [AssetCategories.avatar]: avatarAreas,
  [AssetCategories.accessory]: accessoryAreas,
  [AssetCategories.animation]: animationAreas,
  [AssetCategories.tutorial]: tutorialAreas,
  [AssetCategories.shader]: shaderAreas,
  [AssetCategories.retexture]: retextureAreas,
  [AssetCategories.article]: articleAreas,
  [AssetCategories.world]: worldAreas,
  [AssetCategories.worldAsset]: worldAssetAreas,
  [AssetCategories.tool]: toolAreas
}

export const standardAreaNames = {
  none: 'none'
}

export const standardAreas = {
  [standardAreaNames.none]: {
    namePlural: 'Other',
    tags: []
  }
}

export const getAreasForAsset = (
  asset: Asset,
  areas: { [key: string]: Area }
) => {
  const areasForAsset = []
  const tags = asset.tags || []
  let hasFoundMatch = false

  for (const tag of tags) {
    for (const [areaName, { tags: tagsForArea }] of Object.entries(areas)) {
      if (tagsForArea.includes(tag) && hasFoundMatch === false) {
        areasForAsset.push(areaName)
        hasFoundMatch = true
      }
    }
  }

  if (!hasFoundMatch) {
    areasForAsset.push(standardAreaNames.none)
  }

  return areasForAsset
}

export const groupAssetsIntoAreas = (
  assets: PublicAsset[],
  categoryNameOrAreas: string | { [areaName: string]: Area }
): { [areaName: string]: PublicAsset[] } => {
  const areas =
    typeof categoryNameOrAreas === 'string'
      ? areasByCategory[categoryNameOrAreas]
      : categoryNameOrAreas

  const assetsByArea: { [areaName: string]: PublicAsset[] } = Object.keys(
    areas
  ).reduce((groups, areaName) => ({ ...groups, [areaName]: [] }), {})

  assetsByArea[standardAreaNames.none] = []

  for (const asset of assets) {
    const areasForAsset = getAreasForAsset(asset, areas)

    for (const areaForAsset of areasForAsset) {
      assetsByArea[areaForAsset].push(asset)
    }
  }

  return assetsByArea
}

export interface Area {
  namePlural: string
  tags: string[]
}
