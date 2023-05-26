import categoryMeta from '../category-meta'

export default categoryName => {
  return categoryName in categoryMeta ? categoryMeta[categoryName] : false
}
