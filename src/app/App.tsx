import { FC } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Flow } from '../components/flow/Flow';

import 'reactflow/dist/style.css';
import './app.css';

const App: FC = () => {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
};

export default App;
