import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Checkbox } from "../components/ui/checkbox"
import { Link } from 'react-router-dom'
import { loginUser } from '../api/auth'
import { useNavigate } from 'react-router-dom'


export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const data = await loginUser(username, password)
      localStorage.setItem('token', data.access_token)
      navigate('/home')
      console.log("Successful Login attempt with:", { username, rememberMe })
    } catch (error) {
      console.error("Login error:", error)
      alert("Login failed: " + (error?.message || "Please try again."))
    }
    console.log("Form submitted with:", { username, password, rememberMe })
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
            E-mail
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="example@gmail.com"
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

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-teal-900 hover:bg-teal-800 text-white"
        >
          Sign In
        </Button>
      </form>
    </div>
    </div>
  )
}
