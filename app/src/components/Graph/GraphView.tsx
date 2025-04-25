import React, { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

const GraphView = () => {
    return (
        <div>
            <ReactFlow>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};