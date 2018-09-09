{
	"translatorID": "6a3e392d-1284-4c81-89b9-4994a2d8a290",
	"translatorType": 4,
	"label": "CourtListener",
	"creator": "Frank Bennett",
	"target": "https://www.courtlistener.com/(opinion/[0-9]+/|\\?q=.*type=o[^a]).*",
	"minVersion": "1.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "g",
	"lastUpdated": "2018-03-24 07:44:14"
}


var codeMap = {
	"acca": "us:fed;army.court.criminal.appeals", 
	"afcca": "us:fed;air.force.court.criminal.appeals", 
	"ag": "us:fed;attorney.general", 
	"akb": "us:c9:ak.d;bankruptcy.court", 
	"akd": "us:c9:ak.d;district.court", 
	"ala": "us:al;supreme.court", 
	"alacivapp": "us:al;court.civil.appeals", 
	"alacrimapp": "us:al;court.criminal.appeals", 
	"alactapp": "us:al;court.appeals", 
	"alaska": "us:ak;supreme.court", 
	"alaskactapp": "us:ak;court.appeals", 
	"ald": "us:c11:al.d;district.court", 
	"almb": "us:c11:al.md;bankruptcy.court", 
	"almd": "us:c11:al.md;district.court", 
	"alnb": "us:c11:al.nd;bankruptcy.court", 
	"alnd": "us:c11:al.nd;district.court", 
	"alsb": "us:c11:al.sd;bankruptcy.court", 
	"alsd": "us:c11:al.sd;district.court", 
	"arb": "us:c9:az.d;bankruptcy.court", 
	"areb": "us:c8:ar.ed;bankruptcy.court", 
	"ared": "us:c8:ar.ed;district.court", 
	"ariz": "us:az;supreme.court", 
	"arizctapp": "us:az;court.appeals", 
	"ariztaxct": "us:az;tax.court", 
	"ark": "us:ar;supreme.court", 
	"arkag": "us:ar;attorney.general", 
	"arkctapp": "us:ar;court.appeals", 
	"arkworkcompcom": "us:ar;workers.compensation.commission", 
	"armfor": "us:fed;court.appeals.armed.forces", 
	"arwb": "us:c8:ar.wd;bankruptcy.court", 
	"arwd": "us:c8:ar.wd;district.court", 
	"asbca": "us:fed;armed.services.board.contract.appeals", 
	"azd": "us:c9:az.d;district.court", 
	"bap1": "us:c1;bankruptcy.appellate.panel", 
	"bap10": "us:c10;bankruptcy.appellate.panel", 
	"bap2": "us:c2;bankruptcy.appellate.panel", 
	"bap6": "us:c6;bankruptcy.appellate.panel", 
	"bap8": "us:c8;bankruptcy.appellate.panel", 
	"bap9": "us:c9;bankruptcy.appellate.panel", 
	"bapma": "us:ma;bankruptcy.appellate.panel", 
	"bapme": "us:c1:me.d;bankruptcy.appellate.panel", 
	"bva": "us:c;board.veterans.appeals", 
	"ca1": "us:c1;court.appeals", 
	"ca10": "us:c10;court.appeals", 
	"ca11": "us:c11;court.appeals", 
	"ca2": "us:c2;court.appeals", 
	"ca3": "us:c3;court.appeals", 
	"ca4": "us:c4;court.appeals", 
	"ca5": "us:c5;court.appeals", 
	"ca6": "us:c6;court.appeals", 
	"ca7": "us:c7;court.appeals", 
	"ca8": "us:c8;court.appeals", 
	"ca9": "us:c9;court.appeals", 
	"caca": "us:ca.d;circuit.court", 
	"cacb": "us:c9:ca.cd;bankruptcy.court", 
	"cacd": "us:c9:ca.cd;district.court", 
	"cadc": "us:c0;court.appeals", 
	"caeb": "us:c9:ca.ed;bankruptcy.court", 
	"caed": "us:c9:ca.ed;district.court", 
	"cafc": "us:c;court.appeals.federal.circuit", 
	"cal": "us:ca;supreme.court", 
	"calag": "us:ca;attorney.general", 
	"calappdeptsuper": "us:ca;appellate.division.superior.court", 
	"calctapp": "us:ca;court.appeal", 
	"californiad": "us:c9:ca.d;district.court", 
	"canalzoned": "us:c5:pz.d;district.court", 
	"canb": "us:c9:ca.nd;bankruptcy.court", 
	"cand": "us:c9:ca.nd;district.court", 
	"casb": "us:c9:ca.sd;bankruptcy.court", 
	"casd": "us:c9:ca.sd;district.court", 
	"cavc": "us:c;court.appeals.veterans.claims", 
	"cc": "us:c;court.claims", 
	"ccpa": "us:c;court.customs.patent.appeals", 
	"circtdel": "us:de.d;circuit.court", 
	"circtnc": "us:nc.d;circuit.court", 
	"circttenn": "us:tn.d;circuit.court", 
	"cit": "us:c;court.international.trade", 
	"cjdpa": "us:pa;court.judicial.discipline", 
	"cob": "us:c10:co.d;bankruptcy.court", 
	"cod": "us:c10:co.d;district.court", 
	"colo": "us:co;supreme.court", 
	"coloag": "us:co;attorney.general", 
	"coloctapp": "us:co;court.appeals", 
	"coloworkcompcom": "us:co;industrial.claim.appeals", 
	"com": "us:fed;commerce.court", 
	"conn": "us:ct;supreme.court", 
	"connappct": "us:ct;appellate.court", 
	"connsuperct": "us:ct;superior.court", 
	"connworkcompcom": "us:ct;compensation.review.board", 
	"ctb": "us:c2:ct.d;bankruptcy.court", 
	"ctd": "us:c2:ct.d;district.court", 
	"cusc": "us:c;customs.court", 
	"dc": "us:dc;court.appeals", 
	"dcb": "us:c0:dc.d;bankruptcy.court", 
	"dcd": "us:c0:dc.d;district.court", 
	"deb": "us:c3:de.d;bankruptcy.court", 
	"ded": "us:c3:de.d;district.court", 
	"del": "us:de;supreme.court", 
	"delch": "us:de;court.chancery", 
	"delctcompl": "us:de;court.common.pleas", 
	"delfamct": "us:de;family.court", 
	"deljudct": "us:de;court.judiciary", 
	"delsuperct": "us:de;superior.court", 
	"eca": "us:fed;emergency.court.appeals", 
	"fisc": "us:fed;foreign.intelligence.surveillance.court", 
	"fiscr": "us:fed;foreign.intelligence.surveillance.court.review", 
	"fla": "us:fl;supreme.court", 
	"flaag": "us:fl;attorney.general", 
	"fladistctapp": "us:fl;district.court.appeal", 
	"fld": "us:c11:fl.d;district.court", 
	"flmb": "us:c11:fl.md;bankruptcy.court", 
	"flmd": "us:c11:fl.md;district.court", 
	"flnb": "us:c11:fl.nd;bankruptcy.court", 
	"flnd": "us:c11:fl.nd;district.court", 
	"flsb": "us:c11:fl.sd;bankruptcy.court", 
	"flsd": "us:c11:fl.sd;district.court", 
	"ga": "us:ga;supreme.court", 
	"gactapp": "us:ga;court.appeals", 
	"gad": "us:c11:ga.d;district.court", 
	"gamb": "us:c11:ga.md;bankruptcy.court", 
	"gamd": "us:c11:ga.md;district.court", 
	"ganb": "us:c11:ga.nd;bankruptcy.court", 
	"gand": "us:c11:ga.nd;district.court", 
	"gasb": "us:c11:ga.sd;bankruptcy.court", 
	"gasd": "us:c11:ga.sd;district.court", 
	"gub": "us:c9:gu.d;bankruptcy.court", 
	"gud": "us:c9:gu.d;district.court", 
	"haw": "us:hi;supreme.court", 
	"hawapp": "us:hi;intermediate.court.appeals", 
	"hib": "us:c9:hi.d;bankruptcy.court", 
	"hid": "us:c9:hi.d;district.court", 
	"iad": "us:c8:ia.d;district.court", 
	"ianb": "us:c8:ia.nd;bankruptcy.court", 
	"iand": "us:c8:ia.nd;district.court", 
	"iasb": "us:c8:ia.sd;bankruptcy.court", 
	"iasd": "us:c8:ia.sd;district.court", 
	"idaho": "us:id;supreme.court", 
	"idahoctapp": "us:id;court.appeals", 
	"idb": "us:c9:id.d;bankruptcy.court", 
	"idd": "us:c9:id.d;district.court", 
	"ilcb": "us:c7:il.cd;bankruptcy.court", 
	"ilcd": "us:c7:il.cd;district.court", 
	"ill": "us:il;supreme.court", 
	"illappct": "us:il;appellate.court", 
	"illinoisd": "us:c7:il.d;district.court", 
	"illinoised": "us:c7:il.ed;district.court", 
	"ilnb": "us:c7:il.nd;bankruptcy.court", 
	"ilnd": "us:c7:il.nd;district.court", 
	"ilsb": "us:c7:il.sd;bankruptcy.court", 
	"ilsd": "us:c7:il.sd;district.court", 
	"ind": "us:in;supreme.court", 
	"indctapp": "us:in;court.appeals", 
	"indianad": "us:c7:in.d;district.court", 
	"indtc": "us:in;tax.court", 
	"innb": "us:c7:in.nd;bankruptcy.court", 
	"innd": "us:c7:in.nd;district.court", 
	"insb": "us:c7:in.sd;bankruptcy.court", 
	"insd": "us:c7:in.sd;district.court", 
	"iowa": "us:ia;supreme.court", 
	"iowactapp": "us:ia;court.appeals", 
	"jpml": "us:fed;judicial.panel.multidistrict.litigation", 
	"kan": "us:ks;supreme.court", 
	"kanag": "us:ks;attorney.general", 
	"kanctapp": "us:ks;court.appeals", 
	"kingsbench": "gb:england.and.wales;kb", 
	"ksb": "us:c10:ks.d;bankruptcy.court", 
	"ksd": "us:c10:ks.d;district.court", 
	"ky": "us:ky;supreme.court", 
	"kyctapp": "us:ky;court.appeals", 
	"kyctapphigh": "us:ky;court.appeals.high", 
	"kyd": "us:c6:ky.d;district.court", 
	"kyeb": "us:c6:ky.ed;bankruptcy.court", 
	"kyed": "us:c6:ky.ed;district.court", 
	"kywb": "us:c6:ky.wd;bankruptcy.court", 
	"kywd": "us:c6:ky.wd;district.court", 
	"la": "us:la;supreme.court", 
	"laag": "us:la;attorney.general", 
	"lactapp": "us:la;court.appeal", 
	"lad": "us:c5:la.d;district.court", 
	"laeb": "us:c5:la.ed;bankruptcy.court", 
	"laed": "us:c5:la.ed;district.court", 
	"lamb": "us:c5:la.md;bankruptcy.court", 
	"lamd": "us:c5:la.md;district.court", 
	"lawb": "us:c5:la.wd;bankruptcy.court", 
	"lawd": "us:c5:la.wd;district.court", 
	"mab": "us:c1:ma.d;bankruptcy.court", 
	"mad": "us:c1:ma.d;district.court", 
	"mass": "us:ma;supreme.judicial.court", 
	"massappct": "us:ma;appeals.court", 
	"massdistct": "us:ma;district.court", 
	"masssuperct": "us:ma;superior.court", 
	"maworkcompcom": "us:ma;department.industrial.accidents", 
	"mc": "us:fed;court.military.commission.review", 
	"md": "us:md;court.appeals", 
	"mdag": "us:md;attorney.general", 
	"mdb": "us:c4:md.d;bankruptcy.court", 
	"mdctspecapp": "us:md;court.special.appeals", 
	"mdd": "us:c4:md.d;district.court", 
	"me": "us:me;supreme.judicial.court", 
	"meb": "us:c1:me.d;bankruptcy.court", 
	"med": "us:c1:me.d;district.court", 
	"mich": "us:mi;supreme.court", 
	"michctapp": "us:mi;court.appeals", 
	"michd": "us:c6:mi.d;district.court", 
	"mieb": "us:c8:mn.d;bankruptcy.court", 
	"mied": "us:c8:mn.d;district.court", 
	"minn": "us:mn;supreme.court", 
	"minnag": "us:mn;attorney.general", 
	"minnctapp": "us:mn;court.appeals", 
	"miss": "us:ms;supreme.court", 
	"missctapp": "us:ms;court.appeals", 
	"missd": "us:c5:ms.d;district.court", 
	"miwb": "us:c6:mi.wd;bankruptcy.court", 
	"miwd": "us:c6:mi.wd;district.court", 
	"mnb": "us:c6:mi.ed;bankruptcy.court", 
	"mnd": "us:c6:mi.ed;district.court", 
	"mo": "us:mo;supreme.court", 
	"moag": "us:mo;attorney.general", 
	"mocd": "us:c8:mo.cd;district.court", 
	"moctapp": "us:mo;court.appeals", 
	"mod": "us:c8:mo.d;district.court", 
	"moeb": "us:c8:mo.ed;bankruptcy.court", 
	"moed": "us:c8:mo.ed;district.court", 
	"mont": "us:mt;supreme.court", 
	"montag": "us:mt;attorney.general", 
	"monttc": "us:mt;tax.appeal.board", 
	"mosd": "us:c8:mo.sd;district.court", 
	"mowb": "us:c8:mo.wd;bankruptcy.court", 
	"mowd": "us:c8:mo.wd;district.court", 
	"msnb": "us:c5:ms.nd;bankruptcy.court", 
	"msnd": "us:c5:ms.nd;district.court", 
	"mspb": "us:c;merit.systems.protection.board", 
	"mssb": "us:c5:ms.sd;bankruptcy.court", 
	"mssd": "us:c5:ms.sd;district.court", 
	"mtb": "us:c9:mt.d;bankruptcy.court", 
	"mtd": "us:c9:mt.d;district.court", 
	"nc": "us:nc;supreme.court", 
	"ncctapp": "us:nc;court.appeals", 
	"ncd": "us:c4:nc.d;district.court", 
	"nceb": "us:c4:nc.ed;bankruptcy.court", 
	"nced": "us:c4:nc.ed;district.court", 
	"ncmb": "us:c4:nc.md;bankruptcy.court", 
	"ncmd": "us:c4:nc.md;district.court", 
	"ncsuperct": "us:nc;superior.court", 
	"ncwb": "us:c4:nc.wd;bankruptcy.court", 
	"ncwd": "us:c4:nc.wd;district.court", 
	"ncworkcompcom": "us:nc;industrial.commission", 
	"nd": "us:nd;supreme.court", 
	"ndb": "us:c8:nd.d;bankruptcy.court", 
	"ndctapp": "us:nd;court.appeals", 
	"ndd": "us:c8:nd.d;district.court", 
	"neb": "us:ne;supreme.court", 
	"nebag": "us:ne;attorney.general", 
	"nebctapp": "us:ne;court.appeals", 
	"nebraskab": "us:c8:ne.d;bankruptcy.court", 
	"ned": "us:c8:ne.d;district.court", 
	"nev": "us:nv;supreme.court", 
	"nh": "us:nh;supreme.court", 
	"nhb": "us:c1:nh.d;bankruptcy.court", 
	"nhd": "us:c1:nh.d;district.court", 
	"nj": "us:nj;supreme.court", 
	"njb": "us:c3:nj.d;bankruptcy.court", 
	"njch": "us:nj;court.chancery", 
	"njd": "us:c3:nj.d;district.court", 
	"njsuperctappdiv": "us:nj;superior.court", 
	"njtaxct": "us:nj;tax.court", 
	"nm": "us:nm;supreme.court", 
	"nmb": "us:c10:nm.d;bankruptcy.court", 
	"nmcca": "us:fed;navy-marine.corps.court.criminal.appeals", 
	"nmctapp": "us:nm;court.appeals", 
	"nmd": "us:c10:nm.d;district.court", 
	"nmib": "us:c9:mp.d;bankruptcy.court", 
	"nmid": "us:c9:mp.d;district.court", 
	"nvb": "us:c9:nv.d;bankruptcy.court", 
	"nvd": "us:c9:nv.d;district.court", 
	"ny": "us:ny;court.appeals", 
	"nyag": "us:ny;attorney.general", 
	"nyappdiv": "us:ny;appellate.division.supreme.court", 
	"nyappterm": "us:ny;appellate.term.supreme.court", 
	"nycivct": "us:ny:nyc;civil.court", 
	"nycrimct": "us:ny:nyc;criminal.court", 
	"nyd": "us:c2:ny.d;district.court", 
	"nyeb": "us:c2:ny.ed;bankruptcy.court", 
	"nyed": "us:c2:ny.ed;district.court", 
	"nyfamct": "us:ny;family.court", 
	"nynb": "us:c2:ny.nd;bankruptcy.court", 
	"nynd": "us:c2:ny.nd;district.court", 
	"nysb": "us:c2:ny.sd;bankruptcy.court", 
	"nysd": "us:c2:ny.sd;district.court", 
	"nysupct": "us:ny;supreme.court", 
	"nysurct": "us:ny;surrogates.court", 
	"nywb": "us:c2:ny.wd;bankruptcy.court", 
	"nywd": "us:c2:ny.wd;district.court", 
	"ohio": "us:oh;supreme.court", 
	"ohioctapp": "us:oh;court.appeals", 
	"ohioctcl": "us:oh;court.claims", 
	"ohiod": "us:c6:oh.d;district.court", 
	"ohnb": "us:c6:oh.nd;bankruptcy.court", 
	"ohnd": "us:c6:oh.nd;district.court", 
	"ohsb": "us:c6:oh.sd;bankruptcy.court", 
	"ohsd": "us:c6:oh.sd;district.court", 
	"okeb": "us:c10:ok.ed;bankruptcy.court", 
	"oked": "us:c10:ok.ed;district.court", 
	"okla": "us:ok;supreme.court", 
	"oklaag": "us:ok;attorney.general.reports", 
	"oklacivapp": "us:ok;court.civil.appeals", 
	"oklacoj": "us:ok;court.judiciary", 
	"oklacrimapp": "us:ok;court.criminal.appeals", 
	"oklajeap": "us:ok;judicial.ethics.advisory.panel", 
	"oknb": "us:c10:ok.nd;bankruptcy.court", 
	"oknd": "us:c10:ok.nd;district.court", 
	"okwb": "us:c10:ok.wd;bankruptcy.court", 
	"okwd": "us:c10:ok.wd;district.court", 
	"or": "us:or;supreme.court", 
	"orb": "us:c9:or.d;bankruptcy.court", 
	"orctapp": "us:or;court.appeals", 
	"ord": "us:c9:or.d;district.court", 
	"orld": "us:orleans.d;district.court", 
	"ortc": "us:or;tax.court", 
	"pa": "us:pa;supreme.court", 
	"pacommwct": "us:pa;commonwealth.court", 
	"paeb": "us:c3:pa.ed;bankruptcy.court", 
	"paed": "us:c3:pa.ed;district.court", 
	"pamb": "us:c3:pa.md;bankruptcy.court", 
	"pamd": "us:c3:pa.md;district.court", 
	"pasuperct": "us:pa;superior.court", 
	"pawb": "us:c3:pa.wd;bankruptcy.court", 
	"pawd": "us:c3:pa.wd;district.court", 
	"pennsylvaniad": "us:c3:pa.d;district.court", 
	"prb": "us:c1:pr.d;bankruptcy.court", 
	"prd": "us:c1:pr.d;district.court", 
	"reglrailreorgct": "us:fed;special.court.regional.rail.reorganization.act", 
	"ri": "us:ri;supreme.court", 
	"rib": "us:c1:ri.d;bankruptcy.court", 
	"rid": "us:c1:ri.d;district.court", 
	"risuperct": "us:ri;superior.court", 
	"sc": "us:sc;supreme.court", 
	"scb": "us:c4:sc.d;bankruptcy.court", 
	"scctapp": "us:sc;court.appeals", 
	"scd": "us:c4:sc.d;district.court", 
	"scotus": "us;supreme.court", 
	"sd": "us:sd;supreme.court", 
	"sdb": "us:c8:sd.d;bankruptcy.court", 
	"sdd": "us:c8:sd.d;district.court", 
	"southcarolinaed": "us:c4:sc.ed;district.court", 
	"southcarolinawd": "us:c4:sc.wd;district.court", 
	"stp": "us:pa;special.tribunal", 
	"sttex": "us:tx.d;special.tribunal", 
	"tax": "us:fed;tax.court", 
	"tecoa": "us:fed;temporary.emergency.court.appeals", 
	"tenn": "us:tn;supreme.court", 
	"tenncrimapp": "us:tn;court.criminal.appeals", 
	"tennctapp": "us:tn;court.appeals", 
	"tennessed": "us:c6:tn.d;district.court", 
	"tennesseeb": "us:c6:tn.d;bankruptcy.court", 
	"tennsuperct": "us:tn;superior.court.law.equity", 
	"tex": "us:tx;supreme.court", 
	"texag": "us:tx;attorney.general", 
	"texapp": "us:tx;court.appeals", 
	"texcrimapp": "us:tx;court.criminal.appeals", 
	"texd": "us:c5:tx.d;district.court", 
	"texjpml": "us:tx;judicial.panel.multidistrict.litigation", 
	"texreview": "us:tx;special.court.review", 
	"tneb": "us:c6:tn.ed;bankruptcy.court", 
	"tned": "us:c6:tn.ed;district.court", 
	"tnmb": "us:c6:tn.md;bankruptcy.court", 
	"tnmd": "us:c6:tn.md;district.court", 
	"tnwb": "us:c6:tn.wd;bankruptcy.court", 
	"tnwd": "us:c6:tn.wd;district.court", 
	"txeb": "us:c5:tx.ed;bankruptcy.court", 
	"txed": "us:c5:tx.ed;district.court", 
	"txnb": "us:c5:tx.nd;bankruptcy.court", 
	"txnd": "us:c5:tx.nd;district.court", 
	"txsb": "us:c5:tx.sd;bankruptcy.court", 
	"txsd": "us:c5:tx.sd;district.court", 
	"txwb": "us:c5:tx.wd;bankruptcy.court", 
	"txwd": "us:c5:tx.wd;district.court", 
	"uscfc": "us:c;court.federal.claims", 
	"usjc": "us:fed;judicial.conference.committee", 
	"utah": "us:ut;supreme.court", 
	"utahctapp": "us:ut;court.appeals", 
	"utb": "us:c10:ut.d;bankruptcy.court", 
	"utd": "us:c10:ut.d;district.court", 
	"va": "us:va;supreme.court", 
	"vactapp": "us:va;court.appeals", 
	"vad": "us:c4:va.d;district.court", 
	"vaeb": "us:c4:va.ed;bankruptcy.court", 
	"vaed": "us:c4:va.ed;district.court", 
	"vawb": "us:c4:va.wd;bankruptcy.court", 
	"vawd": "us:c4:va.wd;district.court", 
	"vib": "us:c3:vi.d;bankruptcy.court", 
	"vid": "us:c3:vi.d;district.court", 
	"vt": "us:vt;supreme.court", 
	"vtb": "us:c2:vt.d;bankruptcy.court", 
	"vtd": "us:c2:vt.d;district.court", 
	"waeb": "us:c9:wa.ed;bankruptcy.court", 
	"waed": "us:c9:wa.ed;district.court", 
	"wash": "us:wa;supreme.court", 
	"washag": "us:wa;attorney.general", 
	"washctapp": "us:wa;court.appeals", 
	"washd": "us:c9:wa.d;district.court", 
	"wawb": "us:c9:wa.wd;bankruptcy.court", 
	"wawd": "us:c9:wa.wd;district.court", 
	"wieb": "us:c7:wi.ed;bankruptcy.court", 
	"wied": "us:c7:wi.ed;district.court", 
	"wis": "us:wi;supreme.court", 
	"wisag": "us:wi;attorney.general", 
	"wisctapp": "us:wi;court.appeals", 
	"wisd": "us:c7:wi.d;district.court", 
	"wiwb": "us:c7:wi.wd;bankruptcy.court", 
	"wiwd": "us:c7:wi.wd;district.court", 
	"wva": "us:wv;supreme.court", 
	"wvad": "us:c4:wv.d;district.court", 
	"wvnb": "us:c4:wv.nd;bankruptcy.court", 
	"wvnd": "us:c4:wv.nd;district.court", 
	"wvsb": "us:c4:wv.sd;bankruptcy.court", 
	"wvsd": "us:c4:wv.sd;district.court", 
	"wyb": "us:c10:wy.d;bankruptcy.court", 
	"wyd": "us:c10:wy.d;district.court", 
	"wyo": "us:wy;supreme.court"
}

var citeTypes = [
	"federal_cite_one",
	"federal_cite_two",
	"federal_cite_three",
	"state_cite_one",
	"state_cite_two",
	"state_cite_three",
	"state_cite_regional",
	"specialty_cite_one",
	"scotus_early_cite",
	"lexis_cite",
	"westlaw_cite",
	"neutral_cite"
]

var procSegments = [
	"cluster",
	"opinion",
	"docket",
	"court",
	"audio"
]

function fixAttachments(doc, item) {
	for (var i=0,ilen=item.attachments.length;i<ilen;i++) {
		var attachment = item.attachments[i];

		if (attachment.snapshot === false) {
			continue;
		}

		// head element
		var head = doc.createElement("head");
		var body = doc.createElement('div');
		var css = "*{margin:0;padding:0;}div.mlz-outer{width: 60em;margin:0 auto;text-align:left;}body{text-align:center;}p{margin-top:0.75em;margin-bottom:0.75em;}div.mlz-link-button a{text-decoration:none;background:#cccccc;color:white;border-radius:1em;font-family:sans;padding:0.2em 0.8em 0.2em 0.8em;}div.mlz-link-button a:hover{background:#bbbbbb;}div.mlz-link-button{margin: 0.7em 0 0.8em 0;}pre.inline{white-space:pre;display:inline;}span.citation{white-space:pre;}";
		
		var year = false;
		var itemTitle = item.caseName;
		if (item.reporterVolume && item.reporter && item.firstPage) {
			itemTitle = itemTitle + ', ' + item.reporterVolume + ' ' + item.reporter + ' ' + item.firstPage;
		}
		if (item.dateDecided) {
			year = item.dateDecided.replace(/^.*([0-9][0-9][0-9][0-9]).*/, "$1");
			itemTitle = itemTitle + ' (' + year + ')';
		}
		if (attachment._description) {
			itemTitle = itemTitle + " [" + attachment._description + "]";
		}
		delete attachment._description;

		head.innerHTML = '<title>' + itemTitle + '</title>';
		head.innerHTML += '<style type="text/css">' + css + '</style>'; 
		
		body.innerHTML = attachment._txt;
		delete attachment._txt;

		var newDoc = ZU.composeDoc(doc, head, body);
		attachment.document = newDoc;
	}
	return item;
}


var proc = {
	cluster: {
		setData: function(item, obj) {
			//Zotero.debug("proc: cluster");
			
			var firstCite = true;
			var extras = [];
			for (var i=0,ilen=citeTypes.length;i<ilen;i++) {
				if (obj[citeTypes[i]]) {
					if (firstCite) {
						var citeSplit = obj[citeTypes[i]].split(" ");
						item.reporterVolume = citeSplit[0];
						item.reporter = citeSplit.slice(1, -1).join(" ");
						item.firstPage = citeSplit[citeSplit.length-1];
						firstCite = false;
					} else {
						extras.push(obj[citeTypes[i]]);
					}
				}
			}
			item.dateDecided = obj.date_filed;
			if (extras.length) {
				item.extra = "Other cites: " + extras.join("; ")
			}
		},
		setURLs: function(item, obj) {
			var sub_opinions = [];
			for (var i=0,ilen=obj.sub_opinions.length;i<ilen;i++) {
				sub_opinions.push(obj.sub_opinions[i] + '?fields=html_with_citations,description');
			}
			urls.opinion = sub_opinions;
			urls.docket = [obj.docket + "?fields=docket_number,case_name,case_name_short,court,audio_files"];
		}
	},
	opinion: {
		setData: function(item, obj) {
			// Zotero.debug("proc: opinion");

			// Saving of document fragments not currently possible in 5.0
			//var textForms = ["html_with_citations", "html", "html_columbia", "html_lawbox", "plain_text"];
			//var mimeTypes = ["text/html", "text/html", "text/html", "text/html", "text/plain"];
			//for (var i=0,ilen=textForms.length;i<ilen;i++) {
			//	if (obj[textForms[i]]) {
			//		item.attachments.push({
			//			_description: obj.description,
			//			_txt: obj[textForms[i]],
			//			mimeType: mimeTypes[i],
			//			snapshot: true
			//		});
			//		break;
			//	}
			//}
		},
		setURLs: function(item, obj) {
			// opinion proc sets up no onward call
		}
	},
	docket: {
		setData: function(item, obj) {
			// Zotero.debug("proc: docket");
			item.docketNumber = obj.docket_number;
			item.caseName = obj.case_name;
			item.title = obj.case_name;
			item.shortTitle = obj.case_name_short;
		},
		setURLs: function(item, obj) {
			urls.court = [obj.court + "?fields=resource_uri"];
		}
	},
	court: {
		setData: function(item, obj) {
			// Zotero.debug("proc: court");
			var flp_code = obj.resource_uri.replace(/^.*?\/([^\/]*)\/*$/, "$1")
			if (codeMap[flp_code]) {
				var codeSplit = codeMap[flp_code].split(";")
				item.jurisdiction = codeSplit[0];
				item.court = codeSplit[1];
			} else {
				item.jurisdiction = flp_code;
			}
		},
		setURLs: function(item, obj) {
			var flp_code = obj.resource_uri.replace(/^.*?\/([^\/]*)\/*$/, "$1");
			urls.audio = [];
			if (item.docketNumber && flp_code) {
				urls.audio.push('https://www.courtlistener.com/api/rest/v3/search/?type=oa&docket_number=' + item.number + '&court=' + flp_code);
			}
		}
	},
	audio: {
		setData: function(item, obj) {
			// Zotero.debug("proc: audio");
			//for (var i=0,ilen=obj.results.length;i<ilen;i++) {
			//var theattachment = {
			//	url: 'https://www.courtlistener.com' + obj.results[i].absolute_url,
			//	title: 'CourtListener Audio' + (i+1),
			//	snapshot: false
			//}
			//item.attachments.push(theattachment);
			//}
		},
		setURLs: function(item, obj) {
			// audio is the terminus
			urls.end = true;
		}
	}
}

function runURLs(step, pos, item, doc) {
	var mode = procSegments[step];
	var url = urls[mode][pos];
	if (!url || urls.end) {
		// Saving of document fragments not currently possible in 5.0,
		// so skip this for now
		//fixAttachments(doc, item);
		item.complete();
		return;
	}
	ZU.doGet(url, function(txt){
		var obj = JSON.parse(txt);
		proc[mode].setData(item, obj, doc);
		if (!urls[mode] || urls[mode].length === 0 || pos === (urls[mode].length-1)) {
			proc[mode].setURLs(item, obj);
			step += 1;
			// We have all the mode URLs we're going to get at this point,
			// so run through the sets until we find something we can
			// work with.
			for (var i=step,ilen=procSegments.length;i<ilen;i++) {
				mode = procSegments[i];
				if (urls[mode] && urls[mode].length > 0) {
					break;
				}
			}
			step = i < procSegments.length ? i : (procSegments.length - 1);
			pos = 0;
		} else {
			pos += 1;
		}
		runURLs(step, pos, item, doc)
	}, null, null, {
		authorization: 'Token ' + ZU.getAppExtra('6a3e392d-1284-4c81-89b9-4994a2d8a290'),
		accept: 'application/json'
	});
}

var urls = {};

function scrapeData(doc, url) {
	var num = url.replace(/^.*\/([0-9]+)\/.*/, "$1")
	var item = new Zotero.Item("case");
	item.attachments.push({
		url: url,
		title: 'CourtListener Snapshot',
		mimeType: 'text/html'
	});
	item.url = url.replace(/\?.*/, '');
	urls.cluster = ['https://www.courtlistener.com/api/rest/v3/clusters/' + num + "/?fields=docket,sub_opinions,date_filed," + citeTypes.join(",")];
	runURLs(0, 0, item, doc);
}

function detectWeb(doc, url) {
	if (url.match(/^https:\/\/www\.courtlistener\.com\/\?q=.*/)) {
		return "multiple";
	} else {
		return "case";
	}
}

function getMultiple(doc) {
	var res = ZU.xpath(doc, '//a[@class="visitable"][contains(@href,"/opinion/")]');
	if (!res.length) return false;
	var items = {};
	for (var i = 0; i < res.length; i++) {
		items[res[i].href] = ZU.trimInternal(res[i].textContent);
	}
	return items;
}


function doWeb (doc, url) {
	if ("multiple" == detectWeb(doc, url)) {
		var items = getMultiple(doc);
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			var caseURLs = [];
			for (var i in items) {
				caseURLs.push(i);
			}
			ZU.processDocuments(caseURLs, scrapeData);
		});
	} else {
		scrapeData(doc, url)
	}
}
