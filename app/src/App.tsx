import GraphView from './components/Graph/GraphView';
import './App.css';

function App() {
  return (
    <main style={{ padding: 0, position: 'relative' }}>
      <h1 className="app-title">Journey Builder</h1>
      <GraphView />
    </main>
  );
}

export default App;
