import { MapDisplay } from './MapDisplay.tsx'
import { SearchBar } from './SearchBar.tsx'
import { CSSProperties } from 'react';
import { useEffect, useState, useRef, useContext } from "react";
import { NeighborhoodListSchema } from '../schemas/NeighborhoodSchema'
import { NeighborhoodsContext } from '../contexts/NeighborhoodsContext.tsx';
import { EndScreen } from './EndScreen.tsx';
import seedrandom from "seedrandom";
import { HintBox } from './HintBox.tsx';
import { GoalBox } from './GoalBox.tsx';
import { LoseScreen } from './LoseScreen.tsx';
import { initGA, logPageView } from "../analytics.tsx";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { InfoScreen } from './InfoScreen';
import { Header } from './Header.tsx';
import { COLORS } from '../constants.tsx'
import { preconnect } from 'react-dom';

export enum ColorCodes {
  Good = COLORS.logo_color,
  Close = "orange",
  Bad = COLORS.deep_red,
  Hint = COLORS.dark_blue,
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
        <Route path="/" element={<AppInner key={new Date().getTime()} />} />
        <Route path='/debug' element={<AppInner debug={true} key={new Date().getTime()} />} />
        <Route path='/practice' element={<AppInner practice={true} key={new Date().getTime()} />} />
      </Routes>
    </NeighborhoodsContext.Provider>
  )
}

function AppInner({ debug = false, practice = false }) {
  const navigate = useNavigate();
  const [showInfoScreen, setShowInfoScreen] = useState(() => {
    try {
      const saved = localStorage.getItem('gameState')
      return saved || practice ? false : true
    } catch {
      return true
    }
  })
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [neighborhoodsDict, setNeighborhoodsDict] = useState({});
  const [gameState, setGameState] = useState(() => {
    try {
      let date = new Date()
      let day = date.getDate() + 1;
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      let currentDate = `${day}-${month}-${year}`;
      let saved = localStorage.getItem('gameState')

      if (!practice && !debug && saved && (JSON.parse(saved)["date"] != currentDate)) {
        localStorage.clear();
        saved = null;
      }
      return saved && !practice ? JSON.parse(saved) : {
        neighborhoods_guessed: [],
        color_tracker: [],
        start_neighborhood_id: null,
        end_neighborhood_id: null,
        finished: false,
        gave_up: false,
        showed_outlines: false,
      }
    } catch {
      return {
        neighborhoods_guessed: [],
        color_tracker: [],
        start_neighborhood_id: null,
        end_neighborhood_id: null,
        finished: false,
        gave_up: false,
        showed_outlines: false, 
      }
    }
  })
  const [endScreenVisible, setEndScreenVisible] = useState(false);
  const context = useContext(NeighborhoodsContext)

  // Load apply saved game state
  const savedGameStateApplied = useRef(false);

  useEffect(() => {
    if (!context.current) return;
    // Wait for all neighborhoods to be registered. 
    if (!neighborhoods.length) return;
    if (!neighborhoods.every(
      n => context.current[n.id] !== undefined
    )) {
      return;
    }
    if (debug) {
      setAllEnabled();
      return;
    }

    if (savedGameStateApplied.current) return;
    savedGameStateApplied.current = true
    if (practice) {
      setAllDisabled();
      return;
    }
    if (gameState.finished) 
      { 
        setAllEnabled();
        setEndScreenVisible(true);
      }

    if (gameState.showed_outlines){
      Object.values(context.current).forEach(neighborhood => neighborhood.setEnabled(true))
    }
    for (let i = 0; i < gameState.neighborhoods_guessed.length; i++) {
      const id = gameState.neighborhoods_guessed[i];
      const color_code = gameState.color_tracker[i];
      if (context.current[id]) {
        if(!gameState.finished)context.current[id].setGreyedOut(true);
        context.current[id].setColor(color_code);
        context.current[id].setEnabled(true);
        context.current[id].setShowName(true)
      }
    }
    isRouteDone()

  }, [gameState, context.current]);

  useEffect(() => {
    if (debug || practice) return;
    localStorage.setItem("gameState", JSON.stringify(gameState))
  }, [gameState]);
  useEffect(() => {
    fetchData(setNeighborhoods, setNeighborhoodsDict);
  }, []
  );

  useEffect(() => {
    if (!neighborhoods) {
      return
    }
    randomizeRoute(gameState, setGameState, neighborhoods, neighborhoodsDict, practice);
  }, [neighborhoods]
  );

  // Color and enable start/end neighborhoods
  useEffect(() => {
    if (
      neighborhoods.length === 0 ||
      !context.current[gameState.start_neighborhood_id] ||
      !context.current[gameState.end_neighborhood_id]
    ) {
      return;
    }

    context.current[gameState.start_neighborhood_id].setEnabled(true);
    context.current[gameState.start_neighborhood_id].setColor('#E58A8A');
    context.current[gameState.start_neighborhood_id].setShowName(true);
    context.current[gameState.end_neighborhood_id].setEnabled(true);
    context.current[gameState.end_neighborhood_id].setColor('#7DA9E8');
    context.current[gameState.end_neighborhood_id].setShowName(true);

  }, [neighborhoods, gameState.start_neighborhood_id, gameState.end_neighborhood_id]);

  const wrapperRef = useRef(null)

  function addNeighborhood(value, is_hint = false) {
    if (gameState.neighborhoods_guessed.includes(value)) return;
    if (gameState.finished) return;
    if (value == gameState.start_neighborhood_id || value == gameState.end_neighborhood_id) {
      return
    }
    context.current[value].setGreyedOut(true)
    context.current[value].setEnabled(true)
    context.current[value].setShowName(true)

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
      setGameState({
        ...gameState, finished: true,
        neighborhoods_guessed: [...gameState.neighborhoods_guessed, value],
        color_tracker: [...gameState.color_tracker, color_code]
      });
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

  function optimalDistance(id_1, id_2, include_guessed = false) {
    if (id_1 === id_2) return [id_1];

    let dequeue = [{ id: id_1, path: [] }];
    let visited = new Set([id_1]);

    while (dequeue.length > 0) {
      let { id: current_id, path } = dequeue.shift();
      let current_neighborhood = neighborhoodsDict[current_id];

      for (let neighbor_id of current_neighborhood.borders) {
        if (visited.has(neighbor_id)) continue;

        let newPath = [];
        if (!gameState.neighborhoods_guessed.includes(neighbor_id) || include_guessed) {
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
  function setAllDisabled() {
    Object.values(context.current).forEach(neighborhood => neighborhood.setEnabled(false));
    Object.values(context.current).forEach(neighborhood => neighborhood.setShowName(false));
    Object.values(context.current).forEach(neighborhood => neighborhood.setShowName('lightgrey'));
  }


  function isRouteDone(last_guess) {
    // DFS of neighborhoods (only checking ones that have been guessed)
    let stack = [gameState.start_neighborhood_id]
    const visited = new Set([gameState.start_neighborhood_id]);
    const guessed = gameState.neighborhoods_guessed.concat([last_guess, gameState.end_neighborhood_id])

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
          context.current[neighbors[i]].setGreyedOut(false)
        }
      }
    }
    return false;
  }




  const wrapper: CSSProperties = {
    minHeight: "130svh",
    maxHeight: "200svh",
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: COLORS.background_color,
    flexDirection: 'column',
    padding: 0,
  }
  const middle_div: CSSProperties = {
    width: window.innerWidth <= 820 ? "90%" : "40%",
    flex: 2,
    display: "flex",
    flexDirection: "column",
    justifyContent: 'center',
  };
  function showNextNeighborhood() {
    const optimal_path = optimalDistance(gameState.start_neighborhood_id, gameState.end_neighborhood_id)
    var next_neighborhood = optimal_path.shift()
    addNeighborhood(next_neighborhood, true)
  }
  function showAllOutlines() {
    Object.values(context.current).forEach(neighborhood => neighborhood.setEnabled(true));
    setGameState({...gameState, showed_outlines: true})
  }
  function giveUp() {
    if (gameState.finished) return;
    setEndScreenVisible(true)
    setAllEnabled()
    setGameState({ ...gameState, finished: true, gave_up: true });
  }
  function red_neighborhoods(neighborhoods) {
    for (var val in neighborhoods) {
      context.current[neighborhoods[val]].setColor('red')
    }
  }
  function grey_neighborhoods(neighborhoods) {
    for (const val in neighborhoods) {
      context.current[neighborhoods[val]].setColor('lightgrey')
    }
  }

  const enabled_neighborhoods_ids = Array.from(new Set([gameState.start_neighborhood_id, gameState.end_neighborhood_id, ...gameState.neighborhoods_guessed].filter(id => id !== null)));
  const start_neighborhood_name = gameState.start_neighborhood_id !== null && neighborhoodsDict[gameState.start_neighborhood_id] ? neighborhoodsDict[gameState.start_neighborhood_id].name : 'Loading...'
  const end_neighborhood_name = gameState.end_neighborhood_id !== null && neighborhoodsDict[gameState.end_neighborhood_id] ? neighborhoodsDict[gameState.end_neighborhood_id].name : 'Loading...'
  if (debug) {
    return (
      <div ref={wrapperRef} style={wrapper}>
        <Header showInfoScreen={() => setShowInfoScreen(true)} showPracticeMode={() => navigate('/practice')} showHome={() => navigate('/')} />
        <div style={middle_div}>
          <GoalBox startNeighborhoodName={start_neighborhood_name} endNeighborhoodName={end_neighborhood_name} />
          <MapDisplay neighborhoods={neighborhoods} enabled_neighborhoods_ids={neighborhoods.map(neighborhood => neighborhood.id)} onHover={red_neighborhoods} offHover={grey_neighborhoods} />
          <SearchBar neighborhoods={neighborhoods} addNeighborhood={addNeighborhood} wrapperRef={wrapperRef} />
          <InfoScreen showInfoScreen={showInfoScreen} onClose={() => setShowInfoScreen(false)} />
        </div>
        <div style={{ width: window.innerWidth <= 820 ? "90%" : "40%", flex: .9 }}>
          <HintBox showNextNeighborhood={showNextNeighborhood} showAllOutlines={showAllOutlines} giveUp={giveUp} />
        </div>
      </div>
    )
  }
  return (
    <div ref={wrapperRef} style={wrapper}>
      <Header showInfoScreen={() => setShowInfoScreen(true)} showPracticeMode={() => navigate('/practice')} showHome={() => navigate('/')} />
      <div style={middle_div}>
        <GoalBox startNeighborhoodName={start_neighborhood_name} endNeighborhoodName={end_neighborhood_name} />
        <MapDisplay neighborhoods={neighborhoods} enabled_neighborhoods_ids={enabled_neighborhoods_ids} />
        <SearchBar neighborhoods={neighborhoods} addNeighborhood={addNeighborhood} wrapperRef={wrapperRef} />
        <EndScreen
          endScreenVisible={endScreenVisible}
          onClose={() => setEndScreenVisible(false)}
          gameState={gameState}
          neighborhoodsDict={neighborhoodsDict}
          optimalRoute={Object.keys(neighborhoodsDict).length ? optimalDistance(gameState.start_neighborhood_id, gameState.end_neighborhood_id, true) : []}
          practice={practice}
        />
        <InfoScreen showInfoScreen={showInfoScreen} onClose={() => setShowInfoScreen(false)} />
      </div>
      <div style={{ width: window.innerWidth <= 820 ? "90%" : "40%", flex: .9 }}>
        <HintBox showNextNeighborhood={showNextNeighborhood} showAllOutlines={showAllOutlines} giveUp={giveUp} />
      </div>
    </div>
  )

}

const COORDS_CACHE_KEY = 'coords_v1';

async function fetchData(setNeighborhoods, setNeighborhoodsDict) {

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('coords_') && key !== COORDS_CACHE_KEY) {
      localStorage.removeItem(key);
    }
  }


  const cached = localStorage.getItem(COORDS_CACHE_KEY);
  if (cached) {
    const data = JSON.parse(cached);
    setNeighborhoods(data);
    const dict = {};
    data.forEach((neighborhood) => (dict[neighborhood.id] = neighborhood));
    setNeighborhoodsDict(dict);
    return;
  }

  const response = await fetch(`${import.meta.env.BASE_URL}coords.json`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();

  const result = NeighborhoodListSchema.safeParse(data);
  if (!result.success) {
    console.error("Schema validation failed", result.error);
    return;
  }

  setNeighborhoods(result.data);
  const neighborhoodsDict = {};
  result.data.forEach((neighborhood) => {
    neighborhoodsDict[neighborhood.id] = neighborhood;
  });
  setNeighborhoodsDict(neighborhoodsDict);

  localStorage.setItem(COORDS_CACHE_KEY, JSON.stringify(result.data));
}



function randomizeRoute(prev, setGameState, neighborhoods, neighborhoodsDict, practice) {
  if (!neighborhoods.length) {
    return
  }

  let date = new Date()
  let day = date.getDate() + 1;
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let currentDate = `${day}-${month}-${year}`;

  const rng = practice ? Math.random : seedrandom(currentDate)
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
      date: currentDate,
    })
  }
}

