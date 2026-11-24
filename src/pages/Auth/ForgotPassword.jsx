import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logoImg from "../../assets/logo.jpeg";
import { useForgotPasswordSendOtpMutation } from "../../redux/features/auth/authApiSlice";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [step, setStep] = useState(1);

  const [sendOtp, { isLoading: sending }] = useForgotPasswordSendOtpMutation();

  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setFieldErrors({ email: "Email is required" });
      return;
    }

    try {
      const result = await sendOtp({ email: email.trim() }).unwrap();

      toast.success(result?.message || "Reset OTP sent successfully");
      setFieldErrors({});
      setStep(2);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to send reset OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!otp.trim()) errors.otp = "OTP is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setStep(1);
    setOtp("");
    setFieldErrors({});
    navigate("/login");
  };

  const inputStyle =
    "bg-transparent outline-none w-full text-[15px] font-medium text-white placeholder:text-white caret-white";
  const inputWrap =
    "flex items-center gap-3 bg-white/10 border border-white/40 rounded-full px-4 py-3 backdrop-blur-sm";
  const mainBtn =
    "w-full py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 text-black text-[19px] font-bold shadow-lg hover:scale-[1.02] transition disabled:opacity-50";
  const iconStyle = "w-[22px] h-[22px] shrink-0 text-orange-500";
  const labelStyle = "block text-white text-[14px] font-semibold ml-2 mb-1.5";
  const errorText = "text-red-500 text-[12px] font-semibold mt-1 px-4";

  return (
    <div
      className="  flex items-center justify-center p-4  m-5    font-sans relative"
      style={{
        backgroundImage: "url('/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: white !important;
          -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
          transition: background-color 5000s ease-in-out 0s;
          caret-color: white;
        }
        input { color: white !important; }
      `}</style>

      <div className="absolute inset-0  " />

      <div className="relative z-10 w-full max-w-100 md:max-w-105">
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 w-18 h-18 rounded-full overflow-hidden border-[3px] border-orange-500 shadow-[0_0_20px_6px_rgba(255,120,0,0.55)] bg-black flex items-center justify-center">
          <img
            src={logoImg}
            alt="Buy Logo"
            className="w-[85%] h-[85%] object-contain"
          />
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/40 rounded-[26px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] pt-11 pb-6 px-5 md:px-6">
          <div className="text-center mb-5">
            <h1 className="text-white text-[24px] font-bold leading-tight">
              Forgot Password?
            </h1>
            <p className="text-white/80 text-[14px] mt-1">
              {step === 1
                ? "Enter your email to receive a verification code"
                : "Enter the OTP sent to your email"}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-3.5" noValidate>
              <div>
                <label htmlFor="forgot-email" className={labelStyle}>
                  Email
                </label>
                <div className={inputWrap}>
                  <svg
                    aria-hidden="true"
                    className={iconStyle}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 6L2 7" />
                  </svg>
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError("email");
                    }}
                    className={inputStyle}
                  />
                </div>
                {fieldErrors.email && (
                  <p className={errorText}>{fieldErrors.email}</p>
                )}
              </div>

              <button type="submit" disabled={sending} className={mainBtn}>
                {sending ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleResetPassword}
              className="space-y-3.5"
              noValidate
            >
              <div>
                <label htmlFor="forgot-otp" className={labelStyle}>
                  Verification Code
                </label>
                <div className={inputWrap}>
                  <svg
                    aria-hidden="true"
                    className={iconStyle}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
                  </svg>
                  <input
                    id="forgot-otp"
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      clearFieldError("otp");
                    }}
                    className={inputStyle}
                  />
                </div>
                {fieldErrors.otp && (
                  <p className={errorText}>{fieldErrors.otp}</p>
                )}
              </div>

              <button type="submit" className={mainBtn}>
                Verify OTP
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setFieldErrors({});
                }}
                className="w-full text-white text-[13px] font-semibold hover:underline"
              >
                Change Email
              </button>
            </form>
          )}

          <div className="text-center text-[14px] mt-5">
            Remember your password?
            <Link
              to="/login"
              onClick={() => setFieldErrors({})}
              className="text-orange-400  inline-block ms-1 text-[18px] font-bold  "
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
