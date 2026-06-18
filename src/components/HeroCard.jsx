function HeroCard({ hero, isPicked, onSelect }) {
  function hideBrokenImage(event) {
    event.currentTarget.hidden = true
  }

  return (
    <button
      type="button"
      className="hero-card"
      disabled={isPicked}
      onClick={() => onSelect(hero)}
      title={isPicked ? 'เลือกไปแล้ว' : `เลือก ${hero.name}`}
    >
      <span className="hero-card__avatar">
        <span>{hero.name.slice(0, 1)}</span>
        {hero.image ? (
          <img src={hero.image} alt="" loading="lazy" onError={hideBrokenImage} />
        ) : null}
      </span>
      <span className="hero-card__body">
        <span className="hero-card__name">{hero.name}</span>
        <span className="hero-card__meta">
          {hero.role} · {hero.lane}
        </span>
      </span>
      <span className={`hero-card__damage hero-card__damage--${hero.damage.toLowerCase()}`}>
        {hero.damage}
      </span>
    </button>
  )
}

export default HeroCard
