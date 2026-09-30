import React from 'react'

const FlipMove = React.lazy(() => import('react-flip-move'))

// ensure each child is wrapped in a HTML element NOT a component
const MovableList = ({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) => <FlipMove>{children}</FlipMove>

export default MovableList
