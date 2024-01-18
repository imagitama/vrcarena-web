import AccessibilityIcon from '@material-ui/icons/Accessibility'
import ReceiptIcon from '@material-ui/icons/Receipt'
import SchoolIcon from '@material-ui/icons/School'
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun'

import CheckroomIcon from '@mui/icons-material/Checkroom'
import ConstructionIcon from '@mui/icons-material/Construction'
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill'
import BrushIcon from '@mui/icons-material/Brush'

import { AssetCategories } from './hooks/useDatabaseQuery'

// TODO: Load on demand
import accessoryOptimizedImageUrl from './assets/images/categories/optimized/accessory.webp'
import animationOptimizedImageUrl from './assets/images/categories/optimized/animation.webp'
import articleOptimizedImageUrl from './assets/images/categories/optimized/article.webp'
import avatarOptimizedImageUrl from './assets/images/categories/optimized/avatar.webp'
import tutorialOptimizedImageUrl from './assets/images/categories/optimized/tutorial.webp'
import worldOptimizedImageUrl from './assets/images/categories/optimized/world.webp'
import worldAssetOptimizedImageUrl from './assets/images/categories/optimized/worldAsset.webp'
import toolOptimizedImageUrl from './assets/images/categories/optimized/tool.webp'
import alterationOptimizedImageUrl from './assets/images/categories/optimized/alteration.webp'
import contentOptimizedImageUrl from './assets/images/categories/optimized/content.webp'
import retextureOptimizedImageUrl from './assets/images/categories/optimized/retexture.webp'
import shaderOptimizedImageUrl from './assets/images/categories/optimized/shader.webp'

export interface Category {
  id: string
  name: string
  nameSingular: string
  shortDescription: string
  optimizedImageUrl: string
  icon?: any
}

const categories: { [name: string]: Category } = {
  [AssetCategories.accessory]: {
    id: AssetCategories.accessory,
    name: 'Accessories',
    nameSingular: 'Accessory',
    shortDescription: `Add clothes, jewelry, glasses and more to your avatar using these accessories.`,
    optimizedImageUrl: accessoryOptimizedImageUrl,
    icon: CheckroomIcon,
  },
  [AssetCategories.animation]: {
    id: AssetCategories.animation,
    name: 'Animations',
    nameSingular: 'Animation',
    shortDescription:
      'Make your avatar dance, wave or run on the spot using one of these pre-made animations.',
    optimizedImageUrl: animationOptimizedImageUrl,
    icon: DirectionsRunIcon,
  },
  [AssetCategories.avatar]: {
    id: AssetCategories.avatar,
    name: 'Avatars',
    nameSingular: 'Avatar',
    shortDescription: `Discover new avatars for you to use in your favorite VR game.`,
    optimizedImageUrl: avatarOptimizedImageUrl,
    icon: AccessibilityIcon,
  },
  [AssetCategories.tutorial]: {
    id: AssetCategories.tutorial,
    name: 'Tutorials',
    nameSingular: 'Tutorial',
    shortDescription: `Learn how to use software such as Unity, Blender or Substance Painter. Learn how to make changes to your avatar or build worlds.`,
    optimizedImageUrl: tutorialOptimizedImageUrl,
    icon: SchoolIcon,
  },
  [AssetCategories.article]: {
    id: AssetCategories.article,
    name: 'News',
    nameSingular: 'Article',
    shortDescription: `Read recent news article about VRChat and the different species.`,
    optimizedImageUrl: articleOptimizedImageUrl,
    icon: ReceiptIcon,
  },
  [AssetCategories.tool]: {
    id: AssetCategories.tool,
    name: 'Tools',
    nameSingular: 'Tool',
    shortDescription:
      'Mods, scripts, Unity plugins and other tools to help users create content for VR games.',
    optimizedImageUrl: toolOptimizedImageUrl,
    icon: ConstructionIcon,
  },
  [AssetCategories.shader]: {
    id: AssetCategories.shader,
    name: 'Shaders',
    nameSingular: 'Shader',
    shortDescription:
      'Shaders that modify the appearance of an avatar or world.',
    optimizedImageUrl: shaderOptimizedImageUrl,
    icon: FormatColorFillIcon,
  },
  [AssetCategories.retexture]: {
    id: AssetCategories.retexture,
    name: 'Retextures',
    nameSingular: 'Retexture',
    shortDescription: 'New textures for existing avatars or accessories.',
    optimizedImageUrl: retextureOptimizedImageUrl,
    icon: BrushIcon,
  },
  [AssetCategories.world]: {
    id: AssetCategories.world,
    name: 'Worlds',
    nameSingular: 'World',
    shortDescription: `Worlds you can visit in any VR social game.`,
    optimizedImageUrl: worldOptimizedImageUrl,
  },
  [AssetCategories.worldAsset]: {
    id: AssetCategories.worldAsset,
    name: 'World Assets',
    nameSingular: 'World Asset',
    shortDescription: `Assets that you can use in your worlds such as buttons, games, video players, etc.`,
    optimizedImageUrl: worldAssetOptimizedImageUrl,
  },
  // deprecated
  [AssetCategories.content]: {
    id: AssetCategories.content,
    name: 'Content',
    nameSingular: 'Content',
    shortDescription:
      'Screenshots, videos, tweets or ANYTHING to do with another asset.',
    optimizedImageUrl: contentOptimizedImageUrl,
  },
  [AssetCategories.alteration]: {
    id: AssetCategories.alteration,
    name: 'Alterations',
    nameSingular: 'Alteration',
    shortDescription:
      'An alteration or modification of an existing avatar or accessory.',
    optimizedImageUrl: alterationOptimizedImageUrl,
  },
}

export default categories
