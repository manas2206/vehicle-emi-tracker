import { useState } from 'react'

export default function SearchBar({ onSearch, loading }) {
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim()) onSearch(value.trim())
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <span style={{
          position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
          color: 'var(--muted)', fontSize: '16px', pointerEvents: 'none',
        }}>🔍</span>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value.toUpperCase())}
          placeholder="Enter vehicle number  e.g. MH12AB1234"
          maxLength={15}
          style={{ paddingLeft: '44px' }}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !value.trim()}
        style={{
          background: loading || !value.trim() ? 'var(--surface3)' : 'var(--accent)',
          color: loading || !value.trim() ? 'var(--muted)' : '#fff',
          border: 'none', borderRadius: '12px', padding: '0 28px',
          fontSize: '14px', fontWeight: '500', fontFamily: 'DM Sans, sans-serif',
          cursor: loading || !value.trim() ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', whiteSpace: 'nowrap',
        }}
      >
        {loading ? 'Searching…' : 'Search'}
      </button>
    </form>
  )
}