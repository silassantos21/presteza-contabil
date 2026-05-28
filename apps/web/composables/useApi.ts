export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const baseURL = config.public.apiUrl as string

  async function request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }

    const res = await fetch(`${baseURL}${path}`, { ...options, headers })

    if (res.status === 401) {
      authStore.logout()
      throw new Error('Sessão expirada')
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro desconhecido' }))
      throw new Error(err.message || 'Erro na requisição')
    }

    return res.json()
  }

  async function upload<T>(path: string, formData: FormData): Promise<T> {
    const headers: Record<string, string> = {}
    if (authStore.token) headers['Authorization'] = `Bearer ${authStore.token}`

    const res = await fetch(`${baseURL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (res.status === 401) {
      authStore.logout()
      throw new Error('Sessão expirada')
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro desconhecido' }))
      throw new Error(err.message || 'Erro no upload')
    }

    return res.json()
  }

  async function downloadPdf(path: string, filename: string): Promise<void> {
    const headers: Record<string, string> = {}
    if (authStore.token) headers['Authorization'] = `Bearer ${authStore.token}`

    const res = await fetch(`${baseURL}${path}`, { headers })

    if (res.status === 401) {
      authStore.logout()
      throw new Error('Sessão expirada')
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro desconhecido' }))
      throw new Error(err.message || 'Erro ao gerar relatório')
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return {
    get: <T>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
    del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
    upload,
    downloadPdf,
  }
}
