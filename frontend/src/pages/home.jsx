import { useNavigate } from 'react-router-dom'


export default function MenuPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      <button
        onClick={() => navigate('/courts')}
        className="w-64 h-20 rounded-3xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg hover:bg-white/30 transition-all duration-300 text-white text-xl font-semibold"
      >
        Courts
      </button>

      <button
        onClick={() => console.log("Profile clicked")}
        className="w-64 h-20 rounded-3xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg hover:bg-white/30 transition-all duration-300 text-white text-xl font-semibold"
      >
        Profile
      </button>
    </div>
  );
}