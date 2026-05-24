import { makeStyles } from '@mui/styles'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

import Dialog, { DialogProps } from '@/components/dialog'

const dialogBg = 'rgb(22, 38, 46)'

const useStyles = makeStyles({
  content: {
    position: 'relative', // fix overlapping
  },
  bg: {
    position: 'absolute',
    opacity: 0.05,
    fontSize: '3000% !important',
    bottom: 0,
    right: 0,
    color: 'rgb(255,255,255)',
  },
  paper: {
    '&&': {
      backgroundColor: dialogBg,
      minHeight: '80%',
      maxHeight: '80%',
      minWidth: '80%',
      maxWidth: '80%',
    },
  },
})

const AiDialog = (props: DialogProps) => {
  const classes = useStyles()
  return (
    <Dialog
      PaperProps={{
        className: classes.paper,
      }}
      {...props}>
      <AutoAwesomeIcon className={classes.bg} />
      <div className={classes.content}>{props.children}</div>
    </Dialog>
  )
}

export default AiDialog
