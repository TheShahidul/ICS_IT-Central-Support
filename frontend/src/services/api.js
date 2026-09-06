export async function apiRequest(path, options = {}) {
	const response = await fetch(path, {
		credentials: 'include',
		...options,
		headers: {
			...(options.body ? { 'Content-Type': 'application/json' } : {}),
			...(options.headers || {}),
		},
	})

	const data = await response.json().catch(() => ({}))
	if (!response.ok) {
		throw new Error(data.error || 'Request failed')
	}
	return data
}
