import HCaptcha from '@hcaptcha/react-hcaptcha'
import { useRef, useState } from 'react'

const HCAPTCHA_SITE_KEY = process.env.REACT_APP_HCAPTCHA_SITE_KEY
if (!HCAPTCHA_SITE_KEY) throw new Error('Need hcaptcha site key')

const CaptchaInput = ({
  onToken,
}: {
  onToken: (token: string | null) => void
}) => {
  const captchaRef = useRef<null | HCaptcha>(null)

  return (
    <HCaptcha
      ref={captchaRef}
      sitekey={HCAPTCHA_SITE_KEY}
      onVerify={(token) => onToken(token)}
      onExpire={() => onToken(null)}
    />
  )
}

export default CaptchaInput
