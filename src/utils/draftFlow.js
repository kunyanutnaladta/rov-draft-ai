export const draftSteps = [
  { type: 'ban', team: 'blue', index: 0, label: 'Blue Ban 1' },
  { type: 'ban', team: 'red', index: 0, label: 'Red Ban 1' },
  { type: 'ban', team: 'blue', index: 1, label: 'Blue Ban 2' },
  { type: 'ban', team: 'red', index: 1, label: 'Red Ban 2' },
  { type: 'pick', team: 'blue', index: 0, label: 'Blue Pick 1' },
  { type: 'pick', team: 'red', index: 0, label: 'Red Pick 1' },
  { type: 'pick', team: 'red', index: 1, label: 'Red Pick 2' },
  { type: 'pick', team: 'blue', index: 1, label: 'Blue Pick 2' },
  { type: 'pick', team: 'blue', index: 2, label: 'Blue Pick 3' },
  { type: 'pick', team: 'red', index: 2, label: 'Red Pick 3' },
  { type: 'ban', team: 'red', index: 2, label: 'Red Ban 3' },
  { type: 'ban', team: 'blue', index: 2, label: 'Blue Ban 3' },
  { type: 'ban', team: 'red', index: 3, label: 'Red Ban 4' },
  { type: 'ban', team: 'blue', index: 3, label: 'Blue Ban 4' },
  { type: 'pick', team: 'red', index: 3, label: 'Red Pick 4' },
  { type: 'pick', team: 'blue', index: 3, label: 'Blue Pick 4' },
  { type: 'pick', team: 'blue', index: 4, label: 'Blue Pick 5' },
  { type: 'pick', team: 'red', index: 4, label: 'Red Pick 5' },
]

export function getNextStepIndex(bluePicks, redPicks, blueBans, redBans) {
  const nextIndex = draftSteps.findIndex((step) => {
    const slots = getSlotsForStep(step, bluePicks, redPicks, blueBans, redBans)

    return !slots[step.index]
  })

  return nextIndex === -1 ? draftSteps.length : nextIndex
}

export function getStepIndex(type, team, index) {
  return draftSteps.findIndex(
    (step) => step.type === type && step.team === team && step.index === index,
  )
}

function getSlotsForStep(step, bluePicks, redPicks, blueBans, redBans) {
  if (step.type === 'ban') {
    return step.team === 'blue' ? blueBans : redBans
  }

  return step.team === 'blue' ? bluePicks : redPicks
}
