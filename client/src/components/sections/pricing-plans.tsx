import SectionTitle from "../landing/section-title";
import { CheckIcon, ZapIcon, StarIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingPlans(): React.JSX.Element {

    const plans = [
        {
            title: 'Free',
            description: 'For getting started',
            price: '₹0',
            period: '/forever',
            buttonText: 'Get Started Free',
            buttonStyle: 'border border-gray-200 text-gray-700 hover:border-teal-300 hover:text-teal-600 bg-white',
            mostPopular: false,
            features: [
                'Limited Credits / Day',
                'Standard Speed',
                'Basic Support',
                'Up to 3 evaluations',
                'PDF & Image upload',
            ],
            featureActive: [true, true, true, false, false],
        },
        {
            title: 'Pro Monthly',
            description: 'For serious educators',
            price: '₹499',
            period: '/month',
            buttonText: 'Choose Monthly',
            buttonStyle: 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-100',
            mostPopular: true,
            features: [
                'Unlimited Credits',
                'Fastest Speed',
                '30 Days Access',
                'Unlimited evaluations',
                'PDF, JPG & PNG upload',
            ],
            featureActive: [true, true, true, true, true],
        },
        {
            title: 'Pro Yearly',
            description: 'Save 33% per year',
            price: '₹3,999',
            period: '/year',
            buttonText: 'Choose Yearly',
            buttonStyle: 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-100',
            mostPopular: false,
            badge: 'BEST VALUE',
            features: [
                'Everything in Monthly',
                'Save ₹2,000/year',
                '365 Days Access',
                'Unlimited evaluations',
                'Priority Support',
            ],
            featureActive: [true, true, true, true, true],
        },
    ];

    return (
        <section className="mt-32" id="pricing">
            <SectionTitle
                title="Pricing"
                description="Simple, transparent pricing. No hidden fees. Cancel anytime."
            />

            {/* Plans Grid */}
            <div className="mt-12 flex flex-wrap items-stretch justify-center gap-6 px-4">
                {plans.map((plan, index) => (
                    <motion.div
                        key={index}
                        className={`relative w-full max-w-xs flex flex-col rounded-2xl p-6 transition duration-300 hover:-translate-y-1 ${
                            plan.mostPopular
                                ? 'bg-teal-500 text-white shadow-2xl shadow-teal-100 scale-105'
                                : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'
                        }`}
                        initial={{ y: 60, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.12, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        {/* Best Value Badge */}
                        {plan.badge && (
                            <div className="absolute -top-3.5 right-4 flex items-center gap-1 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                                <StarIcon className="w-3 h-3 fill-white" />
                                {plan.badge}
                            </div>
                        )}

                        {/* Header */}
                        <div className="flex items-center justify-between mb-1">
                            <h3 className={`text-base font-semibold ${plan.mostPopular ? 'text-white' : 'text-gray-900'}`}>
                                {plan.title}
                            </h3>
                            {plan.mostPopular && (
                                <span className="flex items-center gap-1 text-xs font-semibold bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                                    <ZapIcon className="w-3 h-3" />
                                    Popular
                                </span>
                            )}
                        </div>

                        <p className={`text-xs mb-5 ${plan.mostPopular ? 'text-teal-100' : 'text-gray-400'}`}>
                            {plan.description}
                        </p>

                        {/* Price */}
                        <div className="mb-6">
                            <span className={`text-4xl font-bold ${plan.mostPopular ? 'text-white' : 'text-gray-900'}`}>
                                {plan.price}
                            </span>
                            <span className={`text-sm ml-1 ${plan.mostPopular ? 'text-teal-100' : 'text-gray-400'}`}>
                                {plan.period}
                            </span>
                        </div>

                        {/* CTA Button */}
                        <a
                            href="/sign-up"
                            className={`w-full text-sm font-semibold text-center py-2.5 rounded-xl transition active:scale-95 mb-6 ${
                                plan.mostPopular
                                    ? 'bg-white text-teal-600 hover:bg-teal-50'
                                    : plan.buttonStyle
                            }`}
                        >
                            {plan.buttonText}
                        </a>

                        {/* Divider */}
                        <div className={`h-px mb-5 ${plan.mostPopular ? 'bg-white/20' : 'bg-gray-100'}`} />

                        {/* Features */}
                        <ul className="space-y-3 flex-1">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-2.5">
                                    <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                                        plan.featureActive[i]
                                            ? plan.mostPopular ? 'bg-white/20' : 'bg-teal-50'
                                            : 'bg-gray-100'
                                    }`}>
                                        <CheckIcon className={`w-2.5 h-2.5 ${
                                            plan.featureActive[i]
                                                ? plan.mostPopular ? 'text-white' : 'text-teal-500'
                                                : 'text-gray-300'
                                        }`} strokeWidth={3} />
                                    </div>
                                    <span className={`text-sm ${
                                        plan.featureActive[i]
                                            ? plan.mostPopular ? 'text-white' : 'text-gray-700'
                                            : plan.mostPopular ? 'text-teal-200 line-through' : 'text-gray-300 line-through'
                                    }`}>
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>

            {/* Bottom note */}
            <motion.p
                className="text-center text-xs text-gray-400 mt-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                All plans include secure payment via Razorpay. No hidden charges.
            </motion.p>
        </section>
    );
}