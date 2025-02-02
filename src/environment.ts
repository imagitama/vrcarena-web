export const inDevelopment = () => process.env.NODE_ENV === 'development'

export const usingEmulator = () => process.env.REACT_APP_USE_EMULATORS
