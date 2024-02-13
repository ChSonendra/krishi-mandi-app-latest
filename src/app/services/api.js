// import baseUrl from "../../utils/environment/Environment";
import axios from "axios";
import * as config from '../configs/config.json'
export const makeApiRequest = async (functionName, method, serverName, Body = null, authToken = null) => {
  try {
    const baseUrl = config.servers[serverName];
    const apiUrl = `${baseUrl}${functionName}`;
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'max-age=86400',
    };
    console.log("till here is fine")
    if (authToken) {
      headers['Authorization'] = authToken;
    }
    if (method == "POST") {
      if (Body !== null) {
        const body = JSON.stringify(Body);
        const result = await axios.post(apiUrl, body, { headers: headers })
        console.log("result ====================================",functionName,"",result.data.apiResponseStatus);
        if (result.data.apiResponseStatus) {
          return {
            status: true,
            payload: result.data.apiResponseData
          }
        }
        else if (!result.data.apiResponseStatus) {
          return {
            status: false,
            message: result.data.apiResponseData.apiResponseMessage
          }
        }
        else {
          return {
            status: false,
            message: "Some error Occured please try opening the app later"
          }
        }
      }
    }
    else if (method == "GET") {
      const body = JSON.stringify(Body);
      const result = await axios.post(apiUrl, { headers: headers })
      console.log(result);

      if (result.data.apiResponseStatus) {
        return {
          status: true,
          payload: result.data.apiResponseData
        }
      }
      else if (!result.data.apiResponseStatus) {
        return {
          status: false,
          message: result.data.apiResponseData.apiResponseMessage
        }
      }
      else {
        return {
          status: false,
          message: "Some error Occured please try opening the app later"
        }
      }
    }
  }
  catch (error) {
    return {
      status: false,
      message: "Some error Occured please try opening the app later"
    }
  }

  // if (authToken) {
  //   headers['Authorization'] = authToken;
  // }

  // const options = {
  //   method,
  //   headers,
  // };



  // console.log(options);
  // try {
  //   const response = await fetch(apiUrl, options);
  //   console.log("response ",response);
  //   if (!response.ok) {
  //     return "great error"
  //   }

  //   const responseData = await response.json();
  //   console.log(responseData);
  //   //   callback(responseData)
  //   return responseData;
  // } catch (error) {
  //   console.error('API request error:', error);
  //   throw new Error(`API request failed with status ${response.status}`)
  // }
};