function DraftSlot({
  hero,
  teamName,
  index,
  active,
  slotLabel,
  emptyLabel = 'ว่าง',
  compact = false,
  onSelectSlot,
  onRemove,
}) {
  function hideBrokenImage(event) {
    event.currentTarget.hidden = true
  }

  return (
    <button
      type="button"
      className={`draft-slot ${compact ? 'draft-slot--compact' : ''} ${active ? 'draft-slot--active' : ''} ${hero ? 'draft-slot--filled' : ''}`}
      style={hero?.image ? { '--slot-image': `url(${hero.image})` } : undefined}
      onClick={hero ? onRemove : onSelectSlot}
      title={hero ? `ลบ ${hero.name}` : `เลือกช่อง ${teamName} ${index + 1}`}
    >
      <span className="draft-slot__number">{slotLabel ?? index + 1}</span>
      {hero ? (
        <>
          <span className="draft-slot__avatar">
            <span>{hero.name.slice(0, 1)}</span>
            {hero.image ? (
              <img src={hero.image} alt="" loading="lazy" onError={hideBrokenImage} />
            ) : null}
          </span>
        <span className="draft-slot__content">
          <span className="draft-slot__name">{hero.name}</span>
          <span className="draft-slot__meta">
            {hero.role} · {hero.damage}
          </span>
        </span>
        </>
      ) : (
        <span className="draft-slot__empty">{emptyLabel}</span>
      )}
    </button>
  )
}

export default DraftSlot
