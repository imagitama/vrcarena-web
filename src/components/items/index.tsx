import { mediaQueryForTabletsOrBelow } from '@/media-queries'
import styled from '@emotion/styled'

const Items = styled.div`
  display: flex;
  flex-wrap: wrap;
  & * > {
    margin: 0.5rem;

    & ${mediaQueryForTabletsOrBelow} {
      margin: 0.25rem;
    }
  }
`

export default Items
