import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import apiURL from "./apiURL";

class HttpService {
  axios: AxiosInstance;
  private accessToken: string = "";
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

  async authHttp() {
    console.log(process.env.CLIENT_ID);
    
    try {
      const response = await this.axios.request({
        method: "POST",
        url: "oauth/token",
        data: {
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          grant_type: process.env.GRANT_TYPE,
          password: process.env.PASSWORD,
          username: process.env.USERNAME,
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      this.accessToken = response?.data?.access_token;
    } catch (error) {
      console.log(error);
      
    }
  }

  async httpApi() {
    await this.authHttp();

    return axios.create({
      baseURL: apiURL.apiURL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
  }
}

export default HttpService;
