import { useState } from 'react'
import Sketch from '@uiw/react-color-sketch'
import { rgbaToHsva } from '@uiw/color-convert'
import ColorLensIcon from '@mui/icons-material/ColorLens'

import Dialog from '../dialog'
import Heading from '../heading'
import Button from '../button'

export interface RgbaColor {
  r: number
  g: number
  b: number
  a: number
}

export type Color = RgbaColor

export const PURE_BLACK: RgbaColor = {
  r: 0,
  g: 0,
  b: 0,
  a: 1,
}
export const PURE_WHITE: RgbaColor = {
  r: 255,
  g: 255,
  b: 255,
  a: 1,
}

const ColorPickerButton = ({
  initialValue,
  onDone,
}: {
  initialValue: Color
  onDone: (newColorRgba: Color) => void
}) => {
  const [newColorRgba, setNewColorRgba] = useState<Color>(initialValue)
  const [isOpen, setIsOpen] = useState(false)

  const onClickDone = () => {
    setIsOpen(false)
    onDone(newColorRgba)
  }

  return (
    <>
      {isOpen && (
        <Dialog>
          <Heading variant="h1">Color Picker</Heading>
          <p>Pick a color:</p>
          <Sketch
            color={rgbaToHsva(newColorRgba)}
            onChange={(color) => {
              setNewColorRgba(color.rgba)
            }}
          />
          <p>
            You have chosen:{' '}
            <div
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: `rgba(${newColorRgba.r},${newColorRgba.g},${newColorRgba.b},${newColorRgba.a})`,
              }}></div>
          </p>
          <Button onClick={onClickDone}>Done</Button>
        </Dialog>
      )}
      <Button
        icon={<ColorLensIcon />}
        color="secondary"
        onClick={() => setIsOpen(true)}>
        Color
        <div
          style={{
            width: '10px',
            height: '10px',
            marginLeft: '0.25rem',
            backgroundColor: `rgba(${newColorRgba.r},${newColorRgba.g},${newColorRgba.b},${newColorRgba.a})`,
          }}></div>
      </Button>
    </>
  )
}

export default ColorPickerButton
