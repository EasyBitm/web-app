"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
} from "react-icons/fa6";

const footerLinks = {
  Semesters: [
    { label: "1st Semester", href: "/semester/first" },
    { label: "2nd Semester", href: "/semester/second" },
  ],
  Explore: [
    { label: "Home", href: "/" },
    { label: "CMAT preparation", href: "/cmat" },
    { label: "Notices", href: "/notices" },
    { label: "Support us", href: "/support" },
  ],
  // Community: [
  //   { label: "Why easyBITM?", href: "/#why" },
  //   { label: "Support us", href: "/#contact" },
  //   { label: "Send feedback", href: "mailto:easybitm@gmail.com" },
  // ],
};

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/easybitm/", Icon: FaInstagram },
  { label: "Facebook", href: "https://www.facebook.com/easybitm/", Icon: FaFacebookF },
  { label: "GitHub", href: "https://github.com/easybitm", Icon: FaGithub },
];

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  function handleHomeClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    if (pathname === "/") {
      window.history.replaceState(null, "", "/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  }

  return (
    <footer className="border-t border-border w-full" aria-labelledby="footer-heading">
      <div className="mx-auto flex w-[calc(100%-10rem)]  flex-col justify-between gap-12 px-6 py-12 md:flex-row md:gap-0">
        <div className="flex max-w-sm flex-col items-center md:w-1/3">
          <Link href="/" onClick={handleHomeClick} className="inline-flex items-center" aria-label="easyBITM home">
            <Image
              src="/logo.png"
              alt="easyBITM"
              width={96}
              height={28}
              className="hidden h-24 w-auto object-contain [html[data-theme='dark']_&]:block"
            />
            <Image
              src="/logo-light.png"
              alt="easyBITM"
              width={128}
              height={32}
              className="hidden h-24 w-auto object-contain [html[data-theme='light']_&]:block"
            />
          </Link>
          <h2 id="footer-heading" className="sr-only mt-0">easyBITM footer</h2>
          <p className="mt-5 max-w-xs text-sm leading-6 text-muted">
            A free, student-focused resource hub for Bachelor in Information
            Technology and Management learners.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 md:w-auto">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="w-1/2 sm:w-40 sm:flex-none">
              <h3 className="text-base font-semibold">{title}</h3>
              <ul className="mt-4 flex flex-col gap-2 text-base text-muted">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    {href.startsWith("mailto:") ? (
                      <a href={href} className="transition-colors hover:text-foreground">
                        {label}
                      </a>
                    ) : (
                      <Link href={href} className="transition-colors hover:text-foreground">
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}          
          <div className="w-1/2 sm:w-30 sm:flex-none">
            <h3 className="text-base font-semibold">Follow us</h3>
            <div className="mt-4 flex flex-col gap-2 text-base text-muted" aria-label="Social media links">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`easyBITM on ${label}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <Icon size={14} aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-2 px-6 py-4 text-xs text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} easyBITM. Built for BITM students.</p>
          <a href="mailto:easybitm@gmail.com" className="inline-flex items-center gap-2 hover:text-foreground">
            <Mail size={14} aria-hidden="true" />
            easybitm@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
