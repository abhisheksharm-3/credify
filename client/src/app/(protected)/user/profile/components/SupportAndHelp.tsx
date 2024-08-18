import { CircleHelpIcon, PowerIcon } from "lucide-react";
import Link from "next/link";

function SupportAndHelp() {
  return (
    <div className="border-2 rounded-xl p-6 bg-card">
      <div className="flex flex-col gap-0.5">
        <div className="text-2xl font-semibold">Support and Help</div>
        <div className="text-sm text-gray-500">
          Get assistance with your account.
        </div>
      </div>
      <div className="grid gap-6 mt-10">
        <div className="grid gap-2">
          <label className="font-semibold text-sm" htmlFor="contact-support">
            Contact Support
          </label>
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-primary"
            prefetch={false}
          >
            <PowerIcon color="#ec1e3d" className="h-5 w-5" />
            <span className="text-[#ec1e3d]">Get in touch</span>
          </Link>
        </div>
        <div className="grid gap-2">
          <label className="font-semibold text-sm" htmlFor="help-center">
            Help Center
          </label>
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-primary"
            prefetch={false}
          >
            <CircleHelpIcon color="#ec1e3d" className="h-5 w-5" />
            <span className="text-[#ec1e3d]">Visit the Help Center</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SupportAndHelp;
