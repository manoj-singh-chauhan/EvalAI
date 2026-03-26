import SectionTitle from "../landing/section-title";
import { StarIcon } from "lucide-react";

type TestimonialItem = {
    review: string;
    name: string;
    about: string;
    rating: number;
    image: string;
};

const data: TestimonialItem[] = [
    {
        review: 'AI Eval saved us hours of manual checking. The accuracy is incredible — it evaluates exactly how a teacher would.',
        name: 'Dr. Priya Sharma',
        about: 'Professor, Delhi University',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200',
    },
    {
        review: 'We evaluated 200 answer sheets in under 10 minutes. The detailed per-question feedback is a game changer.',
        name: 'Rahul Mehta',
        about: 'School Principal',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
    },
    {
        review: 'The strictness levels are brilliant. Moderate mode gives fair marks just like an experienced examiner would.',
        name: 'Anjali Verma',
        about: 'Exam Coordinator',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60',
    },
    {
        review: 'Uploading PDFs and getting instant scores with AI feedback — this is exactly what education needed.',
        name: 'Mohammed Al-Hassan',
        about: 'EdTech Consultant',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60',
    },
    {
        review: 'The downloadable PDF reports are professional and detailed. Our parents love receiving them after exams.',
        name: 'Sarah Thompson',
        about: 'Academic Director',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&h=100&auto=format&fit=crop',
    },
    {
        review: 'Incredibly easy to use. Type the questions, upload the sheets, done. The AI understands context beautifully.',
        name: 'Neha Kapoor',
        about: 'Senior Lecturer',
        rating: 5,
        image: 'https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/userImage/userImage1.png',
    },
    {
        review: 'Best evaluation tool I have used. The AI feedback helps students understand where they went wrong.',
        name: 'James Whitfield',
        about: 'High School Teacher',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
    },
    {
        review: 'Reduced our exam correction time by 80%. Highly recommended for any institution running large exams.',
        name: 'Dr. Kavitha Reddy',
        about: 'Head of Academics',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200',
    },
];

function TestimonialCard({ item }: { item: TestimonialItem }) {
    return (
        <div className="w-72 flex-shrink-0 space-y-4 rounded-xl border border-gray-100 bg-white shadow-sm p-5 mx-3">
            <div className="flex items-center gap-0.5">
                {Array.from({ length: item.rating }).map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                "{item.review}"
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                <img
                    className="w-9 h-9 rounded-full object-cover"
                    src={item.image}
                    alt={item.name}
                />
                <div>
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.about}</p>
                </div>
            </div>
        </div>
    );
}

export default function Testimonials(): React.JSX.Element {
    // Triplicate for perfectly seamless loop
    const row = [...data, ...data, ...data];

    return (
        <section className="mt-32 flex flex-col items-center overflow-hidden">
            <SectionTitle
                title="Testimonials"
                description="Trusted by educators, professors, and institutions who evaluate smarter with AI."
            />

            <div className="mt-12 w-full">
                <div
                    className="flex overflow-hidden"
                    style={{ maskImage: 'linear-gradient(to right, transparent, white 8%, white 92%, transparent)' }}
                >
                    <div
                        className="flex"
                        style={{ animation: 'marquee-left 35s linear infinite', width: 'max-content' }}
                        onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
                        onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
                    >
                        {row.map((item, index) => (
                            <TestimonialCard key={index} item={item} />
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes marquee-left {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                }
            `}</style>
        </section>
    );
}