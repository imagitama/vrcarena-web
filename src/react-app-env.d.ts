/// <reference types="react-scripts" />

declare module 'react-autocomplete-input' {
  export type ReactAutocompleteComponentProps = {
    value: string
    onChange: (e: React.ChangeEvent) => void
    onBlur: () => void
    onKeyDown: () => void
  }

  export type ReactAutocompleteInputProps = {
    Component: React.Element<ReactAutocompleteComponentProps>
    value: string
    onChange: (newVal: string) => void
    options: string[]
    onRequestOptions: (options: any) => void
    matchAny: boolean
  }
  export default (props: ReactAutocompleteInputProps) => React.Element
}
