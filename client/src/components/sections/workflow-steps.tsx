import { motion } from "framer-motion";
import SectionTitle from "../landing/section-title";
import { ArrowRightIcon } from "lucide-react";

type WorkflowStep = {
    id: number;
    title: string;
    description: string;
    link: string;
    image: string;
};

const steps: WorkflowStep[] = [
    {
        id: 1,
        title: "Create Your Question Paper",
        description: "Type or upload your exam question paper. Our AI instantly extracts all questions along with their marks — no manual setup needed.",
        link: "/question",
        image: "/assets/workflow1.png",
    },
    {
        id: 2,
        title: "Upload Student Answer Sheets",
        description: "Upload one or multiple student answer sheets as PDFs or images. Choose your marking strictness — Lenient, Moderate, or Strict.",
        link: "/question",
        image: "/assets/workflow2.png",
    },
    {
        id: 3,
        title: "Get AI Evaluation & Reports",
        description: "Receive instant scores, per-question feedback, and overall evaluation. Download detailed PDF reports for every student.",
        link: "/question",
        image: "/assets/workflow3.png",
    },
];

export default function WorkflowSteps(): React.JSX.Element {
    return (
        <section className="mt-32 relative" id="workflow">
            <SectionTitle
                title="Workflow"
                description="From question paper to evaluated results in three simple steps."
            />

            <motion.div
                className="relative space-y-20 md:space-y-28 mt-20"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                {/* Center timeline — desktop only */}
                <div className="flex-col items-center hidden md:flex absolute left-1/2 -translate-x-1/2">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-teal-500 text-white text-sm font-semibold my-10 shadow-md">
                        01
                    </div>
                    <div className="h-64 w-px bg-gradient-to-b from-teal-300 via-teal-100 to-transparent" />
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-teal-500 text-white text-sm font-semibold my-10 shadow-md">
                        02
                    </div>
                    <div className="h-64 w-px bg-gradient-to-b from-teal-300 via-teal-100 to-transparent" />
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-teal-500 text-white text-sm font-semibold my-10 shadow-md">
                        03
                    </div>
                </div>

                {steps.map((step: WorkflowStep, index: number) => (
                    <motion.div
                        key={index}
                        className={`flex items-center justify-center gap-6 md:gap-20 ${index % 2 !== 0 ? 'flex-col md:flex-row-reverse' : 'flex-col md:flex-row'}`}
                        initial={{ y: 80, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        {/* Image */}
                        <div className="flex-1 max-w-sm w-full">
                            <img
                                src={step.image}
                                alt={`Step ${step.id}`}
                                className="w-full h-auto rounded-2xl border border-gray-100 shadow-md"
                            />
                        </div>

                        {/* Text */}
                        <div className="flex-1 flex flex-col gap-4 md:px-6 max-w-md">
                            {/* Mobile step number */}
                            <span className="inline-flex md:hidden items-center justify-center w-8 h-8 rounded-full bg-teal-500 text-white text-xs font-semibold">
                                0{step.id}
                            </span>

                            <h3 className="text-2xl font-semibold text-gray-900">
                                {step.title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-6">
                                {step.description}
                            </p>
                            <a
                                href={step.link}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition"
                            >
                                Get Started
                                <ArrowRightIcon className="w-4 h-4" />
                            </a>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}