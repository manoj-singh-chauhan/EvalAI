import { motion } from "framer-motion";

type SectionTitleProps = {
    title: string;
    description: string;
};

export default function SectionTitle({ title, description }: SectionTitleProps): React.JSX.Element {
    return (
        <div className="text-center">
            <motion.span
                className="inline-block text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-200 rounded-full px-3 py-1 uppercase tracking-widest mb-3"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
                {title}
            </motion.span>
            <motion.p
                className="mt-4 text-center text-sm leading-7 text-gray-500 max-w-md mx-auto"
                initial={{ y: 120, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
            >
                {description}
            </motion.p>
        </div>
    );
}