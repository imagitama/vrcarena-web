import React, { createContext, useContext } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableContainerProps,
  TableHead,
  TableHeadProps,
  TableRow,
  TableRowProps,
  Paper,
  Typography,
  useTheme,
  type Breakpoint,
} from '@mui/material'
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

export interface ResponsiveTableProps
  extends Omit<TableContainerProps, 'children'> {
  mediaQueryBreakpoint?: string
  children: React.ReactNode
}

export const ResponsiveTable = ({
  mediaQueryBreakpoint = mediaQueryForTabletsOrBelow,
  children,
  sx,
  ...containerProps
}: ResponsiveTableProps) => {
  return (
    <ResponsiveTableContext.Provider value={mediaQueryBreakpoint}>
      <TableContainer sx={{ overflowX: 'auto', ...sx }} {...containerProps}>
        <Table
          sx={{
            [mediaQueryForDesktopsOnly]: { display: 'table', minWidth: 650 },
            [mediaQueryForTabletsOrBelow]: { display: 'block' },
          }}>
          {children}
        </Table>
      </TableContainer>
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
  const theme = useTheme()
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

// ---- cell: takes mobileWidth + optional inline label shown only on mobile ----

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

/* ---------------- Example usage ----------------

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
}

const rows: UserRow[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@x.com', role: 'Admin', status: 'Active', joined: '2021' },
  { id: 2, name: 'Alan Turing', email: 'alan@x.com', role: 'Editor', status: 'Invited', joined: '2022' },
];

function UsersTable() {
  return (
    <ResponsiveTable breakpoint="sm">
      <ResponsiveTableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Joined</TableCell>
        </TableRow>
      </ResponsiveTableHead>

      <TableBody>
        {rows.map((row) => (
          <ResponsiveTableRow key={row.id}>
            <ResponsiveTableCell label="Name" mobileWidth="50%">{row.name}</ResponsiveTableCell>
            <ResponsiveTableCell label="Email" mobileWidth="50%">{row.email}</ResponsiveTableCell>
            <ResponsiveTableCell label="Role" mobileWidth="33.33%">{row.role}</ResponsiveTableCell>
            <ResponsiveTableCell label="Status" mobileWidth="33.33%">{row.status}</ResponsiveTableCell>
            <ResponsiveTableCell label="Joined" mobileWidth="33.33%">{row.joined}</ResponsiveTableCell>
          </ResponsiveTableRow>
        ))}
      </TableBody>
    </ResponsiveTable>
  );
}

-------------------------------------------------- */
