import { retrieveFromLocalStorage, storeInLocalStorage } from './storage'

const pollsVotedInKey = 'pollsVotedIn'

export function getHasVotedInPoll(pollId) {
  let pollsVotedIn = retrieveFromLocalStorage(pollsVotedInKey)

  if (!pollsVotedIn) {
    pollsVotedIn = []
    storeInLocalStorage(pollsVotedInKey, pollsVotedIn)
  }

  return pollsVotedIn.includes(pollId)
}

export function setHasVotedInPoll(pollId) {
  let pollsVotedIn = retrieveFromLocalStorage(pollsVotedInKey)

  if (!pollsVotedIn) {
    pollsVotedIn = []
  }

  const newPollsVotedIn = pollsVotedIn.concat([pollId])

  storeInLocalStorage(pollsVotedInKey, newPollsVotedIn)
}
