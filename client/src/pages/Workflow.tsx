import { Upload, FileText, BarChart3, Zap, Check, Sparkles, Shield, TrendingUp } from 'lucide-react';

export default function AIEvalWorkflow() {
  const steps = [
    {
      id: 1,
      title: "Create Question Paper",
      description: "Upload your question paper or type manually",
      details: "Support for PDF, JPG, PNG & text input with instant OCR extraction",
      icon: Upload,
      features: ["Type Manually", "Upload PDF", "Upload Images", "Set Marks"],
      color: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-600"
    },
    {
      id: 2,
      title: "Upload Answer Sheets",
      description: "Students submit multiple response sheets",
      details: "Set difficulty level & marking criteria with auto-extraction",
      icon: FileText,
      features: ["Multiple Uploads", "Difficulty Levels", "Mark Criteria", "Auto Extract"],
      color: "from-purple-500 to-pink-500",
      iconColor: "text-purple-600"
    },
    {
      id: 3,
      title: "AI Evaluation",
      description: "Intelligent marking with detailed analysis",
      details: "AI evaluates submissions with contextual feedback for each answer",
      icon: Sparkles,
      features: [ "Question Feedback", "Answer Analysis", "Detailed Report"],
      color: "from-green-500 to-emerald-500",
      iconColor: "text-green-600"
    },
    {
      id: 4,
      title: "View Results",
      description: "Comprehensive performance dashboard",
      details: "Individual scores, feedback, and downloadable performance reports",
      icon: BarChart3,
      features: ["Score Reports", "Performance Stats", "Feedback Summary"],
      color: "from-orange-500 to-red-500",
      iconColor: "text-orange-600"
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast",
      desc: "Evaluate hundreds of answer sheets in minutes, not days",
      features: ["Instant Results", "100x Faster", "Real-time Updates"]
    },
    {
      icon: BarChart3,
      title: "Detailed Insights",
      desc: "Get comprehensive analytics and actionable feedback for students",
      features: ["Question Analysis", "Student Progress", "Skill Mapping"]
    },
    {
      icon: Shield,
      title: "Consistent Grading",
      desc: "Ensure fair, objective evaluation based on predefined criteria",
      features: ["Fair Marking", "Transparent Criteria", "Audit Trail"]
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-slate-50 overflow-hidden">
      {/* Background blur (visual only) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative z-10">
        {/* HERO SECTION (TOP GAP FIXED HERE) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/50 rounded-full border border-blue-200 mb-6">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">
                AI-Powered Education Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              How AI Eval Works
            </h1>

            <p className="text-base text-gray-600 max-w-3xl mx-auto">
              From question creation to detailed feedback — faster, smarter,
              and more insightful evaluation.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {steps.map((step) => {
              const Icon = step.icon;
              
              return (
                <div
                  key={step.id}
                  className="group relative h-full"
                >
                  {/* Card */}
                  <div className="relative h-full p-8 sm:p-10 bg-white border-2 border-gray-200 rounded ">
                    {/* Step Counter */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} text-white font-black text-2xl shadow-lg`}>
                        {step.id}
                      </div>
                      {/* <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div> */}
                    </div>

                    {/* Title & Icon */}
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className={`w-7 h-7 ${step.iconColor}`} />
                        <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 font-semibold mb-2 text-base">
                      {step.description}
                    </p>

                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                      {step.details}
                    </p>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      {step.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-700 font-medium text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom accent */}
                    <div className={`h-1 rounded-full bg-gradient-to-r ${step.color}`}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Process Flow */}
          <div className="mb-24">
            <h2 className="text-3xl sm:text-4xl font-black text-center text-gray-900 mb-16">The Complete Workflow</h2>
            
            <div className="relative">
              {/* Connection Line */}
              <div className="hidden lg:block absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 rounded-full"></div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
                {[
                  { step: 1, label: "Upload Paper", icon: Upload, color: "bg-blue-500" },
                  { step: 2, label: "Extract Text", icon: Zap, color: "bg-cyan-500" },
                  { step: 3, label: "Answer sheet Submit", icon: FileText, color: "bg-purple-500" },
                  { step: 4, label: "AI Process", icon: Sparkles, color: "bg-pink-500" },
                  { step: 5, label: "Get Results", icon: TrendingUp, color: "bg-green-500" }
                ].map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div className={`${item.color} rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-white shadow-lg`}>
                        <IconComp className="w-8 h-8 sm:w-10 sm:h-10" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-700 text-center mt-3">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mb-24">
            <h2 className="text-3xl sm:text-4xl font-black text-center text-gray-900 mb-12">Why Educators Love AI Eval</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, idx) => {
                const BenefitIcon = benefit.icon;
                return (
                  <div key={idx} className="p-8 rounded border-2 border-gray-200 bg-white shadow-md">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                      <BenefitIcon className="w-6 h-6 text-gray-700" />
                    </div>
                    <h4 className="text-xl font-black text-gray-900 mb-2">{benefit.title}</h4>
                    <p className="text-gray-600 text-sm mb-6">{benefit.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {benefit.features.map((feature, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}