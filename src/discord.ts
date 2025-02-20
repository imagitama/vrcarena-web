export const getAvatarImageUrl = (userId: string, avatarHash: string): string =>
  `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`

// good: https://discord.com/channels/734993431507763289/736972936581349506/1338845707876044851
// bad: https://discord.gg/T5x8gQwK
// export const getIsDiscordUrlButNotDiscordServerMessageUrl = (url: string): boolean => {
//   const discordUrlPattern =
//     /^(https?:\/\/)?(www\.)?(discord\.com|discord\.gg|discordapp\.com)/i
//   const messageUrlPattern = /discord\.(com|gg)\/channels\/\d+\/\d+\/\d+/

//   return discordUrlPattern.test(url) && !messageUrlPattern.test(url)
// }

// https://discord.com/channels/734993431507763289/736972936581349506/133884570
// https://discord.gg/T5x8gQwK
export const getIsDiscordUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)
    return (
      parsedUrl.hostname === 'discord.com' ||
      parsedUrl.hostname === 'discord.gg'
    )
  } catch {
    return false
  }
}

// good: https://discord.com/channels/734993431507763289/736972936581349506/133884570
// bad:  https://discord.gg/T5x8gQwK
// note discord.gg is only for invite URLs
export const getIsDiscordMessageUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname !== 'discord.com') return false

    // Discord message URLs follow this format: https://discord.com/channels/{guildId}/{channelId}/{messageId}
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean)
    return (
      pathSegments.length === 4 &&
      pathSegments[0] === 'channels' &&
      !isNaN(Number(pathSegments[1])) &&
      !isNaN(Number(pathSegments[2])) &&
      !isNaN(Number(pathSegments[3]))
    )
  } catch {
    return false
  }
}
