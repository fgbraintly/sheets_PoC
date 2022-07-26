import HttpService from "./HttpService";
import { AxiosInstance } from "axios";
class Calls {
  private firstName: string = "";
  private lastName: string = "";
  private totalTimeSpoken: string = "";
  private coach: string = "";
  private date: string = "";
  private recordingUrl: string = "";
  private axios: AxiosInstance | null;

  constructor() {
    this.axios = null;
  }

  async getCalls(_institutionId: string) {
    this.axios = await new HttpService().httpApi();
    try {
      const response = await this.axios.request({
        method: "GET",
        url: "/api/app/backoffice/calls",
        params: {
          institution_id: _institutionId,
        },
      });
      const calls = response?.data;
      
    } catch (error) {
      throw new Error("Failed to fetch calls");
    }
  }
}

export default Calls;
