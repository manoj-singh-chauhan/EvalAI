import { ArrowRightIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";

export default function CallToAction(): React.JSX.Element {
    const { isSignedIn } = useUser();

    return (
        <motion.div
            className="flex flex-col max-w-5xl mt-40 px-4 mx-auto items-center justify-center text-center py-16 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600"
            initial={{ y: 150, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
        >
            <motion.h2
                className="text-2xl md:text-4xl font-semibold mt-2 text-white"
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
            >
                Ready to evaluate smarter?
            </motion.h2>
            <motion.p
                className="mt-4 text-sm leading-7 max-w-md text-teal-100"
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 70, mass: 1 }}
            >
                See how fast you can evaluate answer sheets with AI. Get started for free, no credit card required.
            </motion.p>
            <motion.a
                href={isSignedIn ? '/question' : '/sign-up'}
                className="flex items-center gap-2 mt-8 bg-white text-teal-600 hover:bg-teal-50 font-semibold text-sm px-6 py-3 rounded-lg transition active:scale-95"
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
            >
                Try now
                <ArrowRightIcon className="w-4 h-4" />
            </motion.a>
        </motion.div>
    );
}