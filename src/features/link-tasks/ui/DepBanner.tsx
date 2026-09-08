type Props = {
  linkSourceId: string | null
  onCancel: () => void
}

export function DepBanner({ linkSourceId, onCancel }: Props) {
  return (
    <div className="dep-banner">
      Режим создания зависимости:{' '}
      {linkSourceId
        ? 'кликните задачу-последователя (стрелка от предшественника)'
        : 'кликните задачу-предшественника'}
      <button type="button" className="icon-btn" onClick={onCancel}>
        Esc
      </button>
    </div>
  )
}
