import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubscribed(true);
    toast.success("Thank you for subscribing!");

    setEmail("");
  };

  return (
    <section className="relative overflow-hidden px-4 py-16 transition-colors duration-300 sm:px-6 lg:px-10">
      <div className="">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-linear-to-br from-gray-300/20 via-orange-500/40 to-gray-400/20 px-6 py-12 shadow-2xl shadow-orange-500/20 sm:px-12 sm:py-16"
        >
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-35 border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur-sm">
              <Mail size={30} />
            </div>

            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.25em] text-orange-100">
              Newsletter
            </span>

            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Stay Updated
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-orange-50 sm:text-base">
              Subscribe to our newsletter and get exclusive deals and new
              arrivals first.
            </p>

            {!isSubscribed ? (
              <form
                onSubmit={handleSubscribe}
                className="mx-auto mt-9 flex max-w-xl flex-col gap-3 rounded-2xl bg-white p-2 shadow-xl sm:flex-row sm:rounded-full"
              >
                <div className="flex flex-1 items-center gap-3 px-4">
                  <Mail size={20} className="shrink-0 text-orange-500" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full min-w-0 border-none bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0"
                  />
                </div>

                <button
                  type="submit"
                  className="group flex items-center justify-center gap-2 rounded-full bg-[#171310] px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:bg-black hover:shadow-lg"
                >
                  Subscribe
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </form>
            ) : (
              <div className="mx-auto mt-9 flex max-w-xl items-center justify-center gap-3 rounded-2xl bg-white px-6 py-5 text-emerald-600 shadow-xl">
                <CheckCircle2 size={24} />
                <span className="font-bold">You're subscribed! Thank you.</span>
              </div>
            )}

            <p className="mt-5 text-xs text-orange-100">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
