import { isStatusPaid } from '../../braintree'

export default function Status({ status, simple = false }) {
  const userFriendlyStatus = status
    .toLowerCase()
    .split('_')
    .map(s => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ')

  if (simple) {
    if (isStatusPaid(status)) {
      return 'Paid'
    } else {
      return 'Pending'
    }
  }

  return userFriendlyStatus
}
