import React from 'react'
import FlipMove from 'react-flip-move'
// import styled from '@emotion/styled'

// ensure each child is wrapped in a HTML element NOT a component
const MovableList = ({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) => <FlipMove>{children}</FlipMove>
//   if (React.Children.count(children) > 1) {
//     return <FlipMove>{children}</FlipMove>
//   }
//   return children
// }

export default MovableList
