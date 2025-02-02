export interface Page extends Record<string, unknown> {
  id: string
  parent: string
  title: string
  description: string
  content: string
}

export const CollectionNames = {
  Pages: 'pages',
  PageParents: 'pageparents',
}
