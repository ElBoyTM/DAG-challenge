import GraphView from './components/Graph/GraphView';

function App() {
  return (
    <main style={{ padding: 0, position: 'relative' }}>
      <h1 style={{
        position: 'fixed',
        top: '0',
        left: '0',
        margin: '10px',
        zIndex: 10
      }}>Journey Builder</h1>
      <GraphView />
    </main>
  );
}

export default App;
