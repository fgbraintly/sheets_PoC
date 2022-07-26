import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import apiURL from "./apiURL";

class HttpService {
  axios: AxiosInstance | undefined = undefined;
  constructor() {
    const config: AxiosRequestConfig<any> = {
      baseURL: apiURL.apiURL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    this.axios = axios.create(config);
  }

  async auth(){
    this.axios?.request({
        
    })
  }
}

export default HttpService;
