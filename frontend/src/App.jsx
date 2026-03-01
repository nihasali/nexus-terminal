import React,{useEffect,useRef} from 'react'
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Signup from './components/Signup';
import VerifyOTP from './components/VerifyOTP';
import Login from './components/Login';
import SchoolDashboard from './pages/school/Schooldashboard';
import ProtectedRoute from "./components/ProtectedRoute";
import { useDispatch,useSelector } from "react-redux";
import { loadUserThunk } from "./redux/authSlice";
// import PublicRoute from "./components/PublicRoute";
import CreateTeacher from "./pages/school/CreateTeacher";
import SetPassword from "./pages/school/SetPassword";
import TeacherList from "./pages/school/TeacherList";
import TeacherDetail from './pages/school/TeacherDetail';
import TeacherEdit from './pages/school/TeacherEdit';
import SchoolRoute from "./components/SchoolRoute";
import TeacherRoute from "./components/TeacherRoute";
import TeacherProfileRoute from './components/TeacherProfileRoute';
import TeacherProfileComplete from "./pages/teacher/TeacherProfileComplete";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherEditProfile from './pages/teacher/TeacherEditProfile';
import StudentList from './pages/school/StudentList';
import StudentDetail from './pages/school/StudentDetail';
import CreateStudent from './pages/school/StudentCreate';
import StudentEdit from './pages/school/StudentEdit';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentRoute from './components/StudentRoute';
import CreateParent from './pages/school/CreateParent';
import ParentList from './pages/school/ParentList';
import ParentDetail from './pages/school/ParentDetail';
import ParentEdit from './pages/school/ParentEdit';
import ParentRoute from './components/ParentRoute';
import ParentDashboard from './pages/parent/ParentDashboard';
import ParentProfile from './pages/parent/ParentProfile';
import StudentProfile from './pages/student/StudentProfile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ClassList from './pages/school/ClassList';
import ClassDetail from './pages/school/ClassDetail';
import CreateClass from './pages/school/CreateClass';
import SubjectList from './pages/school/SubjectList';


function App() {
  const dispatch = useDispatch();
  const loading = useSelector(state => state.auth.loading);

  const called = useRef(false);

  useEffect(() => {
    if (!called.current) {
      dispatch(loadUserThunk());
      called.current = true;
    }
  }, [dispatch]);
  
  if (loading) {
    return <h3>Loading...</h3>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/*--------------------------------------------------------------- public root--------------------------------------------------------- */}
        
        <Route path='/' element={<Signup/> } />
        <Route path='/signup' element={<Signup/> } />
        <Route path='/verify-otp' element={<VerifyOTP/> } />
        <Route path='/login' element={<Login/>} />
        <Route path='/set-password/:token' element={<SetPassword />} />
        <Route path="/forgot-password"       element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* -------------------------------------------------------------------------------------------------------------------------------------------*/}

        {/* -------------------------------------------------------------school private root---------------------------------------------------------- */}
        
        <Route path="/Schooldashboard" element={<SchoolRoute> <SchoolDashboard /> </SchoolRoute>} />
        <Route path="/create-teacher" element={<SchoolRoute><CreateTeacher /></SchoolRoute>}/>
        <Route path='/school-teacherlist' element={<SchoolRoute> <TeacherList/> </SchoolRoute>} ></Route>
        <Route path='/school-teacher-details/:id' element={<SchoolRoute> <TeacherDetail/> </SchoolRoute>} ></Route>
        <Route path='/school-teacher/edit/:id' element={<SchoolRoute> <TeacherEdit/> </SchoolRoute>} ></Route>
        <Route path="/school-students/list/" element={<SchoolRoute><StudentList /></SchoolRoute>} />
        <Route path="/school-student-details/:id" element={<SchoolRoute><StudentDetail /></SchoolRoute>} />
        <Route path="/school-student-edit/:id" element={<SchoolRoute><StudentEdit /></SchoolRoute>} />
        <Route path="/school-student-create/" element={<SchoolRoute><CreateStudent /></SchoolRoute>} />
        <Route path="/school-parents/create/" element={<SchoolRoute><CreateParent /></SchoolRoute>} />
        <Route path="/school-parents/list/" element={<SchoolRoute><ParentList /></SchoolRoute>} />
        <Route path="/school-parents/details/:id" element={<SchoolRoute><ParentDetail /></SchoolRoute>} />
        <Route path="/school-parents/edit/:id" element={<SchoolRoute><ParentEdit /></SchoolRoute>} />
        <Route path="/school-classes"          element={<SchoolRoute><ClassList /></SchoolRoute>} />
        <Route path="/school-classes/create"   element={<SchoolRoute><CreateClass /></SchoolRoute>} />
        <Route path="/school-classes/:id"      element={<SchoolRoute><ClassDetail /></SchoolRoute>} />
        <Route path="/school-subjects" element={<SchoolRoute> <SubjectList /> </SchoolRoute>} />



        

        {/* --------------------------------------------------Teacher private root-------------------------------------------------------------------- */}

        <Route path="/teacher/dashboard" element={ <TeacherProfileRoute> <TeacherDashboard /> </TeacherProfileRoute>}/>
        <Route path="/teacher/complete-profile" element={<TeacherProfileRoute> <TeacherProfileComplete /> </TeacherProfileRoute>}/>
        <Route path="/teacher/profile" element={ <TeacherRoute> <TeacherProfile /> </TeacherRoute>}/>
        <Route path="/teacher/edit-profile" element={ <TeacherRoute> <TeacherEditProfile /></TeacherRoute>}/>


        {/* --------------------------------------------------student private root-------------------------------------------------------------------- */}
        
        <Route path='/student/dashboard' element={<StudentRoute><StudentDashboard/></StudentRoute>}/>
        <Route path='/student/profile' element={<StudentRoute><StudentProfile/></StudentRoute>}/>

        {/* --------------------------------------------------Parent private root-------------------------------------------------------------------- */}

        <Route path='/parent/dashboard' element={<ParentRoute><ParentDashboard/></ParentRoute>} />
        <Route path='/parent/profile' element={<ParentRoute><ParentProfile/></ParentRoute>} />


      </Routes>
    </BrowserRouter>
  )
}

export default App