import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL

export const getCourts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/courts`)
    return response.data
  } catch (error) {
    console.error('Error fetching courts:', error)
    throw error
  }
}

export const getCourtsById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/courts/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching courts:', error)
    throw error
  }
}
