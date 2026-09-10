import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { getSemesters } from "../src/lib/data";
import darkthemeImage from "./dark-theme.png";
import bitmHomepageImage from "./bitmhomepage.png";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "BITM Notes, Resources & Study Materials",
	description:
		"Find organized notes, lessons, syllabi, videos, and question papers for Bachelor in Information Technology and Management students.",
	openGraph: {
		title: "BITM Notes, Resources & Study Materials | easyBITM",
		description: "Organized semester resources and study materials for BITM students.",
	},
};

export default async function Home() {
	const semesters = await getSemesters({ includeHidden: true });
	const visibleSemesters = semesters.filter((s) => s.is_visible);
	const stats = [
		{ label: "Semesters Covered", value: `${visibleSemesters.length || 8}` },
		{ label: "Cost to Use", value: "Free" },
	];

	return (
		<div className="flex flex-col flex-1">
			<div className="flex flex-col">
				<Header />

				<section className="relative z-0 mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-10 px-6 py-20 lg:flex-row lg:items-center lg:gap-16 lg:px-10">
					<div
						aria-hidden="true"
						className="absolute left-1/2 top-20 h-2 w-2 rounded-full bg-accent animate-pulse"
					/>
					<div
						aria-hidden="true"
						className="absolute right-10 top-40 h-1.5 w-1.5 rounded-full bg-accent-2 animate-pulse"
					/>

					<div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-4 lg:items-start">
						<div className="">
							<h1 className="hero-title mt-0 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
								<span className="inline-block">
									Your <span className="text-accent">simple</span> guide
								</span>
								<br />
								to ace every semester.
							</h1>

							<p className="hero-subtitle mt-5 max-w-lg text-muted leading-relaxed">
								Notes, guides, and organized resources — so you can focus on learning instead of hunting
								for materials.
							</p>
						</div>

						<div className="flex flex-wrap gap-4 pt-2">
							<a
								href="#semesters"
								className="group relative overflow-hidden rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover-primary"
							>
								<span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
								Start Learning
							</a>
							<a
								href="/support"
								className="rounded-full border border-accent-2/60 bg-accent-2/10 px-6 py-3 text-sm font-medium text-accent-2 transition-colors duration-200 hover:bg-accent-2 hover:text-white"
							>
								Contribute
							</a>
						</div>

						<div className="mt-2 flex flex-wrap gap-3">
							{stats.map((s) => (
								<div key={s.label} className="rounded-xl border border-border bg-surface/90 px-4 py-3">
									<div className="text-xl font-semibold">{s.value}</div>
									<div className="text-xs text-muted">{s.label}</div>
								</div>
							))}
						</div>
					</div>

					<div className="relative isolate h-[28rem] w-full max-w-sm shrink-0 overflow-hidden bg-transparent transition-transform duration-200 hover:scale-[1.02] sm:h-[32rem] lg:h-[34rem] lg:w-[28rem] lg:max-w-none">
						{/* Light mode */}
						<Image
							src={bitmHomepageImage}
							alt="BITM student choosing exam preparation, syllabus, videos, and notes"
							fill
							preload
							sizes="(max-width: 639px) min(100vw - 3rem, 20rem), (max-width: 1023px) 20rem, 24rem"
							className="object-contain hidden [html[data-theme='light']_&]:block"
						/>

						{/* Dark mode */}
						<Image
							src={darkthemeImage}
							alt="BITM student choosing exam preparation, syllabus, videos, and notes"
							fill
							preload
							sizes="(max-width: 639px) min(100vw - 3rem, 20rem), (max-width: 1023px) 20rem, 24rem"
							className="object-contain hidden [html[data-theme='dark']_&]:block"
						/>
					</div>
				</section>

			<section id="semesters" className="mx-auto min-h-screen w-full max-w-6xl px-6 py-16">
				<h2 className="text-2xl mt-10 font-semibold">Semesters</h2>
				<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{semesters.map((s) =>
						s.is_visible ? (
							<Link
								key={s.slug}
								href={`/semester/${s.slug}`}
								className="group flex min-h-32 items-center justify-between rounded-xl border border-border bg-surface px-6 py-6 transition-all hover:-translate-y-0.5 hover:border-accent-2/70 hover:bg-surface-2 hover:shadow-lg hover:shadow-accent-2/10"
							>
								<div>
									<div className="text-lg font-medium">{s.name}</div>
									<div className="text-sm text-muted">{s.subjects.length} subjects</div>
								</div>
								<span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-2/10 text-accent-2 transition-transform group-hover:translate-x-1">
									&rsaquo;
								</span>
							</Link>
						) : (
							<div
								key={s.slug}
								aria-disabled="true"
								className="flex min-h-32 cursor-not-allowed items-center justify-between rounded-xl border border-border bg-surface px-6 py-6 opacity-50"
							>
								<div>
									<div className="text-lg font-medium">{s.name}</div>
									<div className="text-sm text-muted">Coming soon</div>
								</div>
								<span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-muted">
									&ndash;
								</span>
							</div>
						),
					)}
				</div>
			</section>

			<section id="why" className="border-t border-border mx-auto flex w-full max-w-6xl flex-col px-6 py-20 lg:flex-row-reverse lg:items-center lg:gap-16 lg:px-10">

				<div className="relative z-10 w-full max-w-2xl lg:flex-1">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Why easyBITM?</p>
					<h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
						Everything you need, organized in one place.
					</h2>
					<p className="mt-4 max-w-xl text-muted leading-relaxed">
						Always updated and free to use, so you can spend less time searching and more time learning.
					</p>
					<div className="mt-8 grid gap-5 sm:grid-cols-2">
						<div className="border-l-2 border-accent px-4">
							<h3 className="font-medium">Organized</h3>
							<p className="mt-2 text-sm text-muted">
								Find exactly what you need without digging through folders, groups, or scattered files.
							</p>
						</div>
						<div className="border-l-2 border-accent-2 px-4">
							<h3 className="font-medium">Always Free</h3>
							<p className="mt-2 text-sm text-muted">
								No paywalls, no subscriptions — just resources when you need them.
							</p>
						</div>
						<div className="border-l-2 border-accent-2 px-4">
							<h3 className="font-medium">Always Updated</h3>
							<p className="mt-1 text-sm text-muted">We keep improving and updating resources so you can focus on learning.</p>
						</div>
						<div className="border-l-2 border-accent px-4">
							<h3 className="font-medium">Built for Students</h3>
							<p className="mt-1 text-sm text-muted">Made with students in mind: simple, accessible, and focused on what helps you study.</p>
						</div>
					</div>
				</div>
				<div className="relative mx-auto mt-8 h-80 w-full max-w-[10rem] shrink-0 sm:h-96 lg:mt-0 lg:h-[34rem] lg:w-[12rem]">
					<Image
						src="/why-section-dark-theme.png"
						alt="Simple illustration representing easyBITM for students"
						fill
						sizes="(max-width: 639px) 10rem, (max-width: 1023px) 11rem, 12rem"
						className="object-contain hidden [html[data-theme='light']_&]:block"
					/>
					<Image
						src="/dark-mode-why -section.png"
						alt="Simple illustration representing easyBITM for students"
						fill
						sizes="(max-width: 639px) 10rem, (max-width: 1023px) 11rem, 12rem"
						className="object-contain hidden [html[data-theme='dark']_&]:block"
					/>
				</div>
			</section>

			<section id="contact" className="border-t border-border">
				<div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-6 py-20 lg:flex-row lg:items-center lg:gap-16 lg:px-10">
					<div className="w-full max-w-2xl lg:flex-1">
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Your feedback matters</p>
						<h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Help Us Improve</h2>
						<p className="mt-4 max-w-xl text-muted leading-relaxed">
							Found something broken? Missing a resource? Have an idea? Tell us. Your feedback helps us keep easyBITM useful, simple, and up to date.
						</p>

						<div className="mt-8 grid gap-5 sm:grid-cols-2">
							<div className="border-l-2 border-accent px-4">
								<h3 className="font-medium">Found a Bug?</h3>
								<p className="mt-1 text-sm text-muted">Let us know what went wrong so we can fix it.</p>
							</div>
							<div className="border-l-2 border-accent-2 px-4">
								<h3 className="font-medium">Have an Idea?</h3>
								<p className="mt-1 text-sm text-muted">Suggest a feature that would make learning easier.</p>
							</div>
							<div className="border-l-2 border-accent-2 px-4">
								<h3 className="font-medium">Missing Content?</h3>
								<p className="mt-1 text-sm text-muted">Tell us what notes, resources, or topics you would like to see.</p>
							</div>
							<div className="border-l-2 border-accent px-4">
								<h3 className="font-medium">Know a Better Video?</h3>
								<p className="mt-1 text-sm text-muted">Suggest a clear and useful video for a topic.</p>
							</div>
						</div>
						<p className="mt-8 text-sm text-muted leading-relaxed">
							See outdated or incorrect content? Point it out and help us keep everything fresh. Every suggestion matters, and every correction helps.
						</p>
						<a
							href="mailto:easybitm@gmail.com"
							className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover-primary"
						>
							Send Feedback
						</a>
					</div>

					<div className="relative h-80 w-full max-w-sm shrink-0 sm:h-96 lg:h-[30rem] lg:w-[25rem]">
						<Image
							src="/help-us.png"
							alt="Student sharing feedback to help improve easyBITM"
							fill
							sizes="(max-width: 639px) 100vw, (max-width: 1023px) 24rem, 25rem"
							className="object-contain hidden [html[data-theme='light']_&]:block"
						/>
						<Image
							src="/help-us-dark-theme.png"
							alt="Student sharing feedback to help improve easyBITM"
							fill
							sizes="(max-width: 639px) 100vw, (max-width: 1023px) 24rem, 25rem"
							className="object-contain hidden [html[data-theme='dark']_&]:block"
						/>
					</div>
				</div>
			</section>

			</div>
			<Footer />
		</div>
	);
}
