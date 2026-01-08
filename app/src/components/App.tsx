import { MapDisplay } from './MapDisplay.tsx'
import { SearchBar } from './SearchBar.tsx'
import { CSSProperties } from 'react';
import { useEffect, useState, useRef, useContext } from "react";
import { NeighborhoodListSchema } from '../schemas/NeighborhoodSchema'
import { NeighborhoodsContext } from '../contexts/NeighborhoodsContext.tsx';
import { EndScreen } from './EndScreen.tsx';

export enum ColorCodes {
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
  const [neighborhoodsDict, setNeighborhoodsDict] = useState({});
  const [gameState, setGameState] = useState({
    neighborhoods_guessed: [],
    color_tracker: [],
    start_neighborhood_id: null,
    end_neighborhood_id: null
  })
  const [endScreenVisible, setEndScreenVisible] = useState(false);

  const context = useContext(NeighborhoodsContext)

  function addNeighborhood(value) {
    if (value == gameState.start_neighborhood_id || value == gameState.end_neighborhood_id) {
      return
    }
    context.current[value].setEnabled(true)

    //determine how good a guess is (assign green/orange/red)
    let color_score = null
    const optimal_distance = neighborhoodsDict[gameState.start_neighborhood_id].distances[gameState.end_neighborhood_id]
    const distance_to_end = neighborhoodsDict[value].distances[gameState.end_neighborhood_id]
    const distance_to_start = neighborhoodsDict[value].distances[gameState.start_neighborhood_id]
    if (distance_to_end + distance_to_start > optimal_distance + 3 || distance_to_start === null) {
      context.current[value].setColor(ColorCodes.Bad)
      color_score = ColorCodes.Bad
    }
    else if (distance_to_end + distance_to_start > optimal_distance) {
      context.current[value].setColor(ColorCodes.Close)
      color_score = ColorCodes.Close
    }
    else {
      context.current[value].setColor(ColorCodes.Good)
      color_score = ColorCodes.Good
    }

    setGameState({
      ...gameState,
      neighborhoods_guessed: [...gameState.neighborhoods_guessed, value],
      color_tracker: [...gameState.color_tracker, color_score]
    })


    if (isRouteDone(value)) {
      setEndScreenVisible(true);
      setAllEnabled();
    }
  }

  function setAllEnabled() {
    Object.values(context.current).forEach(neighborhood => neighborhood.setEnabled(true));
  }

  function isRouteDone(last_guess) {
    // DFS of neighborhoods (only checking ones that have been guessed)
    let stack = [gameState.start_neighborhood_id]
    const visited = new Set([gameState.start_neighborhood_id]);
    const guessed = gameState.neighborhoods_guessed.concat([last_guess])

    while (stack.length > 0) {
      const current = stack.pop()
      if (current === gameState.end_neighborhood_id) {
        return true;
      }
      const current_neighborhood = neighborhoodsDict[current]
      const neighbors = current_neighborhood.borders
      for (let i = 0; i < neighbors.length; i++) {
        if (!visited.has(neighbors[i]) && guessed.includes(neighbors[i])) {
          visited.add(neighbors[i])
          stack.push(neighbors[i])
        }
      }
    }
    return false;
  }


  useEffect(() => {
    fetchData(setNeighborhoods, setNeighborhoodsDict);
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

  const enabled_neighborhoods_ids = Array.from(new Set([gameState.start_neighborhood_id, gameState.end_neighborhood_id, ...gameState.neighborhoods_guessed].filter(id => id !== null)));
  const start_neighborhood_name = gameState.start_neighborhood_id !== null && neighborhoodsDict[gameState.start_neighborhood_id] ? neighborhoodsDict[gameState.start_neighborhood_id].name : 'Loading...'
  const end_neighborhood_name = gameState.end_neighborhood_id !== null && neighborhoodsDict[gameState.end_neighborhood_id] ? neighborhoodsDict[gameState.end_neighborhood_id].name : 'Loading...'
  return (
    <div style={wrapper}>
      <div><p> Today I want to go from <strong>{start_neighborhood_name}</strong> to <strong>{end_neighborhood_name}</strong></p></div>
      <MapDisplay neighborhoods={neighborhoods} enabled_neighborhoods_ids={enabled_neighborhoods_ids} />
      <SearchBar neighborhoods={neighborhoods} addNeighborhood={addNeighborhood} />
      <EndScreen endScreenVisible={endScreenVisible} onClose={() => setEndScreenVisible(false)} colorTracker={gameState.color_tracker} />
    </div>
  )

}

async function fetchData(setNeighborhoods: (neighborhoods: any) => void, setNeighborhoodsDict: (neighborhoodsDict: any) => void) {
  const response = await fetch(`${import.meta.env.BASE_URL}coords.json`);
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

  const neighborhoodsDict = {}
  result.data.forEach((neighborhood) => {
    neighborhoodsDict[neighborhood.id] = neighborhood;
  });
  setNeighborhoodsDict(neighborhoodsDict);
}

function randomizeRoute(prev, setGameState, neighborhoods) {
  const start_neighborhood_id = 0;
  const end_neighborhood_id = 7;

  setGameState({
    ...prev,
    start_neighborhood_id: start_neighborhood_id,
    end_neighborhood_id: end_neighborhood_id,
    neighborhoods_guessed: [end_neighborhood_id]
  })
}

