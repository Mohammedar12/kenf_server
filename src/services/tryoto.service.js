import axios from 'axios';
import ApiError from '../helpers/ApiError';

let access_token;
let access_token_expire_at;

const refreshToken = async() => {
    var data = {
        refresh_token: process.env.REFRESH_TOKEN,
    };
    var config = {
        method: "post",
        url: "https://api.tryoto.com/rest/v2/refreshToken",
        headers: {},
        data: data,
    };
    try{
        let response = await axios(config);
        if(!response.data.success){
            throw new ApiError(502, 'Bad delivery gateway.');
        }
        access_token = response.data.access_token;
        access_token_expire_at = Math.round(new Date().getTime() / 1000) + response.data.expires_in;
    }
    catch(e){
        throw new ApiError(502, 'Bad delivery gateway.');
    }
};

export default call = async(url,method,data) => {
    if(!access_token || !access_token_expire_at || (  Math.round(new Date().getTime() / 1000) > access_token_expire_at )){
        refreshToken();
    }
    return await axios({
        method: method,
        url: "https://api.tryoto.com/rest/v2/"+url,
        headers: {
            Accept: "application/json",
            Authorization: "Bearer " + access_token,
        },
        data: data,
    });
}