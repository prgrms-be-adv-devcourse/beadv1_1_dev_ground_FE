import axios from 'axios'

const openApi = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

const api = axios.create({
  baseURL: '/api',
  headers: {
    'X-CODE': sessionStorage.getItem('X-CODE'),
    'Content-Type': 'application/json',
  },
})

export { api, openApi }
