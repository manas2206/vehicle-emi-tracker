const vehicleIcons = { car: '🚗', bike: '🏍️', truck: '🚛', other: '🚌' }

function formatINR(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN')
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--surface2)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: '6px',
    }}>
      <span style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '26px', fontFamily: 'DM Mono, monospace', fontWeight: 500, color: color || 'var(--text)', lineHeight: 1.1 }}>{value}</span>
      {sub && <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{sub}</span>}
    </div>
  )
}

export default function EMICard({ data, onMarkPaid }) {
  const { vehicle, summary, schedule } = data
  const progress = Math.round((summary.paid_count / summary.total_emis) * 100)
  const totalPaid = summary.paid_count * summary.monthly_emi
  const totalRemaining = summary.pending_count * summary.monthly_emi

  return (
    <div className="card fade-up">

      {/* Header */}
      <div style={{
        padding: '28px 32px', borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(135deg, var(--surface2) 0%, var(--surface) 100%)',
        display: 'flex', alignItems: 'center', gap: '20px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px',
          background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          width: '56px', height: '56px', background: 'var(--surface3)',
          borderRadius: '16px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '26px',
          border: '1px solid var(--border2)', flexShrink: 0,
        }}>
          {vehicleIcons[vehicle.vehicle_type] || '🚗'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
            <h2 className="mono" style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '0.08em' }}>
              {vehicle.registration_number}
            </h2>
            <span style={{
              fontSize: '11px', padding: '3px 10px', borderRadius: '99px',
              background: 'rgba(108,99,255,0.15)', color: 'var(--accent2)',
              border: '1px solid rgba(108,99,255,0.25)', fontWeight: 500,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>{vehicle.vehicle_type}</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            {vehicle.model} &nbsp;·&nbsp; {vehicle.owner_name}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted2)', marginTop: '2px' }}>
            Loan: {formatINR(vehicle.loan_amount)} &nbsp;·&nbsp; {vehicle.tenure_months} months &nbsp;·&nbsp; {vehicle.interest_rate}% p.a.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Monthly EMI</p>
            <p className="mono" style={{ fontSize: '28px', fontWeight: 500 }}>{formatINR(summary.monthly_emi)}</p>
          </div>
          <button onClick={() => window.print()} style={{
            fontSize: '12px', padding: '7px 16px', borderRadius: '8px',
            background: 'var(--surface3)', border: '1px solid var(--border2)',
            color: 'var(--muted)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            🖨️ Print / Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <StatCard label="Total EMIs" value={summary.total_emis} sub="instalments" />
          <StatCard label="Paid" value={summary.paid_count} sub={formatINR(totalPaid)} color="var(--green)" />
          <StatCard label="Pending" value={summary.pending_count} sub={formatINR(totalRemaining)} color="var(--yellow)" />
          <StatCard label="Overdue" value={summary.overdue_count} sub="requires attention" color={summary.overdue_count > 0 ? 'var(--red)' : 'var(--muted)'} />
        </div>
      </div>

      {/* Progress */}
      <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>Repayment Progress</span>
          <span className="mono" style={{ fontSize: '13px', color: 'var(--accent2)', fontWeight: 500 }}>{progress}%</span>
        </div>
        <div style={{ height: '6px', background: 'var(--surface3)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--accent) 0%, var(--green) 100%)',
            borderRadius: '99px', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted2)' }}>{formatINR(totalPaid)} paid</span>
          <span style={{ fontSize: '11px', color: 'var(--muted2)' }}>{formatINR(totalRemaining)} remaining</span>
        </div>
      </div>

      {/* Schedule */}
      <div style={{ padding: '24px 32px' }}>
        <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: '16px' }}>
          EMI Schedule
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 100px 130px 110px', padding: '8px 16px', marginBottom: '4px' }}>
          {['Month', 'Amount', 'Status', 'Date', ''].map((h, i) => (
            <span key={i} style={{ fontSize: '11px', color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{h}</span>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {schedule.map((emi, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '110px 1fr 100px 130px 110px',
              alignItems: 'center', padding: '13px 16px',
              background: 'var(--surface2)', borderRadius: '12px',
              border: '1px solid var(--border)', transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{emi.month_label}</span>
              <span className="mono" style={{ fontSize: '14px', fontWeight: 500 }}>{formatINR(emi.amount)}</span>
              <span>
                <span className={`badge-${emi.status}`} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '99px', fontWeight: 500 }}>
                  {emi.status}
                </span>
              </span>
              <span style={{ fontSize: '12px', color: 'var(--muted2)', fontFamily: 'DM Mono, monospace' }}>
                {emi.paid_date ? `✓ ${emi.paid_date}` : `Due ${emi.due_date}`}
              </span>
              <span>
                {(emi.status === 'pending' || emi.status === 'overdue') && (
                  <button
                    onClick={() => onMarkPaid(vehicle.registration_number, emi.id)}
                    style={{
                      fontSize: '11px', padding: '5px 12px', borderRadius: '8px',
                      background: 'rgba(34,211,122,0.1)', border: '1px solid rgba(34,211,122,0.25)',
                      color: 'var(--green)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 500, transition: 'all 0.2s', whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,211,122,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,211,122,0.1)'}
                  >✓ Mark Paid</button>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .app-wrap { padding: 0 !important; }
          button { display: none !important; }
          .card { border: 1px solid #ddd !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  )
}