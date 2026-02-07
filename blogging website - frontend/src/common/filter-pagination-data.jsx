import axios from "axios";

export const filterPaginationData = async ({create_new_arr = false,state,arr,data,page,countRoute,data_to_send = { },user = undefined}) => {

    let obj;
    let headers={};
    if(user)
    {
        headers.headers = {
            'Authorization' : `Bearer ${user}`
        }
    }
    if(state !== null && !create_new_arr)
    {
        console.log("Adding new data to existing state. Current results:", state.results.length, "New data:", data.length);
        obj = {...state,results: [ ...state.results, ...data], page: page}
        console.log("Combined results:", obj.results.length);
    }
    else
    {   
        console.log("Creating new state with data:", data.length);
        await axios.post(import.meta.env.VITE_SERVER_DOMAIN + countRoute,data_to_send,headers)
        .then(({data : {totalDocs}}) => {
            obj = {results: data,page: 1,totalDocs}
            console.log("New state created. Total docs:", totalDocs, "Results:", data.length);
        })
        .catch(err => {
            console.log(err);
        })
    }
    return obj;
}