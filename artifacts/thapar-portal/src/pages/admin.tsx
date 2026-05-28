import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { NavHeader } from "./homepage";
import { 
  useGetAdminStudents, 
  useGetAdminStudentCourses, 
  useCreateAdminStudent, 
  useCreateAdminCourse, 
  useEnrollStudent, 
  useCreateAdminAssignment, 
  useUpdateAdminMarks,
  getGetAdminStudentsQueryKey,
  getGetAdminStudentCoursesQueryKey,
} from "@workspace/api-client-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  
  // Forms state
  const [newStudent, setNewStudent] = useState({ college_id: "", name: "", password: "" });
  const [newCourse, setNewCourse] = useState({ course_id: "", course_title: "", subject_catalog_nbr: "", class_nbr: "", class_section: "1" });
  const [enrollData, setEnrollData] = useState({ student_college_id: "", course_id: "" });
  const [newAssignment, setNewAssignment] = useState({ course_id: "", assignment_name: "", category: "Mid-Term", max_marks: "100" });
  const [markData, setMarkData] = useState({ student_college_id: "", assignment_id: "", marks: "" });

  const { data: students, isLoading: isLoadingStudents } = useGetAdminStudents();
  const { data: studentCourses, isLoading: isLoadingCourses } = useGetAdminStudentCourses(
    selectedStudentId,
    { query: { enabled: !!selectedStudentId, queryKey: getGetAdminStudentCoursesQueryKey(selectedStudentId) } }
  );

  const createStudent = useCreateAdminStudent();
  const createCourse = useCreateAdminCourse();
  const enrollStudent = useEnrollStudent();
  const createAssignment = useCreateAdminAssignment();
  const updateMarks = useUpdateAdminMarks();

  useEffect(() => {
    if (!user) {
      setLocation("/");
    } else if (user.role !== "admin") {
      setLocation("/homepage");
    }
  }, [user, setLocation]);

  if (!user || user.role !== "admin") return null;

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStudent.mutateAsync({ data: newStudent });
    queryClient.invalidateQueries({ queryKey: getGetAdminStudentsQueryKey() });
    setNewStudent({ college_id: "", name: "", password: "" });
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCourse.mutateAsync({ data: newCourse });
    setNewCourse({ course_id: "", course_title: "", subject_catalog_nbr: "", class_nbr: "", class_section: "1" });
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    await enrollStudent.mutateAsync({ 
      data: { 
        student_college_id: enrollData.student_college_id, 
        course_id: parseInt(enrollData.course_id, 10) 
      } 
    });
    if (enrollData.student_college_id === selectedStudentId) {
      queryClient.invalidateQueries({ queryKey: getGetAdminStudentCoursesQueryKey(selectedStudentId) });
    }
    setEnrollData({ student_college_id: "", course_id: "" });
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAssignment.mutateAsync({ 
      data: { 
        ...newAssignment, 
        course_id: parseInt(newAssignment.course_id, 10),
        max_marks: parseInt(newAssignment.max_marks, 10)
      } 
    });
    setNewAssignment({ course_id: "", assignment_name: "", category: "Mid-Term", max_marks: "100" });
  };

  const handleUpdateMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMarks.mutateAsync({ 
      data: { 
        student_college_id: markData.student_college_id, 
        assignment_id: parseInt(markData.assignment_id, 10),
        marks: parseFloat(markData.marks)
      } 
    });
    // Invalidate grades for this student and course
    // Would need to know course ID to fully invalidate, but this triggers refresh next time they check
    setMarkData({ student_college_id: "", assignment_id: "", marks: "" });
    alert("Marks updated");
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] font-sans">
      <NavHeader />
      
      <main className="max-w-6xl mx-auto p-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-[#8B1A1A]">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - View Data */}
          <div className="space-y-6">
            <div className="bg-white p-4 shadow-sm border border-gray-200">
              <h2 className="font-bold text-lg mb-4 text-[#cc6600]">Students</h2>
              
              {isLoadingStudents ? (
                <div>Loading...</div>
              ) : (
                <div className="overflow-y-auto max-h-60 border border-gray-300">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 border-b border-gray-300 text-left">College ID</th>
                        <th className="p-2 border-b border-gray-300 text-left">Name</th>
                        <th className="p-2 border-b border-gray-300 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students?.map((student) => (
                        <tr key={student.id} className={selectedStudentId === student.college_id ? "bg-blue-50" : ""}>
                          <td className="p-2 border-b border-gray-300">{student.college_id}</td>
                          <td className="p-2 border-b border-gray-300">{student.name}</td>
                          <td className="p-2 border-b border-gray-300">
                            <button 
                              onClick={() => setSelectedStudentId(student.college_id)}
                              className="text-xs bg-[#0066cc] text-white px-2 py-1 rounded"
                            >
                              View Courses
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {selectedStudentId && (
              <div className="bg-white p-4 shadow-sm border border-gray-200">
                <h2 className="font-bold text-lg mb-4 text-[#cc6600]">Courses for {selectedStudentId}</h2>
                
                {isLoadingCourses ? (
                  <div>Loading...</div>
                ) : studentCourses?.length ? (
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {studentCourses.map(c => (
                      <li key={c.id}>
                        {c.course_id} - {c.course_title} (ID: {c.id})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500">No courses enrolled.</div>
                )}
              </div>
            )}
          </div>
          
          {/* Right Column - Forms */}
          <div className="space-y-6">
            {/* Create Student */}
            <div className="bg-white p-4 shadow-sm border border-gray-200">
              <h2 className="font-bold text-lg mb-4 text-[#cc6600]">Add Student</h2>
              <form onSubmit={handleCreateStudent} className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <input placeholder="College ID" className="border border-gray-300 px-2 py-1" value={newStudent.college_id} onChange={e => setNewStudent({...newStudent, college_id: e.target.value})} required />
                  <input placeholder="Password" type="password" className="border border-gray-300 px-2 py-1" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} required />
                </div>
                <input placeholder="Full Name" className="border border-gray-300 px-2 py-1 w-full text-sm" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} required />
                <button type="submit" disabled={createStudent.isPending} className="bg-[#8B1A1A] text-white text-sm px-4 py-1.5 font-bold">Add Student</button>
              </form>
            </div>
            
            {/* Create Course */}
            <div className="bg-white p-4 shadow-sm border border-gray-200">
              <h2 className="font-bold text-lg mb-4 text-[#cc6600]">Add Course</h2>
              <form onSubmit={handleCreateCourse} className="space-y-3">
                <input placeholder="Course ID (e.g. UCT 201)" className="border border-gray-300 px-2 py-1 w-full text-sm" value={newCourse.course_id} onChange={e => setNewCourse({...newCourse, course_id: e.target.value})} required />
                <input placeholder="Course Title" className="border border-gray-300 px-2 py-1 w-full text-sm" value={newCourse.course_title} onChange={e => setNewCourse({...newCourse, course_title: e.target.value})} required />
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <input placeholder="Catalog Nbr" className="border border-gray-300 px-2 py-1" value={newCourse.subject_catalog_nbr} onChange={e => setNewCourse({...newCourse, subject_catalog_nbr: e.target.value})} />
                  <input placeholder="Class Nbr" className="border border-gray-300 px-2 py-1" value={newCourse.class_nbr} onChange={e => setNewCourse({...newCourse, class_nbr: e.target.value})} />
                  <input placeholder="Section" className="border border-gray-300 px-2 py-1" value={newCourse.class_section} onChange={e => setNewCourse({...newCourse, class_section: e.target.value})} />
                </div>
                <button type="submit" disabled={createCourse.isPending} className="bg-[#8B1A1A] text-white text-sm px-4 py-1.5 font-bold">Add Course</button>
              </form>
            </div>
            
            {/* Enroll Student */}
            <div className="bg-white p-4 shadow-sm border border-gray-200">
              <h2 className="font-bold text-lg mb-4 text-[#cc6600]">Enroll Student</h2>
              <form onSubmit={handleEnroll} className="flex gap-2 text-sm">
                <input placeholder="College ID" className="border border-gray-300 px-2 py-1 flex-1" value={enrollData.student_college_id} onChange={e => setEnrollData({...enrollData, student_college_id: e.target.value})} required />
                <input placeholder="Course Db ID" type="number" className="border border-gray-300 px-2 py-1 w-32" value={enrollData.course_id} onChange={e => setEnrollData({...enrollData, course_id: e.target.value})} required />
                <button type="submit" disabled={enrollStudent.isPending} className="bg-[#0066cc] text-white px-4 py-1 font-bold">Enroll</button>
              </form>
            </div>
            
            {/* Create Assignment */}
            <div className="bg-white p-4 shadow-sm border border-gray-200">
              <h2 className="font-bold text-lg mb-4 text-[#cc6600]">Add Assignment</h2>
              <form onSubmit={handleCreateAssignment} className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <input placeholder="Course Db ID" type="number" className="border border-gray-300 px-2 py-1" value={newAssignment.course_id} onChange={e => setNewAssignment({...newAssignment, course_id: e.target.value})} required />
                  <input placeholder="Assignment Name" className="border border-gray-300 px-2 py-1" value={newAssignment.assignment_name} onChange={e => setNewAssignment({...newAssignment, assignment_name: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <select className="border border-gray-300 px-2 py-1" value={newAssignment.category} onChange={e => setNewAssignment({...newAssignment, category: e.target.value})}>
                    <option>Mid-Term</option>
                    <option>End-Term</option>
                    <option>Quiz</option>
                    <option>Assignment</option>
                  </select>
                  <input placeholder="Max Marks" type="number" className="border border-gray-300 px-2 py-1" value={newAssignment.max_marks} onChange={e => setNewAssignment({...newAssignment, max_marks: e.target.value})} required />
                </div>
                <button type="submit" disabled={createAssignment.isPending} className="bg-[#8B1A1A] text-white text-sm px-4 py-1.5 font-bold">Add Assignment</button>
              </form>
            </div>
            
            {/* Update Marks */}
            <div className="bg-white p-4 shadow-sm border border-gray-200">
              <h2 className="font-bold text-lg mb-4 text-[#cc6600]">Enter Marks</h2>
              <form onSubmit={handleUpdateMarks} className="flex gap-2 text-sm">
                <input placeholder="College ID" className="border border-gray-300 px-2 py-1 w-28" value={markData.student_college_id} onChange={e => setMarkData({...markData, student_college_id: e.target.value})} required />
                <input placeholder="Assign ID" type="number" className="border border-gray-300 px-2 py-1 w-24" value={markData.assignment_id} onChange={e => setMarkData({...markData, assignment_id: e.target.value})} required />
                <input placeholder="Marks" type="number" step="0.5" className="border border-gray-300 px-2 py-1 flex-1" value={markData.marks} onChange={e => setMarkData({...markData, marks: e.target.value})} required />
                <button type="submit" disabled={updateMarks.isPending} className="bg-[#0066cc] text-white px-4 py-1 font-bold">Save</button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
