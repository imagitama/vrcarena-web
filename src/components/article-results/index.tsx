import styled from '@emotion/styled'

import { FullArticle } from '@/modules/articles'
import ArticleResultsItem from '../article-results-item'
import { mediaQueryForTabletsOrBelow } from '@/media-queries'

const StyledArticleResults = styled.div`
  & > * {
    margin-bottom: 0.5rem;
    ${mediaQueryForTabletsOrBelow} {
      margin-bottom: 0.25rem;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
`

const ArticleResults = ({
  articles,
  hydrate,
  trim,
}: {
  articles: FullArticle[]
  hydrate?: () => void
  trim?: boolean
}) => (
  <StyledArticleResults>
    {articles.map((article) => (
      <ArticleResultsItem
        key={article.id}
        article={article}
        hydrate={hydrate}
        trim={trim}
      />
    ))}
  </StyledArticleResults>
)

export default ArticleResults
