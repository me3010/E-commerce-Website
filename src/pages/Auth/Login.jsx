import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useLoginMutation,
  useRegisterSendOtpMutation,
} from "../../redux/features/auth/authApiSlice";

import logoImg from "../../assets/logo.jpeg";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const isRegisterRoute = location.pathname === "/register";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading: isLoginLoading, error: loginError }] =
    useLoginMutation();

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  const [sendOtp, { isLoading: isSendingOtp, error: sendOtpError }] =
    useRegisterSendOtpMutation();

  useEffect(() => {
    if (loginError) {
      toast.error(loginError?.data?.message || "Something went wrong");
    }
  }, [loginError]);

  useEffect(() => {
    if (sendOtpError) {
      toast.error(sendOtpError?.data?.message || "Something went wrong");
    }
  }, [sendOtpError]);

  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!email.trim()) errors.email = "Email is required";
    if (!password.trim()) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();
      const token = result?.token || result?.data?.token;

      if (token) {
        Cookies.set("token", token, {
          expires: 7,
          path: "/",
          sameSite: "lax",
        });
        Cookies.set("user", result?.user?.username);
        Cookies.set("role", result?.user?.role);
      }
      try {
        localStorage.setItem("isAuthenticated", "true");
      } catch {}

      toast.success("Logged in successfully");
      window.dispatchEvent(new Event("authChange"));
      navigate("/home");
    } catch (err) {
      console.log("Login Error:", err);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      const errors = {};
      if (!regName.trim()) errors.regName = "Username is required";
      if (!regEmail.trim()) errors.regEmail = "Email is required";
      if (!regPassword.trim()) errors.regPassword = "Password is required";

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }

      try {
        const res = await sendOtp({
          username: regName,
          email: regEmail,
          password: regPassword,
        }).unwrap();
        toast.info(res?.message || "OTP sent to your email");
        setFieldErrors({});
        setStep(2);
      } catch (err) {
        console.log("Send OTP Error:", err);
        console.log("Validation Details:", err?.data?.errors);
      }
    } else {
      if (!otp.trim()) {
        setFieldErrors({ otp: "OTP is required" });
        return;
      }

      const token = otp.trim();
      Cookies.set("token", token, {
        expires: 7,
        path: "/",
        sameSite: "lax",
      });
      try {
        localStorage.setItem("isAuthenticated", "true");
      } catch {}

      toast.success("Account verified successfully");
      window.dispatchEvent(new Event("authChange"));
      navigate("/home");
    }
  };

  const tabActive =
    "flex-1 py-2 rounded-full text-[17px] bg-gradient-to-r from-orange-500 to-orange-400 text-black font-bold transition shadow-lg";
  const tabInactive =
    "flex-1 py-2 rounded-full text-[17px] text-white font-bold transition";
  const labelStyle = "block text-white text-[13px] font-semibold mb-1 px-2";
  const inputStyle =
    "bg-transparent outline-none w-full text-[15px] font-medium text-white placeholder:text-white caret-white";
  const inputWrap =
    "flex items-center gap-3 bg-white/10 border border-white/40 rounded-full px-4 py-3 backdrop-blur-sm";
  const mainBtn =
    "w-full py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 text-black text-[19px] font-bold shadow-lg hover:scale-[1.02] transition disabled:opacity-50";
  const errorText = "text-red-500 text-[12px] font-semibold mt-1 px-4";

  const iconStyle = "w-[22px] h-[22px] shrink-0 text-orange-500";

  return (
    <div
      className="flex my-5 items-center justify-center p-4 font-sans relative  "
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

      <div className="absolute inset-0" />

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
            {!isRegisterRoute ? (
              <>
                <h2 className="text-white text-[24px] font-bold leading-tight">
                  Welcome back
                </h2>
                <p className="text-white/80 text-[14px] mt-1">
                  Sign in to your account
                </p>
              </>
            ) : (
              <>
                <h2 className="text-white text-[24px] font-bold leading-tight">
                  {step === 1 ? "Create an account" : "Verify OTP"}
                </h2>
                <p className="text-white/80 text-[14px] mt-1">
                  {step === 1
                    ? "Join us and start shopping"
                    : `Enter the verification code sent to ${regEmail}`}
                </p>
              </>
            )}
          </div>

          <div className="flex bg-white/10 backdrop-blur border border-white/40 rounded-full p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                navigate("/login");
                setStep(1);
                setFieldErrors({});
              }}
              className={!isRegisterRoute ? tabActive : tabInactive}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                navigate("/register");
                setStep(1);
                setFieldErrors({});
              }}
              className={isRegisterRoute ? tabActive : tabInactive}
            >
              Register
            </button>
          </div>

          {!isRegisterRoute ? (
            <form className="space-y-3.5" onSubmit={handleLogin} noValidate>
              <div>
                <label htmlFor="login-email" className={labelStyle}>
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
                    id="login-email"
                    type="email"
                    placeholder="Email"
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

              <div>
                <label htmlFor="login-password" className={labelStyle}>
                  Password
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
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError("password");
                    }}
                    className={inputStyle}
                  />
                </div>
                {fieldErrors.password && (
                  <p className={errorText}>{fieldErrors.password}</p>
                )}
              </div>

              <div className="flex justify-end -mt-1">
                <NavLink
                  to="/forgot-password"
                  className="text-white text-[13px] font-semibold   block cursor-pointer "
                >
                  Forgot password?
                </NavLink>
              </div>

              <button
                type="submit"
                disabled={isLoginLoading}
                className={mainBtn}
              >
                {isLoginLoading ? "Loading..." : "Login"}
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-white/70" />
                <span className="text-white text-[14px]">or</span>
                <div className="flex-1 h-px bg-white/70" />
              </div>

              <p className="text-center text-[14px] text-white">
                Don't have an account?
                <NavLink
                  to="/register"
                  onClick={() => setFieldErrors({})}
                  className="text-orange-400 font-bold text-[17px]   ml-1"
                >
                  Sign up
                </NavLink>
              </p>
            </form>
          ) : (
            <form
              className="space-y-3.5"
              onSubmit={handleRegisterSubmit}
              noValidate
            >
              {step === 1 ? (
                <>
                  <div>
                    <label htmlFor="register-name" className={labelStyle}>
                      Full Name
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
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
                      </svg>
                      <input
                        id="register-name"
                        type="text"
                        placeholder="Full Name"
                        value={regName}
                        onChange={(e) => {
                          setRegName(e.target.value);
                          clearFieldError("regName");
                        }}
                        className={inputStyle}
                      />
                    </div>
                    {fieldErrors.regName && (
                      <p className={errorText}>{fieldErrors.regName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="register-email" className={labelStyle}>
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
                        id="register-email"
                        type="email"
                        placeholder="Email"
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          clearFieldError("regEmail");
                        }}
                        className={inputStyle}
                      />
                    </div>
                    {fieldErrors.regEmail && (
                      <p className={errorText}>{fieldErrors.regEmail}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="register-password" className={labelStyle}>
                      Password
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
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <input
                        id="register-password"
                        type="password"
                        placeholder="Password"
                        value={regPassword}
                        onChange={(e) => {
                          setRegPassword(e.target.value);
                          clearFieldError("regPassword");
                        }}
                        className={inputStyle}
                      />
                    </div>
                    {fieldErrors.regPassword && (
                      <p className={errorText}>{fieldErrors.regPassword}</p>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <label htmlFor="register-otp" className={labelStyle}>
                    OTP Code
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
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      id="register-otp"
                      type="text"
                      placeholder="Enter OTP Code"
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
              )}

              <button type="submit" disabled={isSendingOtp} className={mainBtn}>
                {isSendingOtp
                  ? "Loading..."
                  : step === 1
                    ? "Sign up"
                    : "Verify OTP"}
              </button>

              <p className="text-center text-[14px] text-white pt-1">
                Already have an account?
                <NavLink
                  to="/login"
                  className="text-orange-400 font-bold text-[17px] inline-block ml-1"
                >
                  Sign in
                </NavLink>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
