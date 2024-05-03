import { TypedUseSelectorHook, useSelector } from 'react-redux'
import { RootState } from '../store'

// const useRootState: TypedUseSelectorHook<RootState> = useSelector
const useRootState: (selector: (state: any) => any) => any = useSelector

export default useRootState
