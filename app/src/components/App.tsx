import { MapDisplay } from './MapDisplay.tsx'
import { SearchBar } from './SearchBar.tsx'
import { CSSProperties } from 'react';
import { useEffect, useState, useRef, useContext } from "react";
import { NeighborhoodListSchema } from '../schemas/NeighborhoodSchema'
import { NeighborhoodsContext } from '../contexts/NeighborhoodsContext.tsx';
import { EndScreen } from './EndScreen.tsx';
import seedrandom from "seedrandom";
import { HintBox } from './HintBox.tsx';
import { Header } from './Header.tsx';
import { LoseScreen } from './LoseScreen.tsx';
import { initGA, logPageView } from "../analytics.tsx";
import { Route, Routes, useLocation } from "react-router-dom";

export enum ColorCodes {
  Good = "green",
  Close = "orange",
  Bad = "red",
  Hint = "grey",
}

export function App() {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    logPageView(location.pathname);
  }, [location]);
  const registry = useRef({});
  return (
    <NeighborhoodsContext.Provider value={registry}>
      <Routes>
        <Route path="/NYCDLE" element={<AppInner />} />

      </Routes>
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
    end_neighborhood_id: null,
  })
  const [endScreenVisible, setEndScreenVisible] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const context = useContext(NeighborhoodsContext)

  const wrapperRef = useRef(null)

  function addNeighborhood(value, is_hint = false) {
    if (value == gameState.start_neighborhood_id || value == gameState.end_neighborhood_id) {
      return
    }
    context.current[value].setEnabled(true)
    context.current[value].setShowName(true)
    //determine how good a guess is (assign green/orange/red)
    var color_code = null;
    if (!is_hint) color_code = determineScore(value);
    else color_code = ColorCodes.Hint;
    context.current[value].setColor(color_code)
    setGameState({
      ...gameState,
      neighborhoods_guessed: [...gameState.neighborhoods_guessed, value],
      color_tracker: [...gameState.color_tracker, color_code]
    })


    if (isRouteDone(value)) {
      setEndScreenVisible(true);
      setAllEnabled();
    }
  }

  function determineScore(value) {
    const optimal_path = optimalDistance(gameState.start_neighborhood_id, gameState.end_neighborhood_id)
    const optimal_distance = optimal_path.length
    const path_to_end = optimalDistance(value, gameState.end_neighborhood_id)
    const distance_to_end = path_to_end ? path_to_end.length : null
    const path_to_start = optimalDistance(value, gameState.start_neighborhood_id)
    const distance_to_start = path_to_start ? path_to_start.length : null

    if (distance_to_end + distance_to_start > optimal_distance + 3 || distance_to_start === null) {
      return ColorCodes.Bad
    }
    if (distance_to_end + distance_to_start > optimal_distance) {
      return ColorCodes.Close
    }
    return ColorCodes.Good
  }

  function optimalDistance(id_1, id_2) {
    if (id_1 === id_2) return [id_1];

    let dequeue = [{ id: id_1, path: [] }];
    let visited = new Set([id_1]);

    while (dequeue.length > 0) {
      let { id: current_id, path } = dequeue.shift();
      let current_neighborhood = neighborhoodsDict[current_id];

      for (let neighbor_id of current_neighborhood.borders) {
        if (visited.has(neighbor_id)) continue;

        let newPath = [];
        if (!gameState.neighborhoods_guessed.includes(neighbor_id)) {
          newPath = [...path, neighbor_id];
          dequeue.push({
            id: neighbor_id,
            path: newPath
          });
        }
        else {
          newPath = path
          dequeue.unshift({
            id: neighbor_id,
            path: newPath
          });
        }

        if (neighbor_id === id_2) {
          return newPath;
        }

        visited.add(neighbor_id);
      }
    }

    return null;
  }


  function setAllEnabled() {
    Object.values(context.current).forEach(neighborhood => neighborhood.setEnabled(true));
    Object.values(context.current).forEach(neighborhood => neighborhood.setShowName(true));
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
  }, []
  );

  useEffect(() => {
    randomizeRoute(gameState, setGameState, neighborhoods, neighborhoodsDict);
  }, [neighborhoods]
  );


  useEffect(() => {
    if (
      neighborhoods.length === 0 ||
      !context.current[gameState.start_neighborhood_id] ||
      !context.current[gameState.end_neighborhood_id]
    ) {
      return; // Wait until neighborhoods loaded and refs registered
    }

    context.current[gameState.start_neighborhood_id].setEnabled(true);
    context.current[gameState.start_neighborhood_id].setColor('#E58A8A');
    context.current[gameState.start_neighborhood_id].setShowName(true);
    context.current[gameState.end_neighborhood_id].setEnabled(true);
    context.current[gameState.end_neighborhood_id].setColor('#7DA9E8');
    context.current[gameState.end_neighborhood_id].setShowName(true);

  }, [neighborhoods, context, gameState.start_neighborhood_id, gameState.end_neighborhood_id]);

  const wrapper: CSSProperties = {
    height: '100dvh',
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    flexDirection: 'column',
    margin: 0,
    padding: 0,
    overflowY: 'auto'
  }
  const middle_div: CSSProperties = {
    width: window.innerWidth <= 820 ? "90%" : "40%",
    height: '90%',
    maxWidth: "1200px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };
  function showNextNeighborhood() {
    const optimal_path = optimalDistance(gameState.start_neighborhood_id, gameState.end_neighborhood_id)
    var next_neighborhood = optimal_path.shift()
    addNeighborhood(next_neighborhood, true)
  }
  function showAllOutlines() {
    Object.values(context.current).forEach(neighborhood => neighborhood.setEnabled(true));
  }
  function giveUp() {
    setGaveUp(true)
    setAllEnabled()
  }
  const enabled_neighborhoods_ids = Array.from(new Set([gameState.start_neighborhood_id, gameState.end_neighborhood_id, ...gameState.neighborhoods_guessed].filter(id => id !== null)));
  const start_neighborhood_name = gameState.start_neighborhood_id !== null && neighborhoodsDict[gameState.start_neighborhood_id] ? neighborhoodsDict[gameState.start_neighborhood_id].name : 'Loading...'
  const end_neighborhood_name = gameState.end_neighborhood_id !== null && neighborhoodsDict[gameState.end_neighborhood_id] ? neighborhoodsDict[gameState.end_neighborhood_id].name : 'Loading...'
  return (
    <div ref={wrapperRef} style={wrapper}>
      <div style={middle_div}>
        <Header startNeighborhoodName={start_neighborhood_name} endNeighborhoodName={end_neighborhood_name} />
        <MapDisplay neighborhoods={neighborhoods} enabled_neighborhoods_ids={enabled_neighborhoods_ids} />
        <SearchBar neighborhoods={neighborhoods} addNeighborhood={addNeighborhood} />
        <HintBox showNextNeighborhood={showNextNeighborhood} showAllOutlines={showAllOutlines} giveUp={giveUp} />
        <EndScreen endScreenVisible={endScreenVisible} onClose={() => setEndScreenVisible(false)} colorTracker={gameState.color_tracker} />
        <LoseScreen gaveUp={gaveUp} onClose={() => setGaveUp(false)} colorTracker={gameState.color_tracker} />
      </div>
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

function randomizeRoute(prev, setGameState, neighborhoods, neighborhoodsDict) {
  if (!neighborhoods.length) {
    return
  }

  let date = new Date()
  let day = date.getDate() + 1;
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let currentDate = `${day}-${month}-${year}`;

  const rng = seedrandom(currentDate)
  const end_candidates = []
  while (!end_candidates.length) {
    const start_neighborhood_id = Math.floor(rng() * neighborhoods.length);


    const distances = neighborhoodsDict[start_neighborhood_id].distances
    for (let i = 0; i < distances.length; i++) {
      if (distances[i] > 3 && distances[i] < 8) {
        end_candidates.push(i)
      }
    }
    const end_neighborhood_id = end_candidates[Math.floor(rng() * end_candidates.length)]

    setGameState({
      ...prev,
      start_neighborhood_id: start_neighborhood_id,
      end_neighborhood_id: end_neighborhood_id,
      neighborhoods_guessed: [end_neighborhood_id]
    })
  }
}

