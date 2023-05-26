import useQueryParams from './useQueryParams'

export default (name: string, decode: boolean = true): string | null => {
  const queryParams = useQueryParams()
  const val = queryParams.get(name)
  return decode && val ? decodeURIComponent(val) : val
}
