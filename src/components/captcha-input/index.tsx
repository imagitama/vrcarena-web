import { useEffect, useRef } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import styled from '@emotion/styled'

const HCAPTCHA_SITE_KEY = process.env.REACT_APP_HCAPTCHA_SITE_KEY
if (!HCAPTCHA_SITE_KEY) throw new Error('Need hcaptcha site key')

const Root = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`
const Label = styled.div`
  text-align: center;
  margin: 1rem 0;
`
const CaptchaWrapper = styled.div`
  display: flex;
  justify-content: center;
`

const CaptchaInput = ({
  token,
  onToken,
}: {
  token: string | null
  onToken: (token: string | null) => void
}) => {
  const captchaRef = useRef<null | HCaptcha>(null)

  useEffect(() => {
    if (!token) {
      console.debug('resetting captcha...')
      captchaRef.current?.resetCaptcha()
    }
  }, [token])

  return (
    <Root>
      <Label>
        Please complete this really annoying captcha to combat bots:
      </Label>
      <CaptchaWrapper>
        <HCaptcha
          ref={captchaRef}
          sitekey={HCAPTCHA_SITE_KEY}
          onVerify={(token) => onToken(token)}
          onExpire={() => onToken(null)}
        />
      </CaptchaWrapper>
    </Root>
  )
}

export default CaptchaInput
