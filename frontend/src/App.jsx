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
        {/*--------------------------------------------------------------- school public root--------------------------------------------------------- */}
        
        <Route path='/' element={<Signup/> } />
        <Route path='/signup' element={<Signup/> } />
        <Route path='/verify-otp' element={<VerifyOTP/> } />
        <Route path='/login' element={<Login/>} />
        <Route path='/set-password/:token' element={<SetPassword />} />

        {/* -------------------------------------------------------------------------------------------------------------------------------------------*/}

        {/* -------------------------------------------------------------school private root---------------------------------------------------------- */}
        
        <Route path="/Schooldashboard" element={<SchoolRoute> <SchoolDashboard /> </SchoolRoute>} />
        <Route path="/create-teacher" element={<SchoolRoute><CreateTeacher /></SchoolRoute>}/>
        <Route path='/school-teacherlist' element={<SchoolRoute> <TeacherList/> </SchoolRoute>} ></Route>
        <Route path='/school-teacher-details/:id' element={<SchoolRoute> <TeacherDetail/> </SchoolRoute>} ></Route>
        <Route path='/school-teacher/edit/:id' element={<SchoolRoute> <TeacherEdit/> </SchoolRoute>} ></Route>

        

        {/* --------------------------------------------------Teacher private root-------------------------------------------------------------------- */}

        <Route path="/teacher/dashboard" element={ <TeacherProfileRoute> <TeacherDashboard /> </TeacherProfileRoute>}/>
        <Route path="/teacher/complete-profile" element={<TeacherProfileRoute> <TeacherProfileComplete /> </TeacherProfileRoute>}/>
        <Route path="/teacher/profile" element={ <TeacherRoute> <TeacherProfile /> </TeacherRoute>}/>
        <Route path="/teacher/edit-profile" element={ <TeacherRoute> <TeacherEditProfile /></TeacherRoute>}/>


        
      </Routes>
    </BrowserRouter>
  )
}

export default App