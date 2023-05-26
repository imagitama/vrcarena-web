import React, { useEffect, useState } from 'react'
import Link from '../../components/link'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'

import FormattedDate from '../../components/formatted-date'
import Price from '../../components/price'
import Status from '../../components/transaction-status'

import * as routes from '../../routes'
import {
  TransactionFieldNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'

function TransactionItem({
  transaction,
  forProduct = false,
  isSimple = false
}) {
  const [asset, setAsset] = useState(null)

  useEffect(() => {
    if (forProduct) {
      return
    }

    async function main() {
      const assetDoc = await transaction.product.asset.get()
      setAsset(assetDoc.data())
    }

    main()
  }, [])

  return (
    <TableRow>
      <TableCell>
        <FormattedDate date={transaction.createdAt} />
      </TableCell>
      {forProduct !== true && (
        <TableCell>
          <Link
            to={routes.viewTransactionWithVar.replace(
              ':transactionId',
              transaction.id
            )}>
            {' '}
            View Transaction
          </Link>
        </TableCell>
      )}
      {forProduct !== true && (
        <TableCell>
          <Link
            to={routes.viewProductWithVar.replace(
              ':productId',
              transaction.product.id
            )}>
            {' '}
            {asset ? asset.title : '...'}
          </Link>
        </TableCell>
      )}
      <TableCell>
        <Link
          to={routes.viewUserWithVar.replace(
            ':userId',
            transaction[TransactionFieldNames.customer].id
          )}>
          {transaction[TransactionFieldNames.customer][UserFieldNames.username]}
        </Link>
      </TableCell>
      <TableCell>
        <Price price={transaction.priceUsd} />
      </TableCell>
      <TableCell>
        <Status status={transaction.status} simple={forProduct || isSimple} />
      </TableCell>
    </TableRow>
  )
}

export default ({ transactions, forProduct = false, isSimple = false }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          {forProduct !== true && <TableCell />}
          {forProduct !== true && <TableCell>Product</TableCell>}
          <TableCell>Customer</TableCell>
          <TableCell>Price (USD)</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.map(transaction => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            forProduct={forProduct}
            isSimple={isSimple}
          />
        ))}
      </TableBody>
    </Table>
  )
}
