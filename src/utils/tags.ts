export const cleanupTags = (tags?: string[]): string[] =>
  tags
    ? tags
        .filter((tag) => /^[a-z0-9_]+$/g.test(tag))
        .map((tag) => tag.trim().toLowerCase().replaceAll(' ', '_'))
    : []

export const removeDuplicates = (tags: string[]): string[] =>
  tags.filter((value, index, array) => array.indexOf(value) === index)

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
  Quest_Rank: 'Quest_Rank',
}

export const getLabelForTag = (tag: string): string =>
  tag
    .split('_')
    .map((chunk) => `${chunk[0].toUpperCase()}${chunk.slice(1)}`)
    .join(' ')

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
  '4k_textures': ['high_resolution_textures'],
}

/**
 * deprecated:
 * - not_vrchat_compatible
 * - toggle_accessories
 * - dynamic_bones_ready
 * - requires_dynamic_bones
 * - multiple_blend_shapes
 */
