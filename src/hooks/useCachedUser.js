import { useState, useEffect } from 'react'
import { handleError } from '../error-handling'
import { quickReadRecord } from '../supabase'
import { CollectionNames } from './useDatabaseQuery'
import useDataStoreItem from './useDataStoreItem'

export default userId => {
  return useDataStoreItem(CollectionNames.Users, userId)
}
