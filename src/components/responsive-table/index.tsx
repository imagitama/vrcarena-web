import React, { createContext, useContext } from 'react'
import Table, { TableProps } from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell, { TableCellProps } from '@mui/material/TableCell'
import TableContainer, {
  TableContainerProps,
} from '@mui/material/TableContainer'
import TableHead, { TableHeadProps } from '@mui/material/TableHead'
import TableRow, { TableRowProps } from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import useTheme from '@mui/material/styles/useTheme'
import {
  mediaQueryForDesktopsOnly,
  mediaQueryForTabletsOrBelow,
} from '@/media-queries'

const ResponsiveTableContext = createContext<string>(
  mediaQueryForTabletsOrBelow
)

function useResponsiveTableMediaQuery() {
  return useContext(ResponsiveTableContext)
}

export interface ResponsiveTableProps extends Omit<TableProps, 'children'> {
  mediaQueryBreakpoint?: string
  children: React.ReactNode
}

export const ResponsiveTable = ({
  mediaQueryBreakpoint = mediaQueryForTabletsOrBelow,
  children,
  sx,
  ...tableProps
}: ResponsiveTableProps) => {
  return (
    <ResponsiveTableContext.Provider value={mediaQueryBreakpoint}>
      <Table
        {...tableProps}
        sx={{
          [mediaQueryForDesktopsOnly]: {
            display: 'table',
            tableLayout: 'fixed',
            minWidth: 650,
          },
          [mediaQueryForTabletsOrBelow]: { display: 'block' },
        }}>
        {children}
      </Table>
    </ResponsiveTableContext.Provider>
  )
}

export interface ResponsiveTableHeadProps extends TableHeadProps {
  /** if to hide the entire <TableHead /> as it doesn't align with our cells anymore */
  autoHide?: boolean
}

export const ResponsiveTableHead = ({
  autoHide = true,
  sx,
  children,
  ...props
}: ResponsiveTableHeadProps) => {
  const mediaQuery = useResponsiveTableMediaQuery()
  return (
    <TableHead
      sx={{ [mediaQuery]: autoHide ? { display: 'none' } : {}, ...sx }}
      {...props}>
      {children}
    </TableHead>
  )
}

export const ResponsiveTableRow = ({
  sx,
  children,
  ...props
}: TableRowProps) => {
  const theme = useTheme()
  const mediaQuery = useResponsiveTableMediaQuery()
  return (
    <TableRow
      sx={{
        [mediaQuery]: {
          display: 'flex',
          flexWrap: 'wrap',
          borderBottom: `1px solid ${theme.palette.divider}`,
          py: 1,
        },
        ...sx,
      }}
      {...props}>
      {children}
    </TableRow>
  )
}

export interface ResponsiveTableCellProps extends TableCellProps {
  mobileWidthPerc?: string
  /** <TableHead /> is hidden on mobile so show label here */
  label?: string
}

export const ResponsiveTableCell = ({
  mobileWidthPerc,
  label,
  sx,
  children,
  ...props
}: ResponsiveTableCellProps) => {
  const mediaQuery = useResponsiveTableMediaQuery()
  return (
    <TableCell
      sx={{
        [mediaQuery]: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          width: mobileWidthPerc || 'auto',
          border: 'none',
          boxSizing: 'border-box',
          py: 0.5,
        },
        ...sx,
      }}
      {...props}>
      {label && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'none', [mediaQuery]: { display: 'block' } }}>
          {label}
        </Typography>
      )}
      {children}
    </TableCell>
  )
}

export {
  ResponsiveTableHead as TableHead,
  ResponsiveTableCell as TableCell,
  ResponsiveTableRow as TableRow,
  TableBody,
}
export default ResponsiveTable
