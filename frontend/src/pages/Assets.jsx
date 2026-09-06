import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AssetIcon from '../components/AssetIcon'

export default function Assets() {
  const [assets, setAssets] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/assets', { credentials: 'include' })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to load assets')
        setAssets(data.assets)
      })
      .catch((loadError) => setError(loadError.message))
  }, [])

  return (
    <main className="container py-4">
      <h1 className="h2 mb-4">Asset inventory</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive card">
        <table className="table table-hover mb-0">
          <thead><tr><th>Asset tag</th><th>Type</th><th>Brand / model</th><th>Status</th><th>Assigned user</th></tr></thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td><Link to={`/assets/${asset.id}`}>{asset.asset_tag}</Link></td>
                <td><span className="icon-label"><AssetIcon type={asset.asset_type} />{asset.asset_type}</span></td>
                <td><span className="brand-label"><span className="brand-mark-small">{asset.brand.slice(0, 2).toUpperCase()}</span>{asset.brand} {asset.model}</span></td>
                <td>{asset.status}</td>
                <td>{asset.assigned_to || 'Unassigned'}</td>
              </tr>
            ))}
            {assets.length === 0 && <tr><td colSpan="5" className="text-center py-4">No assets found.</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  )
}
