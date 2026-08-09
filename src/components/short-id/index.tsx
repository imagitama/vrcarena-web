import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { getShortId } from '@/utils/formatting'
import CopyThing from '../copy-thing'
import Link from '../link'

const ShortId = ({ children, url }: { children: string; url?: string }) => (
  <>
    <CopyThing text={children} title={`Click to copy "${children}"`}>
      #{getShortId(children)}
    </CopyThing>{' '}
    {url && (
      <Link to={url}>
        <OpenInNewIcon />
      </Link>
    )}
  </>
)

export default ShortId
