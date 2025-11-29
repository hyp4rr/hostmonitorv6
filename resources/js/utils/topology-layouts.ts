import { Node, Edge } from 'reactflow';

export type LayoutType = 'bus' | 'ring' | 'star' | 'extended-star' | 'hierarchical' | 'mesh';

/**
 * Grid layout - arranges nodes in a grid pattern
 */
export function applyGridLayout(nodes: Node[], spacing: number = 200): Node[] {
    if (nodes.length === 0) return nodes;

    const cols = Math.ceil(Math.sqrt(nodes.length));
    const startX = 0;
    const startY = 0;

    return nodes.map((node, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        return {
            ...node,
            position: {
                x: startX + col * spacing,
                y: startY + row * spacing,
            },
        };
    });
}

/**
 * Hierarchical layout - arranges nodes in levels based on connections
 */
export function applyHierarchicalLayout(nodes: Node[], edges: Edge[], spacing: { x: number; y: number } = { x: 250, y: 150 }): Node[] {
    if (nodes.length === 0) return nodes;

    // Build adjacency list
    const adjacencyList: Map<string, string[]> = new Map();
    nodes.forEach(node => adjacencyList.set(node.id, []));
    
    edges.forEach(edge => {
        const sourceList = adjacencyList.get(edge.source) || [];
        sourceList.push(edge.target);
        adjacencyList.set(edge.source, sourceList);
    });

    // Find root nodes (nodes with no incoming edges)
    const hasIncoming = new Set<string>();
    edges.forEach(edge => hasIncoming.add(edge.target));
    const rootNodes = nodes.filter(node => !hasIncoming.has(node.id));

    // If no root nodes, use first node
    const roots = rootNodes.length > 0 ? rootNodes : [nodes[0]];

    // BFS to assign levels
    const levelMap = new Map<string, number>();
    const visited = new Set<string>();
    const queue: Array<{ id: string; level: number }> = [];

    roots.forEach(root => {
        queue.push({ id: root.id, level: 0 });
        levelMap.set(root.id, 0);
    });

    while (queue.length > 0) {
        const { id, level } = queue.shift()!;
        if (visited.has(id)) continue;
        visited.add(id);

        const neighbors = adjacencyList.get(id) || [];
        neighbors.forEach(neighborId => {
            if (!visited.has(neighborId)) {
                const neighborLevel = level + 1;
                if (!levelMap.has(neighborId) || levelMap.get(neighborId)! > neighborLevel) {
                    levelMap.set(neighborId, neighborLevel);
                    queue.push({ id: neighborId, level: neighborLevel });
                }
            }
        });
    }

    // Assign levels to unvisited nodes
    nodes.forEach(node => {
        if (!levelMap.has(node.id)) {
            const maxLevel = Math.max(...Array.from(levelMap.values()), -1);
            levelMap.set(node.id, maxLevel + 1);
        }
    });

    // Group nodes by level
    const nodesByLevel = new Map<number, Node[]>();
    nodes.forEach(node => {
        const level = levelMap.get(node.id) || 0;
        if (!nodesByLevel.has(level)) {
            nodesByLevel.set(level, []);
        }
        nodesByLevel.get(level)!.push(node);
    });

    // Position nodes
    const maxLevel = Math.max(...Array.from(nodesByLevel.keys()));
    const startX = 0;
    const startY = 0;

    return nodes.map(node => {
        const level = levelMap.get(node.id) || 0;
        const levelNodes = nodesByLevel.get(level) || [];
        const indexInLevel = levelNodes.findIndex(n => n.id === node.id);
        const nodesInLevel = levelNodes.length;

        // Center nodes horizontally within their level
        const totalWidth = (nodesInLevel - 1) * spacing.x;
        const offsetX = nodesInLevel > 1 ? -totalWidth / 2 : 0;

        return {
            ...node,
            position: {
                x: startX + offsetX + indexInLevel * spacing.x,
                y: startY + level * spacing.y,
            },
        };
    });
}

/**
 * Circular layout - arranges nodes in a circle
 */
export function applyCircularLayout(nodes: Node[], radius: number = 300): Node[] {
    if (nodes.length === 0) return nodes;

    const centerX = 0;
    const centerY = 0;
    const angleStep = (2 * Math.PI) / nodes.length;

    return nodes.map((node, index) => {
        const angle = index * angleStep;
        return {
            ...node,
            position: {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
            },
        };
    });
}

/**
 * Force-directed layout simulation (simplified)
 */
export function applyForceDirectedLayout(
    nodes: Node[],
    edges: Edge[],
    iterations: number = 50,
    options: { repulsion: number; attraction: number; damping: number } = {
        repulsion: 1000,
        attraction: 0.1,
        damping: 0.9,
    }
): Node[] {
    if (nodes.length === 0) return nodes;

    // Initialize positions randomly if not set
    let positionedNodes = nodes.map(node => ({
        ...node,
        position: node.position.x === 0 && node.position.y === 0
            ? { x: Math.random() * 400 - 200, y: Math.random() * 400 - 200 }
            : node.position,
    }));

    // Initialize velocities
    const velocities = new Map<string, { x: number; y: number }>();
    positionedNodes.forEach(node => {
        velocities.set(node.id, { x: 0, y: 0 });
    });

    // Run simulation
    for (let iter = 0; iter < iterations; iter++) {
        const forces = new Map<string, { x: number; y: number }>();

        // Initialize forces
        positionedNodes.forEach(node => {
            forces.set(node.id, { x: 0, y: 0 });
        });

        // Repulsion between all nodes
        for (let i = 0; i < positionedNodes.length; i++) {
            for (let j = i + 1; j < positionedNodes.length; j++) {
                const node1 = positionedNodes[i];
                const node2 = positionedNodes[j];
                const dx = node2.position.x - node1.position.x;
                const dy = node2.position.y - node1.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = options.repulsion / (distance * distance);

                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                const force1 = forces.get(node1.id)!;
                force1.x -= fx;
                force1.y -= fy;

                const force2 = forces.get(node2.id)!;
                force2.x += fx;
                force2.y += fy;
            }
        }

        // Attraction along edges
        edges.forEach(edge => {
            const sourceNode = positionedNodes.find(n => n.id === edge.source);
            const targetNode = positionedNodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return;

            const dx = targetNode.position.x - sourceNode.position.x;
            const dy = targetNode.position.y - sourceNode.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = distance * options.attraction;

            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;

            const forceSource = forces.get(sourceNode.id)!;
            forceSource.x += fx;
            forceSource.y += fy;

            const forceTarget = forces.get(targetNode.id)!;
            forceTarget.x -= fx;
            forceTarget.y -= fy;
        });

        // Update velocities and positions
        positionedNodes = positionedNodes.map(node => {
            const force = forces.get(node.id)!;
            const velocity = velocities.get(node.id)!;

            velocity.x = (velocity.x + force.x) * options.damping;
            velocity.y = (velocity.y + force.y) * options.damping;

            return {
                ...node,
                position: {
                    x: node.position.x + velocity.x,
                    y: node.position.y + velocity.y,
                },
            };
        });
    }

    return positionedNodes;
}

/**
 * Bus layout - nodes connected to a central backbone
 */
export function applyBusLayout(nodes: Node[], spacing: number = 150): Node[] {
    if (nodes.length === 0) return nodes;
    
    const backboneY = 0;
    const backboneLength = (nodes.length - 1) * spacing;
    const startX = -backboneLength / 2;
    
    return nodes.map((node, index) => ({
        ...node,
        position: {
            x: startX + index * spacing,
            y: index % 2 === 0 ? backboneY - 80 : backboneY + 80,
        },
    }));
}

/**
 * Ring layout - nodes arranged in a circle, each connected to neighbors
 */
export function applyRingLayout(nodes: Node[], radius: number = 200): Node[] {
    if (nodes.length === 0) return nodes;
    
    const centerX = 0;
    const centerY = 0;
    const angleStep = (2 * Math.PI) / nodes.length;
    
    return nodes.map((node, index) => {
        const angle = index * angleStep - Math.PI / 2; // Start from top
        return {
            ...node,
            position: {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
            },
        };
    });
}

/**
 * Star layout - central hub with nodes arranged around it
 */
export function applyStarLayout(nodes: Node[], radius: number = 200): Node[] {
    if (nodes.length === 0) return nodes;
    
    const centerX = 0;
    const centerY = 0;
    
    if (nodes.length === 1) {
        return [{
            ...nodes[0],
            position: { x: centerX, y: centerY },
        }];
    }
    
    // First node is the hub/center
    const hub = {
        ...nodes[0],
        position: { x: centerX, y: centerY },
    };
    
    // Remaining nodes arranged around the hub
    const peripheralNodes = nodes.slice(1).map((node, index) => {
        const angle = (2 * Math.PI * index) / (nodes.length - 1) - Math.PI / 2;
        return {
            ...node,
            position: {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
            },
        };
    });
    
    return [hub, ...peripheralNodes];
}

/**
 * Extended Star layout - multi-tiered star structure
 */
export function applyExtendedStarLayout(nodes: Node[], radius: number = 150): Node[] {
    if (nodes.length === 0) return nodes;
    
    const centerX = 0;
    const centerY = 0;
    
    if (nodes.length === 1) {
        return [{
            ...nodes[0],
            position: { x: centerX, y: centerY },
        }];
    }
    
    // First node is the central hub
    const centralHub = {
        ...nodes[0],
        position: { x: centerX, y: centerY },
    };
    
    // Calculate intermediate nodes (second tier)
    const intermediateCount = Math.min(4, Math.floor((nodes.length - 1) / 2));
    const intermediateNodes = nodes.slice(1, 1 + intermediateCount).map((node, index) => {
        const angle = (2 * Math.PI * index) / intermediateCount - Math.PI / 2;
        return {
            ...node,
            position: {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
            },
        };
    });
    
    // Remaining nodes are peripheral (third tier)
    const peripheralNodes = nodes.slice(1 + intermediateCount).map((node, index) => {
        const intermediateIndex = index % intermediateCount;
        const intermediateNode = intermediateNodes[intermediateIndex];
        const angle = (2 * Math.PI * index) / (nodes.length - 1 - intermediateCount) - Math.PI / 2;
        return {
            ...node,
            position: {
                x: intermediateNode.position.x + radius * 0.6 * Math.cos(angle),
                y: intermediateNode.position.y + radius * 0.6 * Math.sin(angle),
            },
        };
    });
    
    return [centralHub, ...intermediateNodes, ...peripheralNodes];
}

/**
 * Mesh layout - fully interconnected network
 */
export function applyMeshLayout(nodes: Node[], radius: number = 200): Node[] {
    if (nodes.length === 0) return nodes;
    
    const centerX = 0;
    const centerY = 0;
    const angleStep = (2 * Math.PI) / nodes.length;
    
    return nodes.map((node, index) => {
        const angle = index * angleStep - Math.PI / 2;
        return {
            ...node,
            position: {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
            },
        };
    });
}

/**
 * Apply layout based on type
 */
export function applyLayout(
    nodes: Node[],
    edges: Edge[],
    layoutType: LayoutType,
    options?: any
): Node[] {
    switch (layoutType) {
        case 'bus':
            return applyBusLayout(nodes, options?.spacing || 150);
        case 'ring':
            return applyRingLayout(nodes, options?.radius || 200);
        case 'star':
            return applyStarLayout(nodes, options?.radius || 200);
        case 'extended-star':
            return applyExtendedStarLayout(nodes, options?.radius || 150);
        case 'hierarchical':
            return applyHierarchicalLayout(nodes, edges, options?.spacing || { x: 200, y: 120 });
        case 'mesh':
            return applyMeshLayout(nodes, options?.radius || 200);
        default:
            return nodes;
    }
}

