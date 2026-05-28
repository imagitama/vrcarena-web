export interface Page extends Record<string, unknown> {
  id: string
  parent: string
  title: string
  description: string
  content: string
}

export enum CollectionNames {
  Pages = 'pages',
  PageParents = 'pageparents',
}
