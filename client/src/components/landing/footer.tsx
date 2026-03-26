import { GithubIcon, LinkedinIcon, TwitterIcon } from "lucide-react";
import { motion } from "framer-motion";

type NavLink = { name: string; href: string };

export default function Footer(): React.JSX.Element {
    const links: NavLink[] = [
        { name: 'Terms of Service', href: '#terms-of-service' },
        { name: 'Privacy Policy', href: '#privacy-policy' },
        { name: 'Security', href: '#security' },
        { name: 'Sitemap', href: '#sitemap' },
    ];

    return (
        <motion.footer
            className="flex flex-col items-center px-4 md:px-16 lg:px-24 justify-center w-full pt-16 mt-40 border-t border-slate-200"
            style={{
                backgroundColor: '#f1f5f9',
                backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
                backgroundSize: '28px 28px',
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            {/* Logo */}
            <a href='/' className='flex items-center gap-2'>
                <div className='flex items-center justify-center w-8 h-8 rounded-md bg-teal-500 text-white font-bold text-sm'>
                    AE
                </div>
                <span className='font-semibold text-gray-900 text-base'>AI Eval</span>
            </a>

            {/* Nav Links */}
            <div className="flex flex-wrap items-center justify-center gap-8 py-8">
                {links.map((link: NavLink, index: number) => (
                    <a key={index} href={link.href} className='text-sm text-gray-500 transition hover:text-teal-600'>
                        {link.name}
                    </a>
                ))}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-6 pb-6">
                <a href="#" className="hover:-translate-y-0.5 text-gray-400 hover:text-teal-500 transition-all duration-300">
                    <LinkedinIcon className="w-5 h-5" />
                </a>
                <a href="#" className="hover:-translate-y-0.5 text-gray-400 hover:text-teal-500 transition-all duration-300">
                    <TwitterIcon className="w-5 h-5" />
                </a>
                <a href="#" className="hover:-translate-y-0.5 text-gray-400 hover:text-teal-500 transition-all duration-300">
                    <GithubIcon className="w-5 h-5" />
                </a>
            </div>

            {/* Bottom bar */}
            <hr className="w-full border-slate-200 mt-2" />
            <div className="flex flex-col md:flex-row items-center w-full justify-between gap-4 py-5">
                <p className="text-sm text-gray-400">AI-powered answer sheet evaluation</p>
                <p className="text-sm text-gray-400">Copyright © 2025 <span className="text-gray-600 font-medium">AI Eval</span>. All rights reserved.</p>
            </div>
        </motion.footer>
    );
}