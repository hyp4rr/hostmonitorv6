import MonitorLayout from '@/layouts/monitor-layout';
import {
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    Server,
    Network,
    Search,
    Filter,
    MoreVertical,
    Download,
    Upload,
    RefreshCw,
    Link2,
    MousePointer2,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Settings,
    Router,
    Layers,
    Wifi,
    Monitor,
    HardDrive,
    Grid3x3,
    Move,
    Zap,
    Eye,
    EyeOff,
} from 'lucide-react';
import { getDeviceCategoryIcon } from '@/utils/device-icons';
import { useEffect, useState, useCallback, useRef, useMemo, memo } from 'react';
import { router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { applyLayout, LayoutType } from '@/utils/topology-layouts';
import ReactFlow, {
    Node,
    Edge,
    addEdge,
    Background,
    Controls,
    MiniMap,
    Connection,
    useNodesState,
    useEdgesState,
    Panel,
    NodeTypes,
    EdgeTypes,
    Handle,
    Position,
    MarkerType,
    BezierEdge,
    StepEdge,
    StraightEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface Device {
    id: number;
    name: string;
    ip_address: string;
    category: string;
    status: string;
    brand: string;
    model: string;
}

interface Topology {
    id: number;
    name: string;
    description: string;
    canvas_data: {
        nodes: Node[];
        edges: Edge[];
    };
    device_count: number;
    created_at: string;
    updated_at: string;
}

interface TopologyDevice {
    device_id: number;
    node_id: string;
    position_x: number;
    position_y: number;
    node_data?: any;
}

// Modern smooth edge component with bezier curves
const ModernEdge = memo((props: any) => {
    const { sourceX, sourceY, targetX, targetY, selected, style = {}, sourceHandleId, targetHandleId } = props;
    
    // Validate coordinates to prevent NaN errors
    const sx = typeof sourceX === 'number' && !isNaN(sourceX) ? sourceX : 0;
    const sy = typeof sourceY === 'number' && !isNaN(sourceY) ? sourceY : 0;
    const tx = typeof targetX === 'number' && !isNaN(targetX) ? targetX : 0;
    const ty = typeof targetY === 'number' && !isNaN(targetY) ? targetY : 0;
    
    // Calculate bezier curve path for smooth connections
    const dx = tx - sx;
    const dy = ty - sy;
    const curvature = 0.3;
    const controlX1 = sx + dx * curvature;
    const controlY1 = sy;
    const controlX2 = tx - dx * curvature;
    const controlY2 = ty;
    
    // Ensure all values are valid numbers
    const path = `M ${sx} ${sy} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${tx} ${ty}`;
    
    // Premium edge styling
    const lineColor = selected ? '#3b82f6' : (style.stroke || '#94a3b8');
    const lineWidth = selected ? 3.5 : (style.strokeWidth || 2.5);
    
    return (
        <g>
            {/* Shadow/glow layer for depth */}
            {selected && (
                <path
                    d={path}
                    stroke={lineColor}
                    strokeWidth={lineWidth + 4}
                    fill="none"
                    strokeLinecap="round"
                    opacity={0.2}
                    style={{ filter: 'blur(4px)' }}
                />
            )}
            
            {/* Main edge line - smooth bezier curve */}
            <path
                d={path}
                stroke={lineColor}
                strokeWidth={lineWidth}
                fill="none"
                strokeLinecap="round"
                style={{
                    opacity: selected ? 1 : 0.65,
                    filter: selected ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))' : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                    transition: 'all 0.3s ease',
                    ...style,
                }}
            />
            
            {/* Connection point indicators when selected */}
            {selected && (
                <>
                    <circle
                        cx={sx}
                        cy={sy}
                        r={6}
                        fill={lineColor}
                        stroke="white"
                        strokeWidth={2.5}
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
                    />
                    <circle
                        cx={tx}
                        cy={ty}
                        r={6}
                        fill={lineColor}
                        stroke="white"
                        strokeWidth={2.5}
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
                    />
                </>
            )}
        </g>
    );
});

const edgeTypes: EdgeTypes = {
    cable: ModernEdge,
    default: BezierEdge,
    straight: StraightEdge,
    step: StepEdge,
    smooth: ModernEdge,
};

// Get device icon based on category (Packet Tracer style)
const getDeviceIcon = (category: string) => {
    const iconClass = "w-12 h-12";
    switch (category?.toLowerCase()) {
        case 'switches':
            return <Layers className={iconClass} />;
        case 'servers':
            return <Server className={iconClass} />;
        case 'wifi':
            return <Wifi className={iconClass} />;
        case 'cctv':
            return <Monitor className={iconClass} />;
        case 'tas':
            return <HardDrive className={iconClass} />;
        default:
            return <Network className={iconClass} />;
    }
};

// Get node color scheme based on category/status
const getNodeColorScheme = (category: string, status: string) => {
    const isOnline = status === 'online';
    
    if (!isOnline) {
        return {
            bg: 'bg-slate-300 dark:bg-slate-600',
            border: 'border-slate-400 dark:border-slate-500',
            text: 'text-slate-700 dark:text-slate-200',
            icon: 'text-slate-500 dark:text-slate-400',
            statusDot: 'bg-slate-500'
        };
    }
    
    switch (category?.toLowerCase()) {
        case 'switches':
            return {
                bg: 'bg-blue-50 dark:bg-blue-950/30',
                border: 'border-blue-300 dark:border-blue-700',
                text: 'text-blue-900 dark:text-blue-100',
                icon: 'text-blue-600 dark:text-blue-400',
                statusDot: 'bg-blue-500'
            };
        case 'servers':
            return {
                bg: 'bg-purple-50 dark:bg-purple-950/30',
                border: 'border-purple-300 dark:border-purple-700',
                text: 'text-purple-900 dark:text-purple-100',
                icon: 'text-purple-600 dark:text-purple-400',
                statusDot: 'bg-purple-500'
            };
        case 'wifi':
            return {
                bg: 'bg-pink-50 dark:bg-pink-950/30',
                border: 'border-pink-300 dark:border-pink-700',
                text: 'text-pink-900 dark:text-pink-100',
                icon: 'text-pink-600 dark:text-pink-400',
                statusDot: 'bg-pink-500'
            };
        case 'cctv':
            return {
                bg: 'bg-indigo-50 dark:bg-indigo-950/30',
                border: 'border-indigo-300 dark:border-indigo-700',
                text: 'text-indigo-900 dark:text-indigo-100',
                icon: 'text-indigo-600 dark:text-indigo-400',
                statusDot: 'bg-indigo-500'
            };
        case 'tas':
            return {
                bg: 'bg-teal-50 dark:bg-teal-950/30',
                border: 'border-teal-300 dark:border-teal-700',
                text: 'text-teal-900 dark:text-teal-100',
                icon: 'text-teal-600 dark:text-teal-400',
                statusDot: 'bg-teal-500'
            };
        default:
            return {
                bg: 'bg-slate-50 dark:bg-slate-800',
                border: 'border-slate-300 dark:border-slate-600',
                text: 'text-slate-900 dark:text-slate-100',
                icon: 'text-slate-600 dark:text-slate-400',
                statusDot: 'bg-slate-500'
            };
    }
};

// Modern professional node component
const DeviceNode = memo(({ data, selected }: { data: any; selected?: boolean }) => {
    const colors = getNodeColorScheme(data.category, data.status);
    const Icon = getDeviceCategoryIcon(data.category || '');
    const isOnline = data.status === 'online';

    return (
        <div 
            className="relative group"
            style={{ pointerEvents: 'auto' }}
        >
            {/* Connection handles - all four sides */}
            {['top', 'bottom', 'left', 'right'].map((pos) => (
                <Handle
                    key={`source-${pos}`}
                    type="source"
                    position={Position[pos as keyof typeof Position]}
                    id={pos}
                    className="!bg-slate-600 !border-2 !border-white hover:!bg-blue-500 hover:!scale-110 transition-all duration-200"
                    style={{ 
                        width: '12px', 
                        height: '12px',
                        borderRadius: '50%',
                        cursor: 'grab',
                        zIndex: 10,
                    }}
                />
            ))}
            {['top', 'bottom', 'left', 'right'].map((pos) => (
                <Handle
                    key={`target-${pos}`}
                    type="target"
                    position={Position[pos as keyof typeof Position]}
                    id={pos}
                    className="!bg-slate-600 !border-2 !border-white hover:!bg-blue-500 hover:!scale-110 transition-all duration-200"
                    style={{ 
                        width: '12px', 
                        height: '12px',
                        borderRadius: '50%',
                        cursor: 'grab',
                        zIndex: 10,
                    }}
                />
            ))}

            {/* Compact card-style node */}
            <div 
                className={`
                    ${colors.bg} ${colors.border} border-2 rounded-lg shadow-lg hover:shadow-xl 
                    transition-all duration-300 px-3 py-2.5 min-w-[120px] max-w-[150px]
                    ${selected ? 'ring-2 ring-blue-500/50 ring-offset-1 scale-105' : 'hover:scale-105'}
                    backdrop-blur-sm
                `}
            >
                {/* Status indicator */}
                <div className="absolute -top-1.5 -right-1.5 z-10">
                    <div className={`w-3 h-3 rounded-full ${colors.statusDot} ${isOnline ? 'animate-pulse' : ''} shadow-md border-2 border-white dark:border-slate-800`} />
                </div>

                {/* Device icon */}
                <div className="flex items-center justify-center mb-2">
                    <div className={`p-2 rounded-lg bg-white/70 dark:bg-black/30 backdrop-blur-sm ${colors.icon} shadow-sm`}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>

                {/* Device name */}
                <div className={`${colors.text} text-sm font-bold text-center mb-1.5 truncate leading-tight`}>
                    {data.name}
                </div>

                {/* IP address */}
                <div className={`${colors.text} text-[10px] opacity-80 text-center font-mono truncate mb-1.5 px-1.5 py-0.5 bg-white/40 dark:bg-black/20 rounded`}>
                    {data.ip_address}
                </div>

                {/* Category badge */}
                <div className={`mt-1.5 text-center ${colors.text} text-[9px] font-bold uppercase tracking-wide opacity-70 px-1.5 py-0.5 rounded bg-white/30 dark:bg-black/20`}>
                    {data.category || 'Device'}
                </div>
            </div>
        </div>
    );
});

const nodeTypes: NodeTypes = {
    device: DeviceNode,
};

export default function Topology() {
    const { props } = usePage<PageProps>();
    const { currentBranch, topologies: initialTopologies } = props;

    const [topologies, setTopologies] = useState<Topology[]>(initialTopologies || []);
    const [selectedTopology, setSelectedTopology] = useState<Topology | null>(null);
    const [devices, setDevices] = useState<Device[]>([]);
    const [isLoadingDevices, setIsLoadingDevices] = useState(false);
    const [isLoadingTopologies, setIsLoadingTopologies] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [topologyToDelete, setTopologyToDelete] = useState<Topology | null>(null);
    const [newTopologyName, setNewTopologyName] = useState('');
    const [newTopologyDescription, setNewTopologyDescription] = useState('');
    const [editTopologyName, setEditTopologyName] = useState('');
    const [editTopologyDescription, setEditTopologyDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isTopologyPanelCollapsed, setIsTopologyPanelCollapsed] = useState(false);
    const [isDevicePanelCollapsed, setIsDevicePanelCollapsed] = useState(false);
    const [isControlsPanelCollapsed, setIsControlsPanelCollapsed] = useState(false);
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
    const [deviceSearchQuery, setDeviceSearchQuery] = useState('');
    
    // Multi-selection state
    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
    const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(new Set());
    const [showBulkEditPanel, setShowBulkEditPanel] = useState(false);
    
    // Debounce search queries to reduce re-renders
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [debouncedDeviceSearchQuery, setDebouncedDeviceSearchQuery] = useState('');

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    // Load devices
    useEffect(() => {
        loadDevices();
    }, [currentBranch?.id]);

    // Load topologies
    useEffect(() => {
        loadTopologies();
    }, [currentBranch?.id]);

    // Load topology data when selected
    useEffect(() => {
        if (selectedTopology) {
            loadTopologyData(selectedTopology.id);
        } else {
            setNodes([]);
            setEdges([]);
        }
    }, [selectedTopology?.id]); // Use selectedTopology?.id to avoid unnecessary reloads

    // Debounce search queries
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedDeviceSearchQuery(deviceSearchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [deviceSearchQuery]);


    const loadDevices = useCallback(async () => {
        if (!currentBranch?.id) return;

        setIsLoadingDevices(true);
        try {
            // Only load first 100 devices initially for better performance
            // Users can search/filter to find specific devices
            const response = await fetch(
                `/api/devices?branch_id=${currentBranch.id}&per_page=100&page=1&include_inactive=true&active_filter=all`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Handle error response
            if (result.error) {
                throw new Error(result.error);
            }
            
            // The API returns { data: [...], pagination: {...} }
            if (result.data && Array.isArray(result.data)) {
                setDevices(result.data);
            } else {
                setDevices([]);
            }
        } catch (error) {
            console.error('Failed to load devices:', error);
            setDevices([]);
        } finally {
            setIsLoadingDevices(false);
        }
    }, [currentBranch?.id]);

    const loadTopologies = async () => {
        if (!currentBranch?.id) return;

        setIsLoadingTopologies(true);
        try {
            const response = await fetch(
                `/api/topologies?branch_id=${currentBranch.id}`
            );
            const result = await response.json();
            // The API returns { success: true, data: [...] }
            if (result.success && result.data) {
                setTopologies(result.data || []);
            } else if (Array.isArray(result)) {
                // Fallback: if API returns array directly
                setTopologies(result);
            }
        } catch (error) {
            console.error('Failed to load topologies:', error);
        } finally {
            setIsLoadingTopologies(false);
        }
    };

    const loadTopologyData = async (topologyId: number) => {
        try {
            const response = await fetch(`/api/topologies/${topologyId}`);
            const result = await response.json();
            // The API returns { success: true, data: {...} }
            if (result.success && result.data) {
                const topology = result.data;
                setSelectedTopology({
                    id: topology.id,
                    name: topology.name,
                    description: topology.description || '',
                    canvas_data: topology.canvas_data || { nodes: [], edges: [] },
                    device_count: topology.devices?.length || 0,
                    created_at: topology.created_at,
                    updated_at: topology.updated_at,
                });

                // Convert devices to nodes
                const topologyNodes: Node[] = (topology.devices || []).map((device: any) => ({
                    id: device.node_id,
                    type: 'device',
                    position: { x: device.position_x, y: device.position_y },
                    data: {
                        name: device.name,
                        ip_address: device.ip_address,
                        category: device.category,
                        status: device.status,
                        brand: device.brand,
                        model: device.model,
                        deviceId: device.id,
                    },
                }));

                // Load edges from canvas_data
                // Filter edges to only include those where both source and target nodes exist
                const nodeIds = new Set(topologyNodes.map(n => n.id));
                const topologyEdges: Edge[] = (topology.canvas_data?.edges || [])
                    .filter((edge: any) => {
                        const hasSource = nodeIds.has(edge.source);
                        const hasTarget = nodeIds.has(edge.target);
                        if (!hasSource || !hasTarget) {
                            console.warn('Edge filtered out - missing node:', {
                                edgeId: edge.id,
                                source: edge.source,
                                target: edge.target,
                                hasSource,
                                hasTarget,
                                availableNodes: Array.from(nodeIds)
                            });
                            return false;
                        }
                        return true;
                    })
                    .map((edge: any) => {
                        const edgeObj: Edge = {
                            id: edge.id,
                            source: edge.source,
                            target: edge.target,
                            type: edge.type || 'cable',
                            animated: edge.animated || false,
                            style: edge.style || { 
                                strokeWidth: 2.5, 
                                stroke: '#94a3b8',
                            },
                        };
                        // Always restore handles if they exist (important for proper connection points)
                        if (edge.sourceHandle) {
                            edgeObj.sourceHandle = edge.sourceHandle;
                        }
                        if (edge.targetHandle) {
                            edgeObj.targetHandle = edge.targetHandle;
                        }
                        return edgeObj;
                    });

                setNodes(topologyNodes);
                setEdges(topologyEdges);
            }
        } catch (error) {
            console.error('Failed to load topology data:', error);
        }
    };

    const onConnect = useCallback(
        (params: Connection) => {
            // Allow connections from handles
            if (!selectedTopology) {
                return false;
            }
            
            // Prevent self-connections
            if (params.source === params.target) {
                return false;
            }
            
            // Create edge from handle connection with proper type and handles
            const newEdge: Edge = {
                id: `edge-${params.source}-${params.target}-${params.sourceHandle || 'default'}-${params.targetHandle || 'default'}-${Date.now()}`,
                source: params.source,
                target: params.target,
                sourceHandle: params.sourceHandle || undefined,
                targetHandle: params.targetHandle || undefined,
                type: 'cable',
                animated: false,
                style: { 
                    strokeWidth: 2.5, 
                    stroke: '#94a3b8',
                },
            };
            
            // Check if connection already exists (same handles)
            const existingEdge = edges.find(
                (edge) => 
                    edge.source === params.source && 
                    edge.target === params.target &&
                    edge.sourceHandle === params.sourceHandle &&
                    edge.targetHandle === params.targetHandle
            );
            
            if (!existingEdge) {
                setEdges((eds) => [...eds, newEdge]);
                
                // Visual feedback
                setNodes((nds) =>
                    nds.map((n) =>
                        n.id === params.source || n.id === params.target
                            ? { 
                                ...n, 
                                style: { 
                                    ...n.style, 
                                    border: '3px solid #10b981', 
                                    borderColor: '#10b981',
                                    transition: 'border-color 0.3s',
                                } 
                            }
                            : n
                    )
                );
                
                setTimeout(() => {
                    setNodes((nds) =>
                        nds.map((n) => ({
                            ...n,
                            style: { ...n.style, border: undefined, borderColor: undefined },
                        }))
                    );
                }, 500);
            }
            
            return true; // Allow ReactFlow to create the connection
        },
        [selectedTopology, edges, setEdges, setNodes]
    );


    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Handle pane click to deselect
    const onPaneClick = useCallback((event?: React.MouseEvent) => {
        // Only clear selection if not Ctrl+click (for multi-select)
        if (event && (event.ctrlKey || event.metaKey)) {
            return;
        }
        
        setSelectedEdge(null);
        // Clear multi-selection when clicking on pane (unless Ctrl is held)
        if (!event || (!event.ctrlKey && !event.metaKey)) {
            setSelectedNodeIds(new Set());
            setSelectedEdgeIds(new Set());
            setShowBulkEditPanel(false);
        }
    }, []);
    
    // Handle selection change (from ReactFlow)
    const onSelectionChange = useCallback((params: { nodes: Node[]; edges: Edge[] }) => {
        const nodeIds = new Set(params.nodes.map(n => n.id));
        const edgeIds = new Set(params.edges.map(e => e.id));
        setSelectedNodeIds(nodeIds);
        setSelectedEdgeIds(edgeIds);
        setShowBulkEditPanel(nodeIds.size > 0 || edgeIds.size > 0);
    }, []);
    
    // Bulk edit functions
    const handleBulkDelete = useCallback(() => {
        if (selectedNodeIds.size === 0 && selectedEdgeIds.size === 0) return;
        
        if (confirm(`Delete ${selectedNodeIds.size} device(s) and ${selectedEdgeIds.size} connection(s)?`)) {
            // Delete selected nodes
            if (selectedNodeIds.size > 0) {
                setNodes((nds) => nds.filter(n => !selectedNodeIds.has(n.id)));
            }
            
            // Delete selected edges
            if (selectedEdgeIds.size > 0) {
                setEdges((eds) => eds.filter(e => !selectedEdgeIds.has(e.id)));
            }
            
            // Clear selection
            setSelectedNodeIds(new Set());
            setSelectedEdgeIds(new Set());
            setShowBulkEditPanel(false);
        }
    }, [selectedNodeIds, selectedEdgeIds, setNodes, setEdges]);
    
    const handleBulkChangeEdgeType = useCallback((edgeType: string) => {
        if (selectedEdgeIds.size === 0) return;
        
        setEdges((eds) =>
            eds.map((edge) =>
                selectedEdgeIds.has(edge.id)
                    ? { ...edge, type: edgeType }
                    : edge
            )
        );
    }, [selectedEdgeIds, setEdges]);
    
    const handleSelectAll = useCallback(() => {
        const allNodeIds = new Set(nodes.map(n => n.id));
        const allEdgeIds = new Set(edges.map(e => e.id));
        setSelectedNodeIds(allNodeIds);
        setSelectedEdgeIds(allEdgeIds);
        setShowBulkEditPanel(allNodeIds.size > 0 || allEdgeIds.size > 0);
    }, [nodes, edges]);
    
    const handleDeselectAll = useCallback(() => {
        setSelectedNodeIds(new Set());
        setSelectedEdgeIds(new Set());
        setShowBulkEditPanel(false);
    }, []);
    
    // Handle node click with Ctrl for multi-select (removed click-to-connect)
    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (!selectedTopology) {
            return;
        }
        
        event.stopPropagation();
        
        if (event.ctrlKey || event.metaKey) {
            // Multi-select mode
            setSelectedNodeIds(prev => {
                const newSet = new Set(prev);
                if (newSet.has(node.id)) {
                    newSet.delete(node.id);
                } else {
                    newSet.add(node.id);
                }
                setShowBulkEditPanel(newSet.size > 0 || selectedEdgeIds.size > 0);
                return newSet;
            });
        } else {
            // Single select mode - just clear multi-selection
            setSelectedNodeIds(new Set());
            setSelectedEdgeIds(new Set());
            setShowBulkEditPanel(false);
        }
    }, [selectedTopology, selectedEdgeIds]);
    
    // Handle edge click with Ctrl for multi-select
    const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        event.stopPropagation();
        
        if (event.ctrlKey || event.metaKey) {
            // Multi-select mode
            setSelectedEdgeIds(prev => {
                const newSet = new Set(prev);
                if (newSet.has(edge.id)) {
                    newSet.delete(edge.id);
                } else {
                    newSet.add(edge.id);
                }
                setShowBulkEditPanel(newSet.size > 0 || selectedNodeIds.size > 0);
                return newSet;
            });
        } else {
            // Single select mode
            setSelectedEdge(edge);
            setSelectedNodeIds(new Set());
            setSelectedEdgeIds(new Set([edge.id]));
            setShowBulkEditPanel(true);
        }
    }, [selectedNodeIds]);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!selectedTopology) {
                alert('Please select a topology first');
                return;
            }

            const deviceId = event.dataTransfer.getData('application/reactflow');
            if (!deviceId) {
                return;
            }

            if (!reactFlowInstance) {
                return;
            }

            const device = devices.find((d) => d.id === parseInt(deviceId));
            if (!device) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // Check if device already exists in canvas
            const deviceExists = nodes.some((node) => node.data.deviceId === device.id);
            if (deviceExists) {
                alert(`Device "${device.name}" is already in the canvas. Each device can only be added once.`);
                return;
            }

            const newNode: Node = {
                id: `device-${device.id}-${Date.now()}`,
                type: 'device',
                position,
                data: {
                    name: device.name,
                    ip_address: device.ip_address,
                    category: device.category,
                    status: device.status,
                    brand: device.brand || '',
                    model: device.model || '',
                    deviceId: device.id,
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, devices, nodes, setNodes, selectedTopology]
    );

    const handleCreateTopology = async () => {
        if (!newTopologyName.trim() || !currentBranch?.id) return;

        setIsSaving(true);
        try {
            const canvasData = {
                nodes: nodes.map((node) => ({
                    id: node.id,
                    position: node.position,
                    type: node.type,
                    data: node.data,
                })),
                edges: edges.map((edge) => {
                    const edgeData: any = {
                        id: edge.id,
                        source: edge.source,
                        target: edge.target,
                        type: edge.type || 'cable',
                        animated: edge.animated || false,
                        style: edge.style || { 
                            strokeWidth: 4, 
                            stroke: '#6366f1',
                        },
                        markerEnd: edge.markerEnd || {
                            type: MarkerType.ArrowClosed,
                            width: 24,
                            height: 24,
                            color: '#6366f1',
                        },
                    };
                    // Only include handles if they exist
                    if (edge.sourceHandle) {
                        edgeData.sourceHandle = edge.sourceHandle;
                    }
                    if (edge.targetHandle) {
                        edgeData.targetHandle = edge.targetHandle;
                    }
                    return edgeData;
                }),
            };

            const topologyDevices: TopologyDevice[] = nodes.map((node) => ({
                device_id: node.data.deviceId,
                node_id: node.id,
                position_x: node.position.x,
                position_y: node.position.y,
                node_data: node.data,
            }));

            const response = await fetch('/api/topologies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    branch_id: currentBranch.id,
                    name: newTopologyName,
                    description: newTopologyDescription,
                    canvas_data: canvasData,
                    devices: topologyDevices,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setShowCreateModal(false);
                setNewTopologyName('');
                setNewTopologyDescription('');
                setNodes([]);
                setEdges([]);
                loadTopologies();
            } else {
                alert('Failed to create topology: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Failed to create topology:', error);
            alert('Failed to create topology');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateTopology = async () => {
        if (!selectedTopology || !currentBranch?.id) return;

        setIsSaving(true);
        try {
            const canvasData = {
                nodes: nodes.map((node) => ({
                    id: node.id,
                    position: node.position,
                    type: node.type,
                    data: node.data,
                })),
                edges: edges.map((edge) => {
                    const edgeData: any = {
                        id: edge.id,
                        source: edge.source,
                        target: edge.target,
                        type: edge.type || 'cable',
                        animated: edge.animated || false,
                        style: edge.style || { 
                            strokeWidth: 2.5, 
                            stroke: '#94a3b8',
                        },
                    };
                    // Always include handles if they exist (important for proper connection points)
                    if (edge.sourceHandle) {
                        edgeData.sourceHandle = edge.sourceHandle;
                    }
                    if (edge.targetHandle) {
                        edgeData.targetHandle = edge.targetHandle;
                    }
                    return edgeData;
                }),
            };

            const topologyDevices: TopologyDevice[] = nodes
                .filter((node) => node.data && node.data.deviceId) // Only include nodes with valid deviceId
                .map((node) => ({
                    device_id: node.data.deviceId,
                    node_id: node.id,
                    position_x: node.position.x,
                    position_y: node.position.y,
                    node_data: node.data,
                }));

            const requestBody: any = {
                name: selectedTopology.name,
                description: selectedTopology.description || '',
                canvas_data: canvasData,
            };

            // Only include devices if there are any
            if (topologyDevices.length > 0) {
                requestBody.devices = topologyDevices;
            }

            const response = await fetch(`/api/topologies/${selectedTopology.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(requestBody),
            });

            // Check if response is ok
            if (!response.ok) {
                const errorText = await response.text();
                console.error('HTTP Error:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('Update response:', data);
            if (data.success) {
                loadTopologies();
                loadTopologyData(selectedTopology.id);
            } else {
                // Show detailed error message
                let errorMessage = data.message || 'Unknown error';
                if (data.errors) {
                    const errorDetails = Object.values(data.errors).flat().join(', ');
                    errorMessage += ': ' + errorDetails;
                }
                if (data.error) {
                    errorMessage += ': ' + data.error;
                }
                console.error('Update failed:', data);
                alert('Failed to update topology: ' + errorMessage);
            }
        } catch (error) {
            console.error('Failed to update topology:', error);
            alert('Failed to update topology: ' + (error instanceof Error ? error.message : 'Network error'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTopology = async () => {
        if (!topologyToDelete) return;

        try {
            const response = await fetch(`/api/topologies/${topologyToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            if (data.success) {
                setShowDeleteModal(false);
                setTopologyToDelete(null);
                if (selectedTopology?.id === topologyToDelete.id) {
                    setSelectedTopology(null);
                    setNodes([]);
                    setEdges([]);
                }
                loadTopologies();
            } else {
                alert('Failed to delete topology: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Failed to delete topology:', error);
            alert('Failed to delete topology');
        }
    };

    // Memoize filtered topologies to avoid recalculating on every render
    const filteredTopologies = useMemo(() => {
        if (!debouncedSearchQuery.trim()) return topologies;
        const query = debouncedSearchQuery.toLowerCase();
        return topologies.filter((topology) =>
            topology.name.toLowerCase().includes(query)
        );
    }, [topologies, debouncedSearchQuery]);

    // Filter devices for device panel - exclude devices already in canvas
    const availableDevices = useMemo(() => {
        if (!devices.length) return [];
        
        const deviceIdsInCanvas = new Set(nodes.map(node => node.data?.deviceId || node.data?.device_id));
        const query = debouncedDeviceSearchQuery.toLowerCase();
        
        return devices
            .filter((device) => {
                // Exclude devices already in canvas
                if (deviceIdsInCanvas.has(device.id)) return false;
                
                // Filter by search if provided
                if (query) {
                    return device.name.toLowerCase().includes(query) ||
                           device.ip_address.toLowerCase().includes(query);
                }
                return true;
            })
            .slice(0, 50); // Limit to 50 devices
    }, [devices, nodes, debouncedDeviceSearchQuery]);

    // Auto-layout functions
    const handleApplyLayout = (layoutType: LayoutType) => {
        if (nodes.length === 0) {
            alert('No nodes to arrange. Add devices to the canvas first.');
            return;
        }

        const layoutedNodes = applyLayout(nodes, edges, layoutType);
        setNodes(layoutedNodes);
    };

    // Export topology as JSON
    const handleExportTopology = () => {
        if (!selectedTopology) {
            alert('Please select a topology first');
            return;
        }

        const exportData = {
            name: selectedTopology.name,
            description: selectedTopology.description,
            nodes: nodes.map(node => ({
                id: node.id,
                type: node.type,
                position: node.position,
                data: node.data,
            })),
            edges: edges.map(edge => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: edge.type,
                style: edge.style,
            })),
            exportedAt: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedTopology.name.replace(/[^a-z0-9]/gi, '_')}_topology_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Import topology from JSON
    const handleImportTopology = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importData = JSON.parse(text);

            if (!importData.nodes || !Array.isArray(importData.nodes)) {
                throw new Error('Invalid topology file format');
            }

            const importedNodes: Node[] = importData.nodes.map((node: any) => ({
                id: node.id,
                type: node.type || 'device',
                position: node.position || { x: 0, y: 0 },
                data: node.data || {},
            }));

            const importedEdges: Edge[] = (importData.edges || []).map((edge: any) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: edge.type || 'cable',
                style: edge.style || { strokeWidth: 4, stroke: '#22c55e' },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 24,
                    height: 24,
                    color: '#22c55e',
                },
            }));

            setNodes(importedNodes);
            setEdges(importedEdges);

            alert(`Imported ${importedNodes.length} nodes and ${importedEdges.length} connections`);
        } catch (error) {
            console.error('Import error:', error);
            alert('Failed to import topology: ' + (error instanceof Error ? error.message : 'Invalid file format'));
        } finally {
            event.target.value = '';
        }
    };

    // Memoize default edge options - use smooth bezier curves
    const defaultEdgeOptions = useMemo(() => ({
        type: 'smooth' as const,
        animated: false,
        style: { 
            strokeWidth: 2.5, 
            stroke: '#94a3b8',
        },
    }), []);

    // Handle line type change
    const handleLineTypeChange = (edgeId: string, newType: string) => {
        setEdges((eds) =>
            eds.map((edge) =>
                edge.id === edgeId
                    ? { ...edge, type: newType === 'default' ? 'default' : newType }
                    : edge
            )
        );
        setSelectedEdge(null);
    };

    return (
        <MonitorLayout title="Topology">
            <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] gap-3 p-3 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                {/* Left Sidebar - Topologies List */}
                <div className={`${isTopologyPanelCollapsed ? 'w-12' : 'w-full lg:w-64'} bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-lg border border-slate-200/50 dark:border-slate-700/50 flex flex-col h-[300px] lg:h-auto transition-all duration-300 ease-out overflow-hidden`}>
                    <div className="p-3 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50">
                        <div className="flex items-center justify-between mb-2">
                            {!isTopologyPanelCollapsed && (
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                                        <Network className="w-4 h-4 text-white" />
                                    </div>
                                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                        Topologies
                                    </h2>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 ml-auto">
                                {!isTopologyPanelCollapsed && (
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
                                        title="Create New Topology"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsTopologyPanelCollapsed(!isTopologyPanelCollapsed)}
                                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                                    title={isTopologyPanelCollapsed ? "Expand Panel" : "Collapse Panel"}
                                >
                                    {isTopologyPanelCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        {!isTopologyPanelCollapsed && (
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search topologies..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                />
                            </div>
                        )}
                    </div>
                    {!isTopologyPanelCollapsed && (
                        <div className="flex-1 overflow-y-auto p-1.5">
                            {isLoadingTopologies ? (
                            <div className="flex items-center justify-center py-6">
                                <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                            </div>
                        ) : filteredTopologies.length === 0 ? (
                            <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
                                No topologies found
                            </div>
                        ) : (
                            filteredTopologies.map((topology) => (
                                <div
                                    key={topology.id}
                                    onClick={() => {
                                        if (selectedTopology?.id !== topology.id) {
                                            setSelectedTopology(topology);
                                        }
                                    }}
                                    className={`p-2.5 mb-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                        selectedTopology?.id === topology.id
                                            ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 border border-blue-500 shadow-md'
                                            : 'bg-white/60 dark:bg-slate-700/40 border border-slate-200/60 dark:border-slate-600/60 hover:bg-white dark:hover:bg-slate-700/60 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-sm backdrop-blur-sm'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-semibold text-sm mb-1 truncate ${
                                                selectedTopology?.id === topology.id
                                                    ? 'text-blue-900 dark:text-blue-100'
                                                    : 'text-slate-900 dark:text-white'
                                            }`}>
                                                {topology.name}
                                            </h3>
                                            {topology.description && (
                                                <p className={`text-xs mb-2 line-clamp-2 ${
                                                    selectedTopology?.id === topology.id
                                                        ? 'text-blue-700 dark:text-blue-300'
                                                        : 'text-slate-600 dark:text-slate-400'
                                                }`}>
                                                    {topology.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 text-[10px]">
                                                <span className={`px-1.5 py-0.5 rounded ${
                                                    selectedTopology?.id === topology.id
                                                        ? 'bg-blue-200/50 dark:bg-blue-800/30 text-blue-800 dark:text-blue-200'
                                                        : 'bg-slate-100 dark:bg-slate-600/50 text-slate-700 dark:text-slate-300'
                                                }`}>
                                                    {topology.device_count} devices
                                                </span>
                                                <span className={`text-[10px] ${
                                                    selectedTopology?.id === topology.id
                                                        ? 'text-blue-600 dark:text-blue-400'
                                                        : 'text-slate-500 dark:text-slate-400'
                                                }`}>
                                                    {new Date(topology.updated_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 ml-2 flex-shrink-0">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditTopologyName(topology.name);
                                                    setEditTopologyDescription(topology.description || '');
                                                    setSelectedTopology(topology);
                                                    setShowEditModal(true);
                                                }}
                                                className="p-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all"
                                                title="Edit"
                                            >
                                                <Edit className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTopologyToDelete(topology);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-1 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                            )}
                        </div>
                    )}
                    
                    {/* Device Panel - Below Topologies */}
                    {!isTopologyPanelCollapsed && (
                        <>
                            <div className="border-t border-slate-200/60 dark:border-slate-700/60 p-3 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                                            <Server className="w-4 h-4 text-white" />
                                        </div>
                                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                            Devices
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setIsDevicePanelCollapsed(!isDevicePanelCollapsed)}
                                        className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded transition-all"
                                        title={isDevicePanelCollapsed ? "Expand" : "Collapse"}
                                    >
                                        {isDevicePanelCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                {!isDevicePanelCollapsed && (
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search devices..."
                                            value={deviceSearchQuery}
                                            onChange={(e) => setDeviceSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                )}
                            </div>
                            {!isDevicePanelCollapsed && (
                                <div className="flex-1 overflow-y-auto p-1.5 min-h-0">
                                    {isLoadingDevices ? (
                                        <div className="flex items-center justify-center py-6">
                                            <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                                        </div>
                                    ) : availableDevices.length === 0 ? (
                                        <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
                                            {deviceSearchQuery ? 'No devices found' : 'All devices are in canvas'}
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {availableDevices.map((device) => {
                                                const getStatusColor = (status: string) => {
                                                    switch (status) {
                                                        case 'online':
                                                            return 'bg-green-500';
                                                        case 'offline':
                                                            return 'bg-red-500';
                                                        case 'warning':
                                                            return 'bg-yellow-500';
                                                        default:
                                                            return 'bg-gray-500';
                                                    }
                                                };
                                                const statusColor = getStatusColor(device.status);
                                                const Icon = getDeviceCategoryIcon(device.category || '');
                                                
                                                return (
                                                    <button
                                                        key={device.id}
                                                        onClick={() => handleAddDevice(device)}
                                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all duration-200 text-left"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1 bg-slate-100 dark:bg-slate-600 rounded flex-shrink-0">
                                                                <Icon className="w-3 h-3 text-slate-700 dark:text-slate-200" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
                                                                    <span className="font-medium text-slate-900 dark:text-white text-xs truncate">
                                                                        {device.name}
                                                                    </span>
                                                                </div>
                                                                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono truncate">
                                                                    {device.ip_address}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Center - Canvas */}
                <div className="flex-1 bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-lg border border-slate-200/50 dark:border-slate-700/50 flex flex-col min-w-0 overflow-hidden">
                    {/* Compact Toolbar */}
                    <div className="bg-gradient-to-r from-slate-50/80 via-white/80 to-slate-50/80 dark:from-slate-800/80 dark:via-slate-800/80 dark:to-slate-800/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 px-3 py-2">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                                        <Network className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                                            {selectedTopology ? selectedTopology.name : 'No Topology Selected'}
                                        </h2>
                                        {selectedTopology && (
                                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                                {selectedTopology.description || 'No description'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {selectedTopology && (
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={handleUpdateTopology}
                                        disabled={isSaving}
                                        className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                                    >
                                        {isSaving ? (
                                            <>
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-3.5 h-3.5" />
                                                <span>Save</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div 
                        className="flex-1 relative w-full h-full min-h-0" 
                        ref={reactFlowWrapper}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                    >
                        {selectedTopology ? (
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                onNodeClick={onNodeClick}
                                onPaneClick={onPaneClick}
                                onEdgeClick={onEdgeClick}
                                onSelectionChange={onSelectionChange}
                                onInit={setReactFlowInstance}
                                nodeTypes={nodeTypes}
                                edgeTypes={edgeTypes}
                                fitView
                                deleteKeyCode={['Backspace', 'Delete']}
                                nodesDraggable={true}
                                nodesConnectable={true}
                                connectOnClick={false}
                                elementsSelectable={true}
                                selectionOnDrag={true}
                                multiSelectionKeyCode={['Meta', 'Control']}
                                panOnDrag={[1, 2]} // Allow pan with middle mouse or space
                                panOnScroll={true}
                                zoomOnScroll={true}
                                zoomOnPinch={true}
                                connectionMode="loose"
                                connectionRadius={25}
                                connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2.5, strokeDasharray: '5,5' }}
                                connectionLineType="smoothstep"
                                snapToGrid={false}
                                defaultEdgeOptions={defaultEdgeOptions}
                                className="w-full h-full"
                                style={{
                                    cursor: 'default',
                                }}
                                preventScrolling={false}
                                proOptions={{ hideAttribution: true }}
                                onlyRenderVisibleElements={true}
                                minZoom={0.1}
                                maxZoom={2}
                            >
                                <Background 
                                    gap={30} 
                                    size={2} 
                                    color="#cbd5e1" 
                                    variant="dots"
                                    style={{ opacity: 0.25 }}
                                />
                                <Controls showInteractive={false} />
                                <MiniMap 
                                    nodeColor={(node) => {
                                        if (node.data?.status === 'online') return '#22c55e';
                                        if (node.data?.status === 'offline') return '#ef4444';
                                        return '#94a3b8';
                                    }}
                                    maskColor="rgba(0, 0, 0, 0.1)"
                                    style={{ backgroundColor: 'transparent' }}
                                />
                                {/* Debug info - shows edge count */}
                                {process.env.NODE_ENV === 'development' && edges.length > 0 && (
                                    <Panel position="bottom-left" className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded text-xs border border-yellow-300">
                                        <div className="font-semibold">Debug Info</div>
                                        <div>Nodes: {nodes.length}</div>
                                        <div>Edges: {edges.length}</div>
                                        <div className="mt-1 text-[10px] max-h-32 overflow-y-auto">
                                            {edges.map(e => (
                                                <div key={e.id} className="truncate">
                                                    {e.source} → {e.target} ({e.type})
                                                </div>
                                            ))}
                                        </div>
                                    </Panel>
                                )}
                                {/* Bulk Edit Panel */}
                                {showBulkEditPanel && (selectedNodeIds.size > 0 || selectedEdgeIds.size > 0) && (
                                    <Panel position="top-left" className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-blue-500 dark:border-blue-600 max-w-xs overflow-hidden z-50">
                                        <div className="p-2 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-semibold text-blue-900 dark:text-blue-100 text-xs flex items-center gap-1.5">
                                                    <Edit className="w-3.5 h-3.5" />
                                                    Bulk Edit
                                                </div>
                                                <button
                                                    onClick={handleDeselectAll}
                                                    className="p-1 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                                                    title="Close"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="text-[10px] text-blue-700 dark:text-blue-300 mb-2">
                                                {selectedNodeIds.size > 0 && `${selectedNodeIds.size} device(s) selected`}
                                                {selectedNodeIds.size > 0 && selectedEdgeIds.size > 0 && ' • '}
                                                {selectedEdgeIds.size > 0 && `${selectedEdgeIds.size} connection(s) selected`}
                                            </div>
                                        </div>
                                        <div className="p-2 space-y-2">
                                            {/* Select All / Deselect All */}
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={handleSelectAll}
                                                    className="flex-1 px-2 py-1.5 text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                                >
                                                    Select All
                                                </button>
                                                <button
                                                    onClick={handleDeselectAll}
                                                    className="flex-1 px-2 py-1.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                >
                                                    Deselect All
                                                </button>
                                            </div>
                                            
                                            {/* Bulk Edge Type Change */}
                                            {selectedEdgeIds.size > 0 && (
                                                <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-700 pt-2">
                                                    <div className="font-semibold text-slate-900 dark:text-white text-xs mb-1">
                                                        Change Line Type
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-1">
                                                        <button
                                                            onClick={() => handleBulkChangeEdgeType('straight')}
                                                            className="px-2 py-1 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                                        >
                                                            Straight
                                                        </button>
                                                        <button
                                                            onClick={() => handleBulkChangeEdgeType('bezier')}
                                                            className="px-2 py-1 text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                                        >
                                                            Bezier
                                                        </button>
                                                        <button
                                                            onClick={() => handleBulkChangeEdgeType('step')}
                                                            className="px-2 py-1 text-[10px] font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                                                        >
                                                            Step
                                                        </button>
                                                        <button
                                                            onClick={() => handleBulkChangeEdgeType('cable')}
                                                            className="px-2 py-1 text-[10px] font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                                                        >
                                                            Cable
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Bulk Delete */}
                                            <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                                                <button
                                                    onClick={handleBulkDelete}
                                                    className="w-full px-2 py-1.5 text-[10px] font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Delete Selected
                                                </button>
                                            </div>
                                        </div>
                                    </Panel>
                                )}
                                
                                <Panel position="top-right" className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-w-xs overflow-hidden">
                                    <div className="p-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                                        <div className="font-semibold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                                            <Settings className="w-3.5 h-3.5" />
                                            Layouts
                                        </div>
                                        <button
                                            onClick={() => setIsControlsPanelCollapsed(!isControlsPanelCollapsed)}
                                            className="p-1 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                                            title={isControlsPanelCollapsed ? "Expand Controls" : "Collapse Controls"}
                                        >
                                            {isControlsPanelCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                    {!isControlsPanelCollapsed && (
                                        <div className="p-2 space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
                                            {/* Network Topology Layouts */}
                                            <div className="space-y-1.5">
                                                <div className="font-semibold text-slate-900 dark:text-white text-xs mb-1.5">
                                                    Network Topologies
                                                </div>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                <button
                                                    onClick={() => handleApplyLayout('bus')}
                                                    className="px-2 py-1.5 text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                                    title="Bus topology - nodes connected to a central backbone"
                                                >
                                                    Bus
                                                </button>
                                                <button
                                                    onClick={() => handleApplyLayout('ring')}
                                                    className="px-2 py-1.5 text-[10px] font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                                                    title="Ring topology - nodes arranged in a circle"
                                                >
                                                    Ring
                                                </button>
                                                <button
                                                    onClick={() => handleApplyLayout('star')}
                                                    className="px-2 py-1.5 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                                    title="Star topology - central hub with nodes around it"
                                                >
                                                    Star
                                                </button>
                                                <button
                                                    onClick={() => handleApplyLayout('extended-star')}
                                                    className="px-2 py-1.5 text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                                                    title="Extended Star topology - multi-tiered star structure"
                                                >
                                                    Extended Star
                                                </button>
                                                <button
                                                    onClick={() => handleApplyLayout('hierarchical')}
                                                    className="px-2 py-1.5 text-[10px] font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                                    title="Hierarchical/Tree topology - tree structure"
                                                >
                                                    Hierarchical
                                                </button>
                                                <button
                                                    onClick={() => handleApplyLayout('mesh')}
                                                    className="px-2 py-1.5 text-[10px] font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                                                    title="Mesh topology - fully interconnected network"
                                                >
                                                    Mesh
                                                </button>
                                            </div>
                                            </div>

                                            {/* Export/Import */}
                                            <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-700 pt-2">
                                                <div className="font-semibold text-slate-900 dark:text-white text-xs mb-1.5">
                                                    Export/Import
                                                </div>
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={handleExportTopology}
                                                        className="flex-1 px-2 py-1.5 text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded hover:bg-emerald-200 dark:hover:bg-emerald-900/50 flex items-center justify-center gap-1 transition-colors"
                                                        title="Export topology as JSON"
                                                    >
                                                        <Download className="w-3 h-3" />
                                                        Export
                                                    </button>
                                                    <label className="flex-1 px-2 py-1.5 text-[10px] font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 flex items-center justify-center gap-1 cursor-pointer transition-colors">
                                                        <Upload className="w-3 h-3" />
                                                        Import
                                                        <input
                                                            type="file"
                                                            accept=".json"
                                                            onChange={handleImportTopology}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Connection Info */}
                                            <div className="space-y-1 text-[10px] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2">
                                                <div className="font-semibold text-slate-900 dark:text-white mb-1.5 text-xs">How to connect:</div>
                                                <div className="space-y-0.5">
                                                    <div>• Drag from connection point</div>
                                                    <div>• Release on another device</div>
                                                    <div>• Drag devices to move</div>
                                                    <div>• Delete: Select edge + Delete</div>
                                                </div>
                                                <div className="mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-600 text-slate-500">
                                                    Connections: {edges.length}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Panel>
                            </ReactFlow>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                                <div className="text-center">
                                    <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium mb-2">No Topology Selected</p>
                                    <p className="text-sm">
                                        Select a topology from the left panel or create a new one
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>


            {/* Edge Type Selector Modal */}
            {selectedEdge && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setSelectedEdge(null)}>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-96 max-w-[90vw] border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Link2 className="w-5 h-5 text-blue-600" />
                                Change Line Type
                            </h3>
                            <button
                                onClick={() => setSelectedEdge(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Select a line type for the connection between nodes
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleLineTypeChange(selectedEdge.id, 'straight')}
                                    className={`px-4 py-4 rounded-lg border-2 transition-all hover:scale-105 ${
                                        selectedEdge.type === 'straight'
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md'
                                            : 'border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50'
                                    }`}
                                >
                                    <div className="font-semibold mb-1 text-sm">Straight</div>
                                    <div className="text-xs opacity-75">Direct line</div>
                                </button>
                                <button
                                    onClick={() => handleLineTypeChange(selectedEdge.id, 'default')}
                                    className={`px-4 py-4 rounded-lg border-2 transition-all hover:scale-105 ${
                                        selectedEdge.type === 'default' || selectedEdge.type === 'bezier' || !selectedEdge.type
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md'
                                            : 'border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50'
                                    }`}
                                >
                                    <div className="font-semibold mb-1 text-sm">Curved</div>
                                    <div className="text-xs opacity-75">Smooth curve</div>
                                </button>
                                <button
                                    onClick={() => handleLineTypeChange(selectedEdge.id, 'step')}
                                    className={`px-4 py-4 rounded-lg border-2 transition-all hover:scale-105 ${
                                        selectedEdge.type === 'step'
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md'
                                            : 'border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50'
                                    }`}
                                >
                                    <div className="font-semibold mb-1 text-sm">Step</div>
                                    <div className="text-xs opacity-75">Right-angle</div>
                                </button>
                                <button
                                    onClick={() => handleLineTypeChange(selectedEdge.id, 'cable')}
                                    className={`px-4 py-4 rounded-lg border-2 transition-all hover:scale-105 ${
                                        selectedEdge.type === 'cable'
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md'
                                            : 'border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50'
                                    }`}
                                >
                                    <div className="font-semibold mb-1 text-sm">Cable</div>
                                    <div className="text-xs opacity-75">Cable style</div>
                                </button>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setSelectedEdge(null)}
                                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-96">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Create New Topology
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewTopologyName('');
                                    setNewTopologyDescription('');
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={newTopologyName}
                                    onChange={(e) => setNewTopologyName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter topology name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newTopologyDescription}
                                    onChange={(e) => setNewTopologyDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter topology description"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleCreateTopology}
                                disabled={!newTopologyName.trim() || isSaving}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Creating...' : 'Create'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewTopologyName('');
                                    setNewTopologyDescription('');
                                }}
                                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedTopology && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-96">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Edit Topology
                            </h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditTopologyName('');
                                    setEditTopologyDescription('');
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={editTopologyName}
                                    onChange={(e) => setEditTopologyName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter topology name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={editTopologyDescription}
                                    onChange={(e) => setEditTopologyDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter topology description"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={async () => {
                                    if (!editTopologyName.trim() || !selectedTopology) return;
                                    
                                    setIsSaving(true);
                                    try {
                                        const response = await fetch(`/api/topologies/${selectedTopology.id}`, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                            },
                                            body: JSON.stringify({
                                                name: editTopologyName,
                                                description: editTopologyDescription,
                                                canvas_data: selectedTopology.canvas_data,
                                                devices: nodes.map((node) => ({
                                                    device_id: node.data.deviceId,
                                                    node_id: node.id,
                                                    position_x: node.position.x,
                                                    position_y: node.position.y,
                                                    node_data: node.data,
                                                })),
                                            }),
                                        });

                                        const data = await response.json();
                                        if (data.success) {
                                            setShowEditModal(false);
                                            setEditTopologyName('');
                                            setEditTopologyDescription('');
                                            loadTopologies();
                                            if (selectedTopology) {
                                                loadTopologyData(selectedTopology.id);
                                            }
                                        } else {
                                            alert('Failed to update topology: ' + (data.message || 'Unknown error'));
                                        }
                                    } catch (error) {
                                        console.error('Failed to update topology:', error);
                                        alert('Failed to update topology');
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                                disabled={!editTopologyName.trim() || isSaving}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditTopologyName('');
                                    setEditTopologyDescription('');
                                }}
                                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && topologyToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-96">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Delete Topology
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Are you sure you want to delete "{topologyToDelete.name}"? This action
                            cannot be undone.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDeleteTopology}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setTopologyToDelete(null);
                                }}
                                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MonitorLayout>
    );
}

