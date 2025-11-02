export interface BranchListItem {
    id: number;
    name: string;
    code: string;
    description: string;
}

export interface CurrentBranch {
    id: number | null;
    name: string;
    code: string;
    description: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    is_active: boolean;
    devices: any[];
    deviceCount: number;
    locations: string[];
    branches: BranchListItem[];
}

export interface BranchPageProps {
    currentBranch: CurrentBranch;
}
