const idealRoles = ['Tank', 'Fighter', 'Assassin', 'Mage', 'Carry']
const idealLanes = ['Dark Slayer', 'Jungle', 'Mid', 'Carry', 'Support']
const tierScores = {
  S: 20,
  A: 14,
  B: 8,
  C: 3,
}

export function getPickedHeroIds(blueDraft, redDraft) {
  return new Set([...blueDraft, ...redDraft].filter(Boolean).map((hero) => hero.id))
}

export function analyzeDraft(teamDraft, enemyDraft, heroes, blockedHeroIds = new Set(), mode = 'pick') {
  const selectedHeroes = teamDraft.filter(Boolean)
  const enemyHeroes = enemyDraft.filter(Boolean)
  const profile = getTeamProfile(selectedHeroes)
  const missingRoles = idealRoles.filter((role) => !profile.roles.has(role))
  const missingLanes = idealLanes.filter((lane) => !profile.lanes.has(lane))
  const availableHeroes = heroes.filter((hero) => !blockedHeroIds.has(hero.id))
  const scoredSuggestions = mode === 'ban'
    ? getBanSuggestions(availableHeroes, selectedHeroes, enemyHeroes, profile)
    : getPickSuggestions(availableHeroes, selectedHeroes, enemyHeroes, profile, missingRoles, missingLanes)
  const suggestions = scoredSuggestions.slice(0, 4)

  return {
    mode,
    missingRoles,
    missingLanes,
    suggestions,
    categories: getSuggestionCategories(scoredSuggestions),
    balance: {
      hasMagic: profile.hasMagic,
      hasPhysical: profile.hasPhysical,
      filledSlots: selectedHeroes.length,
    },
    profile,
    warnings: getTeamWarnings(profile, selectedHeroes.length),
  }
}

function getSuggestionCategories(suggestions) {
  return {
    best: suggestions.slice(0, 4),
    combo: suggestions
      .filter((hero) => hero.reasons.some((reason) => reason.includes('เข้าคู่') || reason.includes('combo')))
      .slice(0, 4),
    counter: suggestions
      .filter((hero) => hero.reasons.some((reason) => reason.includes('แก้ทาง') || reason.includes('กดดัน')))
      .slice(0, 4),
  }
}

function getPickSuggestions(heroes, selectedHeroes, enemyHeroes, profile, missingRoles, missingLanes) {
  return heroes
    .map((hero) => {
      const roleFit = missingRoles.includes(hero.role) ? 22 : 4
      const laneFit = getLaneFit(hero, missingLanes)
      const damageFit = getDamageFit(hero, profile.hasMagic, profile.hasPhysical)
      const traitFit = getTraitFit(hero, profile)
      const counterFit = enemyHeroes.filter((enemy) => hero.counters.includes(enemy.id)).length * 18
      const synergyFit = selectedHeroes.filter((ally) => hero.synergy.includes(ally.id)).length * 12
      const metaFit = tierScores[hero.tier] ?? 0
      const score = roleFit + laneFit + damageFit + traitFit + counterFit + synergyFit + metaFit

      return {
        ...hero,
        score,
        reasons: getPickReasons(hero, {
          missingRoles,
          missingLanes,
          profile,
          selectedHeroes,
          enemyHeroes,
        }),
      }
    })
    .sort((firstHero, secondHero) => secondHero.score - firstHero.score)
}

function getBanSuggestions(heroes, selectedHeroes, enemyHeroes, profile) {
  return heroes
    .map((hero) => {
      const metaThreat = (tierScores[hero.tier] ?? 0) * 1.4
      const countersOurTeam = selectedHeroes.filter((ally) => hero.counters.includes(ally.id)).length * 24
      const pairsWithEnemy = enemyHeroes.filter((enemy) => hero.synergy.includes(enemy.id)).length * 18
      const deniesMissingLane = enemyHeroes.length === 0 ? getFirstPhaseBanFit(hero) : 0
      const diveThreat = profile.mobility < 7 && hasTag(hero, ['dive', 'mobility', 'snowball']) ? 14 : 0
      const objectiveThreat = (hero.objectiveDamage ?? 0) >= 4 ? 8 : 0
      const controlThreat = (hero.cc ?? 0) >= 4 ? 8 : 0
      const score = Math.round(
        metaThreat
        + countersOurTeam
        + pairsWithEnemy
        + deniesMissingLane
        + diveThreat
        + objectiveThreat
        + controlThreat,
      )

      return {
        ...hero,
        score,
        reasons: getBanReasons(hero, {
          selectedHeroes,
          enemyHeroes,
          profile,
          countersOurTeam,
          pairsWithEnemy,
          deniesMissingLane,
          diveThreat,
          objectiveThreat,
          controlThreat,
        }),
      }
    })
    .sort((firstHero, secondHero) => secondHero.score - firstHero.score)
}

function getTeamProfile(heroes) {
  const roles = new Set()
  const lanes = new Set()
  let cc = 0
  let mobility = 0
  let waveClear = 0
  let objectiveDamage = 0
  let hasMagic = false
  let hasPhysical = false

  heroes.forEach((hero) => {
    roles.add(hero.role)
    ;(hero.lanes ?? [hero.lane]).forEach((lane) => lanes.add(lane))
    cc += hero.cc ?? 0
    mobility += hero.mobility ?? 0
    waveClear += hero.waveClear ?? 0
    objectiveDamage += hero.objectiveDamage ?? 0
    hasMagic = hasMagic || hero.damage === 'Magic'
    hasPhysical = hasPhysical || hero.damage === 'Physical'
  })

  return {
    roles,
    lanes,
    cc,
    mobility,
    waveClear,
    objectiveDamage,
    hasMagic,
    hasPhysical,
  }
}

function getLaneFit(hero, missingLanes) {
  const heroLanes = hero.lanes ?? [hero.lane]
  const coveredLanes = heroLanes.filter((lane) => missingLanes.includes(lane))

  return coveredLanes.length * 28
}

function getDamageFit(hero, hasMagic, hasPhysical) {
  if (!hasMagic && hero.damage === 'Magic') {
    return 14
  }

  if (!hasPhysical && hero.damage === 'Physical') {
    return 14
  }

  return 3
}

function getTraitFit(hero, profile) {
  let score = 0

  if (profile.cc < 7) {
    score += (hero.cc ?? 0) * 3
  }

  if (profile.waveClear < 7) {
    score += (hero.waveClear ?? 0) * 2
  }

  if (profile.objectiveDamage < 7) {
    score += (hero.objectiveDamage ?? 0) * 2
  }

  if (profile.mobility < 7) {
    score += hero.mobility ?? 0
  }

  return score
}

function getPickReasons(hero, context) {
  const reasons = []
  const heroLanes = hero.lanes ?? [hero.lane]
  const laneMatches = heroLanes.filter((lane) => context.missingLanes.includes(lane))

  if (laneMatches.length > 0) {
    reasons.push(`เติม lane ${laneMatches.join(', ')}`)
  } else if (context.missingRoles.includes(hero.role)) {
    reasons.push(`เติมตำแหน่ง ${hero.role}`)
  }

  if (!context.profile.hasMagic && hero.damage === 'Magic') {
    reasons.push('เพิ่มดาเมจเวท')
  }

  if (!context.profile.hasPhysical && hero.damage === 'Physical') {
    reasons.push('เพิ่มดาเมจกายภาพ')
  }

  if (context.profile.cc < 7 && hero.cc >= 4) {
    reasons.push('เพิ่ม CC ให้ทีม')
  }

  if (context.profile.objectiveDamage < 7 && hero.objectiveDamage >= 4) {
    reasons.push('ตี objective ดี')
  }

  const counterTargets = context.enemyHeroes.filter((enemy) => hero.counters.includes(enemy.id))
  if (counterTargets.length > 0) {
    reasons.push(`แก้ทาง ${counterTargets.map((enemy) => enemy.name).join(', ')}`)
  }

  const synergyTargets = context.selectedHeroes.filter((ally) => hero.synergy.includes(ally.id))
  if (synergyTargets.length > 0) {
    reasons.push(`เข้าคู่กับ ${synergyTargets.map((ally) => ally.name).join(', ')}`)
  }

  if (hero.tier === 'S') {
    reasons.push('meta pick')
  }

  return reasons.length > 0 ? reasons : ['ตัวเลือกยืดหยุ่นสำหรับทีม']
}

function getBanReasons(hero, context) {
  const reasons = []
  const counterTargets = context.selectedHeroes.filter((ally) => hero.counters.includes(ally.id))
  const synergyTargets = context.enemyHeroes.filter((enemy) => hero.synergy.includes(enemy.id))

  if (hero.tier === 'S') {
    reasons.push('meta ban')
  }

  if (counterTargets.length > 0) {
    reasons.push(`กดดัน ${counterTargets.map((ally) => ally.name).join(', ')}`)
  }

  if (synergyTargets.length > 0) {
    reasons.push(`กัน combo กับ ${synergyTargets.map((enemy) => enemy.name).join(', ')}`)
  }

  if (context.deniesMissingLane > 0) {
    reasons.push(`ตัด lane ${getPrimaryLane(hero)}`)
  }

  if (context.diveThreat > 0) {
    reasons.push('เสี่ยงล้วง backline')
  }

  if (context.objectiveThreat > 0) {
    reasons.push('แย่ง objective เร็ว')
  }

  if (context.controlThreat > 0) {
    reasons.push('CC สูง')
  }

  return reasons.length > 0 ? reasons : ['ลดตัวเลือกแข็งของฝั่งตรงข้าม']
}

function getFirstPhaseBanFit(hero) {
  const lane = getPrimaryLane(hero)

  if (hero.tier === 'S') {
    return 12
  }

  if (lane === 'Jungle' || lane === 'Carry' || lane === 'Mid') {
    return 8
  }

  return 4
}

function getPrimaryLane(hero) {
  return (hero.lanes ?? [hero.lane])[0]
}

function hasTag(hero, tags) {
  return tags.some((tag) => hero.tags?.includes(tag))
}

function getTeamWarnings(profile, filledSlots) {
  const warnings = []

  if (filledSlots === 0) {
    return ['เริ่มจากตัว meta/flex หรือ lane สำคัญก่อน']
  }

  const missingLanes = idealLanes.filter((lane) => !profile.lanes.has(lane))
  if (missingLanes.length > 0) {
    warnings.push(`ขาด lane: ${missingLanes.join(', ')}`)
  }

  if (!profile.hasMagic) {
    warnings.push('ดาเมจเวทยังไม่มี')
  }

  if (!profile.hasPhysical) {
    warnings.push('ดาเมจกายภาพยังไม่มี')
  }

  if (profile.cc < 7) {
    warnings.push('CC รวมยังต่ำ')
  }

  if (profile.objectiveDamage < 7) {
    warnings.push('ตี objective ยังไม่แรง')
  }

  return warnings.length > 0 ? warnings.slice(0, 4) : ['โครงทีมสมดุลดี']
}
