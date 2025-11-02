// import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    useEffect(() => {
        console.log('Dashboard component mounted');
        return () => console.log('Dashboard component unmounted');
    }, []);

    try {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <h1 className="text-2xl font-bold">Dashboard Loaded</h1>
                    <p>If you see this, the component is rendering. Check console for errors.</p>
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-gray-800 p-4">
                            <h2>Card 1</h2>
                            <p>Placeholder content</p>
                            {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                        </div>
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-gray-800 p-4">
                            <h2>Card 2</h2>
                            <p>Placeholder content</p>
                            {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                        </div>
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-gray-800 p-4">
                            <h2>Card 3</h2>
                            <p>Placeholder content</p>
                            {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                        </div>
                    </div>
                    <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border bg-white dark:bg-gray-800 p-4">
                        <h2>Main Content Area</h2>
                        <p>This should remain visible. If it goes black, check browser console for errors.</p>
                        {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                    </div>
                </div>
            </AppLayout>
        );
    } catch (error) {
        console.error('Dashboard render error:', error);
        return (
            <div className="p-4">
                <h1>Dashboard Error</h1>
                <p>An error occurred in AppLayout or rendering. Check console for details.</p>
                <pre>{error instanceof Error ? error.message : 'Unknown error'}</pre>
            </div>
        );
    }
}
