import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,#6fd8ca_0%,#63b3ff_100%)] text-sidebar-primary-foreground shadow-sm">
                <AppLogoIcon className="size-5 fill-current text-white" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm leading-none">
                <span className="truncate text-base font-black tracking-tight text-slate-950">KidSchedule</span>
                <span className="mt-1 truncate text-xs font-semibold text-slate-500">Family calendar</span>
            </div>
        </>
    );
}
