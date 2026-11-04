
import { Link } from 'react-router-dom';
import {
    Building2,
    ArrowRight,
    Layers3,
    ClipboardList,
    Ruler,
    Users,
    FileText,
    Calculator,
    ShieldCheck,
    HardHat,
    CheckCircle2,
} from 'lucide-react';

const features = [
    {
        icon: Layers3,
        title: 'Engineering Project Management',
        description:
            'Organise engineering projects, workspaces, teams and project activities in one connected environment.',
    },
    {
        icon: ClipboardList,
        title: 'Site Supervision and Records',
        description:
            'Maintain site notes, daily reports, engineering records and important project information.',
    },
    {
        icon: Ruler,
        title: 'Surveying and Engineering Tools',
        description:
            'Access practical engineering calculations, technical references and tools that support professional workflows.',
    },
    {
        icon: Users,
        title: 'Engineering Collaboration',
        description:
            'Support communication and coordination between engineers, contractors, consultants and project teams.',
    },
    {
        icon: FileText,
        title: 'Technical Documentation',
        description:
            'Organise drawings, documents, project evidence and technical information.',
    },
    {
        icon: Calculator,
        title: 'Engineering Calculations',
        description:
            'Use engineering calculation tools to support technical work and everyday problem-solving.',
    },
    {
        icon: HardHat,
        title: 'Procurement and Site Operations',
        description:
            'Coordinate procurement requests, supplier activities and project-related operations.',
    },
    {
        icon: ShieldCheck,
        title: 'Connected Project Information',
        description:
            'Keep important project information organised and accessible to authorised team members.',
    },
];

const steps = [
    {
        number: '01',
        title: 'Create your workspace',
        description:
            'Establish your engineering workspace and organise your projects.',
    },
    {
        number: '02',
        title: 'Manage your workflow',
        description:
            'Use the available tools to manage records, documentation and project activities.',
    },
    {
        number: '03',
        title: 'Collaborate and progress',
        description:
            'Coordinate with authorised team members and keep project information connected.',
    },
];

export default function HomePage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white">

            <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">

                    <Link to="/" className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-600 p-2">
                            <Building2 size={25} />
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            EngineerOS
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-slate-300 hover:text-white"
                        >
                            Sign In
                        </Link>

                        <Link
                            to="/login"
                            className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold hover:bg-emerald-700"
                        >
                            Get Started
                        </Link>
                    </div>

                </nav>
            </header>

            <main>

                {/* HERO */}
                <section className="relative overflow-hidden">
                    <div className="pointer-events-none absolute -right-40 -top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

                    <div className="relative mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36">

                        <div className="max-w-4xl">

                            <p className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
                                Engineering Intelligence Platform
                            </p>

                            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                                One intelligent workspace.
                                <span className="text-emerald-400">
                                    {' '}Every engineering project.
                                </span>
                            </h1>

                            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
                                EngineerOS is a digital workspace for civil and structural
                                engineering professionals. Bring project management,
                                site supervision, technical documentation, engineering
                                tools, procurement and collaboration into one connected platform.
                            </p>

                            <div className="mt-9 flex flex-wrap gap-4">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-3 rounded-xl bg-emerald-600 px-6 py-4 font-semibold hover:bg-emerald-700"
                                >
                                    Get Started with EngineerOS
                                    <ArrowRight size={19} />
                                </Link>

                                <a
                                    href="#features"
                                    className="rounded-xl border border-slate-700 px-6 py-4 font-semibold hover:bg-slate-900"
                                >
                                    Explore Platform
                                </a>
                            </div>

                            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400">
                                <span>Project Management</span>
                                <span>Site Documentation</span>
                                <span>Engineering Tools</span>
                                <span>Team Collaboration</span>
                            </div>

                        </div>
                    </div>
                </section>

                {/* INTRODUCTION */}
                <section className="border-y border-white/10 bg-slate-900/60">
                    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-20">

                        <div>
                            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-emerald-400">
                                About EngineerOS
                            </p>

                            <h2 className="text-3xl font-bold leading-tight md:text-4xl">
                                A connected digital environment for engineering work.
                            </h2>
                        </div>

                        <p className="text-base leading-8 text-slate-400">
                            Engineering projects involve people, technical records,
                            decisions, documentation and daily site activities.
                            EngineerOS brings these workflows together in a structured
                            digital environment designed to support the way engineering
                            teams organise and manage their work.
                        </p>

                    </div>
                </section>

                {/* FEATURES */}
                <section id="features" className="scroll-mt-24 py-20 md:py-28">
                    <div className="mx-auto max-w-7xl px-5 md:px-8">

                        <div className="mb-12 max-w-3xl">
                            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-emerald-400">
                                Platform capabilities
                            </p>

                            <h2 className="text-3xl font-bold md:text-4xl">
                                Engineering workflows in one workspace.
                            </h2>

                            <p className="mt-5 leading-8 text-slate-400">
                                Explore the tools and connected workflows available
                                within the EngineerOS environment.
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature) => {
                                const Icon = feature.icon;

                                return (
                                    <article
                                        key={feature.title}
                                        className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:-translate-y-1 hover:border-emerald-500/40"
                                    >
                                        <Icon
                                            className="mb-6 text-emerald-400"
                                            size={30}
                                        />

                                        <h3 className="mb-3 text-lg font-bold">
                                            {feature.title}
                                        </h3>

                                        <p className="text-sm leading-7 text-slate-400">
                                            {feature.description}
                                        </p>
                                    </article>
                                );
                            })}
                        </div>

                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section className="border-y border-white/10 bg-slate-900/60 py-20">
                    <div className="mx-auto max-w-7xl px-5 md:px-8">

                        <div className="mb-12 max-w-2xl">
                            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-emerald-400">
                                Getting started
                            </p>

                            <h2 className="text-3xl font-bold md:text-4xl">
                                Start organising your engineering work.
                            </h2>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {steps.map((step) => (
                                <article key={step.number}>
                                    <p className="mb-5 text-4xl font-bold text-emerald-400">
                                        {step.number}
                                    </p>

                                    <h3 className="mb-3 text-xl font-bold">
                                        {step.title}
                                    </h3>

                                    <p className="leading-7 text-slate-400">
                                        {step.description}
                                    </p>
                                </article>
                            ))}
                        </div>

                    </div>
                </section>

                {/* CALL TO ACTION */}
                <section className="px-5 py-24 md:px-8">
                    <div className="mx-auto max-w-5xl rounded-3xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-16 text-center md:px-16">

                        <CheckCircle2
                            className="mx-auto mb-6 text-emerald-400"
                            size={38}
                        />

                        <h2 className="text-3xl font-bold md:text-4xl">
                            Bring your engineering workflow together.
                        </h2>

                        <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-400">
                            Explore EngineerOS and discover a connected workspace
                            for managing engineering projects and technical information.
                        </p>

                        <Link
                            to="/login"
                            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-emerald-600 px-7 py-4 font-semibold hover:bg-emerald-700"
                        >
                            Explore EngineerOS
                            <ArrowRight size={19} />
                        </Link>

                    </div>
                </section>

            </main>

            <footer className="border-t border-white/10 py-8">
                <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 text-sm text-slate-500 md:flex-row md:px-8">
                    <p>
                        EngineerOS © {new Date().getFullYear()}.
                        Engineering Intelligence Platform.
                    </p>

                    <div className="flex gap-5">
                        <Link to="/login" className="hover:text-white">
                            Sign In
                        </Link>
                        <Link to="/login" className="hover:text-white">
                            Get Started
                        </Link>
                    </div>
                </div>
            </footer>

        </div>
    );
}
