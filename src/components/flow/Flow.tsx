import { useState, useRef, useEffect, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Node,
  Edge,
  OnConnectStart,
  OnConnectEnd,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MiniMap,
  Panel,
} from 'reactflow';
import { Button } from 'antd';

import { useOnConnect } from '../../hook/useOnConnect';
import { useUpdateChildNode } from '../../hook/useUpdateChildNode';
import { nodeTypes } from '../customNode/CustomNode';
import { edgeTypes } from '../customEdge/CustomEdge';
import { equipment } from '../../data/equipment';
import { Equipment } from '../../type/type';

import cls from './flow.module.css';

const flowKey = 'example-flow';
const equipmentExcavator = equipment.find((item: Equipment) => item.value === 'Экскаватор');
const initialNodes: Node = {
  id: '0',
  type: 'custom',
  data: equipmentExcavator,
  position: { x: 0, y: 20 },
  deletable: false,
};

export function Flow() {
  const { project, getNode, getEdges } = useReactFlow();
  const connectingNodeId = useRef<string>('');
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [оnConnectTarget, setOnConnectTarget] = useState<string[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const { setViewport } = useReactFlow();

  const firstLocationNode: number = reactFlowWrapper.current?.clientWidth
    ? reactFlowWrapper.current.clientWidth / 2 - 146.5
    : 0;

  useEffect(() => {
    if (firstLocationNode && nodes.length === 0) {
      setNodes((prevNodes) =>
        prevNodes.concat({
          ...initialNodes,
          position: { x: firstLocationNode, y: 20 },
        }),
      );
    } else if (firstLocationNode) {
      setNodes((prevNodes) => {
        const updatedNodes = prevNodes.map((node) => {
          if (node.id === initialNodes.id) {
            return {
              ...initialNodes,
              position: { x: firstLocationNode, y: 20 },
            };
          }
          return node;
        });
        return updatedNodes;
      });
    }
  }, [firstLocationNode]);

  useUpdateChildNode(оnConnectTarget, setOnConnectTarget);
  const onConnect = useOnConnect(setOnConnectTarget);

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    if (!nodeId) return;
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      if (!event.target) return;
      const targetIsPane = (event.target as Element).classList?.contains('react-flow__pane');
      const parentNode = getNode(connectingNodeId.current);
      const edges = getEdges();
      const otherConnections = edges.filter((edge) => edge.source === parentNode?.id);
      const equipmentD19 = equipment.find((item: Equipment) => item.value === 'д19,5мм -120м 2шт');

      if (targetIsPane && reactFlowWrapper.current) {
        const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
        const id = String(nodes.length) + String(Math.floor(Math.random() * 1000000) + 1);

        const newNode: Node = {
          id,
          data: {
            ...equipmentD19,
            parentNode: parentNode?.id,
            inletThrust: parentNode?.data.outletThrust / (otherConnections.length + 1),
            outletThrust: parentNode?.data.outletThrust / (otherConnections.length + 1),
          },
          position: project({
            // x: (event as MouseEvent).clientX - left - 111.5,
            x: (event as MouseEvent).clientX - left - 146.5,
            y: (event as MouseEvent).clientY - top,
          }),
          type: 'custom',
        };

        setNodes((nds) => nds.concat(newNode));

        if (parentNode?.id) {
          setOnConnectTarget([parentNode?.id]);
        }

        setNodes((prevNodes) => {
          const updatedNodes = prevNodes.map((node) => {
            for (let i = 0; i < otherConnections.length; i++) {
              if (node.id === otherConnections[i].target) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    inletThrust: parentNode?.data.outletThrust / (otherConnections.length + 1),
                    outletThrust: parentNode?.data.outletThrust / (otherConnections.length + 1),
                  },
                };
              }
            }
            return node;
          });
          return updatedNodes;
        });

        setEdges((eds) => eds.concat({ id, source: connectingNodeId.current, target: id, type: 'custom' }));
      }
    },
    [project],
  );

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const storedFlow = localStorage.getItem(flowKey); 
      if (storedFlow) {
        const flow = JSON.parse(storedFlow);
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };
  
    restoreFlow();
  }, [setNodes, setViewport, flowKey]);

  const onDelete = useCallback(() => {
    localStorage.removeItem(flowKey);
    setEdges([]);
    setNodes((prevNodes) => {
      const defNode = prevNodes.filter((node) => node.id === '0');
      return defNode;
    });
  }, []);

  useEffect(() => {
    onRestore();
  }, []);

  useEffect(() => {
    onSave();
  }, [nodes, edges]);

  return (
    <div className={cls.bodyReactFlow} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        className={cls.reactFlow}
        onInit={setRfInstance}
      >
        <Controls />
        <MiniMap
          nodeStrokeColor={(node) => {
            if (node.data.inletThrust > node.data.loadLimit) {
              return '#ff0072';
            } else if (node.data.inletThrust > node.data.workingLoad) {
              return '#ffc53d';
            } else {
              return '#1A192B';
            }
          }}
          nodeColor={(node) => {
            if (node.data.inletThrust > node.data.loadLimit) {
              return '#ff0072';
            } else if (node.data.inletThrust > node.data.workingLoad) {
              return '#ffc53d';
            } else {
              return '#eee';
            }
          }}
        />
        <Panel position="top-left">
          <Button size="small" onClick={onDelete}>Очистить</Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
