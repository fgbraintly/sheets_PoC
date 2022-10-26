import { drive_v3 } from "googleapis";

type CodeToEmail = {
  [key: string]: string[];
};
class FileDistributionEmails {
    private emailList: CodeToEmail = {
      "DCAP22": ["palomacortes-goodwyn@dcsok.org", "deborahhill@dcsok.org"],
      "UALKCP": ["kristachambless@uab.edu"],
      "LHWSP3": ["haydeetaylor@hotmail.com"],
      "ASHSP5": ["mabickle@goarrows.org"],
      "CSHIBSL2": ["francisco.teixeira@sacredsf.org"],
      "CSHAR2": ["antony.reyes@sacredsf.org"],
      "CSHIBHL1": ["antony.reyes@sacredsf.org"],
      "CSHIBHL2": ["antony.reyes@sacredsf.org"],
      "CSHSP4": ["diana.bolanos@sacredsf.org"],
      "CSHAPB22": ["diana.bolanos@sacredsf.org"],
      "CSHSP3": ["rebecca.jenkinson@sacredsf.org"],
      "GNSPAP22": ["sfernandez@groton.org"],
      "GJCSP322": ["jconner@groton.org"],
      "GJCSP122": ["jconner@groton.org"],
      "22TC1011": ["rebecca.carte@tri-c.edu"],
      "22TC2010": ["rebecca.carte@tri-c.edu"],
      "22TRICSP12": ["rebecca.carte@tri-c.edu"],
      "TC2010": ["rebecca.carte@tri-c.edu"],
      "TC2411": ["rebecca.carte@tri-c.edu"],
      "SP3HJAG": ["rlevis@sjastudents.org"],
      "JAGSP223": ["esaurwein@sjastudents.org"],
      "CHSSP5": ["magosti@chaminade-hs.org"],
      "EFSCF22": ["osbornh@easternflorida.edu"],
      "SP201CC": ["zaubia@cofc.edu"],
      "SP141122": ["forecelini@shsu.edu"],
      "BWU27022": ["feinberg@bw.edu"],
      "BWU30122": ["feinberg@bw.edu"],
      "DOUBLET2T": ["feinberg@bw.edu"],
      "AKRONA1": ["zanetta@uakron.edu"],
      "UAC22": ["aortiz@uakron.edu"],
      "UASP10222": ["aortiz@uakron.edu"],
      "SUHSSP3": ["matthew.harrison@sullivank12.net"],
      "TAPG22": ["thayere@gilmour.org"],
      "PREAPG22": ["thayere@gilmour.org"],
      "GILSP2B": ["kozakt@gilmour.org"],
      "GSP322": ["kozakt@gilmour.org"],
      "22TGSP3": ["trombettaa@gilmour.org"],
      "UBXDDT":["rebecca.carte@tri-c.edu"]
    };

  constructPermission(code: string) {
    return this.emailList[code]?.map((email) => this.getPermission(email));
  }
  // drive_v3.Schema$Permission
  getPermission(email: string): drive_v3.Schema$Permission {
    return {
      type: "user",
      role: "reader",
      emailAddress: email,
    };
  }
}

export default FileDistributionEmails;
