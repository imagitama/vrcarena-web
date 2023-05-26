import { AssetCategories } from '../hooks/useDatabaseQuery'
import worldTagDetails from '../tagDetails/world'

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
  License: 'License'
}

export interface TagDetails {
  tag: string
  category: string
  description: string
}

const tagWip = {
  tag: 'wip',
  category: categories.General,
  description: 'This is a Work In Progress and may not work correctly'
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
    description:
      'You do not have to pay ANY amount of money to get this asset (including subscriptions like Patreon'
  },
  // modelling
  {
    tag: 'rigged',
    category: categories.Modelling,
    description: 'Has a bones and/or armature'
  },
  {
    tag: 'not_rigged',
    category: categories.Modelling,
    description: 'Does not have any bones'
  },
  {
    tag: 'low_poly',
    category: categories.Modelling,
    description: 'Has a low polygon count compared to other models'
  },
  {
    tag: 'high_poly',
    category: categories.Modelling,
    description: 'Has a high polygon count compared to other models'
  }
]

const standard3dModelTags: TagDetails[] = [
  {
    tag: 'scene_included',
    category: categories.Features,
    description: 'Includes a pre-configured Unity scene'
  },
  {
    tag: 'blendfile_included',
    category: categories.Features,
    description: 'Includes a Blender file'
  },
  {
    tag: 'fbx_included',
    category: categories.Features,
    description: 'Includes a FBX file'
  },
  {
    tag: 'unity_package_included',
    category: categories.Features,
    description: 'Includes a unitypackage archive'
  },
  {
    tag: 'prefabs_included',
    category: categories.Features,
    description: 'Includes a Unity prefab file'
  },
  {
    tag: 'multiple_material_slots',
    category: categories.Features,
    description: 'Has multiple material slots for customization'
  },
  // texturing
  {
    tag: 'textures_included', // originally albedo_included
    category: categories.Textures,
    description: 'Includes some albedo, normal, metallic, roughness maps'
  },
  {
    tag: 'uv_mapped',
    category: categories.Textures,
    description: 'Is UV mapped'
  },
  {
    tag: 'psd_included',
    category: categories.Textures,
    description: 'Includes a Photoshop file'
  },
  {
    tag: 'substance_painter_included',
    category: categories.Textures,
    description: 'Includes a Substance Painter file'
  },
  {
    tag: 'high_resolution_textures',
    category: categories.Textures,
    description: 'Includes high resolution (4K or 8K) textures'
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

export const tagDetailsByCategory: { [categoryName: string]: TagDetails[] } = {
  [AssetCategories.world]: [tagWip, ...worldTagDetails],
  [AssetCategories.worldAsset]: [...standardTags]
}

export const tags: TagDetails[] = [
  ...standardTags,
  ...standard3dModelTags,
  // compatibility
  {
    tag: 'not_vrchat_compatible',
    category: categories.Compatibility,
    description: 'This will break in VRChat'
  },
  {
    tag: 'neosvr_ready',
    category: categories.Compatibility,
    description: 'This can be immediately uploaded to NeosVR'
  },
  {
    tag: 'neosvr_tested',
    category: categories.Compatibility,
    description: 'This has been tested inside NeosVR'
  },
  {
    tag: 'chilloutvr_ready',
    category: categories.Compatibility,
    description: 'This can be immediately uploaded to ChilloutVR'
  },
  {
    tag: 'chilloutvr_tested',
    category: categories.Compatibility,
    description: 'This has been tested inside ChilloutVR'
  },
  {
    tag: 'requires_linked_asset',
    category: categories.Compatibility,
    description: 'To work this requires the asset which has been linked to it'
  },
  {
    tag: 'requires_blender',
    category: categories.Compatibility,
    description: 'To work this requires knowledge of Blender'
  },
  // features
  {
    tag: 'sdk3_puppets',
    category: categories.Features,
    description:
      'You can puppet your ears, tail or any other appendage using a VRChat SDK3 menu'
  },
  {
    tag: 'full_body_ready',
    category: categories.Features,
    description: 'Is tested with full body tracking'
  },
  {
    tag: 'dynamic_bones_ready',
    category: categories.Features,
    description: 'Has Dynamic Bones components pre-configured'
  },
  {
    tag: 'requires_dynamic_bones',
    category: categories.Features,
    description: 'Requires Dynamic Bones to operate'
  },
  {
    tag: 'physbones_ready',
    category: categories.Features,
    description: 'Has VRChat PhysBones components pre-configured'
  },
  {
    tag: 'requires_physbones',
    category: categories.Features,
    description: 'Requires VRChat PhysBones to operate'
  },
  {
    tag: 'nsfw_included',
    category: categories.Features,
    description: 'Includes NSFW content (eg genitals)'
  },
  {
    tag: 'multiple_blend_shapes',
    category: categories.Features,
    description: 'Includes multiple blendshapes or shape keys'
  },
  {
    tag: 'female_blend_shapes',
    category: categories.Features,
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
    category: categories.License,
    description:
      'Owners of this asset are prohibited from uploading public avatars in any game'
  },
  {
    tag: 'adult_avatars_banned',
    category: categories.License,
    description:
      'Owners of this asset are prohibited from adding adult accessories (genitals, sex toys, etc.)'
  }
]

export const moreTags = [
  {
    tag: 'separate_quest_model',
    description: 'Includes a completely separate Quest version of the avatar'
  },
  {
    tag: 'quest_compatible',
    description:
      'This avatar can immediately be uploaded as Quest avatar (ie. low filesize, low polygon)'
  },
  {
    tag: 'less_than_15k_pollies',
    description:
      'Has less than 15,000 polygons (limit of VRChat Quest "Medium" rank avatars)'
  },
  {
    tag: 'less_than_70k_pollies',
    description:
      'Has less than 70,000 polygons (limit of VRChat PC "Poor" rank avatars)'
  },
  {
    tag: 'custom_animations',
    description: 'Includes custom Unity or Blender animations'
  },
  {
    tag: 'custom_idle_animation',
    description: 'Includes a custom idle animation (that loops)'
  },
  {
    tag: 'custom_emotes',
    description: 'Includes custom emotes (eg. a dance)'
  },
  {
    tag: 'custom_gestures',
    description: 'Includes custom hand gestures (fist, thumbs up, point, etc.)'
  },
  {
    tag: 'plantigrade',
    description:
      'The armature is rigged with how mammals (ie humans) stand and walk (on their toes and heel)'
  },
  {
    tag: 'digigrade',
    description:
      'The armature is rigged with how some animals like cats, dogs, etc. walk (on just their toes)'
  },
  {
    tag: 'cartoony',
    description: 'The appearance is cartoony (probably uses a toon shader)'
  },
  {
    tag: 'very_realistic',
    description: 'The appearance is trying to mimick a real creature'
  },
  {
    tag: 'fur',
    description:
      'The avatar uses fur in its appearance (with or without a fur shader)'
  },
  {
    tag: 'scales',
    description: 'The avatar uses scales in its appearance'
  },
  {
    tag: 'feathers',
    description: 'The avatar uses feathers somewhere in its appearance'
  },
  {
    tag: 'toggle_accessories',
    description: 'Includes a menu system for toggling its accessories'
  },
  {
    tag: 'customizable_body',
    description: 'Has blendshapes or other ways to customize its body'
  },
  {
    tag: 'clothes_included',
    description: 'Has clothes included in the package'
  },
  {
    tag: 'multiple_body_textures',
    description:
      'Includes multiple body textures (such as different fur designs)'
  },
  {
    tag: 'multiple_eye_colors',
    description: 'Includes multiple eye color textures'
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
  multiple_blend_shapes: ['blend_shapes'],
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
  textures_included: ['albedo_included']
}
