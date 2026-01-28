import { MapDisplay } from './MapDisplay.tsx'
import { SearchBar } from './SearchBar.tsx'
import { CSSProperties, useCallback, useMemo } from 'react';
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
import { ResultsButton } from './ResultsButton.tsx';
import { PracticeSettings } from './PracticeSettings.tsx';
import { ToolTip } from './ToolTip.tsx';
export enum ColorCodes {
  Good = COLORS.logo_color,
  Close = "orange",
  Bad = COLORS.deep_red,
  Hint = COLORS.dark_blue,
}

export function App() {
  const [registry, setRegistry] = useState({})
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    logPageView(location.pathname);
  }, [location]);

  function reset() {
    setRegistry({})
  }

  return (
    <NeighborhoodsContext.Provider value={{ registry, reset }}>
      <Routes>
        <Route path="/" element={<AppInner key={new Date().getTime()} />} />
        <Route path='/debug' element={<AppInner debug={true} />} />
        <Route path='/practice' element={<AppInner practice={true} />} />
      </Routes>
    </NeighborhoodsContext.Provider>
  )
}

const _INITIAL_GAME_STATE = {
  neighborhoods_guessed: [],
  color_tracker: [],
  start_neighborhood_id: null,
  end_neighborhood_id: null,
  finished: false,
  gave_up: false,
  showed_outlines: false,
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
  const [showPracticeSettings, setShowPracticeSettings] = useState(false)
  const [endScreenVisible, setEndScreenVisible] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [neighborhoodsDict, setNeighborhoodsDict] = useState({});
  const [practiceSettings, setPracticeSettings] = useState({
    enabled_boros: []
  })
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
      return saved && !practice ? JSON.parse(saved) : _INITIAL_GAME_STATE
    } catch {
      return _INITIAL_GAME_STATE
    }
  })
  const { registry, reset_registry } = useContext(NeighborhoodsContext)
  const [toolTipLabel, setToolTipLabel] = useState("")
  const [toolTipOpen, setToolTipOpen] = useState(false)

  function resetGame() {
    Object.values(registry).forEach(neighborhood => neighborhood.setEnabled(false))
    Object.values(registry).forEach(neighborhood => neighborhood.setColor("lightgrey"))
    Object.values(registry).forEach(neighborhood => neighborhood.setGreyedOut(false))
    Object.values(registry).forEach(neighborhood => neighborhood.setShowName(false))

    const state = practice ? _INITIAL_GAME_STATE : gameState
    if (practice) {
      setGameState(_INITIAL_GAME_STATE);
    }
    randomizeRoute(state, setGameState, neighborhoods, neighborhoodsDict, practice, practiceSettings.enabled_boros)
  }

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      var [neighborhoodsData, neighborhoodsDictData] = await fetchData();
      setNeighborhoods(neighborhoodsData)
      setNeighborhoodsDict(neighborhoodsDictData)
    };

    fetchNeighborhoods();
  }, []);

  useEffect(() => { resetGame() }, [location.pathname])

  // Apply saved game state
  const savedGameStateApplied = useRef(false);

  useEffect(() => {
    if (!registry) return;
    // Wait for all neighborhoods to be registered. 
    if (!neighborhoods.length) return;
    if (!neighborhoods.every(
      n => registry[n.id] !== undefined
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
    if (gameState.finished) {
      setAllEnabled();
      setEndScreenVisible(true);
    }

    if (gameState.showed_outlines) {
      Object.values(registry).forEach(neighborhood => neighborhood.setEnabled(true))
    }
    for (let i = 0; i < gameState.neighborhoods_guessed.length; i++) {
      const id = gameState.neighborhoods_guessed[i];
      const color_code = gameState.color_tracker[i];
      if (registry[id]) {
        if (!gameState.finished) registry[id].setGreyedOut(true);
        registry[id].setColor(color_code);
        registry[id].setEnabled(true);
        registry[id].setShowName(true)
      }
    }
    isRouteDone()

  }, [gameState, registry]);

  useEffect(() => {
    if (debug || practice) return;
    localStorage.setItem("gameState", JSON.stringify(gameState))
  }, [gameState]);



  useEffect(() => {
    if (!neighborhoods) {
      return
    }
    randomizeRoute(gameState, setGameState, neighborhoods, neighborhoodsDict, practice, practiceSettings.enabled_boros);
  }, [neighborhoods]
  );

  // Color and enable start/end neighborhoods
  useEffect(() => {
    if (
      neighborhoods.length === 0 ||
      !registry[gameState.start_neighborhood_id] ||
      !registry[gameState.end_neighborhood_id]
    ) {
      return;
    }

    registry[gameState.start_neighborhood_id].setEnabled(true);
    registry[gameState.start_neighborhood_id].setColor(COLORS.pale_red);
    registry[gameState.start_neighborhood_id].setShowName(true);
    registry[gameState.end_neighborhood_id].setEnabled(true);
    registry[gameState.end_neighborhood_id].setColor(COLORS.blue);
    registry[gameState.end_neighborhood_id].setShowName(true);

  }, [neighborhoods, gameState.start_neighborhood_id, gameState.end_neighborhood_id]);

  useEffect(() => {
    resetGame();
  }, [practiceSettings.enabled_boros])
  const wrapperRef = useRef(null)

  function addNeighborhood(value, is_hint = false) {
    if (gameState.neighborhoods_guessed.includes(value)) return;
    if (gameState.finished) return;
    if (value == gameState.start_neighborhood_id || value == gameState.end_neighborhood_id) {
      return
    }
    registry[value].setGreyedOut(true)
    registry[value].setEnabled(true)
    registry[value].setShowName(true)
    registry[value].wiggle()

    var color_code = null;
    if (!is_hint) color_code = determineScore(value);
    else color_code = ColorCodes.Hint;
    registry[value].setColor(color_code)
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
    Object.values(registry).forEach(neighborhood => neighborhood.setEnabled(true));
    Object.values(registry).forEach(neighborhood => neighborhood.setShowName(true));
  }
  function setAllDisabled() {
    Object.values(registry).forEach(neighborhood => neighborhood.setEnabled(false));
    Object.values(registry).forEach(neighborhood => neighborhood.setShowName(false));
    Object.values(registry).forEach(neighborhood => neighborhood.setShowName('lightgrey'));
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
          registry[neighbors[i]].setGreyedOut(false)
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
    Object.values(registry).forEach(neighborhood => neighborhood.setEnabled(true));
    setGameState({ ...gameState, showed_outlines: true })
  }
  function giveUp() {
    if (gameState.finished) return;
    setEndScreenVisible(true)
    setAllEnabled()
    setGameState({ ...gameState, finished: true, gave_up: true });
  }
  function red_neighborhoods(neighborhoods) {
    for (var val in neighborhoods) {
      registry[neighborhoods[val]].setColor('red')
    }
  }
  function grey_neighborhoods(neighborhoods) {
    for (const val in neighborhoods) {
      registry[neighborhoods[val]].setColor('lightgrey')
    }
  }
  async function copyToClipboard(name) {
    await navigator.clipboard.writeText(name)
  }
  const handleHover = useCallback((name: string) => {
    setToolTipLabel(name);
    setToolTipOpen(true);
  }, []);

  const handleOffHover = useCallback(() => {
    setToolTipOpen(false);
  }, []);
  const enabled_neighborhoods_ids = useMemo(
    () => Array.from(new Set([gameState.start_neighborhood_id, gameState.end_neighborhood_id, ...gameState.neighborhoods_guessed])).filter(id => id !== null),
    [gameState.start_neighborhood_id, gameState.end_neighborhood_id, gameState.neighborhoods_guessed]
  );

  const start_neighborhood_name = gameState.start_neighborhood_id !== null && neighborhoodsDict[gameState.start_neighborhood_id] ? neighborhoodsDict[gameState.start_neighborhood_id].name : 'Loading...'
  const end_neighborhood_name = gameState.end_neighborhood_id !== null && neighborhoodsDict[gameState.end_neighborhood_id] ? neighborhoodsDict[gameState.end_neighborhood_id].name : 'Loading...'
  const boroNames: string[] = Array.from(new Set(neighborhoods.map(neighborhood => neighborhood.boroname)))
  if (debug) {
    return (
      <div ref={wrapperRef} style={wrapper}>
        <Header showInfoScreen={() => setShowInfoScreen(true)} showPracticeMode={() => navigate('/practice')} showHome={() => navigate('/')} practice={practice} />
        <div style={middle_div}>
          <GoalBox startNeighborhoodName={start_neighborhood_name} endNeighborhoodName={end_neighborhood_name} />
          <MapDisplay neighborhoods={neighborhoods} enabled_neighborhoods_ids={neighborhoods.map(neighborhood => neighborhood.id)} onHover={red_neighborhoods} offHover={grey_neighborhoods} onClick={copyToClipboard} debug={true} />
          {!gameState.finished ? <SearchBar neighborhoods={neighborhoods} addNeighborhood={addNeighborhood} wrapperRef={wrapperRef} /> : <ResultsButton showResults={() => setEndScreenVisible(true)} />}
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
      <Header showInfoScreen={() => setShowInfoScreen(true)} showPracticeMode={() => { resetGame(); navigate('/practice') }} showHome={() => { navigate('/') }} practice={practice} />
      <div style={middle_div}>
        <ToolTip label={toolTipLabel} open={toolTipOpen} />
        <GoalBox startNeighborhoodName={start_neighborhood_name} endNeighborhoodName={end_neighborhood_name} />
        <MapDisplay neighborhoods={neighborhoods} enabled_neighborhoods_ids={enabled_neighborhoods_ids} practice={practice} showPracticeSettings={() => setShowPracticeSettings(true)} onHover={handleHover} offHover={handleOffHover} />
        {!gameState.finished ? <SearchBar neighborhoods={neighborhoods} addNeighborhood={addNeighborhood} wrapperRef={wrapperRef} /> : <ResultsButton showResults={() => setEndScreenVisible(true)} />}
        <EndScreen
          endScreenVisible={endScreenVisible}
          onClose={() => setEndScreenVisible(false)}
          gameState={gameState}
          neighborhoodsDict={neighborhoodsDict}
          optimalRoute={Object.keys(neighborhoodsDict).length ? optimalDistance(gameState.start_neighborhood_id, gameState.end_neighborhood_id, true) : []}
          practice={practice}
        />
        <InfoScreen showInfoScreen={showInfoScreen} onClose={() => setShowInfoScreen(false)} />
        <PracticeSettings
          setEnabledBoros={(boros) => setPracticeSettings({ ...practiceSettings, enabled_boros: boros })}
          showPracticeSettings={showPracticeSettings}
          onClose={() => {
            setShowPracticeSettings(false);
          }}
          boroNames={boroNames}
          practiceSettings={practiceSettings}
        />
      </div>
      <div style={{ width: window.innerWidth <= 820 ? "90%" : "40%", flex: .9 }}>
        <HintBox showNextNeighborhood={showNextNeighborhood} showAllOutlines={showAllOutlines} giveUp={giveUp} />
      </div>
    </div>
  )

}

const COORDS_CACHE_KEY = 'coords_v2';

async function fetchData() {

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('coords_') && key !== COORDS_CACHE_KEY) {
      localStorage.removeItem(key);
    }
  }


  const cached = localStorage.getItem(COORDS_CACHE_KEY);
  if (cached) {
    const data = JSON.parse(cached);
    const dict = {};
    data.forEach((neighborhood) => (dict[neighborhood.id] = neighborhood));
    return [data, dict];
  }

  const response = await fetch(`${import.meta.env.BASE_URL}coords.json`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();

  const result = NeighborhoodListSchema.safeParse(data);
  if (!result.success) {
    console.error("Schema validation failed", result.error);
    return;
  }


  const neighborhoodsDict = {};
  result.data.forEach((neighborhood) => {
    neighborhoodsDict[neighborhood.id] = neighborhood;
  });


  localStorage.setItem(COORDS_CACHE_KEY, JSON.stringify(result.data));
  return [result.data, neighborhoodsDict]
}



function randomizeRoute(prev, setGameState, neighborhoods, neighborhoodsDict, practice, enabled_boros) {
  if (!neighborhoods.length) {
    return
  }
  let date = new Date()
  let day = date.getDate() + 1;
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let currentDate = `${day}-${month}-${year}`;

  const rng = practice ? Math.random : seedrandom(currentDate)
  var end_candidates = []
  while (!end_candidates.length) {
    var filtered_neighborhoods = practice && enabled_boros.length ? neighborhoods.filter(neighborhood => enabled_boros.includes(neighborhood.boroname)) : neighborhoods
    const start_neighborhood_id = filtered_neighborhoods[Math.floor(rng() * filtered_neighborhoods.length)].id;


    const distances = neighborhoodsDict[start_neighborhood_id].distances
    for (let i = 0; i < distances.length; i++) {
      if (distances[i] > 1 && distances[i] < 8) {
        end_candidates.push(i)
      }
    }
    if (practice && enabled_boros.length) end_candidates = end_candidates.filter(id => enabled_boros.includes(neighborhoodsDict[id].boroname))
    const end_neighborhood_id = end_candidates[Math.floor(rng() * end_candidates.length)]
    setGameState({
      ...prev,
      start_neighborhood_id: start_neighborhood_id,
      end_neighborhood_id: end_neighborhood_id,
      date: currentDate,
    })
  }
}

