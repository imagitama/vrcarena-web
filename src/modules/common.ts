export enum FeaturedStatus {
  Featured = 'featured',
  Unfeatured = 'unfeatured',
}

export interface MetaRecord extends Record<string, unknown> {
  featuredstatus: 'featuredstatus'
  accessstatus: 'accessstatus'
}
