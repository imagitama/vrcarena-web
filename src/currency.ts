export const popularCurrencies = {
  USD: 'United States Dollar',
  EUR: 'Euro',
  JPY: 'Japanese Yen',
  GBP: 'British Pound Sterling',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  SEK: 'Swedish Krona',
  NZD: 'New Zealand Dollar',
  SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar',
  INR: 'Indian Rupee',
  KRW: 'South Korean Won',
  BRL: 'Brazilian Real',
  ZAR: 'South African Rand',
}

export type PopularCurrency = keyof typeof popularCurrencies

export const defaultCurrency: PopularCurrency = 'USD'

const isDollars = (currency: PopularCurrency): boolean => {
  // TODO: probably use NPM package for this
  switch (currency) {
    case 'USD':
    case 'AUD':
    case 'CAD':
    case 'NZD':
      return true
  }

  return false
}

const currencySymbols: Record<PopularCurrency, string> = {
  USD: '$',
  EUR: '€',
  JPY: '¥',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  CNY: 'CN¥',
  SEK: 'SEK',
  NZD: 'NZ$',
  SGD: 'S$',
  HKD: 'HK$',
  INR: '₹',
  KRW: '₩',
  BRL: 'R$',
  ZAR: 'R',
}

const getSymbolForCurrency = (currency: PopularCurrency | null): string => {
  return currency ? currencySymbols[currency] ?? '' : ''
}

export const formatPrice = (price: number, currency: PopularCurrency | null) =>
  `${getSymbolForCurrency(currency)}${price.toFixed(2)}`
