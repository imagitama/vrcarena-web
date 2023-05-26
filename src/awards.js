export const allAwardIds = {
  '1_year_anniversary': '1_year_anniversary',
  '1_asset_approved': '1_asset_approved',
  '5_assets_approved': '5_assets_approved',
  '20_assets_approved': '20_assets_approved',
  '100_assets_approved': '100_assets_approved'
}

export const getNameForAwardId = awardId => {
  switch (awardId) {
    case allAwardIds['1_year_anniversary']:
      return '1 Year Anniversary'
    case allAwardIds['1_asset_approved']:
      return 'Uploaded 1 Asset'
    case allAwardIds['5_assets_approved']:
      return 'Uploaded 5 Assets'
    case allAwardIds['20_assets_approved']:
      return 'Uploaded 20 Assets'
    case allAwardIds['100_assets_approved']:
      return 'Uploaded 100 Assets'
    default:
      throw new Error(`Cannot get name for award "${awardId}": unknown ID!`)
  }
}
