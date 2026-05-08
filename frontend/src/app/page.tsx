import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-gray-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-6xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
        Tasko
      </h1>
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-300">
        Modern Team Task Management
      </h2>
      <p className="text-lg mb-12 max-w-xl text-center text-gray-400 leading-relaxed">
        Streamline your workflow with our premium task management platform. 
        Collaborate, track, and achieve more together.
      </p>
      <div className="flex flex-col sm:flex-row gap-6">
        <Link href="/login" passHref>
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-6 text-lg rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20">
            Login
          </Button>
        </Link>
        <Link href="/register" passHref>
          <Button size="lg" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10 px-8 py-6 text-lg rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/10">
            Register
          </Button>
        </Link>
      </div>
      
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg">
          <h3 className="text-xl font-bold mb-3 text-blue-400">Kanban Boards</h3>
          <p className="text-gray-400">Visualize your workflow with our smooth drag-and-drop task management interface.</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg">
          <h3 className="text-xl font-bold mb-3 text-purple-400">Team Collaboration</h3>
          <p className="text-gray-400">Assign tasks, set deadlines, and keep everyone in sync with real-time updates.</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg">
          <h3 className="text-xl font-bold mb-3 text-indigo-400">Analytics</h3>
          <p className="text-gray-400">Track team performance and project progress with beautiful interactive charts.</p>
        </div>
      </div>
    </div>
  );
}
