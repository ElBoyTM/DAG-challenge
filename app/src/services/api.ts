import axios from "axios";

export const getGraphData = async () => {
    const res = await axios.get('http://localhost:3001/api/v1/any/actions/blueprints/any/graph');
    return res.data;
};