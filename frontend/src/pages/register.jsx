import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Link } from 'react-router-dom'
import { registerUser } from '../api/auth'
import { useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      if (password !== confirmPassword) {
        alert("Passwords don't match")
      return
    }
      const data = await registerUser({ username, password })
      localStorage.setItem('token', data?.access_token)
      navigate('/home')
      } catch (error) {
        
        const detail = error?.response?.data?.detail
        console.error("Registration error:", error)
        if (Array.isArray(detail)) {
          // Pydantic validation error — extract the message
          alert(detail[0]?.msg || 'Registration failed')
        } else {
          alert(detail || 'Registration failed. Please try again.')
        }
      }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="w-full max-w-md p-8 bg-white rounded-lg">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
      <p className="text-sm text-gray-600 mb-6">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm text-gray-700">
            Username
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm text-gray-700">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="bg-gray-50"
            required
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-teal-900 hover:bg-teal-800 text-white"
        >
          Create Account
        </Button>
      </form>
    </div>
    </div>
  )
}
