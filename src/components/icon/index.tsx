import styled from '@emotion/styled'
import * as icons from '@/icons'
import React from 'react'

export type IconName = keyof typeof icons

const Contents = ({
  name,
  className,
}: {
  name: IconName
  className?: string
}) => {
  const Component = icons[name] as React.ComponentType<
    React.SVGProps<SVGSVGElement>
  >
  return <Component className={className} />
}

const Icon = styled(Contents)`
  width: 1em;
  height: 1em;
  fill: #fff;
`

export default Icon
