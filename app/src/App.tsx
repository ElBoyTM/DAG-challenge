import { GraphView } from './components/Graph/GraphView'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <GraphView graph={{ nodes: [], edges: [] }} onNodePositionChange={() => {}} />
    </div>
  )
}

export default App
