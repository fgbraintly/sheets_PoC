import HttpService from "./HttpService";
import { AxiosInstance } from "axios";
class Calls {
  private firstName: string = "";
  private lastName: string = "";
  private totalTimeSpoken: string = "";
  private coach: string = "";
  private date: string = "";
  private recordingUrl: string = "";
  private axios: AxiosInstance | undefined = undefined;
  constructor() {
    this.axios = new HttpService().axios;
  }

  async getCalls(_institutionId: string) {
    try {
        const response = await this.axios?.request({
          method: "GET",
          url: "/api/app/backoffice/calls",
          params: {
            institution_id: _institutionId,
          },
        });
    
        const calls = response?.data;
        console.log(JSON.stringify(calls, null, 2));
    } catch (error) {
        console.log(error);
        
    }

  }
}

export default Calls;