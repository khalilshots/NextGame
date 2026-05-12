import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Checkbox } from "../components/ui/checkbox"
import { Link } from 'react-router-dom'
import { loginUser } from '../api/auth'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'


export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const BASE_URL = import.meta.env.VITE_API_URL


  const handleGoogleSuccess = async (credentialResponse) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/auth/google`, {
      credential: credentialResponse.credential
    })
    localStorage.setItem('token', data.access_token)
    navigate('/home')
  } catch (err) {
    setError('Google sign-in failed. Please try again.', err)
  }
}

const handleSubmit = async e => {
  e.preventDefault()
  setError(null)
  try {
    const data = await loginUser(username, password)
    localStorage.setItem('token', data.access_token)
    navigate('/home')
  } catch (error) {
    const detail = error?.response?.data?.detail
    if (error?.response?.status === 401) {
      setError('Incorrect username or password')
    } else {
      setError(detail || 'Something went wrong. Please try again.')
    }
  }
}
const handleGuest = () => {
  navigate('/courts')
}
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="w-full max-w-md p-8 bg-white rounded-lg">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
      <p className="text-sm text-gray-600 mb-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm text-gray-700">
            username
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="bg-gray-50"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm text-gray-700">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-gray-50"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={checked => setRememberMe(checked)}
          />
          <label
            htmlFor="remember"
            className="text-sm text-gray-600 cursor-pointer"
          >
            Remember me
          </label>
        </div>
    {error && (
      <p className="text-red-500 text-sm text-center">
        {error}
      </p>
    )}
            {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-teal-900 hover:bg-teal-800 text-white"
        >
          Sign In
        </Button>


        <Button onClick={handleGuest}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700"
        >
          Continue as Guest
        </Button>

                <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200"/>
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200"/>
        </div>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google sign-in failed.')}
          width="100%"
          shape="rectangular"
          theme="outline"
        />

      </form>
    </div>
    </div>
  )
}
