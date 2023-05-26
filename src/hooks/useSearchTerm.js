import { useSelector } from 'react-redux'

export default () => useSelector(({ app }) => app.searchTerm)
