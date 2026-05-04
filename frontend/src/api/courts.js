import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

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
