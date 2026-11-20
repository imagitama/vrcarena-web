import {
  createClient,
  FunctionRegion,
  User as SupabaseUser,
} from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_API_KEY

if (!supabaseUrl) {
  throw new Error('Supabase URL is empty')
}
if (!supabaseKey) {
  throw new Error('Supabase key is empty')
}

export let client = createClient(supabaseUrl, supabaseKey, {
  // accessToken: () => Promise.resolve(activeJwt),
})

export const callFunction = async <
  TPayload extends Record<string, any>,
  TResult
>(
  functionName: string,
  payload?: TPayload
): Promise<{ data: TResult }> => {
  console.debug(`calling supabase edge function`, functionName, payload)

  const { data, error } = await client.functions.invoke(functionName, {
    body: payload,
    // fix issues with VRChat API and different regions
    region: FunctionRegion.UsEast1,
  })

  if (error) {
    console.error(
      'failed to call supabase edge function',
      functionName,
      payload,
      data,
      error
    )
    throw error
  }

  return { data }
}

const recordToFormData = <T extends Record<string, any>>(
  payload: T
): FormData => {
  const fd = new FormData()
  for (const [key, value] of Object.entries(payload)) {
    if (value == null) continue
    fd.append(
      key,
      value instanceof Blob
        ? value
        : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value)
    )
  }
  return fd
}

export const callFunctionWithFile = async <
  TPayload extends Record<string, any>,
  TResult
>(
  functionName: string,
  file: File,
  payload?: TPayload
): Promise<{ data: TResult }> => {
  let formData = payload ? recordToFormData(payload) : new FormData()
  formData.append('file', file) // TODO: customise field name?
  return callFunction(functionName, formData)
}
