import SectionTitle from "../landing/section-title";
import { FileTextIcon, BrainIcon, ZapIcon, ShieldCheckIcon, BarChart2Icon, DownloadIcon, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";

type FeatureItem = {
    icon: LucideIcon;
    title: string;
    description: string;
    color: string;
    bg: string;
};

export default function Features(): React.JSX.Element {
    const refs = useRef<(HTMLDivElement | null)[]>([]);

    const featuresData: FeatureItem[] = [
        {
            icon: FileTextIcon,
            title: "Smart Question Extraction",
            description: "Upload or type your question paper and AI instantly extracts all questions with their marks.",
            color: "text-teal-600",
            bg: "bg-teal-50",
        },
        {
            icon: BrainIcon,
            title: "AI-Powered Evaluation",
            description: "Our AI deeply understands student answers and evaluates them with human-level accuracy.",
            color: "text-violet-600",
            bg: "bg-violet-50",
        },
        {
            icon: ZapIcon,
            title: "Instant Results",
            description: "Get detailed scores and feedback in seconds — no waiting, no manual effort.",
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            icon: ShieldCheckIcon,
            title: "Flexible Strictness",
            description: "Choose Lenient, Moderate, or Strict marking to match your evaluation standards.",
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            icon: BarChart2Icon,
            title: "Detailed Analytics",
            description: "View per-question breakdowns, overall scores, and AI feedback for every student.",
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            icon: DownloadIcon,
            title: "Downloadable Reports",
            description: "Export complete evaluation records as PDF for sharing or offline review.",
            color: "text-rose-600",
            bg: "bg-rose-50",
        },
    ];

    return (
        <section className="mt-32" id="features">
            <SectionTitle
                title="Features"
                description="Everything you need to evaluate answer sheets accurately — powered by AI."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12 px-4 max-w-5xl mx-auto">
                {featuresData.map((feature: FeatureItem, index: number) => (
                    <motion.div
                        key={index}
                        ref={(el: HTMLDivElement | null) => { refs.current[index] = el; }}
                        className="group p-6 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 space-y-4 w-full transition duration-300"
                        initial={{ y: 60, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{
                            delay: index * 0.1,
                            type: "spring",
                            stiffness: 320,
                            damping: 70,
                            mass: 1,
                        }}
                    >
                        {/* Icon */}
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${feature.bg}`}>
                            <feature.icon className={`w-5 h-5 ${feature.color}`} />
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-semibold text-gray-900">
                            {feature.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-500 leading-relaxed">
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}