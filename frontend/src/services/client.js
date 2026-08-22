import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || ''

export const useMock = !baseURL

export const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

export async function getJson(path, params) {
  const { data } = await http.get(path, { params })
  return data
}

export async function postJson(path, body) {
  const { data } = await http.post(path, body)
  return data
}

export async function putJson(path, body) {
  const { data } = await http.put(path, body)
  return data
}

export async function deleteJson(path) {
  const { data } = await http.delete(path)
  return data
}
