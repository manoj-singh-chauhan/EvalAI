import { PlayCircleIcon, ArrowRightIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection(): React.JSX.Element {
    return (
        <motion.section className="flex flex-col items-center py-20 md:py-32">

            {/* Badge */}
            <motion.div
                className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 rounded-full px-4 py-1.5 text-xs font-medium"
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                Smart, Fast & AI-Powered Evaluation
            </motion.div>

            {/* Heading */}
            <motion.h1
                className="text-center text-4xl md:text-6xl mt-6 font-semibold tracking-tight max-w-3xl text-gray-900 leading-tight"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
            >
                Evaluate Answer Sheets with{" "}
                <span className="text-teal-500">AI Precision</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
                className="text-center text-gray-500 text-base max-w-lg mt-5 leading-relaxed"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
                Upload question papers and student answer sheets. Get instant AI-powered scores, detailed feedback, and evaluation reports in seconds.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
                className="flex flex-col md:flex-row max-md:w-full items-center gap-3 mt-8"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
                <a
                    href="/question"
                    className="max-md:w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-medium px-6 py-3 rounded-lg transition active:scale-95"
                >
                    Start Evaluating
                    <ArrowRightIcon className="w-4 h-4" />
                </a>
                <a
                    href="#workflow"
                    className="max-md:w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-teal-300 text-gray-700 hover:text-teal-600 font-medium px-6 py-3 rounded-lg transition active:scale-95 bg-white"
                >
                    <PlayCircleIcon className="w-4 h-4" />
                    See How It Works
                </a>
            </motion.div>

            {/* Stats Row */}
            <motion.div
                className="flex flex-wrap justify-center gap-8 mt-14 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
            >
                {[
                    { value: "10x", label: "Faster Evaluation" },
                    { value: "99%", label: "Accuracy Rate" },
                    { value: "5K+", label: "Sheets Evaluated" },
                ].map((stat) => (
                    <div key={stat.label} className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-teal-500">{stat.value}</span>
                        <span className="text-xs text-gray-500 mt-1">{stat.label}</span>
                    </div>
                ))}
            </motion.div>

            {/* Hero Card Preview */}
            <motion.div
                className="mt-14 w-full max-w-3xl bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
            >
                {/* Fake browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="w-3 h-3 rounded-full bg-red-300" />
                    <div className="w-3 h-3 rounded-full bg-yellow-300" />
                    <div className="w-3 h-3 rounded-full bg-green-300" />
                    <div className="flex-1 mx-4 bg-gray-200 rounded-full h-5 flex items-center px-3">
                        <span className="text-xs text-gray-400">aieval.app/results</span>
                    </div>
                </div>

                {/* Fake dashboard preview */}
                <div className="p-6 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="font-semibold text-sm text-gray-800 flex items-center">
                                <span className="px-2 text-gray-800 text-sm font-semibold">Evaluation Dashboard</span>
                            </div>
                            <div className="h-2.5 w-48 bg-gray-100 rounded mt-2" />
                        </div>
                        <div className="flex gap-3">
                            {["Papers: 2", "Completed: 2", "Marks: 50"].map((item) => (
                                <div key={item} className="bg-teal-50 border border-teal-100 rounded-lg px-3 py-1.5 text-xs text-teal-700 font-medium">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        {[
                            { name: "Answer Sheet 1", score: "38 / 50", status: "Completed" },
                            { name: "Answer Sheet 2", score: "45 / 50", status: "Completed" },
                        ].map((row) => (
                            <div key={row.name} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                                <span className="text-sm text-gray-700 font-medium">{row.name}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-semibold text-gray-900">{row.score}</span>
                                    <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full">
                                        {row.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.section>
    );
}