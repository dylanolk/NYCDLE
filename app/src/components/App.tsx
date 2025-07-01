import { MapDisplay } from './MapDisplay.tsx'
import { SearchBar } from './SearchBar.tsx'
import { CSSProperties } from 'react';
import { useEffect, useState } from "react";
import { NeighborhoodListSchema } from '../schemas/NeighborhoodSchema'

export function App() {
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);

  useEffect(() => {
    fetchData(setNeighborhoods);
  }, []);

  function enable_neighborhood(id) {
    setNeighborhoods(prev =>
      prev.map(n =>
        n.id === id ? { ...n, enabled: false } : n
      )
    );
  }


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
    // <Header /> 
    <div style={wrapper}>
      <MapDisplay neighborhoods={neighborhoods} />
      <SearchBar neighborhoods={neighborhoods} onSubmit={enable_neighborhood} />
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


