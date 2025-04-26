import axios from "axios";

export const getGraphData = async () => {
    const res = await axios.get('http://localhost:3001/action-blueprint-graph-get');
    return res.data;
};