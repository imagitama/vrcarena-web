export enum fieldTypes {
  text = 'text',
  textMarkdown = 'textMarkdown',
  multichoice = 'multichoice',
  checkbox = 'checkbox',
  date = 'date',
  ref = 'ref',
  imageUpload = 'imageUpload',
  hidden = 'hidden',
  searchable = 'searchable', // uses search with records with "id" property
  singlechoice = 'singlechoice',
  assets = 'assets',
  custom = 'custom',
  tags = 'tags',
  // for diffs
  url = 'url',
  email = 'email'
}
