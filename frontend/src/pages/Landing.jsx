import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import Stats from "../components/Stats"
import Features from "../components/Features"
import HowItWorks from "../components/HowItWorks"
import CTA from "../components/CTA"
import Footer from "../components/Footer"
import DashboardPreview from "../components/DashboardPreview"

function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <DashboardPreview />
      <Stats />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </>
  )
}

export default Landing