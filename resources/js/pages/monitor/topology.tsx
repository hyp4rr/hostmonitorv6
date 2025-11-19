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
} from 'lucide-react';
import { getDeviceCategoryIcon } from '@/utils/device-icons';
import { useEffect, useState, useCallback, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
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

// Custom edge component for cable-like connections
const CableEdge = (props: any) => {
    const { sourceX, sourceY, targetX, targetY, selected, style = {}, markerEnd } = props;
    
    // Calculate the path for the cable
    const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    
    // Cable colors - green
    const cableColor = selected ? '#16a34a' : (style.stroke || '#22c55e'); // Use green
    const cableWidth = selected ? 5 : (style.strokeWidth || 4);
    
    // Calculate arrow direction
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const arrowLength = 12;
    const arrowWidth = 8;
    
    // Arrow points
    const arrowX = targetX - arrowLength * Math.cos(Math.atan2(dy, dx));
    const arrowY = targetY - arrowLength * Math.sin(Math.atan2(dy, dx));
    const arrowPath = `M ${targetX} ${targetY} L ${arrowX - arrowWidth * Math.cos(Math.atan2(dy, dx) - Math.PI / 2)} ${arrowY - arrowWidth * Math.sin(Math.atan2(dy, dx) - Math.PI / 2)} L ${arrowX - arrowWidth * Math.cos(Math.atan2(dy, dx) + Math.PI / 2)} ${arrowY - arrowWidth * Math.sin(Math.atan2(dy, dx) + Math.PI / 2)} Z`;
    
    return (
        <g>
            {/* Shadow/glow effect for depth - more prominent */}
            <path
                d={path}
                stroke="#1e293b"
                strokeWidth={cableWidth + 3}
                strokeOpacity={0.3}
                fill="none"
                strokeLinecap="round"
                style={{ pointerEvents: 'none' }}
            />
            {/* Main cable line - solid and visible */}
            <path
                d={path}
                stroke={cableColor}
                strokeWidth={cableWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray="0" // Always solid, no dashes
                    style={{
                        filter: selected 
                            ? 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.8))' 
                            : 'drop-shadow(0 0 3px rgba(34, 197, 94, 0.4))',
                        opacity: selected ? 1 : 0.9,
                        ...style,
                    }}
            />
            {/* Arrow head */}
            <path
                d={arrowPath}
                fill={cableColor}
                stroke={cableColor}
                strokeWidth={1}
                style={{ pointerEvents: 'none' }}
            />
            {/* Cable highlight for 3D effect */}
            <path
                d={path}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth={cableWidth * 0.4}
                fill="none"
                strokeLinecap="round"
                strokeDasharray="0"
                style={{ pointerEvents: 'none' }}
            />
        </g>
    );
};

const edgeTypes: EdgeTypes = {
    cable: CableEdge,
    default: BezierEdge,
    straight: StraightEdge,
    step: StepEdge,
};

const nodeTypes: NodeTypes = {
    device: ({ data }: { data: any }) => {
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

        return (
            <div 
                className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-lg shadow-lg min-w-[150px] relative cursor-pointer"
                style={{ pointerEvents: 'auto' }}
            >
                {/* Single connection handle in the center - invisible but functional */}
                <Handle
                    type="source"
                    position={Position.Top}
                    id="center"
                    style={{ 
                        background: 'transparent', 
                        border: 'none',
                        width: '20px', 
                        height: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        top: '-10px'
                    }}
                />
                <Handle
                    type="target"
                    position={Position.Top}
                    id="center"
                    style={{ 
                        background: 'transparent', 
                        border: 'none',
                        width: '20px', 
                        height: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        top: '-10px'
                    }}
                />
                <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(data.status)}`} />
                    {(() => {
                        const Icon = getDeviceCategoryIcon(data.category || '');
                        return <Icon className="size-3 text-slate-600 dark:text-slate-400" />;
                    })()}
                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {data.name}
                    </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    {data.ip_address}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {data.category}
                </div>
            </div>
        );
    },
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
    const [isConnectionMode, setIsConnectionMode] = useState(false);
    const [firstSelectedNode, setFirstSelectedNode] = useState<string | null>(null);

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

    // Debug: Log edges whenever they change
    useEffect(() => {
        console.log('Edges state changed:', edges.length, 'edges');
        if (edges.length > 0) {
            console.log('Current edges:', edges);
        }
    }, [edges]);

    const loadDevices = async () => {
        if (!currentBranch?.id) return;

        setIsLoadingDevices(true);
        try {
            // Fetch all devices by paginating through all pages
            // The API returns { data: [...], pagination: {...} }
            let allDevices: Device[] = [];
            let currentPage = 1;
            let hasMore = true;
            
            while (hasMore) {
                const response = await fetch(
                    `/api/devices?branch_id=${currentBranch.id}&per_page=1000&page=${currentPage}&include_inactive=true&active_filter=all`
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
                    allDevices = [...allDevices, ...result.data];
                    
                    // Check if there are more pages
                    if (result.pagination) {
                        hasMore = currentPage < result.pagination.last_page;
                        currentPage++;
                    } else {
                        // No pagination info, assume we got all devices
                        hasMore = false;
                    }
                } else {
                    // Unexpected response format
                    console.warn('Unexpected API response format:', result);
                    hasMore = false;
                }
            }
            
            setDevices(allDevices);
            console.log(`Loaded ${allDevices.length} devices for topology`);
        } catch (error) {
            console.error('Failed to load devices:', error);
            // Set empty array on error to prevent UI issues
            setDevices([]);
        } finally {
            setIsLoadingDevices(false);
        }
    };

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
                                strokeWidth: 4, 
                                stroke: '#22c55e', // Green
                            },
                            markerEnd: edge.markerEnd || {
                                type: MarkerType.ArrowClosed,
                                width: 24,
                                height: 24,
                                color: '#22c55e',
                            },
                        };
                        // Only add handles if they exist and are not null
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
                console.log('Loaded topology - Nodes:', topologyNodes.length, 'Edges:', topologyEdges.length);
                console.log('Edge details:', topologyEdges);
            }
        } catch (error) {
            console.error('Failed to load topology data:', error);
        }
    };

    const onConnect = useCallback(
        (params: Connection) => {
            // Disable automatic connections - we handle them manually via clicks
            // Return false to prevent ReactFlow from creating the edge automatically
            console.log('onConnect called but disabled - using manual click connections');
            return false;
        },
        []
    );

    // Handle node click in connection mode
    const onNodeClick = useCallback(
        (event: React.MouseEvent, node: Node) => {
            console.log('Node clicked:', node.id, 'Connection mode:', isConnectionMode, 'First selected:', firstSelectedNode);
            
            if (!isConnectionMode || !selectedTopology) {
                console.log('Not in connection mode or no topology selected');
                return;
            }
            
            event.stopPropagation();
            
            if (!firstSelectedNode) {
                // First device selected
                console.log('First device selected:', node.id);
                setFirstSelectedNode(node.id);
                // Highlight the node
                setNodes((nds) =>
                    nds.map((n) =>
                        n.id === node.id
                            ? { ...n, style: { ...n.style, border: '3px solid #3b82f6', borderColor: '#3b82f6' } }
                            : { ...n, style: { ...n.style, border: undefined, borderColor: undefined } }
                    )
                );
            } else if (firstSelectedNode === node.id) {
                // Clicked the same node - deselect
                console.log('Same node clicked, deselecting');
                setFirstSelectedNode(null);
                setNodes((nds) =>
                    nds.map((n) =>
                        n.id === node.id
                            ? { ...n, style: { ...n.style, border: undefined, borderColor: undefined } }
                            : n
                    )
                );
            } else {
                // Second device selected - create connection
                console.log('Second device selected, creating connection from', firstSelectedNode, 'to', node.id);
                
                // Verify both nodes exist before creating edge
                const sourceNodeExists = nodes.some(n => n.id === firstSelectedNode);
                const targetNodeExists = nodes.some(n => n.id === node.id);
                
                if (!sourceNodeExists || !targetNodeExists) {
                    console.error('Cannot create edge - node missing:', {
                        source: firstSelectedNode,
                        target: node.id,
                        sourceExists: sourceNodeExists,
                        targetExists: targetNodeExists,
                        allNodeIds: nodes.map(n => n.id)
                    });
                    setFirstSelectedNode(null);
                    setNodes((nds) =>
                        nds.map((n) => ({
                            ...n,
                            style: { ...n.style, border: undefined, borderColor: undefined },
                        }))
                    );
                    return;
                }
                
                const newEdge: Edge = {
                    id: `edge-${firstSelectedNode}-${node.id}-${Date.now()}`,
                    source: firstSelectedNode,
                    target: node.id,
                    type: 'cable',
                    animated: false,
                    style: { 
                        strokeWidth: 4, 
                        stroke: '#22c55e', // Green
                    },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 24,
                        height: 24,
                        color: '#22c55e',
                    },
                };
                
                // Check if connection already exists (both directions)
                const existingEdge = edges.find(
                    (edge) => 
                        (edge.source === firstSelectedNode && edge.target === node.id) ||
                        (edge.source === node.id && edge.target === firstSelectedNode)
                );
                
                if (!existingEdge) {
                    console.log('Adding new edge:', newEdge);
                    setEdges((eds) => {
                        const updated = [...eds, newEdge];
                        console.log('Total edges after adding:', updated.length);
                        console.log('All edges:', updated);
                        console.log('Edge details:', {
                            id: newEdge.id,
                            source: newEdge.source,
                            target: newEdge.target,
                            type: newEdge.type,
                            style: newEdge.style,
                            markerEnd: newEdge.markerEnd
                        });
                        console.log('Source node exists:', nodes.some(n => n.id === newEdge.source));
                        console.log('Target node exists:', nodes.some(n => n.id === newEdge.target));
                        return updated;
                    });
                    
                    // Brief visual feedback - flash both nodes
                    setNodes((nds) =>
                        nds.map((n) =>
                            n.id === firstSelectedNode || n.id === node.id
                                ? { 
                                    ...n, 
                                    style: { 
                                        ...n.style, 
                                        border: '3px solid #10b981', 
                                        borderColor: '#10b981',
                                        transition: 'border-color 0.3s',
                                    } 
                                }
                                : { ...n, style: { ...n.style, border: undefined, borderColor: undefined } }
                        )
                    );
                    
                    // Reset selection after a brief delay to show the connection was made
                    setTimeout(() => {
                        setNodes((nds) =>
                            nds.map((n) => ({
                                ...n,
                                style: { ...n.style, border: undefined, borderColor: undefined },
                            }))
                        );
                        setFirstSelectedNode(null);
                    }, 500);
                } else {
                    console.log('Connection already exists');
                    // Reset selection immediately if connection exists
                    setNodes((nds) =>
                        nds.map((n) =>
                            n.id === firstSelectedNode || n.id === node.id
                                ? { ...n, style: { ...n.style, border: undefined, borderColor: undefined } }
                                : n
                        )
                    );
                    setFirstSelectedNode(null);
                }
            }
        },
        [isConnectionMode, firstSelectedNode, selectedTopology, setNodes, setEdges, edges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Handle pane click to deselect in connection mode
    const onPaneClick = useCallback(() => {
        if (isConnectionMode && firstSelectedNode) {
            console.log('Pane clicked, deselecting first node');
            setFirstSelectedNode(null);
            setNodes((nds) =>
                nds.map((n) => ({
                    ...n,
                    style: { ...n.style, border: undefined, borderColor: undefined },
                }))
            );
        }
    }, [isConnectionMode, firstSelectedNode, setNodes]);

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
                console.warn('ReactFlow instance not initialized');
                return;
            }

            const device = devices.find((d) => d.id === parseInt(deviceId));
            if (!device) {
                console.warn('Device not found:', deviceId);
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

    const filteredTopologies = topologies.filter((topology) =>
        topology.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredDevices = devices.filter((device) =>
        device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.ip_address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <MonitorLayout title="Topology">
            <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] gap-4 p-2 sm:p-4">
                {/* Left Sidebar - Topologies List */}
                <div className="w-full lg:w-80 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-[300px] lg:h-auto">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Topologies
                            </h2>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Create New Topology"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search topologies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {isLoadingTopologies ? (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                            </div>
                        ) : filteredTopologies.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
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
                                    className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                                        selectedTopology?.id === topology.id
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                                            : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                                {topology.name}
                                            </h3>
                                            {topology.description && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                    {topology.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                                                <span>{topology.device_count} devices</span>
                                                <span>
                                                    {new Date(topology.updated_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditTopologyName(topology.name);
                                                    setEditTopologyDescription(topology.description || '');
                                                    setSelectedTopology(topology);
                                                    setShowEditModal(true);
                                                }}
                                                className="p-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTopologyToDelete(topology);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-1 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Center - Canvas */}
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {selectedTopology ? selectedTopology.name : 'No Topology Selected'}
                            </h2>
                            {selectedTopology && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {selectedTopology.description || 'No description'}
                                </p>
                            )}
                        </div>
                        {selectedTopology && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setIsConnectionMode(!isConnectionMode);
                                        setFirstSelectedNode(null);
                                        // Reset node styles
                                        setNodes((nds) =>
                                            nds.map((n) => ({
                                                ...n,
                                                style: { ...n.style, border: undefined, borderColor: undefined },
                                            }))
                                        );
                                    }}
                                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                                        isConnectionMode
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                                    }`}
                                    title={isConnectionMode ? 'Exit Connection Mode' : 'Enter Connection Mode'}
                                >
                                    <Link2 className="w-4 h-4" />
                                    {isConnectionMode ? 'Exit Cable Mode' : 'Cable Mode'}
                                </button>
                                <button
                                    onClick={handleUpdateTopology}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                    <div 
                        className="flex-1 relative w-full h-full" 
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
                                onInit={setReactFlowInstance}
                                nodeTypes={nodeTypes}
                                edgeTypes={edgeTypes}
                                fitView
                                deleteKeyCode={['Backspace', 'Delete']}
                                nodesDraggable={!isConnectionMode}
                                nodesConnectable={true}
                                elementsSelectable={!isConnectionMode}
                                panOnDrag={!isConnectionMode}
                                connectionLineStyle={{ stroke: '#22c55e', strokeWidth: 2 }}
                                connectionLineType="straight"
                                snapToGrid={false}
                                defaultEdgeOptions={{
                                    type: 'cable',
                                    animated: false,
                                    style: { 
                                        strokeWidth: 4, 
                                        stroke: '#6366f1', // Indigo for better visibility
                                    },
                                    markerEnd: {
                                        type: MarkerType.ArrowClosed,
                                        width: 24,
                                        height: 24,
                                        color: '#6366f1',
                                    },
                                }}
                                className="w-full h-full"
                                style={{
                                    cursor: isConnectionMode ? 'crosshair' : 'default',
                                }}
                                preventScrolling={false}
                                proOptions={{ hideAttribution: true }}
                            >
                                <Background />
                                <Controls />
                                <MiniMap />
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
                                <Panel position="top-right" className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-w-xs">
                                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                                        {isConnectionMode ? (
                                            <>
                                                <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                                    🔌 Cable Mode Active
                                                </div>
                                                <div>1. Click the first device (it will highlight)</div>
                                                <div>2. Click the second device to connect</div>
                                                <div>3. Click "Exit Cable Mode" when done</div>
                                                {firstSelectedNode && (
                                                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-300">
                                                        First device selected. Click another device to connect.
                                                    </div>
                                                )}
                                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 text-slate-500">
                                                    Connections: {edges.length}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="font-semibold text-slate-900 dark:text-white mb-2">How to use:</div>
                                                <div>• Click "Cable Mode" to connect devices</div>
                                                <div>• Drag devices to move them</div>
                                                <div>• Delete: Select edge + Delete key</div>
                                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 text-slate-500">
                                                    Connections: {edges.length}
                                                </div>
                                            </>
                                        )}
                                    </div>
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

                {/* Right Sidebar - Devices List */}
                <div className="w-80 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Devices
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search devices..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {isLoadingDevices ? (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                            </div>
                        ) : filteredDevices.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                No devices found
                            </div>
                        ) : (
                            filteredDevices.map((device) => {
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

                                return (
                                    <div
                                        key={device.id}
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('application/reactflow', device.id.toString());
                                        }}
                                        className="p-3 mb-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-move transition-colors"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div
                                                className={`w-2 h-2 rounded-full ${getStatusColor(device.status)}`}
                                            />
                                            <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                                {device.name}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono mb-1">
                                            {device.ip_address}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-500">
                                            {device.category}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

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

