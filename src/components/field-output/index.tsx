const FieldOutput = ({ children }: { children: any }) => {
  if (Array.isArray(children)) {
    return children.map((val, i) => (
      <>
        {i !== 0 ? <br /> : null}
        <FieldOutput children={val} />
      </>
    ))
  }

  if (typeof children === 'string') {
    return children
  }

  if (typeof children === 'boolean') {
    if (children === true) {
      return 'Yes'
    } else {
      return 'No'
    }
  }

  return children.toString()
}

export default FieldOutput
