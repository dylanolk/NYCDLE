import ReactGA from "react-ga4";

export const initGA = () => {
    ReactGA.initialize("G-6MV0SKK69T");
};

export const logPageView = (path) => {
    ReactGA.send({ hitType: "pageview", page: path });
};
