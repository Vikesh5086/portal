import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { ChevronDown, Search, Clock, Heart, Home, Bell, MoreVertical, Compass, User, KeyRound, CheckSquare, GraduationCap, LayoutList, FileText, FileSpreadsheet, RotateCcw, PenTool, CheckCircle, TrendingUp, IndianRupee, BookOpen } from "lucide-react";
import { useEffect } from "react";

export function NavHeader() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <>
      {/* Top Dark Nav */}
      <header className="bg-[#2d2d2d] text-white h-12 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/homepage" className="text-xl font-serif font-bold text-white hover:text-gray-200">
            ti
          </Link>
          <button className="flex items-center gap-1 text-sm hover:bg-gray-700 px-2 py-1 rounded">
            Menu <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search in Menu" 
              className="w-full bg-white text-black px-3 py-1 pr-8 rounded-full text-sm outline-none"
            />
            <Search className="w-4 h-4 text-gray-500 absolute right-2 top-1.5" />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer" />
          <Heart className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer" />
          <Link href="/homepage">
            <Home className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer" />
          </Link>
          <Bell className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer" />
          <Compass className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer" />
          
          <div className="relative group cursor-pointer ml-2">
            <MoreVertical className="w-5 h-5 text-gray-300 hover:text-white" />
            <div className="absolute right-0 top-full mt-2 bg-white text-black w-48 shadow-lg hidden group-hover:block border border-gray-200 z-50">
              <div className="px-4 py-2 border-b text-sm font-bold truncate">
                {user?.name || "Student"}
              </div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Colorful Mosaic Banner */}
      <div className="h-5 w-full" style={{
        background: `repeating-linear-gradient(
          to right,
          #e53935, #e53935 40px,
          #fb8c00 40px, #fb8c00 80px,
          #fdd835 80px, #fdd835 120px,
          #43a047 120px, #43a047 160px,
          #1e88e5 160px, #1e88e5 200px,
          #8e24aa 200px, #8e24aa 240px,
          #00acc1 240px, #00acc1 280px
        )`
      }}></div>
    </>
  );
}

function Tile({ title, icon: Icon, color, href }: { title: string, icon: any, color: string, href?: string }) {
  const content = (
    <div className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-40 flex flex-col p-4 cursor-pointer">
      <div className="font-bold text-sm text-gray-800 mb-auto">{title}</div>
      <div className="flex justify-center items-center pb-4">
        <Icon className={`w-12 h-12 ${color}`} />
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}

export default function Homepage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f0f0f0] font-sans">
      <NavHeader />
      
      <main className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-normal text-gray-800 flex items-center gap-2">
            Student Homepage <ChevronDown className="w-5 h-5 text-gray-500" />
          </h1>
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Row 1 */}
          <Tile title="Student Response Survey" icon={CheckSquare} color="text-green-600" />
          <Tile title="Change My Password" icon={KeyRound} color="text-blue-600" />
          <Tile title="Profile" icon={User} color="text-purple-600" />
          <Tile title="Student_Center" icon={GraduationCap} color="text-teal-600" />
          
          {/* Row 2 */}
          <Tile title="Manage Classes" icon={LayoutList} color="text-orange-500" />
          <Tile title="I Grade Application" icon={FileText} color="text-red-500" />
          <Tile title="Raise Document Request" icon={FileSpreadsheet} color="text-indigo-500" />
          <Tile title="Backlog Course Registration" icon={RotateCcw} color="text-yellow-600" />
          
          {/* Row 3 */}
          <Tile title="Makeup Test Registration" icon={PenTool} color="text-pink-600" />
          <Tile title="No Dues Status" icon={CheckCircle} color="text-green-500" />
          <div className="md:col-span-2">
            <Tile title="Academic Progress" icon={TrendingUp} color="text-blue-500" />
          </div>
          
          {/* Row 4 */}
          <Tile title="Financial" icon={IndianRupee} color="text-emerald-600" />
          <Tile title="View My Grades" icon={BookOpen} color="text-amber-600" href="/assignments" />
        </div>
      </main>
    </div>
  );
}
