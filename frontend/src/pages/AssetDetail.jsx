import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AssetIcon from '../components/AssetIcon'

export default function AssetDetail() {
  const { id } = useParams()
  const [asset, setAsset] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/assets/${id}`, { credentials: 'include' })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to load asset')
        setAsset(data.asset)
      })
      .catch((loadError) => setError(loadError.message))
  }, [id])

  if (error) return <main className="container py-4"><div className="alert alert-danger">{error}</div></main>
  if (!asset) return <main className="container py-4">Loading asset...</main>

  return (
    <main className="container py-4" style={{ maxWidth: '760px' }}>
      <Link to="/assets">Back to assets</Link>
      <section className="card card-body mt-3">
        <h1 className="h3"><span className="asset-hero-icon"><AssetIcon type={asset.asset_type} size={28} /></span>{asset.asset_tag}</h1>
        <p className="text-muted">{asset.asset_type} · {asset.status}</p>
        <dl className="row mb-0">
          <dt className="col-sm-4">Brand and model</dt><dd className="col-sm-8"><span className="brand-label"><span className="brand-mark-small">{asset.brand.slice(0, 2).toUpperCase()}</span>{asset.brand} {asset.model}</span></dd>
          <dt className="col-sm-4">Serial number</dt><dd className="col-sm-8">{asset.serial_number || 'Not recorded'}</dd>
          <dt className="col-sm-4">Assigned user</dt><dd className="col-sm-8">{asset.assigned_to || 'Unassigned'}</dd>
          <dt className="col-sm-4">Warranty expiry</dt><dd className="col-sm-8">{asset.warranty_expiry || 'Not recorded'}</dd>
          <dt className="col-sm-4">Notes</dt><dd className="col-sm-8">{asset.notes || 'None'}</dd>
        </dl>
      </section>
    </main>
  )
}
