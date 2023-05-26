import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { ReactComponent as DiscordIcon } from '../../assets/images/icons/discord.svg'
import Button from '../button'

const discordColor = '#7289da'
const discordColorDark = '#445282'

const useStyles = makeStyles({
  loginWithDiscordWrapper: {
    textAlign: 'center',
    marginBottom: '1rem'
  },
  loginWithDiscordBtn: {
    backgroundColor: discordColor,
    '&:hover': {
      backgroundColor: discordColorDark
    }
  }
})

export default props => {
  const classes = useStyles()
  return (
    <Button
      size="large"
      icon={<DiscordIcon />}
      className={classes.loginWithDiscordBtn}
      {...props}>
      Sign In with Discord
    </Button>
  )
}
