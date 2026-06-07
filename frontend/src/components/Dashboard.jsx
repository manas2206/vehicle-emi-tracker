import { useEffect, useState } from 'react'
import axios from 'axios'

function formatINR(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN')
}

function BigStat({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: 'var(--surface2)', border: '1px solid var(--border)',
      borderRadius: '20px', padding: '24px 28px',
      display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '22px' }}>{icon}</span>
      </div>
      <span style={{ fontSize: '32px', fontFamily: 'DM Mono, monospace', fontWeight: 500, color: color || 'var(--text)', lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: '12px', color: 'var(--muted2)' }}>{sub}</span>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/api/vehicles')
        const list = res.data.vehicles
        const details = await Promise.all(
          list.map(v => axios.get(`/api/emi/${v.registration_number}`).then(r => r.data))
        )
        setStats({
          totalVehicles: list.length,
          totalPaid: details.reduce((a, d) => a + d.summary.paid_count, 0),
          totalPending: details.reduce((a, d) => a + d.summary.pending_count, 0),
          totalOverdue: details.reduce((a, d) => a + d.summary.overdue_count, 0),
          totalCollected: details.reduce((a, d) => a + (d.summary.paid_count * d.summary.monthly_emi), 0),
          totalRemaining: details.reduce((a, d) => a + (d.summary.pending_count * d.summary.monthly_emi), 0),
          typeCount: list.reduce((a, v) => { a[v.vehicle_type] = (a[v.vehicle_type] || 0) + 1; return a }, {}),
          details,
        })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
      <div style={{ fontSize: '28px', marginBottom: '12px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
      <p style={{ fontSize: '14px' }}>Loading dashboard…</p>
    </div>
  )

  if (!stats) return null
  const typeIcons = { car: '🚗', bike: '🏍️', truck: '🚛', other: '🚌' }

  return (
    <div className="fade-up">
      <div style={{ marginBottom: '32px' }}>
        <h1 className="display" style={{ fontSize: '36px', fontWeight: 600, marginBottom: '8px' }}>
          Dashboard <span style={{ color: 'var(--accent2)' }}>Overview</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--muted)' }}>Summary of all vehicle loans and EMI collections</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
        <BigStat label="Total Vehicles" value={stats.totalVehicles} sub="registered loans" icon="🚗" />
        <BigStat label="Total Collected" value={formatINR(stats.totalCollected)} sub={`${stats.totalPaid} EMIs paid`} color="var(--green)" icon="✅" />
        <BigStat label="Remaining" value={formatINR(stats.totalRemaining)} sub={`${stats.totalPending} EMIs pending`} color="var(--yellow)" icon="⏳" />
        <BigStat label="Overdue" value={stats.totalOverdue} sub="needs immediate action" color={stats.totalOverdue > 0 ? 'var(--red)' : 'var(--muted)'} icon="⚠️" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '12px' }}>
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
          <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: '20px' }}>By Vehicle Type</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(stats.typeCount).map(([type, count]) => (
              <div key={type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{typeIcons[type]} {type}</span>
                  <span className="mono" style={{ fontSize: '13px', color: 'var(--text)' }}>{count}</span>
                </div>
                <div style={{ height: '4px', background: 'var(--surface3)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round((count / stats.totalVehicles) * 100)}%`, background: 'var(--accent)', borderRadius: '99px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
          <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: '16px' }}>All Vehicles</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 60px 70px 70px', gap: '8px', padding: '0 8px', marginBottom: '8px' }}>
            {['Vehicle No.', 'Owner', 'Paid', 'Pending', 'Progress'].map(h => (
              <span key={h} style={{ fontSize: '11px', color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {stats.details.map((d, i) => {
              const pct = Math.round((d.summary.paid_count / d.summary.total_emis) * 100)
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 60px 70px 70px',
                  alignItems: 'center', gap: '8px', padding: '12px',
                  background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)',
                }}>
                  <span className="mono" style={{ fontSize: '12px', letterSpacing: '0.06em' }}>{d.vehicle.registration_number}</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.vehicle.owner_name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'DM Mono, monospace' }}>{d.summary.paid_count}</span>
                  <span style={{ fontSize: '12px', color: d.summary.pending_count > 0 ? 'var(--yellow)' : 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>{d.summary.pending_count}</span>
                  <span style={{ fontSize: '12px', color: 'var(--accent2)', fontFamily: 'DM Mono, monospace' }}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}   