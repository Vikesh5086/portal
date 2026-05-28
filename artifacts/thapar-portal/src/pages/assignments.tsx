import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { NavHeader } from "./homepage";
import { useGetStudentCourses } from "@workspace/api-client-react";
import { useEffect } from "react";
import { ChevronUp } from "lucide-react";

export function BreadcrumbBar({ path }: { path: string }) {
  return (
    <div className="bg-[#b8cce4] text-xs px-4 py-1.5 flex items-center text-gray-800">
      <span className="cursor-pointer hover:underline">Favorites ▼</span>
      <span className="mx-2">&gt;</span>
      <span className="cursor-pointer hover:underline">Main Menu ▼</span>
      <span className="mx-2">&gt;</span>
      <span className="cursor-pointer hover:underline">Nav Coll Navigator</span>
      <span className="mx-2">&gt;</span>
      <span>{path}</span>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string, subtitle: string }) {
  const { user } = useAuth();
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="text-sm font-bold uppercase">{user?.name}</div>
        <div className="flex items-center gap-2 text-sm">
          <span>Go To</span>
          <select className="border border-gray-300 px-2 py-0.5">
            <option>View Assignments and Grades</option>
          </select>
          <button className="bg-[#8B1A1A] text-white px-2 py-0.5">&gt;&gt;</button>
        </div>
      </div>
      
      <div className="flex gap-1 mb-4 border-b border-gray-300">
        <button className="px-3 py-1.5 text-sm font-bold hover:bg-gray-100">Search</button>
        <button className="px-3 py-1.5 text-sm font-bold hover:bg-gray-100">Plan</button>
        <button className="px-3 py-1.5 text-sm font-bold border-t-2 border-l-2 border-r-2 border-gray-300 border-b-white -mb-[1px] bg-white">Enroll</button>
        <button className="px-3 py-1.5 text-sm font-bold hover:bg-gray-100">My Academics</button>
      </div>
      
      <div className="flex gap-4 mb-4 text-sm font-bold text-[#0066cc]">
        <span className="cursor-pointer hover:underline">My Class Schedule</span>
        <span className="cursor-pointer hover:underline">Term Information</span>
      </div>
      
      <h1 className="text-lg font-bold mb-2">{title}</h1>
      <h2 className="text-xl font-bold mb-2">{subtitle}</h2>
      
      <div className="bg-blue-50 border-y border-blue-200 py-1 px-2 text-sm font-bold">
        JUNE 2026 | Undergraduate | Thapar Institute of Eng & Tech
      </div>
    </div>
  );
}

export default function Assignments() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: courses, isLoading } = useGetStudentCourses();

  useEffect(() => {
    if (!user) setLocation("/");
  }, [user, setLocation]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f0f0f0] font-sans">
      <NavHeader />
      <BreadcrumbBar path="View My Assignments" />
      
      <main className="max-w-5xl mx-auto p-4 bg-white mt-4 shadow-sm border border-gray-200">
        <PageHeader title="View Assignments and Grades" subtitle="View Assignments and Grades" />
        
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading courses...</div>
        ) : (
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="text-left p-2 border-r border-gray-300 text-[#cc6600] font-bold">Course Title</th>
                  <th className="text-left p-2 border-r border-gray-300 text-[#cc6600] font-bold">Course ID</th>
                  <th className="text-left p-2 border-r border-gray-300 text-[#cc6600] font-bold">Class Nbr</th>
                  <th className="text-left p-2 border-r border-gray-300 text-[#cc6600] font-bold">Subject Catalog Nbr</th>
                  <th className="text-left p-2 text-[#cc6600] font-bold">Class Section</th>
                </tr>
              </thead>
              <tbody>
                {courses?.map((course) => (
                  <tr key={course.id} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="p-2 border-r border-gray-300">
                      <Link href={`/grades/${course.id}`} className="text-[#0066cc] hover:underline font-bold">
                        {course.course_title}
                      </Link>
                    </td>
                    <td className="p-2 border-r border-gray-300">{course.course_id}</td>
                    <td className="p-2 border-r border-gray-300">{course.class_nbr || "\u00A0"}</td>
                    <td className="p-2 border-r border-gray-300">{course.subject_catalog_nbr || "\u00A0"}</td>
                    <td className="p-2">{course.class_section}</td>
                  </tr>
                ))}
                {(!courses || courses.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">No courses found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1 text-[#0066cc] text-sm hover:underline"
          >
            <ChevronUp className="w-4 h-4" /> Go to top
          </button>
        </div>
      </main>
    </div>
  );
}
