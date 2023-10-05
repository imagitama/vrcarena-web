import React from 'react'
import { AssetCategories } from '../hooks/useDatabaseQuery'
import worldTagDetails from '../tagDetails/world'

// icons
import AccessibilityNewIcon from '@material-ui/icons/AccessibilityNew'
// import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory'
import MoodIcon from '@material-ui/icons/Mood'
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun'
// import TuneIcon from '@material-ui/icons/Tune'
import WcIcon from '@material-ui/icons/Wc'
import LiveTvIcon from '@material-ui/icons/LiveTv'
// import ControlCameraIcon from '@material-ui/icons/ControlCamera'
import AttachMoneyIcon from '@material-ui/icons/AttachMoney'
import ClearIcon from '@material-ui/icons/Clear'
import LinkIcon from '@material-ui/icons/Link'
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import WomanIcon from '@mui/icons-material/Woman'
import ColorizeIcon from '@mui/icons-material/Colorize'
import ImagesearchRollerIcon from '@mui/icons-material/ImagesearchRoller'
import { ReactComponent as BlenderIcon } from '../assets/images/icons/blender.svg'
import { ReactComponent as SubstancePainterIcon } from '../assets/images/icons/substance-painter.svg'
import { ReactComponent as OculusIcon } from '../assets/images/icons/oculus.svg'
import { ReactComponent as ChilloutVRIcon } from '../assets/images/icons/chilloutvr.svg'
import { ReactComponent as PhotoshopIcon } from '../assets/images/icons/photoshop.svg'
import { ReactComponent as NeosVRIcon } from '../assets/images/icons/neosvr.svg'
import { ReactComponent as FbxIcon } from '../assets/images/icons/file_fbx.svg'
import { Unity as UnityIcon } from '@emotion-icons/boxicons-logos/Unity'
import { InsertTemplate as InsertTemplateIcon } from '@emotion-icons/icomoon/InsertTemplate'
import { Bone as BoneIcon } from '@emotion-icons/boxicons-solid/Bone'
import { Resize100Percent as Resize100PercentIcon } from '@emotion-icons/entypo/Resize100Percent'

export const cleanupTags = (tags?: string[]): string[] =>
  tags
    ? tags
        .filter(tag => /^[a-z0-9_]+$/g.test(tag))
        .map(tag =>
          tag
            .trim()
            .toLowerCase()
            .replaceAll(' ', '_')
        )
    : []

export const categories = {
  General: 'General',
  Modelling: 'Modelling',
  Cost: 'Cost',
  Compatibility: 'Compatibility',
  Features: 'Features',
  Textures: 'Textures',
  Avatars: 'Avatars',
  License: 'License',
  Performance: 'Performance',
  PC_Rank: 'PC_Rank',
  Quest_Rank: 'Quest_Rank'
}

export interface TagDetails {
  tag: string
  category: string
  icon?: any
  label?: string
  description?: string
  tip?: string
}

export const getLabelForTagDetails = (tagDetails: TagDetails): string =>
  tagDetails.label ||
  tagDetails.tag
    .split('_')
    .map(chunk => `${chunk[0].toUpperCase()}${chunk.slice(1)}`)
    .join(' ')

const tagWip: TagDetails = {
  tag: 'wip',
  category: categories.General,
  label: 'Work In Progress',
  description: 'This is a "Work In Progress" and may not work correctly'
}

const standardTags: TagDetails[] = [
  tagWip,
  {
    tag: 'paid',
    category: categories.General,
    description:
      'You have to pay ANY amount of money to get this asset (including subscriptions like Patreon)'
  },
  {
    tag: 'free',
    category: categories.General,
    icon: AttachMoneyIcon,
    description:
      'You do not have to pay ANY amount of money to get this asset (including subscriptions like Patreon'
  },
  // modelling
  {
    tag: 'rigged',
    category: categories.Modelling,
    icon: AccessibilityNewIcon,
    label: 'Rigged',
    description: 'Has bones and an armature'
  },
  {
    tag: 'not_rigged',
    label: 'Unrigged',
    category: categories.Modelling,
    description: 'Does not have any bones'
  },
  {
    tag: 'low_poly',
    label: 'Low Poly',
    category: categories.Modelling,
    description: 'Has a low polygon count compared to other models'
  },
  {
    tag: 'high_poly',
    label: 'High Poly',
    category: categories.Modelling,
    description: 'Has a high polygon count compared to other models'
  }
]

const standard3dModelTags: TagDetails[] = [
  {
    tag: 'scene_included',
    category: categories.Features,
    icon: UnityIcon,
    description: 'Includes a pre-configured Unity or other editor scene'
  },
  {
    tag: 'blendfile_included',
    category: categories.Features,
    icon: BlenderIcon,
    description: 'Includes a Blender file'
  },
  {
    tag: 'fbx_included',
    category: categories.Features,
    icon: FbxIcon,
    description: 'Includes a FBX file'
  },
  {
    tag: 'unity_package_included',
    category: categories.Features,
    icon: UnityIcon,
    description: 'Includes a unitypackage archive'
  },
  {
    tag: 'prefabs_included',
    category: categories.Features,
    icon: InsertTemplateIcon,
    description: 'Includes a Unity prefab file'
  },
  // texturing
  {
    tag: 'textures_included',
    category: categories.Textures,
    description: 'Includes some albedo, normal, metallic, roughness maps'
  },
  {
    tag: 'uv_mapped',
    label: 'UV Mapped',
    category: categories.Textures,
    description: 'Is UV mapped'
  },
  {
    tag: 'psd_included',
    label: 'PSD Included',
    category: categories.Textures,
    icon: PhotoshopIcon,
    description: 'Includes a Photoshop file'
  },
  {
    tag: 'substance_painter_included',
    label: 'Substance Painter File Included',
    category: categories.Textures,
    icon: SubstancePainterIcon,
    description: 'Includes a Substance Painter file'
  },
  {
    tag: '4k_textures_included',
    label: '4K Textures Included',
    category: categories.Textures,
    description: 'Includes high resolution (4K) textures'
  },
  {
    tag: 'poiyomi_shader_ready',
    category: categories.Textures,
    description: 'Is pre-configured for Poiyomi shader'
  },
  {
    tag: 'requires_poiyomi_shader',
    category: categories.Textures,
    description: 'Requires Poiyomi Shader otherwise it will not work'
  },
  {
    tag: 'custom_shader_included',
    category: categories.Textures,
    description: 'Includes a custom-built shader'
  }
]

const platformNames = {
  PC: 'PC',
  Quest: 'Quest'
}

const performanceRanks = {
  Excellent: 'Excellent',
  Good: 'Good',
  Medium: 'Medium',
  Poor: 'Poor',
  VeryPoor: 'Very Poor'
}

const performanceTagDetails: TagDetails[] = Object.keys(platformNames).reduce<
  TagDetails[]
>(
  (result, platformName) =>
    result.concat(
      Object.keys(performanceRanks).map(performanceRank => ({
        tag: `${performanceRank.toLowerCase()}_${platformName.toLowerCase()}_rank`,
        // @ts-ignore
        label: `${performanceRanks[performanceRank]} ${platformName} Rank`,
        category:
          platformName === platformNames.PC
            ? categories.PC_Rank
            : categories.Quest_Rank,
        icon:
          platformName === platformNames.PC ? DesktopWindowsIcon : OculusIcon,
        // @ts-ignore
        description: `${platformNames[platformName]} - ${
          // @ts-ignore
          performanceRanks[performanceRank]
        } Performance Rank`
      }))
    ),
  []
)

const avatarTagDetails = [
  {
    tag: 'neosvr_ready',
    label: 'NeosVR Ready',
    icon: NeosVRIcon,
    category: categories.Compatibility,
    description: 'This can be immediately uploaded to NeosVR'
  },
  {
    tag: 'chilloutvr_ready',
    label: 'ChilloutVR Ready',
    category: categories.Compatibility,
    icon: ChilloutVRIcon,
    description: 'This can be immediately uploaded to ChilloutVR'
  },
  {
    tag: 'less_than_15k_pollies',
    description:
      'Has less than 15,000 polygons (limit of VRChat Quest "Medium" rank avatars)',
    category: categories.Performance
  },
  {
    tag: 'less_than_70k_pollies',
    description:
      'Has less than 70,000 polygons (limit of VRChat PC "Poor" rank avatars)',
    category: categories.Performance
  },
  {
    tag: 'quest_compatible',
    icon: OculusIcon,
    label: 'Quest Compatible',
    description:
      'This avatar can immediately be uploaded as Quest avatar (ie. low filesize, low polygon)',
    category: categories.Compatibility
  },
  {
    tag: 'separate_quest_model',
    label: 'Separate Quest Model',
    icon: OculusIcon,
    description: 'Includes a completely separate Quest version of the avatar',
    category: categories.Compatibility
  },
  {
    tag: 'custom_idle_animation',
    description: 'Includes a custom idle animation (that loops)',
    category: categories.Features
  },
  {
    tag: 'custom_emotes',
    description: 'Includes custom emotes (eg. a dance)',
    category: categories.Features
  },
  {
    tag: 'custom_gestures',
    icon: MoodIcon,
    description: 'Includes custom hand gestures (fist, thumbs up, point, etc.)',
    category: categories.Features
  },
  {
    tag: 'plantigrade',
    description:
      'The armature is rigged with how mammals (ie humans) stand and walk (on their toes and heel)',
    category: categories.Avatars
  },
  {
    tag: 'digigrade',
    description:
      'The armature is rigged with how some animals like cats, dogs, etc. walk (on just their toes)',
    category: categories.Avatars
  },
  {
    tag: 'cartoony',
    description: 'The appearance is cartoony (probably uses a toon shader)',
    category: categories.Modelling
  },
  {
    tag: 'very_realistic',
    description: 'The appearance is trying to mimick a real creature',
    category: categories.Modelling
  },
  {
    tag: 'fur',
    description:
      'The avatar uses fur in its appearance (with or without a fur shader)',
    category: categories.Modelling
  },
  {
    tag: 'scales',
    description: 'The avatar uses scales in its appearance',
    category: categories.Modelling
  },
  {
    tag: 'feathers',
    description: 'The avatar uses feathers somewhere in its appearance',
    category: categories.Modelling
  },
  {
    tag: 'customizable_body',
    description: 'Has blendshapes or other ways to customize its body',
    category: categories.Modelling
  },
  {
    tag: 'clothes_included',
    description: 'Has clothes included in the package',
    category: categories.Modelling,
    icon: CheckroomIcon
  },
  {
    tag: 'multiple_body_textures',
    description:
      'Includes multiple body textures (such as different fur designs)',
    category: categories.Modelling,
    icon: ImagesearchRollerIcon
  },
  {
    tag: 'multiple_eye_colors',
    description: 'Includes multiple eye color textures',
    category: categories.Modelling,
    icon: ColorizeIcon
  }
]

export const tagDetailsByCategory: { [categoryName: string]: TagDetails[] } = {
  [AssetCategories.world]: [tagWip, ...worldTagDetails],
  [AssetCategories.accessory]: [...standard3dModelTags],
  [AssetCategories.avatar]: [
    ...avatarTagDetails,
    ...standard3dModelTags,
    ...performanceTagDetails
  ]
}

export const allTags: TagDetails[] = [
  ...standardTags,
  ...standard3dModelTags,
  ...performanceTagDetails,
  ...avatarTagDetails,
  {
    tag: 'custom_animations',
    icon: DirectionsRunIcon,
    description: 'Includes custom Unity or Blender animations',
    category: categories.Features
  },
  // compatibility
  {
    tag: 'requires_linked_asset',
    category: categories.Compatibility,
    icon: LinkIcon,
    description: 'To work this requires the asset which has been linked to it'
  },
  {
    tag: 'requires_blender',
    category: categories.Compatibility,
    icon: BlenderIcon,
    description: 'To work this requires knowledge of Blender'
  },
  // features
  {
    tag: 'vrm_ready',
    label: 'VRM Ready',
    icon: LiveTvIcon,
    description: 'Ready for VRM',
    category: categories.Features
  },
  {
    tag: 'body_puppets',
    category: categories.Features,
    description:
      'You can puppet your ears, tail or any other appendage using a VRChat menu',
    icon: Resize100PercentIcon
  },
  {
    tag: 'full_body_ready',
    icon: AccessibilityNewIcon,
    category: categories.Features,
    description: 'Is tested with full body tracking'
  },
  {
    tag: 'physbones_ready',
    label: 'PhysBones Ready',
    category: categories.Features,
    description: 'Has VRChat PhysBones components pre-configured',
    icon: BoneIcon
  },
  {
    tag: 'requires_physbones',
    category: categories.Features,
    description: 'Requires VRChat PhysBones to operate'
  },
  {
    tag: 'nsfw_included',
    category: categories.Features,
    label: 'Includes NSFW content',
    description: 'Includes NSFW content (eg genitals, sex toys)'
  },
  {
    tag: 'female_blend_shapes',
    label: 'Female Variant Included',
    category: categories.Features,
    icon: WomanIcon,
    description: 'Includes blendshapes or shape keys to appear female'
  },
  {
    tag: 'male_blend_shapes',
    category: categories.Features,
    description: 'Includes blendshapes or shape keys to appear male'
  },
  // licensing
  {
    tag: 'public_avatars_banned',
    icon: ClearIcon,
    category: categories.License,
    label: 'No Public Avatars',
    tip:
      'The creator of this avatar has explicitly banned uploading public versions of this avatar. This is overly restrictive.'
  },
  {
    tag: 'adult_avatars_banned',
    category: categories.License,
    label: 'No Adult Avatars',
    description:
      'Owners of this asset are prohibited from adding adult accessories (genitals, sex toys, etc.)'
  }
]

export const renamedTags = {
  // spelling
  armor: ['armour'],
  // features
  dynamic_bones_ready: ['dynamic_bones'],
  poiyomi_shader_ready: ['poiyomi_shader', 'poiyomi_toon_shader'],
  unity_package_included: ['unity_package'],
  custom_shader_included: ['custom_shaders'],
  uv_mapped: ['uv_included'],
  paid: ['paid_avatar', 'paid_asset', 'paid_model'],
  free: ['free_avatar', 'free_asset', 'free_model'],
  wip: ['work_in_progress'],
  body_puppets: ['sdk3_puppets'],
  // compatibility
  chilloutvr_ready: ['chilloutvr_compatible', 'chilloutvr'],
  quest_compatible: ['quest'],
  vrm_ready: ['vrm'],
  // animations
  sleeping: ['sleep'],
  walking: ['walk'],
  running: ['run'],
  sitting: ['sit'],
  flying: ['fly'],
  falling: ['fall'],
  floating: ['float'],
  idling: ['idle'],
  breathing: ['breath'],
  crying: ['cry'],
  textures_included: ['albedo_included'],
  // textures
  '4k_textures': ['high_resolution_textures']
}

export default allTags

/**
 * deprecated:
 * - not_vrchat_compatible
 * - toggle_accessories
 * - dynamic_bones_ready
 * - requires_dynamic_bones
 */
