// pages/_app.tsx (ou app/layout.tsx si App Router)
import 'react-quill/dist/quill.snow.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../index.css'
import React, { useState } from 'react'
import { AppProps } from 'next/app'
import { ClerkProvider } from '@clerk/nextjs'
import Sidebar from '../components/SideBar'
import Header from '../components/Header'
import Footer from '../components/Footer'

function MyApp({ Component, pageProps }: AppProps) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <div className="bg-violet-300 bg-opacity-10 min-h-screen">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex flex-col min-h-screen lg:ml-64">
          <Header setIsSidebarOpen={setIsSidebarOpen} />
          <main className="flex-grow">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </div>
    </ClerkProvider>
  )
}

export default MyApp
