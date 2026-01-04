import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import DashBoard from './pages/Dashbord'
import ResumeBuilder from './pages/ResumeBuilder'
import Preview from './pages/Preview'
import Login from './pages/Login'
import { useDispatch } from 'react-redux'
import api from './config/api'
import { login, setLoading } from './app/featurs/authSlice'
import {Toaster} from 'react-hot-toast'

const App = () => {

  const dispatch = useDispatch()

  const getUserData = async () =>{
    const token = localStorage.getItem('token')
    try {
      if(token){
        const {data} = await api.get('/api/users/data',
          {headers : {Authorization:token}}
        )
        if(data.user){
          dispatch(login({token,user:data.user}))
        }
        dispatch(setLoading(false))
      }
      else{
        dispatch(setLoading(false))
      }
    } catch (error) {
      dispatch(setLoading(false))
      console.log(error.message)
      
    }
  }
  //dependancy function
  useEffect(()=>{
    getUserData()
  },[])

  return (
    <>
    <Toaster/>
      <Routes>
        <Route path='/' element={<Home />}/> 
        <Route path='/app' element={<Layout />}>
          < Route index element={<DashBoard />} />
          <Route path='builder/:resumeId' element={<ResumeBuilder />} />
        </Route>

        <Route path='view/:resumeId' element={<Preview />}/>
        

      </Routes>
    </>
  )
}

export default App
