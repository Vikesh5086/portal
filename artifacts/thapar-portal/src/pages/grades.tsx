import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useParams } from "wouter";
import { NavHeader } from "./homepage";
import { BreadcrumbBar, PageHeader } from "./assignments";
import { useGetStudentCourseGrades } from "@workspace/api-client-react";
import { useEffect, useState } from "react";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";

export default function Grades() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const courseId = parseInt(params.courseId || "0", 10);
  
  const { data: gradesData, isLoading } = useGetStudentCourseGrades(courseId);
  const [expandedSection, setExpandedSection] = useState(true);

  useEffect(() => {
    if (!user) setLocation("/");
  }, [user, setLocation]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f0f0f0] font-sans">
      <NavHeader />
      <BreadcrumbBar path="View My Assignments" />
      
      {/* Thin colorful banner strip below breadcrumb */}
      <div className="h-1 w-full" style={{
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
      
      <main className="max-w-5xl mx-auto p-4 bg-white mt-4 shadow-sm border border-gray-200">
        <PageHeader title="View Assignments and Grades" subtitle="Class Grades" />
        
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading grades...</div>
        ) : !gradesData ? (
          <div className="p-8 text-center text-gray-500">Course not found</div>
        ) : (
          <div className="mb-8">
            <div className="flex items-center gap-1 mb-2 font-bold cursor-pointer hover:bg-gray-50 p-1" onClick={() => setExpandedSection(!expandedSection)}>
              {expandedSection ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <span>{gradesData.course.subject_catalog_nbr} - {gradesData.course.class_section} ({gradesData.course.class_nbr})</span>
            </div>
            
            {expandedSection && (
              <div className="ml-5">
                <div className="text-sm mb-4">{gradesData.course.course_title} (Lecture)</div>
                <button className="bg-[#c8b89a] text-black px-4 py-1 text-sm font-bold border border-gray-400 rounded-sm mb-4">
                  Change Class
                </button>
                
                <table className="w-full text-sm border-collapse border border-gray-300 mb-6">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="text-left p-2 border-r border-gray-300 font-bold">Days and Times</th>
                      <th className="text-left p-2 border-r border-gray-300 font-bold">Room</th>
                      <th className="text-left p-2 border-r border-gray-300 font-bold">Instructor</th>
                      <th className="text-left p-2 font-bold">Dates</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="p-2 border-r border-gray-300">Tu 07:00-08:00</td>
                      <td className="p-2 border-r border-gray-300">TBA</td>
                      <td className="p-2 border-r border-gray-300">SUNITA GARHWAL</td>
                      <td className="p-2">06/01/2026 - 07/01/2026</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="bg-[#fff9e6] border border-gray-300 p-4 mb-6">
              <h3 className="text-[#8B1A1A] font-bold mb-2">Grades</h3>
              <div className="flex justify-end gap-10 text-sm font-bold">
                <div>Current Mid-Term Grade: {gradesData.midterm_grade != null ? `${gradesData.midterm_grade.toFixed(2)}% ~` : "-"}</div>
                <div>Current Overall Grade: {gradesData.overall_grade != null ? `${gradesData.overall_grade.toFixed(2)}% ~` : "-"}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-2 font-bold bg-gray-50 p-1 border border-gray-200">
                <ChevronDown className="w-4 h-4" />
                <span>Class Assignments</span>
              </div>
              
              <div className="overflow-x-auto ml-1">
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="text-left p-2 border-r border-gray-300 text-[#cc6600] font-bold">Begin Date</th>
                      <th className="text-left p-2 border-r border-gray-300 text-[#cc6600] font-bold">Due Date</th>
                      <th className="text-left p-2 border-r border-gray-300 text-[#cc6600] font-bold">Assignment</th>
                      <th className="text-left p-2 border-r border-gray-300 text-[#cc6600] font-bold">Category</th>
                      <th className="text-left p-2 border-r border-gray-300 text-[#cc6600] font-bold">Grade</th>
                      <th className="text-left p-2 border-r border-gray-300 text-[#cc6600] font-bold">Out of</th>
                      <th className="text-left p-2 text-[#cc6600] font-bold">Other Information</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradesData.assignments.map((assignment) => (
                      <tr key={assignment.id} className="border-b border-gray-300 hover:bg-gray-50">
                        <td className="p-2 border-r border-gray-300">{assignment.begin_date || "\u00A0"}</td>
                        <td className="p-2 border-r border-gray-300">{assignment.due_date || "\u00A0"}</td>
                        <td className="p-2 border-r border-gray-300">
                          <a href="#" className="text-[#0066cc] hover:underline">{assignment.assignment_name}</a>
                        </td>
                        <td className="p-2 border-r border-gray-300">{assignment.category}</td>
                        <td className="p-2 border-r border-gray-300">
                          {assignment.marks_obtained !== null && assignment.marks_obtained !== undefined ? `${assignment.marks_obtained} ~` : "\u00A0"}
                        </td>
                        <td className="p-2 border-r border-gray-300">{assignment.max_marks}</td>
                        <td className="p-2">\u00A0</td>
                      </tr>
                    ))}
                    {gradesData.assignments.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-gray-500">No assignments found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="space-y-1 mb-8">
              <div className="flex items-center gap-1 font-bold cursor-pointer hover:bg-gray-50 p-1 border border-transparent">
                <ChevronRight className="w-4 h-4" />
                <span>Assignment Categories</span>
              </div>
              <div className="flex items-center gap-1 font-bold cursor-pointer hover:bg-gray-50 p-1 border border-transparent">
                <ChevronRight className="w-4 h-4" />
                <span>Instructor Comments</span>
              </div>
              <div className="flex items-center gap-1 font-bold cursor-pointer hover:bg-gray-50 p-1 border border-transparent">
                <ChevronRight className="w-4 h-4" />
                <span>Student Assignment Dates</span>
              </div>
            </div>
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
