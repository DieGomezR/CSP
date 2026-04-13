import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="min-h-svh bg-[linear-gradient(140deg,#eef8f6_0%,#eef6ff_52%,#fff6ed_100%)] px-4 py-8 sm:px-6 sm:py-10">
            <div className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-[32rem] items-center justify-center">
                <div className="w-full">
                    <div className="rounded-[2rem] border border-white/80 bg-white px-6 py-8 shadow-[0_35px_85px_-45px_rgba(44,78,114,0.45)] sm:px-8 sm:py-10 md:px-10">
                        <div className="flex flex-col items-center gap-3 sm:gap-4">
                            <Link
                                href={route('home')}
                                className="bg-[linear-gradient(90deg,#68d2c1_0%,#69a7ff_100%)] bg-clip-text text-center text-[2.5rem] font-black tracking-tight text-transparent sm:text-[3rem]"
                            >
                                KidSchedule
                            </Link>

                            <div className="space-y-2 sm:space-y-3 text-center">
                                <h1 className="text-[1.8rem] font-black tracking-tight text-slate-900 sm:text-[2.3rem]">{title}</h1>
                                <p className="mx-auto max-w-sm text-[1rem] leading-7 text-slate-500 sm:text-[1.15rem] sm:leading-8">{description}</p>
                            </div>
                        </div>

                        <div className="mt-6 sm:mt-8">{children}</div>
                    </div>

                    <div className="mt-6 text-center sm:mt-8">
                        <Link href={route('home')} className="text-[1rem] font-medium text-slate-500 transition hover:text-slate-900 sm:text-[1.05rem]">
                            ← Back to homepage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
