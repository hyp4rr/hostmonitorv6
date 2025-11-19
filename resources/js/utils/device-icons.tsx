import { 
    Network, 
    Server, 
    Wifi, 
    Building2, 
    Camera,
    LucideIcon 
} from 'lucide-react';

/**
 * Get the appropriate icon component for a device category
 */
export function getDeviceCategoryIcon(category: string): LucideIcon {
    const normalizedCategory = category?.toLowerCase() || '';
    
    switch (normalizedCategory) {
        case 'switches':
            return Network;
        case 'servers':
            return Server;
        case 'wifi':
            return Wifi;
        case 'tas':
            return Building2;
        case 'cctv':
            return Camera;
        default:
            return Server; // Default fallback
    }
}

/**
 * Get the icon component as a React element
 */
export function DeviceCategoryIcon({ 
    category, 
    className = "size-4" 
}: { 
    category: string; 
    className?: string;
}) {
    const Icon = getDeviceCategoryIcon(category);
    return <Icon className={className} />;
}

