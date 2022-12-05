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
    "22TC1011": ["rebeccacarte3@gmail.com"],
    "22TC2010": ["rebeccacarte3@gmail.com"],
    "22TRICSP12": ["rebeccacarte3@gmail.com"],
    "TC2010": ["rebeccacarte3@gmail.com"],
    "TC2411": ["rebeccacarte3@gmail.com"],
    "SP3HJAG": ["rlevis@sjastudents.org"],
    "JAGSP223": ["esaurwein@sjastudents.org"],
    "CHSSP5": ["magosti@chaminade-hs.org"],
    "EFSCF22": ["osbornh@easternflorida.edu"],
    "SP201CC": ["zaubia@cofc.edu"],
    "SP141122": ["jmfpf3@gmail.com"],
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
    "UBXDDT": ["rebecca.carte@tri-c.edu"],
    "MNSNKV": ["spencel@bbhcsd.org"],
    "UOTJQD": ["ssebring1@ignatius.edu"],
    "FNDWVB": ["alicia.furgueson@danahall.org"],
    "VENJZZ": ["eromeyn@brunswickschool.org"],
    "XXGCWM": ["eromeyn@brunswickschool.org"],
    "3HONB": ["eromeyn@brunswickschool.org"],
    "3HOND": ["eromeyn@brunswickschool.org"],
    "3HONG": ["eromeyn@brunswickschool.org"],
    "LCTSGM": ["zellera@hoban.org"],
    "SFMBQR": ["zellera@hoban.org"],
    "VIZDYE": ["zellera@hoban.org"],
    "PTMSP4": ["dshannon@potomacschool.org"],
    "AGRMQZ": ["paula@ischool.org"],
    "ASHSP3A": ["mabickle@goarrows.org"],
    "ASHSP3B": ["mabickle@goarrows.org"],
    "ASHSP3C": ["mabickle@goarrows.org"],
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
