import { MenuIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";

type NavLink = { name: string; href: string };

export default function Navbar(): React.JSX.Element {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const { isSignedIn } = useUser();

    const links: NavLink[] = [
        { name: 'Home', href: '/' },
        { name: 'Features', href: '#features' },
        { name: 'Workflow', href: '#workflow' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'FAQ', href: '#faq' }
    ];

    useEffect(() => {
        const handleScroll = (): void => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <motion.nav
                className={`sticky top-0 z-50 flex w-full items-center justify-between px-4 py-3.5 md:px-16 lg:px-24 transition-all duration-300 ${isScrolled ? 'backdrop-blur-lg shadow-sm border-b border-slate-200' : 'bg-transparent'}`}
                style={isScrolled ? { backgroundColor: 'rgba(241, 245, 249, 0.85)' } : {}}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
            >
                <a href='/' className='flex items-center gap-2'>
                    <div className='flex items-center justify-center w-8 h-8 rounded-md bg-teal-500 text-white font-bold text-sm'>
                        AE
                    </div>
                    <span className='font-semibold text-gray-900 text-base'>AI Eval</span>
                </a>

                <div className='hidden items-center space-x-8 md:flex'>
                    {links.map((link: NavLink) => (
                        <a key={link.name} href={link.href} className='text-gray-600 text-sm font-medium transition hover:text-teal-600'>
                            {link.name}
                        </a>
                    ))}
                </div>

                <div className='hidden items-center gap-3 md:flex'>
                    {isSignedIn ? (
                        <a href='/question' className='text-sm font-medium bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition active:scale-95'>
                            Go to Dashboard
                        </a>
                    ) : (
                        <>
                            <a href='/sign-in' className='text-sm font-medium text-gray-700 transition hover:text-teal-600'>
                                Sign In
                            </a>
                            <a href='/sign-up' className='text-sm font-medium bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition active:scale-95'>
                                Get Started
                            </a>
                        </>
                    )}
                </div>

                <button onClick={() => setIsOpen(true)} className='text-gray-700 transition active:scale-90 md:hidden'>
                    <MenuIcon className='w-6 h-6' />
                </button>
            </motion.nav>

            <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 text-base font-medium transition-transform duration-300 md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ backgroundColor: '#f1f5f9' }}
            >
                <div className='flex items-center gap-2 mb-4'>
                    <div className='flex items-center justify-center w-8 h-8 rounded-md bg-teal-500 text-white font-bold text-sm'>
                        AE
                    </div>
                    <span className='font-semibold text-gray-900 text-base'>AI Eval</span>
                </div>

                {links.map((link: NavLink) => (
                    <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className='text-gray-700 hover:text-teal-600 transition'>
                        {link.name}
                    </a>
                ))}

                <div className='flex flex-col items-center gap-3 mt-4'>
                    {isSignedIn ? (
                        <a href='/question' onClick={() => setIsOpen(false)} className='text-sm font-medium bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition active:scale-95'>
                            Go to Dashboard
                        </a>
                    ) : (
                        <>
                            <a href='/sign-in' onClick={() => setIsOpen(false)} className='text-sm font-medium text-gray-700 hover:text-teal-600 transition'>
                                Sign In
                            </a>
                            <a href='/sign-up' onClick={() => setIsOpen(false)} className='text-sm font-medium bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition active:scale-95'>
                                Get Started
                            </a>
                        </>
                    )}
                </div>

                <button onClick={() => setIsOpen(false)} className='mt-4 p-2 rounded-lg border border-slate-200 text-gray-500 hover:text-gray-700 transition'>
                    <XIcon className='w-5 h-5' />
                </button>
            </div>
        </>
    );
}