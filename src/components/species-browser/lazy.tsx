import Masonry, {
  ResponsiveMasonry,
  MasonryProps,
  ResponsiveMasonryProps,
} from 'react-responsive-masonry'

const LazyMasonry = ({
  columnsCountBreakPoints,
  children,
  ...props
}: MasonryProps & ResponsiveMasonryProps) => {
  return (
    <ResponsiveMasonry columnsCountBreakPoints={columnsCountBreakPoints}>
      <Masonry {...props}>{children}</Masonry>
    </ResponsiveMasonry>
  )
}

export default LazyMasonry
