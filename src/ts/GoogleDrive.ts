import { drive_v3, google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import { JSONClient } from "google-auth-library/build/src/auth/googleauth";
import GoogleAuthentication from "./GoogleAuth";

class GoogleDrive {
  private auth: GoogleAuth<JSONClient> | null = null;
  private drive: drive_v3.Drive | null = null;
  constructor() {
    this.auth = GoogleAuthentication.generateAuth();
    this.drive = google.drive({ version: "v3", auth: this.auth });
  }

  async moveFilesToFolder(fileId: string, folderId: string) {
    let params: drive_v3.Params$Resource$Files$Get = {
      fileId: fileId,
      fields: "parents",
    };
    try {
      const file = await this.drive?.files.get(params);
      //   const prevParents = file?.data?.parents?.map(parent =>  parent)
      console.log(JSON.stringify(file?.data.parents, null, 2));
    } catch (error) {
      console.log(error);
    }
  }

  async createFolder(institutionalCode: string) {
    let params: drive_v3.Params$Resource$Files$Create | undefined = {
      requestBody: {
        mimeType: "application/vnd.google-apps.folder",
        name: institutionalCode,
      },
      fields: "id",
    };

    try {
      const file = await this.drive?.files.create(params);
      return file?.data.id;
    } catch (error) {
      throw new Error("Failed to create folder");
    }
  }

  async shareFiles(
    type: string,
    emailAddress: string,
    role: string,
    fileId: string
  ) {
    let params: drive_v3.Params$Resource$Permissions$Create | undefined = {
      requestBody: { type: type, role: role, emailAddress: emailAddress },
      fileId: fileId,
      fields: "id",
    };
    try {
      const res = await this.drive?.permissions.create(params);
      const fileId = res?.data.id;
      return fileId;
    } catch (err) {
      throw new Error("Failed to share file");
    }
  }

  async listFiles() {
    const params: drive_v3.Params$Resource$Files$List = {
      pageSize: 10,
      fields: "nextPageToken, files(id, name)",
    };
    const response = await this.drive?.files.list(params);
    const files = response?.data.files;

    return files;
  }

  async listFolders() {
    const params: drive_v3.Params$Resource$Files$List = {
      q: "mimeType = 'application/vnd.google-apps.folder'",
    };
    try {
      
      const response = await this.drive?.files.list(params);
      const files = response?.data.files;
  
      return files;
    } catch (error) {
      throw new Error("Failed to list folders");
      
    }
  }

  async getFile(fileId: string) {
    const resource: drive_v3.Params$Resource$Files$Get = {
      fileId: fileId,
    };
    const response = await this.drive?.files.get(resource);

    return response?.data.id;
  }
}

export default GoogleDrive;
