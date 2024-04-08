export interface Page {
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
