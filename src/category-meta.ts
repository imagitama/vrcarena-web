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
  description: string
  optimizedImageUrl: string
  icon?: any
  rules?: string
}

const categoryMetas: { [name: string]: CategoryMeta } = {
  [AssetCategory.Accessory]: {
    id: AssetCategory.Accessory,
    name: 'Accessories',
    nameSingular: 'Accessory',
    description:
      'Clothing, jewelry, hair, pens and more accessories designed specifically for VR avatars.',
    optimizedImageUrl: accessoryOptimizedImageUrl,
    icon: CheckroomIcon,
    rules:
      'The accessory must be designed with VR avatars in mind. For example an unrigged wristwatch is fine as it is can be dropped onto an avatar but a Toyota Camry is not as it requires significant work to adapt to an avatar.',
  },
  [AssetCategory.Animation]: {
    id: AssetCategory.Animation,
    name: 'Animations',
    nameSingular: 'Animation',
    description:
      'Animate your VR avatar using these pre-made animations designed specifically for VR avatars.',
    optimizedImageUrl: animationOptimizedImageUrl,
    icon: DirectionsRunIcon,
  },
  [AssetCategory.Avatar]: {
    id: AssetCategory.Avatar,
    name: 'Avatars',
    nameSingular: 'Avatar',
    description: `Represent yourself using an avatar designed specifically for VR games.`,
    optimizedImageUrl: avatarOptimizedImageUrl,
    icon: AccessibilityIcon,
    rules:
      'The avatar must be basically ready for upload to a game (like VRChat) with minimal effort for the user. Unrigged meshes the user is expected to rig themselves and VRM-only models are NOT allowed.',
  },
  [AssetCategory.Tool]: {
    id: AssetCategory.Tool,
    name: 'Tools',
    nameSingular: 'Tool',
    description:
      'Mods, scripts, Unity plugins and other tools to help users create content for VR games.',
    optimizedImageUrl: toolOptimizedImageUrl,
    icon: ConstructionIcon,
  },
  [AssetCategory.Shader]: {
    id: AssetCategory.Shader,
    name: 'Shaders',
    nameSingular: 'Shader',
    description: 'Shaders that modify the appearance of an avatar or world.',
    optimizedImageUrl: shaderOptimizedImageUrl,
    icon: FormatColorFillIcon,
  },
  [AssetCategory.Retexture]: {
    id: AssetCategory.Retexture,
    name: 'Retextures',
    nameSingular: 'Retexture',
    description: 'New textures for existing avatars or accessories.',
    optimizedImageUrl: retextureOptimizedImageUrl,
    icon: BrushIcon,
  },
  [AssetCategory.WorldAsset]: {
    id: AssetCategory.WorldAsset,
    name: 'World Assets',
    nameSingular: 'World Asset',
    description: `Assets designed specifically for VR games such as VRChat Udon prefabs, ProtoFlux prefabs etc.`,
    optimizedImageUrl: worldAssetOptimizedImageUrl,
  },
  // deprecated
  [AssetCategory.Tutorial]: {
    id: AssetCategory.Tutorial,
    name: 'Tutorials',
    nameSingular: 'Tutorial',
    description: `Learn how to create avatars and worlds, add accessories and more.`,
    optimizedImageUrl: tutorialOptimizedImageUrl,
    icon: SchoolIcon,
  },
}

export const getCategoryMeta = (categoryName: AssetCategory): CategoryMeta => {
  if (!(categoryName in categoryMetas)) {
    // TODO: Probably refactor to return null and everything do a null check
    return {} as CategoryMeta
  }
  return categoryMetas[categoryName]
}

export default categoryMetas
