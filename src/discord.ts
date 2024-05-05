export const getAvatarImageUrl = (userId: string, avatarHash: string): string =>
  `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`
