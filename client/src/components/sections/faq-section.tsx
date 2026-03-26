import SectionTitle from '../landing/section-title';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { motion } from "framer-motion";

type FaqItem = {
    question: string;
    answer: string;
};

export default function FaqSection(): React.JSX.Element {
    const [isOpen, setIsOpen] = useState<number | null>(null);

    const data: FaqItem[] = [
        {
            question: 'How does AI Eval evaluate answer sheets?',
            answer: 'AI Eval uses advanced AI to read and understand student answers, comparing them against the questions and marking criteria. It assigns scores per question with detailed feedback, just like a human examiner would.',
        },
        {
            question: 'What file formats are supported for answer sheet upload?',
            answer: 'You can upload answer sheets as PDF, JPG, or PNG files. Multiple sheets can be uploaded in a single session for batch evaluation.',
        },
        {
            question: 'What is the difference between Lenient, Moderate, and Strict marking?',
            answer: 'Lenient gives full credit for showing understanding even with minor errors. Moderate is a balanced approach with fair partial credit — ideal for standard exams. Strict requires precision and complete answers for full marks.',
        },
        {
            question: 'How accurate is the AI evaluation?',
            answer: 'Our AI achieves over 99% accuracy on structured answers. It understands context, partial answers, and concept-based responses — not just keyword matching.',
        },
        {
            question: 'Can I review and edit the AI evaluation results?',
            answer: 'Yes, you can view detailed per-question breakdowns, AI feedback, and scores. The results page lets you review everything before downloading the final report.',
        },
        {
            question: 'Can I download the evaluation results?',
            answer: 'Yes! You can download a complete evaluation record as a PDF for every student. The report includes scores, AI feedback, and overall remarks.',
        },
    ];

    return (
        <section className='mt-32' id="faq">
            <SectionTitle
                title="FAQ's"
                description="Everything you need to know about AI-powered answer sheet evaluation."
            />
            <div className='mx-auto mt-12 space-y-3 w-full max-w-2xl'>
                {data.map((item: FaqItem, index: number) => (
                    <motion.div
                        key={index}
                        className='rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm'
                        initial={{ y: 60, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.08, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <h3
                            className='flex cursor-pointer items-start justify-between gap-4 p-4 font-medium text-sm text-gray-900 hover:bg-gray-50 transition-colors'
                            onClick={() => setIsOpen(isOpen === index ? null : index)}
                        >
                            {item.question}
                            <ChevronDownIcon
                                className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${isOpen === index ? 'rotate-180 text-teal-500' : ''}`}
                            />
                        </h3>
                        <div className={`px-4 text-sm text-gray-500 leading-6 overflow-hidden transition-all duration-300 ${isOpen === index ? 'pt-0 pb-4 max-h-40' : 'max-h-0'}`}>
                            {item.answer}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}