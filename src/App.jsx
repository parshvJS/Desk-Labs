import { useState } from 'react'
import './App.css'
import Root_layout from './myComponents/Root_layout'
import Main from './pages/Main'

import { Route, Routes } from "react-router-dom";
import { Toaster } from './components/ui/toaster';
import Posts from './pages/Posts';
import GetIns from './pages/GetIns';
import CreatePostForm from './pages/CreatePostForm';
import Profile from './pages/Profile';
import { QueryClient, QueryClientProvider } from 'react-query';
import PostDetail from './myComponents/PostDetail';

function App() {
  const queryClient = new QueryClient()
  return (
    <>
      <QueryClientProvider client={queryClient}>

        <div className='w-screen h-screen'>
          <Routes>
            {/* user route */}
            {/* <Route path='/user/log-in' element={<Login />} />
        <Route path='/user/sign-in' element={<SignIn />} /> */}
            <Route element={<Root_layout />} >
              <Route path="/" index element={<Main />} />
              <Route path="/post" element={<Posts />} />
              <Route path="/post/:id/:caption" element={<PostDetail />} />
              <Route path="/inspired" element={<GetIns />} />
              <Route path="/create-new-post" element={<CreatePostForm />} />
              <Route path="/profile/:id" element={<Profile />} />
            </Route>
          </Routes>
          <Toaster />
        </div>
      </QueryClientProvider>

    </>
  )
}

export default App
