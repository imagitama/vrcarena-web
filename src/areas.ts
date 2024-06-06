import avatarAreas from './areas/avatar'
import accessoryAreas from './areas/accessory'
import animationAreas from './areas/animation'
import tutorialAreas from './areas/tutorial'
import shaderAreas from './areas/shader'
import retextureAreas from './areas/retexture'
import toolAreas from './areas/tool'
import {
  Asset,
  AssetCategory,
  CoreAssetFields,
  PublicAsset,
} from './modules/assets'
import worldAssetAreas from './areas/worldAsset'

export const areasByCategory: { [categoryName: string]: Areas } = {
  [AssetCategory.Avatar]: avatarAreas,
  [AssetCategory.Accessory]: accessoryAreas,
  [AssetCategory.Animation]: animationAreas,
  [AssetCategory.Tutorial]: tutorialAreas,
  [AssetCategory.Shader]: shaderAreas,
  [AssetCategory.Retexture]: retextureAreas,
  [AssetCategory.WorldAsset]: worldAssetAreas,
  [AssetCategory.Tool]: toolAreas,
}

export const standardAreaNames = {
  none: 'none',
}

export const standardAreas = {
  [standardAreaNames.none]: {
    namePlural: 'Other',
    tags: [],
  },
}

export const getAreasForAsset = (
  asset: CoreAssetFields,
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
  assets: (Asset | PublicAsset)[],
  categoryNameOrAreas: string | { [areaName: string]: Area }
): { [areaName: string]: (Asset | PublicAsset)[] } => {
  const areas =
    typeof categoryNameOrAreas === 'string'
      ? areasByCategory[categoryNameOrAreas as AssetCategory]
      : categoryNameOrAreas

  const assetsByArea: { [areaName: string]: (Asset | PublicAsset)[] } =
    Object.keys(areas).reduce(
      (groups, areaName) => ({ ...groups, [areaName]: [] }),
      {}
    )

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

export interface Areas {
  [name: string]: Area
}
