export const BraintreeStatus = {
  AuthorizationExpired: 'authorizationexpired',
  Authorized: 'authorized',
  Authorizing: 'authorizing',
  SettlementPending: 'settlementpending',
  SettlementDeclined: 'settlementdeclined',
  Failed: 'failed',
  GatewayRejected: 'gatewayrejected',
  ProcessorDeclined: 'processor_declined',
  Settled: 'settled',
  Settling: 'settling',
  SubmittedForSettlement: 'submittedforsettlement',
  Voided: 'voided'
}

export const isStatusPaid = status => {
  return (
    status === BraintreeStatus.Settled || status === BraintreeStatus.Settling
  )
}
