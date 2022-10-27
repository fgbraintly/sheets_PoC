import { drive_v3, google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import { JSONClient } from "google-auth-library/build/src/auth/googleauth";
import { RequestError } from "google-auth-library/build/src/transporters";
import GoogleAuthentication from "./GoogleAuth";
import { file } from "googleapis/build/src/apis/file";

class GoogleDrive {
  private auth: GoogleAuth<JSONClient> | null = null;
  private drive: drive_v3.Drive;
  constructor() {
    this.auth = GoogleAuthentication.generateAuth();
    this.drive = google.drive({ version: "v3", auth: this.auth });
  }

  async moveFilesToFolder(fileId: string, folderId: string) {
    try {
      const response = await this.drive?.files.update({
        fileId: fileId,
        addParents: folderId,
        fields: "id,parents",
      });
    } catch (error: any) {
      throw new Error("Failed to moveFilesToFolder: " + error.message);
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
      return <string>file?.data.id;
    } catch (error: any) {
      throw new Error("Failed to create folder: " + error.message);
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
      sendNotificationEmail: false,
    };
    try {
      const response = await this.drive?.permissions.create(params);
      const fileId = <string>response?.data.id;
      return fileId;
    } catch (err: any) {
      throw new Error("Failed to share file" + err.message);
    }
  }
  async shareFilesToMultipleEmails(
    permissionArray: drive_v3.Schema$Permission[],
    fileId: string,
    sendNotification:boolean
  ) {
    try {
      if (permissionArray?.length > 0) {
        for (const permission of permissionArray) {
          let params: drive_v3.Params$Resource$Permissions$Create | undefined =
            {
              requestBody: permission,
              fileId: fileId,
              fields: "id",
              sendNotificationEmail: sendNotification,
            };
          const response = await this.drive?.permissions.create(params);
        }
      }
    } catch (err: any) {
      throw new Error("Failed to share file with multiple mails" + err.message);
    }
  }

  async searchFile(fileName: string): Promise<string | boolean> {
    const files = await this.listFiles();
    for (const file of files!) {
      if (file.name === fileName) {
        return file.id as string;
      }
    }
    return false;
  }

  async listFiles() {
    try {
      const params: drive_v3.Params$Resource$Files$List = {
        pageSize: 50,
        fields: "nextPageToken, files(id, name)",
      };
      const response = await this.drive?.files.list(params);
      const files = response?.data.files;

      return files;
    } catch (error: any) {
      throw new Error("List files: " + error.message);
    }
  }

  async listFolders() {
    const params: drive_v3.Params$Resource$Files$List = {
      q: "mimeType = 'application/vnd.google-apps.folder'",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,

    };
    try {
      const response = await this.drive?.files.list(params);
      
      const files = response?.data.files;

      return files;
    } catch (error: any) {
      throw new Error("Failed to list folders: " + error.message);
    }
  }

  /**
   * Searches folders by institution name
   * @param institutionName
   * @returns
   */
  async searchFolder(institutionName: string) {
    const folders = await this.listFolders();

    const folder = folders?.find((folder) => folder.name === institutionName);

    return <string>folder?.id;
  }

  async getFileByCode(_code: string) {
    try {
      const params: drive_v3.Params$Resource$Files$List = {
        q: `name = '${_code}'`,
        fields: "files(id,name,parents)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      };
      const response = await this.drive.files.list(params);
      const files = response.data.files as drive_v3.Schema$File[];
      return files[0];
    } catch (error: any) {
      throw new Error("GetFileByCode: " + error.message);
    }
  }

  async deleteFolder(folder: drive_v3.Schema$File) {
    try {
      const params: drive_v3.Params$Resource$Files$Delete = {
        fileId: <string>folder.id,
      };
      await this.drive?.files.delete(params);
    } catch (error: any) {
      throw new Error("Failed to delete folders: " + error.message);
    }
  }

  async listDrives() {
    try {
      const drives = await this.drive.drives.list({});
      return drives;
    } catch (error: any) {
      throw new Error("Failed to fetch drives " + error.message);
    }
  }
}

export default GoogleDrive;
