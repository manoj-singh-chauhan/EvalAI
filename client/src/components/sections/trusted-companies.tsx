import { motion } from "framer-motion";

export default function TrustedCompanies(): React.JSX.Element {
    const logos: string[] = [
        '/assets/company-logo-1.svg',
        '/assets/company-logo-2.svg',
        '/assets/company-logo-3.svg',
        '/assets/company-logo-4.svg',
        '/assets/company-logo-5.svg',
    ];

    return (
        <motion.section
            className="mt-8"
            initial={{ y: 150, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 70, mass: 1 }}
        >
            <p className="text-center text-gray-400 text-xs font-medium tracking-widest uppercase mb-6">
                Trusted by leading institutions & brands
            </p>

            <div className="relative max-w-4xl w-full mx-auto">
                {/* Fade edges — match #f1f5f9 background */}
                <div className="absolute left-0 top-0 h-full w-16 z-10 pointer-events-none"
                    style={{ background: 'linear-gradient(to right, #f1f5f9, transparent)' }} />
                <div className="absolute right-0 top-0 h-full w-16 z-10 pointer-events-none"
                    style={{ background: 'linear-gradient(to left, #f1f5f9, transparent)' }} />

                <div className="flex flex-wrap justify-between max-sm:justify-center gap-8 px-8">
                    {logos.map((logo: string, index: number) => (
                        <img
                            key={index}
                            src={logo}
                            alt="company logo"
                            className="h-6 w-auto max-w-xs transition duration-300"
                            style={{ filter: 'brightness(0) opacity(0.35)' }}
                            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0) opacity(0.65)')}
                            onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(0) opacity(0.35)')}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-8 border-t border-slate-200" />
        </motion.section>
    );
}