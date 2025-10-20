function Tempo ({ disabled = false, tempo, handleTempoChange }) {
  return (
    <div className='tempo-control'>
      <h3>テンポ調整 (BPM)</h3>
      <input
        type='range'
        min='40'
        max='240'
        value={tempo}
        onChange={handleTempoChange}
        disabled={disabled}
        aria-label='Tempo'
      />
      <span>{tempo}</span>
    </div>
  )
}

export default Tempo
