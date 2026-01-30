import { useEffect, useState } from "react";
import { BillingAPI } from "../api/billing";
import { Check, Zap, Crown, Star } from "lucide-react"; 

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  theme: {
    color: string;
  };
}

interface RazorpayInstance {
  open(): void;
}

type Plan = "free" | "pro";

const BillingPage = () => {
  const [plan, setPlan] = useState<Plan>("free");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingCode, setProcessingCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const getFormattedTimeLeft = (dateString: string) => {
    const expiry = new Date(dateString);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();

    if (diffTime <= 0) return "Expired";

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays >= 1) {
      return `${diffDays} days`;
    }

    const hours = Math.floor((diffTime / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diffTime / (1000 * 60)) % 60);
    const secs = Math.floor((diffTime / 1000) % 60);

    return `${hours.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    BillingAPI.getMyPlan()
      .then((res) => {
        setPlan(res.plan);
        setExpiresAt(res.expiresAt || null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!expiresAt || plan !== "pro") return;

    const timer = setInterval(() => {
      setTimeLeft(getFormattedTimeLeft(expiresAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, plan]);

  const handleUpgrade = async (planCode: string) => {
    try {
      setProcessingCode(planCode);
      const { order } = await BillingAPI.createOrder(planCode);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "AI Eval",
        description: planCode === 'pro_yearly' ? "Pro Yearly Subscription" : "Pro Monthly Subscription",
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await BillingAPI.verifyPayment(response);
          if (verifyRes.success) {
            setPlan("pro");
            setExpiresAt(verifyRes.expiresAt);
            setProcessingCode(null);
          }
        },
        theme: { color: "#059669" },
        modal: { ondismiss: () => setProcessingCode(null) }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment failed", err);
      setProcessingCode(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Simple, Transparent Pricing</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Choose the plan that fits your needs. No hidden fees.</p>
        </div>

        {plan === "pro" && (
          <div className="mb-10 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl shadow-sm max-w-3xl mx-auto animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                <Crown className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-emerald-900">Pro Plan Active</p>
                {expiresAt && (
                  <p className="text-sm text-emerald-700 mt-1">
                    Your premium features are active. {timeLeft.includes(':') ? 'Expires in ' : 'Renews in '} 
                    <span className="font-mono font-bold bg-emerald-200/50 px-2 py-0.5 rounded">
                      {timeLeft || getFormattedTimeLeft(expiresAt)}
                    </span>.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          <div className={`relative rounded-md ${plan === "free" ? "bg-white border border-gray-200" : "bg-gray-50 border border-transparent opacity-75 grayscale"}`}>
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900">Free</h3>
              <p className="text-sm text-gray-500 mt-1">For getting started</p>
              <div className="my-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">₹0</span>
                <span className="text-gray-500">/forever</span>
              </div>
              <button disabled className="w-full py-2.5 px-4 bg-gray-100 text-gray-500 rounded-lg text-sm font-semibold cursor-default border border-gray-200">
                {plan === 'free' ? 'Current Plan' : 'Basic Plan'}
              </button>
              <div className="mt-8 space-y-4">
                <ul className="space-y-3">
                  {['limited Credits / Day', 'Standard Speed', 'Basic Support'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          
          <div className={`relative rounded-md bg-white border border-gray-200 ${plan === 'pro' ? 'ring-2 ring-emerald-500 border-transparent' : ''}`}>
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900">Pro Monthly</h3>
              <p className="text-sm text-gray-500 mt-1">For serious learners</p>
              <div className="my-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">₹499</span>
                <span className="text-gray-500">/month</span>
              </div>
              <button disabled={plan === "pro" || processingCode !== null} onClick={() => handleUpgrade("pro_monthly")} className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${plan === "pro" ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default" : "bg-emerald-600 text-white shadow-sm hover:shadow"}`}>
                {processingCode === "pro_monthly" ? <span className="animate-pulse">Processing...</span> : plan === "pro" ? "Active Plan" : <>{'Choose Monthly '} <Zap className="w-4 h-4" /></>}
              </button>
              <div className="mt-8 space-y-4">
                <ul className="space-y-3">
                  {['Unlimited Credits', 'Fastest Speed','30 Days Access'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-600"><Check className="w-3.5 h-3.5" /></div>
                      <span className="text-gray-700 text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className={`relative rounded-md bg-white border border-gray-200 shadow-sm ${plan === 'pro' ? 'ring-2 ring-emerald-500 border-transparent' : ''}`}>
             <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> Best Value</span>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900">Pro Yearly</h3>
              <p className="text-sm text-gray-500 mt-1">Save 33% per year</p>
              <div className="my-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">₹3999</span>
                <span className="text-gray-500">/year</span>
              </div>
              <button disabled={plan === "pro" || processingCode !== null} onClick={() => handleUpgrade("pro_yearly")} className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${plan === "pro" ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default" : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg transform"}`}>
                {processingCode === "pro_yearly" ? <span className="animate-pulse">Processing...</span> : plan === "pro" ? "Active Plan" : <>{'Choose Yearly '} <Crown className="w-4 h-4" /></>}
              </button>
              <div className="mt-8 space-y-4">
                <ul className="space-y-3">
                  {['Everything in Monthly', 'Save ₹2,000/year', '365 Days Access'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-600"><Check className="w-3.5 h-3.5" /></div>
                      <span className="text-gray-700 text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;