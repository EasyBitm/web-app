import Image from "next/image";

const footerLinks = {
  Explore: ["Semesters", "Notices", "Why Us"],
  Company: ["About", "Team", "Feedback"],
};

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 sm:flex-row sm:justify-between">
        <div className="flex max-w-xs flex-col gap-3">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="easyBITM"
              width={96}
              height={28}
            />
          </div>
          <p className="text-sm text-muted">
            An attempt to make studying easier for everyone.
          </p>
        </div>

        <div className="flex gap-16">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <div className="text-sm font-semibold">{title}</div>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-muted">
                {links.map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-foreground">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-2 px-6 py-4 text-xs text-muted sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} bitmapp. All rights reserved.</span>
          <a href="mailto:info@example.com" className="hover:text-foreground">
            info@example.com
          </a>
        </div>
      </div>
    </footer>
  );
}
