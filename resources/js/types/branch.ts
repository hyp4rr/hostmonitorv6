export interface BranchListItem {
    id: number;
    name: string;
    code: string;
    description: string | null;
}

export interface BranchDevice {
    id: number;
    name: string;
    ip_address: string;
    mac_address: string | null;
    barcode: string;
    category: string;
    status: string;
    location: string;
    building: string;
    manufacturer: string;
    model: string;
    uptime_percentage: number;
    response_time: number | null;
    last_check: string | null;
    latitude: number | null;
    longitude: number | null;
    offline_reason?: string;
    offline_acknowledged_by?: string;
    offline_acknowledged_at?: string;
}

export interface BranchLocation {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
}

export interface CurrentBranch {
    id: number;
    name: string;
    code: string;
    description: string;
    address: string | null;
    deviceCount: number;
    locationCount: number;
    devices: BranchDevice[];
    locations: BranchLocation[];
    branches: BranchListItem[];
}

export interface BranchPageProps {
    currentBranch: CurrentBranch;
}
