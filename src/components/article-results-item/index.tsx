import styled from '@emotion/styled'

import {
  Article,
  ARTICLE_TAG_SITE,
  FullArticle,
  getIsVrchatNewsArticle,
  VrchatNewsArticleMetadata,
} from '@/modules/articles'
import { colorGrey } from '@/themes'
import { AccessStatus, ApprovalStatus } from '@/modules/common'
import { routes } from '@/routes'
import { trimDescription } from '@/utils/formatting'

import Heading from '../heading'
import Markdown from '../markdown'
import Attachments from '../attachments'
import Metadata, { StyledMetadata } from '../metadata'
import WarningMessage from '../warning-message'
import FormattedDate from '../formatted-date'
import Link from '../link'
import ErrorMessage from '../error-message'

const StyledArticleResultsItem = styled.div`
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid ${colorGrey};
`

const VrchatMetadata = ({
  url,
  extraData,
}: {
  url: string
  extraData: VrchatNewsArticleMetadata
}) => (
  <StyledMetadata>
    Originally published <FormattedDate date={extraData.pubDate} /> by VRChat on{' '}
    <a href={url} target="_blank" rel="noopener noreferrer">
      Steam
    </a>
  </StyledMetadata>
)

const SourceBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 1rem;
  height: 100%;
`

const SourceBarLabel = styled.span`
  transform-origin: left top;
  transform: rotate(-90deg);
  position: absolute;
  bottom: -10px;
  left: 0;
  font-size: 75%;
`

const Header = styled.div`
  position: relative;
  background-color: rgb(50, 50, 50);
  padding: 0.5rem;
  padding-left: 1.5rem;
  a {
    color: inherit;
    text-decoration: underline;
  }
`

const Desc = styled.div`
  padding: 0.5rem;
`

const getColorForArticle = (article: Article): string => {
  const isVrchat = getIsVrchatNewsArticle(article)
  if (isVrchat) return '#336AC6'

  if (article.tags.includes(ARTICLE_TAG_SITE)) return 'rgb(110, 74, 158)'

  return ''
}

const getLabelForArticle = (article: Article): string => {
  const isVrchat = getIsVrchatNewsArticle(article)
  if (isVrchat) return 'VRChat'

  if (article.tags.includes(ARTICLE_TAG_SITE)) return 'Site'

  return ''
}

const ArticleResultsItem = ({
  article,
  hydrate,
  trim,
}: {
  article: FullArticle
  hydrate?: () => void
  trim?: boolean
}) => {
  const isVrchat = getIsVrchatNewsArticle(article)

  return (
    <StyledArticleResultsItem>
      <Header>
        <SourceBar style={{ backgroundColor: getColorForArticle(article) }}>
          <SourceBarLabel>{getLabelForArticle(article)}</SourceBarLabel>
        </SourceBar>
        <Heading noMargin variant="h2">
          <Link
            to={routes.viewArticleWithVar.replace(
              ':articleId',
              article.slug || article.id
            )}>
            {article.title}
          </Link>
        </Heading>
        {isVrchat ? (
          <VrchatMetadata
            url={article.sourceurl!}
            extraData={
              article.extradata as unknown as VrchatNewsArticleMetadata
            }
          />
        ) : (
          <Metadata item={article} />
        )}
      </Header>
      <Desc>
        {article.approvalstatus !== ApprovalStatus.Approved &&
        article.approvalstatus !== ApprovalStatus.AutoApproved ? (
          <WarningMessage noMargin>
            This article has not been approved by our staff.
          </WarningMessage>
        ) : null}
        {article.accessstatus === AccessStatus.Deleted && (
          <ErrorMessage>This article has been deleted.</ErrorMessage>
        )}
        <Markdown
          source={trim ? trimDescription(article.content) : article.content}
          replaceImagesWithButtons
        />
      </Desc>
      {article.attachmentids.length > 0 && (
        <>
          <hr />
          <Attachments
            ids={article.attachmentids}
            attachmentsData={article.attachmentsdata}
          />
        </>
      )}
    </StyledArticleResultsItem>
  )
}

export default ArticleResultsItem
