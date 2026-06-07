import { useState } from 'react'
import axios from 'axios'
import SearchBar from './components/SearchBar'
import EMICard from './components/EMICard'
import Dashboard from './components/Dashboard'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [page, setPage] = useState('search')
  const [searchHistory, setSearchHistory] = useState([])

  const handleSearch = async (vehicleNumber) => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await axios.get(`/api/emi/${vehicleNumber}`)
      setResult(res.data)
      setSearchHistory(prev => {
        const filtered = prev.filter(v => v !== vehicleNumber)
        return [vehicleNumber, ...filtered].slice(0, 5)
      })
    } catch (err) {
      if (err.response?.status === 404) setError('No EMI records found for this vehicle number.')
      else setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPaid = async (vehicleNumber, emiId) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      await axios.patch(`/api/emi/${vehicleNumber}/${emiId}`, { status: 'paid', paid_date: today })
      handleSearch(vehicleNumber)
    } catch {
      alert('Failed to update EMI status.')
    }
  }

  return (
    <div className="app-wrap" style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--accent)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '18px',
            }}>⚡</div>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>
              EMI<span style={{ color: 'var(--accent2)' }}>Track</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px', background: 'var(--surface2)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            {[['search', '🔍  Lookup'], ['dashboard', '📊  Dashboard']].map(([key, label]) => (
              <button key={key} onClick={() => setPage(key)} style={{
                padding: '8px 18px', borderRadius: '8px', border: 'none',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                background: page === key ? 'var(--accent)' : 'transparent',
                color: page === key ? '#fff' : 'var(--muted)',
                transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>

          <span style={{
            fontSize: '11px', color: 'var(--muted)', padding: '6px 14px',
            border: '1px solid var(--border)', borderRadius: '99px',
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>Vehicle Finance Portal</span>
        </div>

        {page === 'dashboard' && <Dashboard />}

        {page === 'search' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1 className="display" style={{ fontSize: '42px', fontWeight: 600, lineHeight: 1.2, marginBottom: '14px' }}>
                Vehicle EMI <span style={{ color: 'var(--accent2)' }}>Lookup</span>
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--muted)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.7 }}>
                Enter a vehicle registration number to instantly view loan and EMI details.
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <SearchBar onSearch={handleSearch} loading={loading} />
            </div>

            {searchHistory.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent:</span>
                {searchHistory.map(v => (
                  <button key={v} onClick={() => handleSearch(v)} style={{
                    fontSize: '12px', fontFamily: 'DM Mono, monospace', letterSpacing: '0.06em',
                    padding: '4px 12px', borderRadius: '99px',
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    color: 'var(--muted)', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent2)' }}
                    onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)' }}
                  >{v}</button>
                ))}
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontSize: '14px' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
                <p>Fetching EMI records…</p>
              </div>
            )}

            {error && !loading && (
              <div style={{
                background: 'rgba(255,92,92,0.08)', border: '1px solid rgba(255,92,92,0.2)',
                borderRadius: '14px', padding: '16px 20px',
                color: 'var(--red)', fontSize: '14px', textAlign: 'center',
              }}>{error}</div>
            )}

            {result && !loading && <EMICard data={result} onMarkPaid={handleMarkPaid} />}

            {!result && !loading && !error && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>🚗</div>
                <p style={{ fontSize: '13px', color: 'var(--muted2)' }}>Search a vehicle number to see EMI details</p>
                <p style={{ fontSize: '12px', color: 'var(--muted2)', marginTop: '6px', opacity: 0.7 }}>
                  Try: MH12AB1234 · KA05MN4567 · DL1CT9900
                </p>
              </div>
            )}
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--muted2)', fontSize: '12px' }}>
          EMITrack · Vehicle Finance Management System
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}