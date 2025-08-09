import { MapDisplay } from './MapDisplay.tsx'
import { SearchBar } from './SearchBar.tsx'
import { CSSProperties } from 'react';
import { useEffect, useState, useRef, useContext } from "react";
import { NeighborhoodListSchema } from '../schemas/NeighborhoodSchema'
import { NeighborhoodsContext } from '../contexts/NeighborhoodsContext.tsx';

enum ColorCodes {
  Good = "green",
  Close = "orange",
  Bad = "red"
}

export function App() {
  const registry = useRef({});
  return (
    <NeighborhoodsContext.Provider value={registry}>
      <AppInner />
    </NeighborhoodsContext.Provider>
  )
}

function AppInner() {
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [gameState, setGameState] = useState({
  })

  const context = useContext(NeighborhoodsContext)

  function onSubmit(e) {
    e.preventDefault();
    console.log(e.value);
    context.current[e.value].setEnabled(true)
  }

  useEffect(() => {
    fetchData(setNeighborhoods);
    randomizeRoute(gameState, setGameState, neighborhoods);
  }, []);

  useEffect(() => {
    if (
      neighborhoods.length === 0 ||
      !context.current[gameState.start_neighborhood_id] ||
      !context.current[gameState.end_neighborhood_id]
    ) {
      return; // Wait until neighborhoods loaded and refs registered
    }

    context.current[gameState.start_neighborhood_id].setEnabled(true);
    context.current[gameState.end_neighborhood_id].setEnabled(true);

  }, [neighborhoods, context, gameState.start_neighborhood_id, gameState.end_neighborhood_id]);

  const wrapper: CSSProperties = {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    flexDirection: 'column',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
  }

  return (
    <div style={wrapper}>
      <MapDisplay neighborhoods={neighborhoods} />
      <SearchBar neighborhoods={neighborhoods} onSubmit={onSubmit} />
    </div>
  )

}

async function fetchData(setNeighborhoods: (neighborhoods: any) => void) {
  const response = await fetch('/coords.json');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  const result = NeighborhoodListSchema.safeParse(data);
  if (!result.success) {
    console.error("Schema validation failed", result.error);
    return;
  }

  setNeighborhoods(result.data);
}

function randomizeRoute(prev, setGameState, neighborhoods) {
  const start_neighborhood_id = 0;
  const end_neighborhood_id = 5;

  setGameState({
    ...prev,
    start_neighborhood_id: start_neighborhood_id,
    end_neighborhood_id: end_neighborhood_id
  })
}

