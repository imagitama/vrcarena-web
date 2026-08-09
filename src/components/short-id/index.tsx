import { getShortId } from '@/utils/formatting'
import CopyThing from '../copy-thing'

const ShortId = ({ children }: { children: string }) => (
  <CopyThing text={children} title={`Click to copy "${children}"`}>
    #{getShortId(children)}
  </CopyThing>
)

export default ShortId
