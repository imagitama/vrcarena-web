import AccessibilityIcon from '@mui/icons-material/Accessibility'
import SchoolIcon from '@mui/icons-material/School'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'

import CheckroomIcon from '@mui/icons-material/Checkroom'
import ConstructionIcon from '@mui/icons-material/Construction'
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill'
import BrushIcon from '@mui/icons-material/Brush'

import { AssetCategory } from './modules/assets'

// TODO: Load on demand
import accessoryOptimizedImageUrl from './assets/images/categories/optimized/accessory.webp'
import animationOptimizedImageUrl from './assets/images/categories/optimized/animation.webp'
import avatarOptimizedImageUrl from './assets/images/categories/optimized/avatar.webp'
import tutorialOptimizedImageUrl from './assets/images/categories/optimized/tutorial.webp'
import worldAssetOptimizedImageUrl from './assets/images/categories/optimized/worldAsset.webp'
import toolOptimizedImageUrl from './assets/images/categories/optimized/tool.webp'
import retextureOptimizedImageUrl from './assets/images/categories/optimized/retexture.webp'
import shaderOptimizedImageUrl from './assets/images/categories/optimized/shader.webp'

export interface CategoryMeta {
  id: string
  name: string
  nameSingular: string
  shortDescription: string
  optimizedImageUrl: string
  icon?: any
}

const categoryMetas: { [name: string]: CategoryMeta } = {
  [AssetCategory.Accessory]: {
    id: AssetCategory.Accessory,
    name: 'Accessories',
    nameSingular: 'Accessory',
    shortDescription: `Add clothes, jewelry, glasses and more to your avatar using these accessories.`,
    optimizedImageUrl: accessoryOptimizedImageUrl,
    icon: CheckroomIcon,
  },
  [AssetCategory.Animation]: {
    id: AssetCategory.Animation,
    name: 'Animations',
    nameSingular: 'Animation',
    shortDescription:
      'Make your avatar dance, wave or run on the spot using one of these pre-made animations.',
    optimizedImageUrl: animationOptimizedImageUrl,
    icon: DirectionsRunIcon,
  },
  [AssetCategory.Avatar]: {
    id: AssetCategory.Avatar,
    name: 'Avatars',
    nameSingular: 'Avatar',
    shortDescription: `Discover new avatars for you to use in your favorite VR game.`,
    optimizedImageUrl: avatarOptimizedImageUrl,
    icon: AccessibilityIcon,
  },
  [AssetCategory.Tutorial]: {
    id: AssetCategory.Tutorial,
    name: 'Tutorials',
    nameSingular: 'Tutorial',
    shortDescription: `Learn how to use software such as Unity, Blender or Substance Painter. Learn how to make changes to your avatar or build worlds.`,
    optimizedImageUrl: tutorialOptimizedImageUrl,
    icon: SchoolIcon,
  },
  [AssetCategory.Tool]: {
    id: AssetCategory.Tool,
    name: 'Tools',
    nameSingular: 'Tool',
    shortDescription:
      'Mods, scripts, Unity plugins and other tools to help users create content for VR games.',
    optimizedImageUrl: toolOptimizedImageUrl,
    icon: ConstructionIcon,
  },
  [AssetCategory.Shader]: {
    id: AssetCategory.Shader,
    name: 'Shaders',
    nameSingular: 'Shader',
    shortDescription:
      'Shaders that modify the appearance of an avatar or world.',
    optimizedImageUrl: shaderOptimizedImageUrl,
    icon: FormatColorFillIcon,
  },
  [AssetCategory.Retexture]: {
    id: AssetCategory.Retexture,
    name: 'Retextures',
    nameSingular: 'Retexture',
    shortDescription: 'New textures for existing avatars or accessories.',
    optimizedImageUrl: retextureOptimizedImageUrl,
    icon: BrushIcon,
  },
  [AssetCategory.WorldAsset]: {
    id: AssetCategory.WorldAsset,
    name: 'World Assets',
    nameSingular: 'World Asset',
    shortDescription: `Assets that you can use in your worlds such as buttons, games, video players, etc.`,
    optimizedImageUrl: worldAssetOptimizedImageUrl,
  },
}

export const getCategoryMeta = (categoryName: AssetCategory): CategoryMeta => {
  if (!(categoryName in categoryMetas)) {
    console.warn(`Category ${categoryName} not found in category meta`)
    // TODO: Probably refactor to return null and everything do a null check
    return {} as CategoryMeta
  }
  return categoryMetas[categoryName]
}

export default categoryMetas
