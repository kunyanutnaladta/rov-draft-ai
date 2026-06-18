function SuggestPanel({ teamName, analysis, phase, shouldSuggest, onPick }) {
  const isBanPhase = phase === 'ban'
  const categories = analysis.categories ?? {
    best: analysis.suggestions,
    combo: [],
    counter: [],
  }

  function hideBrokenImage(event) {
    event.currentTarget.hidden = true
  }

  return (
    <aside className={`suggest-panel ${isBanPhase ? 'suggest-panel--ban' : ''}`}>
      <div className="panel-heading">
        <p className="eyebrow">{isBanPhase ? 'Ban Guide' : 'Pick Guide'}</p>
        <h2>{teamName}</h2>
      </div>

      <div className="draft-health">
        <span>{analysis.balance.filledSlots}/5 picks</span>
        <span>{analysis.balance.hasMagic ? 'Magic OK' : 'Need magic'}</span>
        <span>{analysis.balance.hasPhysical ? 'Physical OK' : 'Need physical'}</span>
      </div>

      {shouldSuggest ? (
        <div className="guide-board">
          <GuideRow
            title={isBanPhase ? 'Ban' : 'Pick'}
            heroes={categories.best}
            emptyText="Waiting"
            onPick={onPick}
            onImageError={hideBrokenImage}
          />
          <GuideRow
            title={isBanPhase ? 'Threat' : 'Counter'}
            heroes={categories.counter}
            emptyText="Enemy picks needed"
            onPick={onPick}
            onImageError={hideBrokenImage}
          />
        </div>
      ) : (
        <div className="wait-card">
          <strong>Opponent turn</strong>
          <span>Pick a hero from the pool to record the enemy ban/pick.</span>
        </div>
      )}
    </aside>
  )
}

function GuideRow({ title, heroes, emptyText, onPick, onImageError }) {
  return (
    <section className="guide-row">
      <div className="guide-row__title">{title}</div>
      <div className="guide-row__heroes">
        {heroes.length > 0 ? (
          heroes.map((hero) => (
            <button
              type="button"
              className="guide-hero"
              key={hero.id}
              onClick={() => onPick(hero)}
              title={`${hero.name}: ${hero.reasons.join(' · ')}`}
            >
              <span className="guide-hero__avatar">
                <span>{hero.name.slice(0, 1)}</span>
                {hero.image ? (
                  <img src={hero.image} alt="" loading="lazy" onError={onImageError} />
                ) : null}
              </span>
              <span className="guide-hero__name">{hero.name}</span>
            </button>
          ))
        ) : (
          <span className="guide-row__empty">{emptyText}</span>
        )}
      </div>
    </section>
  )
}

export default SuggestPanel
