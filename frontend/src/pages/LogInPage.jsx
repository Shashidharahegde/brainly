
import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  Search,
  Sparkles,
  Sprout,
  Loader2,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Save anything",
    description: "Notes, links, images, videos, voice — all in one place.",
  },
  {
    icon: Search,
    title: "Find it when it matters",
    description: "Search and AI help surface what you need.",
  },
  {
    icon: Sparkles,
    title: "Connect your ideas",
    description:
      "Turn scattered thoughts into a connected knowledge base.",
  },
];

function GoogleIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.88 46.98 24.55z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function LogInPage() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function responseGoogle(authResult) {
    if (!authResult.code) {
      setError("Google sign-in was unsuccessful. Please try again.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await axios.post(
        `${import.meta.env.VITE_BACKEND}/api/auth/google`,
        { code: authResult.code }
      );

      const { email, name, image } = result.data.user;
      const { token } = result.data;

      localStorage.setItem(
        "user-info",
        JSON.stringify({ email, name, image, token })
      );

      navigate("/", { replace: true });
    } catch (err) {
      console.error("Authentication error:", err);

      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: () => {
      setIsLoading(false);
      setError("Unable to sign in with Google. Please try again.");
    },
    flow: "auth-code",
    scope: "openid email profile",
  });

  const handleLogin = () => {
    if (isLoading) return;

    setError("");
    googleLogin();
  };

  return (
    <main className="flex min-h-svh w-full bg-[#fffefa]">
      {/* Left: Visual introduction */}
      <section className="relative hidden min-h-svh w-[60%] overflow-hidden lg:block">
        <img
          src="/EntryPageImage.svg"
          alt="A peaceful workspace overlooking a mountain landscape at sunset"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff6e6]/20 via-transparent to-black/5" />

        <div className="relative z-10 flex h-full flex-col px-10 pt-20 xl:px-[8.3%] xl:pt-[11.5vh]">
          <div className="max-w-[570px]">
            <h1
              className="font-serif text-[56px] leading-[0.96] tracking-[-0.045em] text-[#101a1e] xl:text-[72px]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Your thoughts,
              <br />
              connected.
            </h1>

            <p className="mt-6 text-[18px] leading-[1.5] text-[#586367] xl:text-[21px]">
              Capture anything. Organize effortlessly.
              <br />
              Find meaning in your own thoughts.
            </p>
          </div>

          <div className="mt-9 flex max-w-[450px] flex-col gap-6 xl:mt-8 xl:gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-5">
                <div className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm">
                  <Icon
                    size={28}
                    strokeWidth={1.8}
                    className="text-[#131a1d]"
                  />
                </div>

                <div className="pt-1">
                  <h3 className="text-[19px] font-semibold leading-6 tracking-[-0.02em] text-[#11191b]">
                    {title}
                  </h3>

                  <p className="mt-1 max-w-[290px] text-[16px] leading-[1.5] text-[#4f5b5e]">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right: Authentication */}
      <section className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden bg-[#fffefa] px-6 lg:w-[40%]">
        {/* Soft background glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, #ffffff 0%, #fffefa 60%, #faf9f5 100%)",
          }}
        />

        <div className="relative z-10 flex w-full max-w-[435px] -translate-y-10 flex-col items-center text-center sm:-translate-y-12">
          {/* Brainly mascot */}
          <img
            src="/Mascot.svg"
            alt="Brainly mascot"
            className="h-[150px] w-[150px] object-contain sm:h-[184px] sm:w-[184px]"
          />

          {/* Heading */}
          <h2
            className="mt-7 text-[43px] leading-[1.1] tracking-[-0.045em] text-[#111a1f] sm:mt-8 sm:text-[58px]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Welcome back
          </h2>

          <p className="mt-3 text-[16px] text-[#798088] sm:text-[18px]">
            Sign in to continue to your notes.
          </p>

          {/* Google login button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleLogin}
            disabled={isLoading}
            className="relative mt-12 h-[64px] w-full rounded-[20px] border border-[#e2e5e9] bg-white/75 px-7 text-[17px] font-medium text-[#14191d] shadow-[0_1px_3px_rgba(0,0,0,0.025)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cbd0d4] hover:bg-white hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#6f8f9c] disabled:cursor-not-allowed disabled:opacity-60 sm:mt-13 sm:h-[70px] sm:text-[18px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                <span className="absolute left-7 flex items-center">
                  <GoogleIcon />
                </span>

                <span>Continue with Google</span>

                <ArrowRight
                  size={23}
                  strokeWidth={1.7}
                  className="absolute right-7 text-[#3a4247]"
                />
              </>
            )}
          </Button>

          {error && (
            <p
              role="alert"
              className="mt-4 text-center text-sm text-red-600"
            >
              {error}
            </p>
          )}
        </div>

        {/* Bottom quote */}
        <div className="absolute bottom-[9%] z-10 flex flex-col items-center gap-4 text-center sm:bottom-[11%]">
          <Sprout
            size={52}
            strokeWidth={1.2}
            className="-rotate-12 text-[#737457]"
          />

          <p
            className="text-[17px] leading-[1.3] text-[#64676b] sm:text-[20px]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            “A more thoughtful you,
            <br />
            one note at a time.”
          </p>
        </div>
      </section>
    </main>
  );
}

export default LogInPage;
