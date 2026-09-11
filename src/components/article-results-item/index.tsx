import styled from '@emotion/styled'

import { CollectionNames, FullArticle } from '@/modules/articles'
import { colorGrey } from '@/themes'
import useIsEditor from '@/hooks/useIsEditor'
import { mediaQueryForMobiles } from '@/media-queries'
import EditorRecordManager from '../editor-record-manager'
import Heading from '../heading'
import Markdown from '../markdown'
import Attachments from '../attachments'
import Metadata from '../metadata'
import { ApprovalStatus } from '@/modules/common'
import WarningMessage from '../warning-message'

const StyledArticleResultsItem = styled.div`
  border-radius: 1rem;
  border: 1px solid ${colorGrey};
  padding: 0.5rem;
  ${mediaQueryForMobiles} {
    padding: 0.25rem;
  }
`

const ArticleResultsItem = ({
  article,
  hydrate,
}: {
  article: FullArticle
  hydrate: () => void
}) => {
  const isEditor = useIsEditor()
  return (
    <StyledArticleResultsItem>
      {article.approvalstatus !== ApprovalStatus.Approved && (
        <WarningMessage>
          This article has not been approved by our staff.
        </WarningMessage>
      )}
      <Heading noMargin variant="h2">
        {article.title}
      </Heading>
      <Metadata item={article} />
      <hr />
      <Markdown source={article.content} />
      <hr />
      <Attachments
        ids={article.attachmentids}
        attachmentsData={article.attachmentsdata}
      />
      {isEditor && (
        <EditorRecordManager
          id={article.id}
          collectionName={CollectionNames.Articles}
          metaCollectionName={CollectionNames.ArticlesMeta}
          showAccessButtons
          showApprovalButtons
          showEditorNotes
          onDone={hydrate}
        />
      )}
    </StyledArticleResultsItem>
  )
}

export default ArticleResultsItem
