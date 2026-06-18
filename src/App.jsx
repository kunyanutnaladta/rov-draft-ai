import { useMemo, useState } from 'react'
import DraftSlot from './components/DraftSlot.jsx'
import HeroCard from './components/HeroCard.jsx'
import SuggestPanel from './components/SuggestPanel.jsx'
import { heroes, roles } from './data/heroes.js'
import { analyzeDraft } from './utils/draftAnalyzer.js'
import { draftSteps, getStepIndex } from './utils/draftFlow.js'

const emptyDraft = Array.from({ length: 5 }, () => null)
const emptyBans = Array.from({ length: 4 }, () => null)

function App() {
  const [blueDraft, setBlueDraft] = useState(emptyDraft)
  const [redDraft, setRedDraft] = useState(emptyDraft)
  const [blueBans, setBlueBans] = useState(emptyBans)
  const [redBans, setRedBans] = useState(emptyBans)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [myTeam, setMyTeam] = useState('blue')
  const [roleFilter, setRoleFilter] = useState('All')

  const selectedHeroIds = useMemo(
    () => getSelectedHeroIds(blueDraft, redDraft, blueBans, redBans),
    [blueDraft, redDraft, blueBans, redBans],
  )
  const currentStep = draftSteps[currentStepIndex] ?? null
  const activeTeam = currentStep?.team ?? 'blue'
  const shouldSuggest = activeTeam === myTeam
  const activeDraft = activeTeam === 'blue' ? blueDraft : redDraft
  const enemyDraft = activeTeam === 'blue' ? redDraft : blueDraft
  const activeAnalysis = useMemo(
    () => analyzeDraft(activeDraft, enemyDraft, heroes, selectedHeroIds, currentStep?.type ?? 'pick'),
    [activeDraft, currentStep?.type, enemyDraft, selectedHeroIds],
  )

  const filteredHeroes = useMemo(() => {
    const roleOrder = ['Tank', 'Fighter', 'Assassin', 'Mage', 'Carry', 'Support']

    return heroes
      .filter((hero) => roleFilter === 'All' || hero.role === roleFilter)
      .sort((firstHero, secondHero) => {
        const firstIndex = roleOrder.indexOf(firstHero.role)
        const secondIndex = roleOrder.indexOf(secondHero.role)

        if (firstIndex !== secondIndex) {
          return firstIndex - secondIndex
        }

        return firstHero.name.localeCompare(secondHero.name)
      })
  }, [roleFilter])

  function selectHero(hero) {
    if (!currentStep || selectedHeroIds.has(hero.id)) {
      return
    }

    const setSlots = getSlotSetter(currentStep.type, currentStep.team)
    setSlots((slots) => slots.map((slot, index) => (index === currentStep.index ? hero : slot)))
    setCurrentStepIndex((stepIndex) => Math.min(stepIndex + 1, draftSteps.length))
  }

  function removeHero(type, team, index) {
    const setSlots = getSlotSetter(type, team)
    const stepIndex = getStepIndex(type, team, index)

    setSlots((slots) => slots.map((slot, slotIndex) => (slotIndex === index ? null : slot)))
    setCurrentStepIndex(stepIndex === -1 ? 0 : stepIndex)
  }

  function selectStep(type, team, index) {
    const stepIndex = getStepIndex(type, team, index)

    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex)
    }
  }

  function getSlotSetter(type, team) {
    if (type === 'ban') {
      return team === 'blue' ? setBlueBans : setRedBans
    }

    return team === 'blue' ? setBlueDraft : setRedDraft
  }

  function resetDraft() {
    setBlueDraft(emptyDraft)
    setRedDraft(emptyDraft)
    setBlueBans(emptyBans)
    setRedBans(emptyBans)
    setCurrentStepIndex(0)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">ROV Draft Assistant</p>
          <h1>Arena of Valor Draft</h1>
        </div>
        <button type="button" className="ghost-button" onClick={resetDraft}>
          Reset
        </button>
      </header>

      <section className="draft-room">
        <TeamColumn
          teamKey="blue"
          teamName="Blue Team"
          myTeam={myTeam}
          bans={blueBans}
          picks={blueDraft}
          currentStep={currentStep}
          onSelectStep={selectStep}
          onRemove={removeHero}
        />

        <section className="center-stage">
          <section className="advice-panel">
            <div className="advice-panel__tools">
              <section className={`current-step current-step--${activeTeam}`}>
                <span>Next Turn</span>
                <strong>{currentStep ? currentStep.label : 'Draft complete'}</strong>
              </section>

              <section className="mode-bar" aria-label="Draft mode">
                <div className="mode-group">
                  <span>My Side</span>
                  <button
                    type="button"
                    className={myTeam === 'blue' ? 'mode-button mode-button--blue mode-button--active' : 'mode-button'}
                    onClick={() => setMyTeam('blue')}
                  >
                    Blue
                  </button>
                  <button
                    type="button"
                    className={myTeam === 'red' ? 'mode-button mode-button--red mode-button--active' : 'mode-button'}
                    onClick={() => setMyTeam('red')}
                  >
                    Red
                  </button>
                </div>
              </section>
            </div>

            <SuggestPanel
              teamName={activeTeam === 'blue' ? 'Blue Team' : 'Red Team'}
              analysis={activeAnalysis}
              phase={currentStep?.type ?? 'pick'}
              shouldSuggest={shouldSuggest}
              onPick={selectHero}
            />
          </section>

          <section className="hero-pool">
            <div className="panel-heading">
              <p className="eyebrow">Hero Pool</p>
              <h2>Heroes by Role</h2>
            </div>

            <div className="role-tabs" aria-label="Filter heroes by role">
              {['All', ...roles].map((role) => (
                <button
                  type="button"
                  className={roleFilter === role ? 'role-tab role-tab--active' : 'role-tab'}
                  key={role}
                  onClick={() => setRoleFilter(role)}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="hero-grid">
              {filteredHeroes.map((hero) => (
                <HeroCard
                  hero={hero}
                  isPicked={selectedHeroIds.has(hero.id)}
                  key={hero.id}
                  onSelect={selectHero}
                />
              ))}
            </div>
          </section>
        </section>

        <TeamColumn
          teamKey="red"
          teamName="Red Team"
          myTeam={myTeam}
          bans={redBans}
          picks={redDraft}
          currentStep={currentStep}
          onSelectStep={selectStep}
          onRemove={removeHero}
        />
      </section>
    </main>
  )
}

function TeamColumn({
  teamKey,
  teamName,
  myTeam,
  bans,
  picks,
  currentStep,
  onSelectStep,
  onRemove,
}) {
  const active = currentStep?.team === teamKey

  return (
    <div className={`team-column team-column--${teamKey} ${myTeam === teamKey ? 'team-column--mine' : ''}`}>
      <button
        type="button"
        className={active ? 'team-title team-title--active' : 'team-title'}
      >
        {teamName}
      </button>

      <div className="ban-list">
        {bans.map((hero, index) => (
          <DraftSlot
            hero={hero}
            teamName={teamName}
            index={index}
            key={`${teamKey}-ban-${index}`}
            slotLabel={`B${index + 1}`}
            emptyLabel="Ban"
            compact
            active={active && currentStep?.type === 'ban' && currentStep.index === index}
            onSelectSlot={() => onSelectStep('ban', teamKey, index)}
            onRemove={() => onRemove('ban', teamKey, index)}
          />
        ))}
      </div>

      <div className="slot-list">
        {picks.map((hero, index) => (
          <DraftSlot
            hero={hero}
            teamName={teamName}
            index={index}
            key={`${teamKey}-pick-${index}`}
            slotLabel={index + 1}
            active={active && currentStep?.type === 'pick' && currentStep.index === index}
            onSelectSlot={() => onSelectStep('pick', teamKey, index)}
            onRemove={() => onRemove('pick', teamKey, index)}
          />
        ))}
      </div>
    </div>
  )
}

function getSelectedHeroIds(...slotGroups) {
  return new Set(
    slotGroups
      .flat()
      .filter(Boolean)
      .map((hero) => hero.id),
  )
}

export default App
