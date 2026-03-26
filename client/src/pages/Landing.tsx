import { useEffect } from "react";
import LenisScroll from "../components/landing/lenis-scroll";
import Navbar from "../components/landing/navbar";
import Footer from "../components/landing/footer";
import HeroSection from "../components/sections/hero-section";
import FaqSection from "../components/sections/faq-section";
import TrustedCompanies from "../components/sections/trusted-companies";
import Features from "../components/sections/features";
import WorkflowSteps from "../components/sections/workflow-steps";
import Testimonials from "../components/sections/testimonials";
import PricingPlans from "../components/sections/pricing-plans";
import CallToAction from "../components/sections/call-to-action";

export default function Landing(): React.JSX.Element {

    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        html.classList.add('custom-scroll');
        body.classList.add('custom-scroll');
        return () => {
            html.classList.remove('custom-scroll');
            body.classList.remove('custom-scroll');
        };
    }, []);

    return (
        <div
            className="text-gray-900 text-sm antialiased"
            style={{
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: '#f1f5f9',
                backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
                backgroundSize: '28px 28px',
            }}
        >
            <LenisScroll />
            <Navbar />
            <main className="px-4">
                <HeroSection />
                <TrustedCompanies />
                <Features />
                <WorkflowSteps />
                <Testimonials />
                <FaqSection />
                <PricingPlans />
                <CallToAction />
            </main>
            <Footer />
        </div>
    );
}