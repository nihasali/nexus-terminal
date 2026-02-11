import React,{useEffect,useRef} from 'react'
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Signup from './components/Signup';
import VerifyOTP from './components/VerifyOTP';
import Login from './components/Login';
import SchoolDashboard from './pages/school/Schooldashboard';
import ProtectedRoute from "./components/ProtectedRoute";
import { useDispatch,useSelector } from "react-redux";
import { loadUserThunk } from "./redux/authSlice";
import PublicRoute from "./components/PublicRoute";
import CreateTeacher from "./pages/school/CreateTeacher";
import SetPassword from "./pages/school/SetPassword";
import TeacherList from "./pages/school/TeacherList";
import TeacherDetail from './pages/school/TeacherDetail';
import TeacherEdit from './pages/school/TeacherEdit';

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
        
        <Route path='/' element={<PublicRoute><Signup/> </PublicRoute> } />
        <Route path='/signup' element={<PublicRoute><Signup/> </PublicRoute> } />
        <Route path='/verify-otp' element={<PublicRoute><VerifyOTP/> </PublicRoute> } />
        <Route path='/login' element={<PublicRoute><Login/></PublicRoute>} />
        <Route path='/set-password/:token' element={<SetPassword />} />

        {/* -------------------------------------------------------------------------------------------------------------------------------------------*/}

        {/* -------------------------------------------------------------school private root---------------------------------------------------------- */}
        
        <Route path="/Schooldashboard" element={<ProtectedRoute> <SchoolDashboard /> </ProtectedRoute>} />
        <Route path="/create-teacher" element={<ProtectedRoute><CreateTeacher /></ProtectedRoute>}/>
        <Route path='/school-teacherlist' element={<ProtectedRoute> <TeacherList/> </ProtectedRoute>} ></Route>
        <Route path='/school-teacher-details/:id' element={<ProtectedRoute> <TeacherDetail/> </ProtectedRoute>} ></Route>
        <Route path='/school-teacher/edit/:id' element={<ProtectedRoute> <TeacherEdit/> </ProtectedRoute>} ></Route>


        {/* ------------------------------------------------------------------------------------------------------------------------------------------ */}

        
      </Routes>
    </BrowserRouter>
  )
}

export default App