import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Nav from './components/Nav'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import Home from './pages/Home'
import DjStudios from './pages/DjStudios'
import ProductionStudio from './pages/ProductionStudio'
import PodcastStudio from './pages/PodcastStudio'
import About from './pages/About'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/studios" element={<Navigate to="/dj-studio" replace />} />
          <Route path="/dj-studio" element={<DjStudios />} />
          <Route path="/main-production-studio" element={<ProductionStudio />} />
          <Route path="/production-studio" element={<Navigate to="/main-production-studio" replace />} />
          <Route path="/podcast-studio" element={<PodcastStudio />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <ChatWidget />
      </BrowserRouter>
    </HelmetProvider>
  )
}
