import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, userData)
    return response.data
  } catch (error) {
    console.error('Error registering user:', error)
    throw error
  }
}

export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/token`,
      new URLSearchParams({ username, password })
    )
    return response.data
  } catch (error) {
    console.error('Error logging in user:', error)
    throw error
  }
}