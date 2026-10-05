import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import ResidencyRoute from './pages/ResidencyRoute'
import Videographer from './pages/Videographer'
import NotFound from './pages/NotFound'
import PrivacyPolicy from './pages/PrivacyPolicy'
import MembershipTerms from './pages/MembershipTerms'
import Membership from './pages/Membership'
import StudioFinder from './components/StudioFinder'
import ScrollToTop from './components/ScrollToTop'
import { FINDER_PATH, backgroundOf } from './lib/studioFinderRoute'

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Nav />
        <AppRoutes />
        <Footer />
        <ChatWidget />
        <StudioFinder />
      </BrowserRouter>
    </HelmetProvider>
  )
}

function AppRoutes() {
  // While the Studio finder overlay is open, keep rendering the page it was
  // opened from. A direct visit to /find-your-studio has no background page,
  // so its own route renders Home underneath.
  const location = useLocation()
  const page = backgroundOf(location) ?? location
  return (
    <>
      <ScrollToTop location={page} />
      <Routes location={page}>
        <Route path="/" element={<Home />} />
        <Route path="/studios" element={<Navigate to="/dj-studio" replace />} />
        <Route path="/dj-studio" element={<DjStudios />} />
        <Route path="/main-production-studio" element={<ProductionStudio />} />
        <Route path="/production-studio" element={<Navigate to="/main-production-studio" replace />} />
        <Route path="/podcast-studio" element={<PodcastStudio />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/residency" element={<ResidencyRoute />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/videographer" element={<Videographer />} />
        <Route path="/apply" element={<Navigate to="/residency" replace />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/membership-terms" element={<MembershipTerms />} />
        <Route path={FINDER_PATH} element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
