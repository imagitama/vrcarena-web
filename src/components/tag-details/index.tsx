import { routes } from '@/routes'
import Link from '../link'
import { Tag } from '@/modules/tags'
import Table from '@/components/responsive-table'
import { TableBody } from '@/components/responsive-table'
import { TableCell } from '@/components/responsive-table'
import { TableHead } from '@/components/responsive-table'
import { TableRow } from '@/components/responsive-table'

const TagDetails = ({ tag }: { tag: Tag }) => {
  return (
    <Table size="small">
      <TableHead>
        <TableCell></TableCell>
        <TableCell>Category</TableCell>
        <TableCell>Label</TableCell>
        <TableCell>Desc</TableCell>
        <TableCell>Opposite</TableCell>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>
            <Link to={routes.viewTagWithVar.replace(':tag', tag.id)}>
              <strong>{tag.id}</strong>
            </Link>
          </TableCell>
          <TableCell label="Category">{tag.category || '-'}</TableCell>
          <TableCell label="Label">{tag.label || '-'}</TableCell>
          <TableCell label="Desc">{tag.description || '-'}</TableCell>
          <TableCell label="Opposite">{tag.oppositetag || '-'}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export default TagDetails
