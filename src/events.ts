export const getEventNameFromReason = (reason: string): string =>
  reason.replaceAll('_', '-')
