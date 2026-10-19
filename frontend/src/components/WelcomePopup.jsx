
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

const features = [
  {

    title: "Create notes",
    image: "/CreateNotes.svg",
    description:
      "A home for everything on your mind. Capture notes, images, videos, audio, and more in one place.",
  },
  {

    title: "Save resources",
    image: "/PasteLinks.svg",
    description:
      "Collect articles, websites, PDFs, and YouTube links. Keep the information that matters close.",
  },
  {

    title: "Explore with AI",
    image: "/ChatWithNotes.svg",
    description:
      "Ask questions, discover connections, and find meaning in the knowledge you've collected.",
  },
];

const STORAGE_PREFIX = "brainly-welcome-v1";

export default function WelcomePopup({ user = null }) {
  const [open, setOpen] = useState(false);

  const userId =
    user?.id ||
    user?._id ||
    user?.email ||
    "browser";

  const storageKey = `${STORAGE_PREFIX}:${userId}`;

  useEffect(() => {
    try {
      const hasSeenWelcome =
        localStorage.getItem(storageKey) === "true";

      setOpen(!hasSeenWelcome);
    } catch {
      setOpen(true);
    }
  }, [storageKey]);

  function handleClose() {
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // Allow the dialog to close if storage is unavailable.
    }

    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
      }}
    >
      <DialogContent
        className="
          w-[calc(100%-24px)]
          max-h-[calc(90dvh-14px)]
          overflow-y-auto
          rounded-[24px]
          border border-[#e9e7e2]
          bg-[#fffefa]
          p-0
          shadow-[0_24px_90px_rgba(17,26,31,0.16)]
          sm:max-w-[980px]
          sm:rounded-[30px]
          [&>button]:right-5
          [&>button]:top-5
          [&>button]:rounded-full
          [&>button]:p-2
          [&>button]:text-[#858a8d]
          [&>button]:opacity-100
          [&>button]:transition-colors
          [&>button]:hover:bg-[#f3f1ed]
          [&>button]:hover:text-[#182126]
        "
      >
        {/* Subtle warm background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse at 50% 0%,
                rgba(247, 235, 216, 0.4) 0%,
                transparent 55%
              )
            `,
          }}
        />

        <div className="relative z-10 px-3 pb-6 pt-8 sm:px-9 sm:pb-9 sm:pt-10 lg:px-9">
          {/* Welcome heading */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/Mascot.svg"
              alt="Brainly mascot"
              className="
                h-[82px] w-[82px]
                object-contain
                sm:h-[90px] sm:w-[90px]
              "
            />

           

            <DialogTitle
              className="
                mt-3
                text-[29px]
                font-normal
                leading-[1.1]
                tracking-[-0.045em]
                text-[#111a1f]
                sm:text-[42px]
                lg:text-[48px]
              "
              style={{
                fontFamily: "Georgia, serif",
              }}
            >
              Welcome to Brainly.
            </DialogTitle>

            <DialogDescription
              className="
                mt-2
                max-w-[500px]
                text-[10px]
                leading-[1.65]
                text-[#798088]
                sm:text-[15px]
              "
            >
              A more thoughtful way to capture, organize,
              and explore everything that matters to you.
            </DialogDescription>
          </div>

          {/* Subtle separator */}
          <div className="mx-auto my-6 h-px max-w-[160px] bg-[#e9e6e0] sm:my-4" />

          {/* Features */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.number}
                className="
                  group
                  flex flex-col
                  overflow-hidden
                  rounded-[22px]
                  border border-[#e9e7e2]
                  bg-white/80
                  p-2
                  shadow-[0_2px_10px_rgba(0,0,0,0.025)]
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-[#d8d6d0]
                  hover:bg-white
                  hover:shadow-[0_8px_24px_rgba(17,26,31,0.055)]
                  sm:rounded-[24px]
                  sm:p-2
                "
              >
                {/* Illustration */}
                <div
                  className="
                    flex h-[170px]
                    items-center justify-center
                    overflow-hidden
                    rounded-[15px]
                    bg-[#f8f7f4]
                    p-3
                    sm:h-[185px]
                    md:h-[160px]
                    lg:h-[180px]
                  "
                >
                  <img
                    src={feature.image}
                    alt=""
                    className="
                      h-full w-full
                      object-contain
                      transition-transform duration-300
                      group-hover:scale-[1.035]
                    "
                  />
                </div>

                {/* Card content */}
                <div className="flex flex-1 flex-col px-1 pb-2 pt-5">
                  <span className="text-[8px] font-medium tracking-[0.16em] text-[#a5a198]">
                  </span>

                  <h3
                    className="
                      mt-2
                      text-[18px]
                      font-normal
                      leading-[1.2]
                      tracking-[-0.035em]
                      text-[#111a1f]
                      lg:text-[27px]
                    "
                    style={{
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className="
                      mt-3
                      text-[14px]
                      leading-[1.7]
                      text-[#747c80]
                      sm:text-[14px]
                    "
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom section */}
          <div className="mt-8 flex flex-col items-center sm:mt-9">
            <Button
              type="button"
              onClick={handleClose}
              className="
                group
                relative
                h-[56px]
                w-full
                max-w-[300px]
                rounded-[17px]
                border border-[#182126]
                bg-[#182126]
                px-7
                text-[15px]
                font-medium
                text-white
                shadow-[0_3px_10px_rgba(17,26,31,0.1)]
                transition-all duration-200
                hover:-translate-y-0.5
                hover:bg-[#303b40]
                hover:shadow-[0_7px_18px_rgba(17,26,31,0.15)]
                focus-visible:ring-2
                focus-visible:ring-[#8e9a9d]
                focus-visible:ring-offset-2
                sm:h-[60px]
                sm:text-[16px]
              "
            >
              Let's get started

              <ArrowRight
                size={20}
                strokeWidth={1.7}
                className="
                  absolute right-6
                  transition-transform duration-200
                  group-hover:translate-x-1
                "
              />
            </Button>

            <p
              className="
                mt-5
                text-center
                text-[13px]
                text-[#a1a3a0]
              "
            >
              Your ideas, all in one place.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
