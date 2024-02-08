import { useCallback, Dispatch, SetStateAction } from 'react';
import { addEdge, OnConnect, useReactFlow } from 'reactflow';

export function useOnConnect(setOnConnectTarget: Dispatch<SetStateAction<string[]>>) {
  const { getEdges, getNodes, setNodes, setEdges } = useReactFlow();
  const nodes = getNodes();
  const edges = getEdges();

  const onConnect: OnConnect = useCallback(
    (params) => {
      const { source, target } = params;
      const sourceNode = nodes.find((node) => node.id === source);
      if (!sourceNode) return;

      const childEdges = edges.filter((edge) => edge.source === target);
      if (childEdges.length > 0 && target) {
        setOnConnectTarget(['0']);
      }

      const otherConnections = edges.filter((edge) => edge.source === source);
      const parentConnections = edges.filter((edge) => edge.target === target);

      let parentOutletThrust = 0;
      nodes.map((node) => {
        for (let i = 0; i < parentConnections.length; i++) {
          if (parentConnections && node.id === parentConnections[i]?.source) {
            parentOutletThrust += node.data.outletThrust;
            return;
          }
        }
      });

      setNodes((prevNodes) => {
        const updatedNodes = prevNodes.map((node) => {
          if (node.id === target) {
            let recalculationOutletThrust;

            if (node.data.category === 'Гиня4') {
              recalculationOutletThrust = (parentOutletThrust + sourceNode.data.outletThrust) * 4;
            } else if (node.data.category === 'Гиня7') {
              recalculationOutletThrust = (parentOutletThrust + sourceNode.data.outletThrust) * 7;
            } else {
              recalculationOutletThrust = parentOutletThrust + sourceNode.data.outletThrust;
            }

            return {
              ...node,
              data: {
                ...node.data,
                inletThrust: (parentOutletThrust + sourceNode.data.outletThrust) / (otherConnections.length + 1),
                outletThrust: recalculationOutletThrust / (otherConnections.length + 1),
                parentNode: source,
              },
            };
          }

          for (let i = 0; i < otherConnections.length; i++) {
            if (node.id === otherConnections[i].target) {
              return {
                ...node,
                data: {
                  ...node.data,
                  inletThrust: sourceNode.data.outletThrust / (otherConnections.length + 1),
                  outletThrust: sourceNode.data.outletThrust / (otherConnections.length + 1),
                },
              };
            }
          }

          return node;
        });

        return updatedNodes;
      });

      const newParams: any = {
        ...params,
        type: 'custom',
      };

      setEdges((prevEdges) => addEdge(newParams, prevEdges));
    },
    [nodes],
  );

  return onConnect;
}
