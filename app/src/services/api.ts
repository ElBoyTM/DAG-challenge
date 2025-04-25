import axios from "axios";

export const getGraphData = async () => {
    const res = await axios.get('https://api.avantos-dev.io/docs#/operations/action-blueprint-graph-get');
    return res.data;
};