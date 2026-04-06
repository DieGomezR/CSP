import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="min-h-svh bg-[linear-gradient(140deg,#eef8f6_0%,#eef6ff_52%,#fff6ed_100%)] px-6 py-10">
            <div className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-[32rem] items-center justify-center">
                <div className="w-full">
                    <div className="rounded-[2rem] border border-white/80 bg-white px-8 py-10 shadow-[0_35px_85px_-45px_rgba(44,78,114,0.45)] md:px-10">
                        <div className="flex flex-col items-center gap-4">
                            <Link
                                href={route('home')}
                                className="text-center text-[3rem] font-black tracking-tight text-transparent bg-[linear-gradient(90deg,#68d2c1_0%,#69a7ff_100%)] bg-clip-text"
                            >
                                KidSchedule
                            </Link>

                            <div className="space-y-3 text-center">
                                <h1 className="text-[2.3rem] font-black tracking-tight text-slate-900">{title}</h1>
                                <p className="mx-auto max-w-sm text-[1.15rem] leading-8 text-slate-500">{description}</p>
                            </div>
                        </div>

                        <div className="mt-8">{children}</div>
                    </div>

                    <div className="mt-8 text-center">
                        <Link href={route('home')} className="text-[1.05rem] font-medium text-slate-500 transition hover:text-slate-900">
                            ← Back to homepage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
