export enum FeaturedStatus {
  Featured = 'featured',
  Unfeatured = 'unfeatured',
}

export enum PublishStatus {
  Published = 'published',
  Draft = 'draft',
}

export enum AccessStatus {
  Public = 'public',
  Archived = 'archived', // added oct 2024
  Deleted = 'deleted',
}

export enum ApprovalStatus {
  Approved = 'approved',
  Waiting = 'waiting',
  Declined = 'declined',
}

export enum PinnedStatus {
  Pinned = 'pinned',
  Unpinned = 'unpinned',
}

export interface MetaRecord extends Record<string, unknown> {
  editornotes: string
  featuredstatus: FeaturedStatus
  accessstatus: AccessStatus
  approvalstatus: ApprovalStatus
  publishstatus: PublishStatus
  // todo: add to non-assets
  approvedat: Date | null
}
