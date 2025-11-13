export interface BranchListItem {
    id: number;
    name: string;
    code: string;
    description: string | null;
}

export interface BranchDevice {
    id: number;
    branch_id: number;
    location_id?: number;
    hardware_detail_id?: number;
    name: string;
    ip_address: string;
    mac_address?: string;
    barcode: string;
    category: string;
    status: string;
    uptime_percentage: number;
    response_time?: number;
    is_active: boolean;
    last_check?: string;
    location?: string;
    brand?: string;
    model?: string;
    latitude?: number;
    longitude?: number;
    hardware_detail?: {
        id: number;
        brand_id: number;
        model_id: number;
        brand?: {
            id: number;
            name: string;
        };
        hardware_model?: {
            id: number;
            name: string;
        };
    };
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
    latitude: number | null;
    longitude: number | null;
    is_active: boolean;
    deviceCount: number;
    devices: BranchDevice[];
    locations: string[]; // Laravel sends string array, not BranchLocation array
    branches: BranchListItem[];
}

export interface BranchPageProps {
    currentBranch: CurrentBranch;
}
