LaTeX = {} unless LaTeX
LaTeX.toLaTeX = { unicode: Object.create(null), ascii: Object.create(null) }
LaTeX.toLaTeX.unicode.math =
  '<': "<"
  '>': ">"
  '\\': "\\backslash"
LaTeX.toLaTeX.unicode.text =
  '#': "\\#"
  '$': "{\\textdollar}"
  '%': "\\%"
  '&': "\\&"
  '^': "\\^{}"
  '_': "\\_"
  '{': "\\{"
  '}': "\\}"
  '~': "{\\textasciitilde}"
LaTeX.toLaTeX.ascii.math =
  '<': "<"
  '>': ">"
  '\\': "\\backslash"
  '\u000AC': "{\\lnot}"
  '\u000AD': "\\-"
  '\u000B1': "{\\pm}"
  '\u000B2': "{^2}"
  '\u000B3': "{^3}"
  '\u000B5': "\\mathrm{\\mu}"
  '\u000B7': "{\\cdot}"
  '\u000B9': "{^1}"
  '\u000F7': "{\\div}"
  '\u00127': "{\\Elzxh}"
  '\u00192': "f"
  '\u001AA': "{\\eth}"
  '\u00250': "{\\Elztrna}"
  '\u00252': "{\\Elztrnsa}"
  '\u00254': "{\\Elzopeno}"
  '\u00256': "{\\Elzrtld}"
  '\u00259': "{\\Elzschwa}"
  '\u0025B': "{\\varepsilon}"
  '\u00263': "{\\Elzpgamma}"
  '\u00264': "{\\Elzpbgam}"
  '\u00265': "{\\Elztrnh}"
  '\u0026C': "{\\Elzbtdl}"
  '\u0026D': "{\\Elzrtll}"
  '\u0026F': "{\\Elztrnm}"
  '\u00270': "{\\Elztrnmlr}"
  '\u00271': "{\\Elzltlmr}"
  '\u00273': "{\\Elzrtln}"
  '\u00277': "{\\Elzclomeg}"
  '\u00279': "{\\Elztrnr}"
  '\u0027A': "{\\Elztrnrl}"
  '\u0027B': "{\\Elzrttrnr}"
  '\u0027C': "{\\Elzrl}"
  '\u0027D': "{\\Elzrtlr}"
  '\u0027E': "{\\Elzfhr}"
  '\u00282': "{\\Elzrtls}"
  '\u00283': "{\\Elzesh}"
  '\u00287': "{\\Elztrnt}"
  '\u00288': "{\\Elzrtlt}"
  '\u0028A': "{\\Elzpupsil}"
  '\u0028B': "{\\Elzpscrv}"
  '\u0028C': "{\\Elzinvv}"
  '\u0028D': "{\\Elzinvw}"
  '\u0028E': "{\\Elztrny}"
  '\u00290': "{\\Elzrtlz}"
  '\u00292': "{\\Elzyogh}"
  '\u00294': "{\\Elzglst}"
  '\u00295': "{\\Elzreglst}"
  '\u00296': "{\\Elzinglst}"
  '\u002A4': "{\\Elzdyogh}"
  '\u002A7': "{\\Elztesh}"
  '\u002C8': "{\\Elzverts}"
  '\u002CC': "{\\Elzverti}"
  '\u002D0': "{\\Elzlmrk}"
  '\u002D1': "{\\Elzhlmrk}"
  '\u002D2': "{\\Elzsbrhr}"
  '\u002D3': "{\\Elzsblhr}"
  '\u002D4': "{\\Elzrais}"
  '\u002D5': "{\\Elzlow}"
  '\u00321': "{\\Elzpalh}"
  '\u0032A': "{\\Elzsbbrg}"
  '\u0038E': "\\mathrm{'Y}"
  '\u0038F': "\\mathrm{'\\Omega}"
  '\u00390': "\\acute{\\ddot{\\iota}}"
  '\u00391': "{\\Alpha}"
  '\u00392': "{\\Beta}"
  '\u00393': "{\\Gamma}"
  '\u00394': "{\\Delta}"
  '\u00395': "{\\Epsilon}"
  '\u00396': "{\\Zeta}"
  '\u00397': "{\\Eta}"
  '\u00398': "{\\Theta}"
  '\u00399': "{\\Iota}"
  '\u0039A': "{\\Kappa}"
  '\u0039B': "{\\Lambda}"
  '\u0039C': "M"
  '\u0039D': "N"
  '\u0039E': "{\\Xi}"
  '\u0039F': "O"
  '\u003A0': "{\\Pi}"
  '\u003A1': "{\\Rho}"
  '\u003A3': "{\\Sigma}"
  '\u003A4': "{\\Tau}"
  '\u003A5': "{\\Upsilon}"
  '\u003A6': "{\\Phi}"
  '\u003A7': "{\\Chi}"
  '\u003A8': "{\\Psi}"
  '\u003A9': "{\\Omega}"
  '\u003AA': "\\mathrm{\\ddot{I}}"
  '\u003AB': "\\mathrm{\\ddot{Y}}"
  '\u003AD': "\\acute{\\epsilon}"
  '\u003AE': "\\acute{\\eta}"
  '\u003AF': "\\acute{\\iota}"
  '\u003B0': "\\acute{\\ddot{\\upsilon}}"
  '\u003B1': "{\\alpha}"
  '\u003B2': "{\\beta}"
  '\u003B3': "{\\gamma}"
  '\u003B4': "{\\delta}"
  '\u003B5': "{\\epsilon}"
  '\u003B6': "{\\zeta}"
  '\u003B7': "{\\eta}"
  '\u003B9': "{\\iota}"
  '\u003BA': "{\\kappa}"
  '\u003BB': "{\\lambda}"
  '\u003BC': "{\\mu}"
  '\u003BD': "{\\nu}"
  '\u003BE': "{\\xi}"
  '\u003BF': "o"
  '\u003C0': "{\\pi}"
  '\u003C1': "{\\rho}"
  '\u003C2': "{\\varsigma}"
  '\u003C3': "{\\sigma}"
  '\u003C4': "{\\tau}"
  '\u003C5': "{\\upsilon}"
  '\u003C6': "{\\varphi}"
  '\u003C7': "{\\chi}"
  '\u003C8': "{\\psi}"
  '\u003C9': "{\\omega}"
  '\u003CA': "\\ddot{\\iota}"
  '\u003CB': "\\ddot{\\upsilon}"
  '\u003CD': "\\acute{\\upsilon}"
  '\u003CE': "\\acute{\\omega}"
  '\u003D2': "{\\Upsilon}"
  '\u003D5': "{\\phi}"
  '\u003D6': "{\\varpi}"
  '\u003DA': "{\\Stigma}"
  '\u003DC': "{\\Digamma}"
  '\u003DD': "{\\digamma}"
  '\u003DE': "{\\Koppa}"
  '\u003E0': "{\\Sampi}"
  '\u003F0': "{\\varkappa}"
  '\u003F1': "{\\varrho}"
  '\u003F6': "{\\backepsilon}"
  '\u0200A': "{\\mkern1mu}"
  '\u02016': "{\\Vert}"
  '\u0201B': "{\\Elzreapos}"
  '\u02032': "{'}"
  '\u02033': "{''}"
  '\u02034': "{'''}"
  '\u02035': "{\\backprime}"
  '\u02057': "''''"
  '\u020DB': "{\\dddot}"
  '\u020DC': "{\\ddddot}"
  '\u02102': "\\mathbb{C}"
  '\u0210B': "\\mathscr{H}"
  '\u0210C': "\\mathfrak{H}"
  '\u0210D': "\\mathbb{H}"
  '\u0210F': "{\\hslash}"
  '\u02110': "\\mathscr{I}"
  '\u02111': "\\mathfrak{I}"
  '\u02112': "\\mathscr{L}"
  '\u02113': "\\mathscr{l}"
  '\u02115': "\\mathbb{N}"
  '\u02118': "{\\wp}"
  '\u02119': "\\mathbb{P}"
  '\u0211A': "\\mathbb{Q}"
  '\u0211B': "\\mathscr{R}"
  '\u0211C': "\\mathfrak{R}"
  '\u0211D': "\\mathbb{R}"
  '\u0211E': "{\\Elzxrat}"
  '\u02124': "\\mathbb{Z}"
  '\u02126': "{\\Omega}"
  '\u02127': "{\\mho}"
  '\u02128': "\\mathfrak{Z}"
  '\u02129': "\\ElsevierGlyph{2129}"
  '\u0212C': "\\mathscr{B}"
  '\u0212D': "\\mathfrak{C}"
  '\u0212F': "\\mathscr{e}"
  '\u02130': "\\mathscr{E}"
  '\u02131': "\\mathscr{F}"
  '\u02133': "\\mathscr{M}"
  '\u02134': "\\mathscr{o}"
  '\u02135': "{\\aleph}"
  '\u02136': "{\\beth}"
  '\u02137': "{\\gimel}"
  '\u02138': "{\\daleth}"
  '\u02153': "\\textfrac{1}{3}"
  '\u02154': "\\textfrac{2}{3}"
  '\u02155': "\\textfrac{1}{5}"
  '\u02156': "\\textfrac{2}{5}"
  '\u02157': "\\textfrac{3}{5}"
  '\u02158': "\\textfrac{4}{5}"
  '\u02159': "\\textfrac{1}{6}"
  '\u0215A': "\\textfrac{5}{6}"
  '\u0215B': "\\textfrac{1}{8}"
  '\u0215C': "\\textfrac{3}{8}"
  '\u0215D': "\\textfrac{5}{8}"
  '\u0215E': "\\textfrac{7}{8}"
  '\u02190': "{\\leftarrow}"
  '\u02191': "{\\uparrow}"
  '\u02192': "{\\rightarrow}"
  '\u02193': "{\\downarrow}"
  '\u02194': "{\\leftrightarrow}"
  '\u02195': "{\\updownarrow}"
  '\u02196': "{\\nwarrow}"
  '\u02197': "{\\nearrow}"
  '\u02198': "{\\searrow}"
  '\u02199': "{\\swarrow}"
  '\u0219A': "{\\nleftarrow}"
  '\u0219B': "{\\nrightarrow}"
  '\u0219C': "{\\arrowwaveright}"
  '\u0219D': "{\\arrowwaveright}"
  '\u0219E': "{\\twoheadleftarrow}"
  '\u021A0': "{\\twoheadrightarrow}"
  '\u021A2': "{\\leftarrowtail}"
  '\u021A3': "{\\rightarrowtail}"
  '\u021A6': "{\\mapsto}"
  '\u021A9': "{\\hookleftarrow}"
  '\u021AA': "{\\hookrightarrow}"
  '\u021AB': "{\\looparrowleft}"
  '\u021AC': "{\\looparrowright}"
  '\u021AD': "{\\leftrightsquigarrow}"
  '\u021AE': "{\\nleftrightarrow}"
  '\u021B0': "{\\Lsh}"
  '\u021B1': "{\\Rsh}"
  '\u021B3': "\\ElsevierGlyph{21B3}"
  '\u021B6': "{\\curvearrowleft}"
  '\u021B7': "{\\curvearrowright}"
  '\u021BA': "{\\circlearrowleft}"
  '\u021BB': "{\\circlearrowright}"
  '\u021BC': "{\\leftharpoonup}"
  '\u021BD': "{\\leftharpoondown}"
  '\u021BE': "{\\upharpoonright}"
  '\u021BF': "{\\upharpoonleft}"
  '\u021C0': "{\\rightharpoonup}"
  '\u021C1': "{\\rightharpoondown}"
  '\u021C2': "{\\downharpoonright}"
  '\u021C3': "{\\downharpoonleft}"
  '\u021C4': "{\\rightleftarrows}"
  '\u021C5': "{\\dblarrowupdown}"
  '\u021C6': "{\\leftrightarrows}"
  '\u021C7': "{\\leftleftarrows}"
  '\u021C8': "{\\upuparrows}"
  '\u021C9': "{\\rightrightarrows}"
  '\u021CA': "{\\downdownarrows}"
  '\u021CB': "{\\leftrightharpoons}"
  '\u021CC': "{\\rightleftharpoons}"
  '\u021CD': "{\\nLeftarrow}"
  '\u021CE': "{\\nLeftrightarrow}"
  '\u021CF': "{\\nRightarrow}"
  '\u021D0': "{\\Leftarrow}"
  '\u021D1': "{\\Uparrow}"
  '\u021D2': "{\\Rightarrow}"
  '\u021D3': "{\\Downarrow}"
  '\u021D4': "{\\Leftrightarrow}"
  '\u021D5': "{\\Updownarrow}"
  '\u021DA': "{\\Lleftarrow}"
  '\u021DB': "{\\Rrightarrow}"
  '\u021DD': "{\\rightsquigarrow}"
  '\u021F5': "{\\DownArrowUpArrow}"
  '\u02200': "{\\forall}"
  '\u02201': "{\\complement}"
  '\u02202': "{\\partial}"
  '\u02203': "{\\exists}"
  '\u02204': "{\\nexists}"
  '\u02205': "{\\varnothing}"
  '\u02207': "{\\nabla}"
  '\u02208': "{\\in}"
  '\u02209': "{\\not\\in}"
  '\u0220B': "{\\ni}"
  '\u0220C': "{\\not\\ni}"
  '\u0220F': "{\\prod}"
  '\u02210': "{\\coprod}"
  '\u02211': "{\\sum}"
  '\u02213': "{\\mp}"
  '\u02214': "{\\dotplus}"
  '\u02216': "{\\setminus}"
  '\u02217': "{_\\ast}"
  '\u02218': "{\\circ}"
  '\u02219': "{\\bullet}"
  '\u0221A': "{\\surd}"
  '\u0221D': "{\\propto}"
  '\u0221E': "{\\infty}"
  '\u0221F': "{\\rightangle}"
  '\u02220': "{\\angle}"
  '\u02221': "{\\measuredangle}"
  '\u02222': "{\\sphericalangle}"
  '\u02223': "{\\mid}"
  '\u02224': "{\\nmid}"
  '\u02225': "{\\parallel}"
  '\u02226': "{\\nparallel}"
  '\u02227': "{\\wedge}"
  '\u02228': "{\\vee}"
  '\u02229': "{\\cap}"
  '\u0222A': "{\\cup}"
  '\u0222B': "{\\int}"
  '\u0222C': "{\\int\\!\\int}"
  '\u0222D': "{\\int\\!\\int\\!\\int}"
  '\u0222E': "{\\oint}"
  '\u0222F': "{\\surfintegral}"
  '\u02230': "{\\volintegral}"
  '\u02231': "{\\clwintegral}"
  '\u02232': "\\ElsevierGlyph{2232}"
  '\u02233': "\\ElsevierGlyph{2233}"
  '\u02234': "{\\therefore}"
  '\u02235': "{\\because}"
  '\u02237': "{\\Colon}"
  '\u02238': "\\ElsevierGlyph{2238}"
  '\u0223A': "\\mathbin{{:}\\!\\!{-}\\!\\!{:}}"
  '\u0223B': "{\\homothetic}"
  '\u0223C': "{\\sim}"
  '\u0223D': "{\\backsim}"
  '\u0223E': "{\\lazysinv}"
  '\u02240': "{\\wr}"
  '\u02241': "{\\not\\sim}"
  '\u02242': "\\ElsevierGlyph{2242}"
  '\u02243': "{\\simeq}"
  '\u02244': "{\\not\\simeq}"
  '\u02245': "{\\cong}"
  '\u02246': "{\\approxnotequal}"
  '\u02247': "{\\not\\cong}"
  '\u02248': "{\\approx}"
  '\u02249': "{\\not\\approx}"
  '\u0224A': "{\\approxeq}"
  '\u0224B': "{\\tildetrpl}"
  '\u0224C': "{\\allequal}"
  '\u0224D': "{\\asymp}"
  '\u0224E': "{\\Bumpeq}"
  '\u0224F': "{\\bumpeq}"
  '\u02250': "{\\doteq}"
  '\u02251': "{\\doteqdot}"
  '\u02252': "{\\fallingdotseq}"
  '\u02253': "{\\risingdotseq}"
  '\u02255': "=:"
  '\u02256': "{\\eqcirc}"
  '\u02257': "{\\circeq}"
  '\u02259': "{\\estimates}"
  '\u0225A': "\\ElsevierGlyph{225A}"
  '\u0225B': "{\\starequal}"
  '\u0225C': "{\\triangleq}"
  '\u0225F': "\\ElsevierGlyph{225F}"
  '\u02260': "\\not ="
  '\u02261': "{\\equiv}"
  '\u02262': "{\\not\\equiv}"
  '\u02264': "{\\leq}"
  '\u02265': "{\\geq}"
  '\u02266': "{\\leqq}"
  '\u02267': "{\\geqq}"
  '\u02268': "{\\lneqq}"
  '\u02269': "{\\gneqq}"
  '\u0226A': "{\\ll}"
  '\u0226B': "{\\gg}"
  '\u0226C': "{\\between}"
  '\u0226D': "{\\not\\kern-0.3em\\times}"
  '\u0226E': "\\not<"
  '\u0226F': "\\not>"
  '\u02270': "{\\not\\leq}"
  '\u02271': "{\\not\\geq}"
  '\u02272': "{\\lessequivlnt}"
  '\u02273': "{\\greaterequivlnt}"
  '\u02274': "\\ElsevierGlyph{2274}"
  '\u02275': "\\ElsevierGlyph{2275}"
  '\u02276': "{\\lessgtr}"
  '\u02277': "{\\gtrless}"
  '\u02278': "{\\notlessgreater}"
  '\u02279': "{\\notgreaterless}"
  '\u0227A': "{\\prec}"
  '\u0227B': "{\\succ}"
  '\u0227C': "{\\preccurlyeq}"
  '\u0227D': "{\\succcurlyeq}"
  '\u0227E': "{\\precapprox}"
  '\u0227F': "{\\succapprox}"
  '\u02280': "{\\not\\prec}"
  '\u02281': "{\\not\\succ}"
  '\u02282': "{\\subset}"
  '\u02283': "{\\supset}"
  '\u02284': "{\\not\\subset}"
  '\u02285': "{\\not\\supset}"
  '\u02286': "{\\subseteq}"
  '\u02287': "{\\supseteq}"
  '\u02288': "{\\not\\subseteq}"
  '\u02289': "{\\not\\supseteq}"
  '\u0228A': "{\\subsetneq}"
  '\u0228B': "{\\supsetneq}"
  '\u0228E': "{\\uplus}"
  '\u0228F': "{\\sqsubset}"
  '\u02290': "{\\sqsupset}"
  '\u02291': "{\\sqsubseteq}"
  '\u02292': "{\\sqsupseteq}"
  '\u02293': "{\\sqcap}"
  '\u02294': "{\\sqcup}"
  '\u02295': "{\\oplus}"
  '\u02296': "{\\ominus}"
  '\u02297': "{\\otimes}"
  '\u02298': "{\\oslash}"
  '\u02299': "{\\odot}"
  '\u0229A': "{\\circledcirc}"
  '\u0229B': "{\\circledast}"
  '\u0229D': "{\\circleddash}"
  '\u0229E': "{\\boxplus}"
  '\u0229F': "{\\boxminus}"
  '\u022A0': "{\\boxtimes}"
  '\u022A1': "{\\boxdot}"
  '\u022A2': "{\\vdash}"
  '\u022A3': "{\\dashv}"
  '\u022A4': "{\\top}"
  '\u022A5': "{\\perp}"
  '\u022A7': "{\\truestate}"
  '\u022A8': "{\\forcesextra}"
  '\u022A9': "{\\Vdash}"
  '\u022AA': "{\\Vvdash}"
  '\u022AB': "{\\VDash}"
  '\u022AC': "{\\nvdash}"
  '\u022AD': "{\\nvDash}"
  '\u022AE': "{\\nVdash}"
  '\u022AF': "{\\nVDash}"
  '\u022B2': "{\\vartriangleleft}"
  '\u022B3': "{\\vartriangleright}"
  '\u022B4': "{\\trianglelefteq}"
  '\u022B5': "{\\trianglerighteq}"
  '\u022B6': "{\\original}"
  '\u022B7': "{\\image}"
  '\u022B8': "{\\multimap}"
  '\u022B9': "{\\hermitconjmatrix}"
  '\u022BA': "{\\intercal}"
  '\u022BB': "{\\veebar}"
  '\u022BE': "{\\rightanglearc}"
  '\u022C0': "\\ElsevierGlyph{22C0}"
  '\u022C1': "\\ElsevierGlyph{22C1}"
  '\u022C2': "{\\bigcap}"
  '\u022C3': "{\\bigcup}"
  '\u022C4': "{\\diamond}"
  '\u022C5': "{\\cdot}"
  '\u022C6': "{\\star}"
  '\u022C7': "{\\divideontimes}"
  '\u022C8': "{\\bowtie}"
  '\u022C9': "{\\ltimes}"
  '\u022CA': "{\\rtimes}"
  '\u022CB': "{\\leftthreetimes}"
  '\u022CC': "{\\rightthreetimes}"
  '\u022CD': "{\\backsimeq}"
  '\u022CE': "{\\curlyvee}"
  '\u022CF': "{\\curlywedge}"
  '\u022D0': "{\\Subset}"
  '\u022D1': "{\\Supset}"
  '\u022D2': "{\\Cap}"
  '\u022D3': "{\\Cup}"
  '\u022D4': "{\\pitchfork}"
  '\u022D6': "{\\lessdot}"
  '\u022D7': "{\\gtrdot}"
  '\u022D8': "{\\verymuchless}"
  '\u022D9': "{\\verymuchgreater}"
  '\u022DA': "{\\lesseqgtr}"
  '\u022DB': "{\\gtreqless}"
  '\u022DE': "{\\curlyeqprec}"
  '\u022DF': "{\\curlyeqsucc}"
  '\u022E2': "{\\not\\sqsubseteq}"
  '\u022E3': "{\\not\\sqsupseteq}"
  '\u022E5': "{\\Elzsqspne}"
  '\u022E6': "{\\lnsim}"
  '\u022E7': "{\\gnsim}"
  '\u022E8': "{\\precedesnotsimilar}"
  '\u022E9': "{\\succnsim}"
  '\u022EA': "{\\ntriangleleft}"
  '\u022EB': "{\\ntriangleright}"
  '\u022EC': "{\\ntrianglelefteq}"
  '\u022ED': "{\\ntrianglerighteq}"
  '\u022EE': "{\\vdots}"
  '\u022EF': "{\\cdots}"
  '\u022F0': "{\\upslopeellipsis}"
  '\u022F1': "{\\downslopeellipsis}"
  '\u02306': "{\\perspcorrespond}"
  '\u02308': "{\\lceil}"
  '\u02309': "{\\rceil}"
  '\u0230A': "{\\lfloor}"
  '\u0230B': "{\\rfloor}"
  '\u02315': "{\\recorder}"
  '\u02316': "\\mathchar\"2208"
  '\u0231C': "{\\ulcorner}"
  '\u0231D': "{\\urcorner}"
  '\u0231E': "{\\llcorner}"
  '\u0231F': "{\\lrcorner}"
  '\u02322': "{\\frown}"
  '\u02323': "{\\smile}"
  '\u0233D': "\\ElsevierGlyph{E838}"
  '\u023A3': "{\\Elzdlcorn}"
  '\u023B0': "{\\lmoustache}"
  '\u023B1': "{\\rmoustache}"
  '\u024C8': "{\\circledS}"
  '\u02506': "{\\Elzdshfnc}"
  '\u02519': "{\\Elzsqfnw}"
  '\u02571': "{\\diagup}"
  '\u025A1': "{\\square}"
  '\u025AA': "{\\blacksquare}"
  '\u025AD': "\\fbox{~~}"
  '\u025AF': "{\\Elzvrecto}"
  '\u025B1': "\\ElsevierGlyph{E381}"
  '\u025B3': "{\\bigtriangleup}"
  '\u025B4': "{\\blacktriangle}"
  '\u025B5': "{\\vartriangle}"
  '\u025B8': "{\\blacktriangleright}"
  '\u025B9': "{\\triangleright}"
  '\u025BD': "{\\bigtriangledown}"
  '\u025BE': "{\\blacktriangledown}"
  '\u025BF': "{\\triangledown}"
  '\u025C2': "{\\blacktriangleleft}"
  '\u025C3': "{\\triangleleft}"
  '\u025CA': "{\\lozenge}"
  '\u025CB': "{\\bigcirc}"
  '\u025D0': "{\\Elzcirfl}"
  '\u025D1': "{\\Elzcirfr}"
  '\u025D2': "{\\Elzcirfb}"
  '\u025D8': "{\\Elzrvbull}"
  '\u025E7': "{\\Elzsqfl}"
  '\u025E8': "{\\Elzsqfr}"
  '\u025EA': "{\\Elzsqfse}"
  '\u025EF': "{\\bigcirc}"
  '\u02662': "{\\diamond}"
  '\u0266D': "{\\flat}"
  '\u0266E': "{\\natural}"
  '\u0266F': "{\\sharp}"
  '\u027F5': "{\\longleftarrow}"
  '\u027F6': "{\\longrightarrow}"
  '\u027F7': "{\\longleftrightarrow}"
  '\u027F8': "{\\Longleftarrow}"
  '\u027F9': "{\\Longrightarrow}"
  '\u027FA': "{\\Longleftrightarrow}"
  '\u027FC': "{\\longmapsto}"
  '\u027FF': "\\sim\\joinrel\\leadsto"
  '\u02905': "\\ElsevierGlyph{E212}"
  '\u02912': "{\\UpArrowBar}"
  '\u02913': "{\\DownArrowBar}"
  '\u02923': "\\ElsevierGlyph{E20C}"
  '\u02924': "\\ElsevierGlyph{E20D}"
  '\u02925': "\\ElsevierGlyph{E20B}"
  '\u02926': "\\ElsevierGlyph{E20A}"
  '\u02927': "\\ElsevierGlyph{E211}"
  '\u02928': "\\ElsevierGlyph{E20E}"
  '\u02929': "\\ElsevierGlyph{E20F}"
  '\u0292A': "\\ElsevierGlyph{E210}"
  '\u02933': "\\ElsevierGlyph{E21C}"
  '\u02936': "\\ElsevierGlyph{E21A}"
  '\u02937': "\\ElsevierGlyph{E219}"
  '\u02940': "{\\Elolarr}"
  '\u02941': "{\\Elorarr}"
  '\u02942': "{\\ElzRlarr}"
  '\u02944': "{\\ElzrLarr}"
  '\u02947': "{\\Elzrarrx}"
  '\u0294E': "{\\LeftRightVector}"
  '\u0294F': "{\\RightUpDownVector}"
  '\u02950': "{\\DownLeftRightVector}"
  '\u02951': "{\\LeftUpDownVector}"
  '\u02952': "{\\LeftVectorBar}"
  '\u02953': "{\\RightVectorBar}"
  '\u02954': "{\\RightUpVectorBar}"
  '\u02955': "{\\RightDownVectorBar}"
  '\u02956': "{\\DownLeftVectorBar}"
  '\u02957': "{\\DownRightVectorBar}"
  '\u02958': "{\\LeftUpVectorBar}"
  '\u02959': "{\\LeftDownVectorBar}"
  '\u0295A': "{\\LeftTeeVector}"
  '\u0295B': "{\\RightTeeVector}"
  '\u0295C': "{\\RightUpTeeVector}"
  '\u0295D': "{\\RightDownTeeVector}"
  '\u0295E': "{\\DownLeftTeeVector}"
  '\u0295F': "{\\DownRightTeeVector}"
  '\u02960': "{\\LeftUpTeeVector}"
  '\u02961': "{\\LeftDownTeeVector}"
  '\u0296E': "{\\UpEquilibrium}"
  '\u0296F': "{\\ReverseUpEquilibrium}"
  '\u02970': "{\\RoundImplies}"
  '\u0297C': "\\ElsevierGlyph{E214}"
  '\u0297D': "\\ElsevierGlyph{E215}"
  '\u02980': "{\\Elztfnc}"
  '\u02985': "\\ElsevierGlyph{3018}"
  '\u02986': "{\\Elroang}"
  '\u02993': "<\\kern-0.58em("
  '\u02994': "\\ElsevierGlyph{E291}"
  '\u02999': "{\\Elzddfnc}"
  '\u0299C': "{\\Angle}"
  '\u029A0': "{\\Elzlpargt}"
  '\u029B5': "\\ElsevierGlyph{E260}"
  '\u029B6': "\\ElsevierGlyph{E61B}"
  '\u029CA': "{\\ElzLap}"
  '\u029CB': "{\\Elzdefas}"
  '\u029CF': "{\\LeftTriangleBar}"
  '\u029D0': "{\\RightTriangleBar}"
  '\u029DC': "\\ElsevierGlyph{E372}"
  '\u029EB': "{\\blacklozenge}"
  '\u029F4': "{\\RuleDelayed}"
  '\u02A04': "{\\Elxuplus}"
  '\u02A05': "{\\ElzThr}"
  '\u02A06': "{\\Elxsqcup}"
  '\u02A07': "{\\ElzInf}"
  '\u02A08': "{\\ElzSup}"
  '\u02A0D': "{\\ElzCint}"
  '\u02A0F': "{\\clockoint}"
  '\u02A10': "\\ElsevierGlyph{E395}"
  '\u02A16': "{\\sqrint}"
  '\u02A25': "\\ElsevierGlyph{E25A}"
  '\u02A2A': "\\ElsevierGlyph{E25B}"
  '\u02A2D': "\\ElsevierGlyph{E25C}"
  '\u02A2E': "\\ElsevierGlyph{E25D}"
  '\u02A2F': "{\\ElzTimes}"
  '\u02A34': "\\ElsevierGlyph{E25E}"
  '\u02A35': "\\ElsevierGlyph{E25E}"
  '\u02A3C': "\\ElsevierGlyph{E259}"
  '\u02A3F': "{\\amalg}"
  '\u02A53': "{\\ElzAnd}"
  '\u02A54': "{\\ElzOr}"
  '\u02A55': "\\ElsevierGlyph{E36E}"
  '\u02A56': "{\\ElOr}"
  '\u02A5E': "{\\perspcorrespond}"
  '\u02A5F': "{\\Elzminhat}"
  '\u02A63': "\\ElsevierGlyph{225A}"
  '\u02A6E': "\\stackrel{*}{=}"
  '\u02A75': "{\\Equal}"
  '\u02A7D': "{\\leqslant}"
  '\u02A7E': "{\\geqslant}"
  '\u02A85': "{\\lessapprox}"
  '\u02A86': "{\\gtrapprox}"
  '\u02A87': "{\\lneq}"
  '\u02A88': "{\\gneq}"
  '\u02A89': "{\\lnapprox}"
  '\u02A8A': "{\\gnapprox}"
  '\u02A8B': "{\\lesseqqgtr}"
  '\u02A8C': "{\\gtreqqless}"
  '\u02A95': "{\\eqslantless}"
  '\u02A96': "{\\eqslantgtr}"
  '\u02A9D': "\\Pisymbol{ppi020}{117}"
  '\u02A9E': "\\Pisymbol{ppi020}{105}"
  '\u02AA1': "{\\NestedLessLess}"
  '\u02AA2': "{\\NestedGreaterGreater}"
  '\u02AAF': "{\\preceq}"
  '\u02AB0': "{\\succeq}"
  '\u02AB5': "{\\precneqq}"
  '\u02AB6': "{\\succneqq}"
  '\u02AB7': "{\\precapprox}"
  '\u02AB8': "{\\succapprox}"
  '\u02AB9': "{\\precnapprox}"
  '\u02ABA': "{\\succnapprox}"
  '\u02AC5': "{\\subseteqq}"
  '\u02AC6': "{\\supseteqq}"
  '\u02ACB': "{\\subsetneqq}"
  '\u02ACC': "{\\supsetneqq}"
  '\u02AEB': "\\ElsevierGlyph{E30D}"
  '\u02AF6': "{\\Elztdcol}"
  '\u02AFD': "{{/}\\!\\!{/}}"
  '\u0300A': "\\ElsevierGlyph{300A}"
  '\u0300B': "\\ElsevierGlyph{300B}"
  '\u03018': "\\ElsevierGlyph{3018}"
  '\u03019': "\\ElsevierGlyph{3019}"
  '\u0301A': "{\\openbracketleft}"
  '\u0301B': "{\\openbracketright}"
  '\u1D400': "\\mathbf{A}"
  '\u1D401': "\\mathbf{B}"
  '\u1D402': "\\mathbf{C}"
  '\u1D403': "\\mathbf{D}"
  '\u1D404': "\\mathbf{E}"
  '\u1D405': "\\mathbf{F}"
  '\u1D406': "\\mathbf{G}"
  '\u1D407': "\\mathbf{H}"
  '\u1D408': "\\mathbf{I}"
  '\u1D409': "\\mathbf{J}"
  '\u1D40A': "\\mathbf{K}"
  '\u1D40B': "\\mathbf{L}"
  '\u1D40C': "\\mathbf{M}"
  '\u1D40D': "\\mathbf{N}"
  '\u1D40E': "\\mathbf{O}"
  '\u1D40F': "\\mathbf{P}"
  '\u1D410': "\\mathbf{Q}"
  '\u1D411': "\\mathbf{R}"
  '\u1D412': "\\mathbf{S}"
  '\u1D413': "\\mathbf{T}"
  '\u1D414': "\\mathbf{U}"
  '\u1D415': "\\mathbf{V}"
  '\u1D416': "\\mathbf{W}"
  '\u1D417': "\\mathbf{X}"
  '\u1D418': "\\mathbf{Y}"
  '\u1D419': "\\mathbf{Z}"
  '\u1D41A': "\\mathbf{a}"
  '\u1D41B': "\\mathbf{b}"
  '\u1D41C': "\\mathbf{c}"
  '\u1D41D': "\\mathbf{d}"
  '\u1D41E': "\\mathbf{e}"
  '\u1D41F': "\\mathbf{f}"
  '\u1D420': "\\mathbf{g}"
  '\u1D421': "\\mathbf{h}"
  '\u1D422': "\\mathbf{i}"
  '\u1D423': "\\mathbf{j}"
  '\u1D424': "\\mathbf{k}"
  '\u1D425': "\\mathbf{l}"
  '\u1D426': "\\mathbf{m}"
  '\u1D427': "\\mathbf{n}"
  '\u1D428': "\\mathbf{o}"
  '\u1D429': "\\mathbf{p}"
  '\u1D42A': "\\mathbf{q}"
  '\u1D42B': "\\mathbf{r}"
  '\u1D42C': "\\mathbf{s}"
  '\u1D42D': "\\mathbf{t}"
  '\u1D42E': "\\mathbf{u}"
  '\u1D42F': "\\mathbf{v}"
  '\u1D430': "\\mathbf{w}"
  '\u1D431': "\\mathbf{x}"
  '\u1D432': "\\mathbf{y}"
  '\u1D433': "\\mathbf{z}"
  '\u1D434': "\\mathsl{A}"
  '\u1D435': "\\mathsl{B}"
  '\u1D436': "\\mathsl{C}"
  '\u1D437': "\\mathsl{D}"
  '\u1D438': "\\mathsl{E}"
  '\u1D439': "\\mathsl{F}"
  '\u1D43A': "\\mathsl{G}"
  '\u1D43B': "\\mathsl{H}"
  '\u1D43C': "\\mathsl{I}"
  '\u1D43D': "\\mathsl{J}"
  '\u1D43E': "\\mathsl{K}"
  '\u1D43F': "\\mathsl{L}"
  '\u1D440': "\\mathsl{M}"
  '\u1D441': "\\mathsl{N}"
  '\u1D442': "\\mathsl{O}"
  '\u1D443': "\\mathsl{P}"
  '\u1D444': "\\mathsl{Q}"
  '\u1D445': "\\mathsl{R}"
  '\u1D446': "\\mathsl{S}"
  '\u1D447': "\\mathsl{T}"
  '\u1D448': "\\mathsl{U}"
  '\u1D449': "\\mathsl{V}"
  '\u1D44A': "\\mathsl{W}"
  '\u1D44B': "\\mathsl{X}"
  '\u1D44C': "\\mathsl{Y}"
  '\u1D44D': "\\mathsl{Z}"
  '\u1D44E': "\\mathsl{a}"
  '\u1D44F': "\\mathsl{b}"
  '\u1D450': "\\mathsl{c}"
  '\u1D451': "\\mathsl{d}"
  '\u1D452': "\\mathsl{e}"
  '\u1D453': "\\mathsl{f}"
  '\u1D454': "\\mathsl{g}"
  '\u1D456': "\\mathsl{i}"
  '\u1D457': "\\mathsl{j}"
  '\u1D458': "\\mathsl{k}"
  '\u1D459': "\\mathsl{l}"
  '\u1D45A': "\\mathsl{m}"
  '\u1D45B': "\\mathsl{n}"
  '\u1D45C': "\\mathsl{o}"
  '\u1D45D': "\\mathsl{p}"
  '\u1D45E': "\\mathsl{q}"
  '\u1D45F': "\\mathsl{r}"
  '\u1D460': "\\mathsl{s}"
  '\u1D461': "\\mathsl{t}"
  '\u1D462': "\\mathsl{u}"
  '\u1D463': "\\mathsl{v}"
  '\u1D464': "\\mathsl{w}"
  '\u1D465': "\\mathsl{x}"
  '\u1D466': "\\mathsl{y}"
  '\u1D467': "\\mathsl{z}"
  '\u1D468': "\\mathbit{A}"
  '\u1D469': "\\mathbit{B}"
  '\u1D46A': "\\mathbit{C}"
  '\u1D46B': "\\mathbit{D}"
  '\u1D46C': "\\mathbit{E}"
  '\u1D46D': "\\mathbit{F}"
  '\u1D46E': "\\mathbit{G}"
  '\u1D46F': "\\mathbit{H}"
  '\u1D470': "\\mathbit{I}"
  '\u1D471': "\\mathbit{J}"
  '\u1D472': "\\mathbit{K}"
  '\u1D473': "\\mathbit{L}"
  '\u1D474': "\\mathbit{M}"
  '\u1D475': "\\mathbit{N}"
  '\u1D476': "\\mathbit{O}"
  '\u1D477': "\\mathbit{P}"
  '\u1D478': "\\mathbit{Q}"
  '\u1D479': "\\mathbit{R}"
  '\u1D47A': "\\mathbit{S}"
  '\u1D47B': "\\mathbit{T}"
  '\u1D47C': "\\mathbit{U}"
  '\u1D47D': "\\mathbit{V}"
  '\u1D47E': "\\mathbit{W}"
  '\u1D47F': "\\mathbit{X}"
  '\u1D480': "\\mathbit{Y}"
  '\u1D481': "\\mathbit{Z}"
  '\u1D482': "\\mathbit{a}"
  '\u1D483': "\\mathbit{b}"
  '\u1D484': "\\mathbit{c}"
  '\u1D485': "\\mathbit{d}"
  '\u1D486': "\\mathbit{e}"
  '\u1D487': "\\mathbit{f}"
  '\u1D488': "\\mathbit{g}"
  '\u1D489': "\\mathbit{h}"
  '\u1D48A': "\\mathbit{i}"
  '\u1D48B': "\\mathbit{j}"
  '\u1D48C': "\\mathbit{k}"
  '\u1D48D': "\\mathbit{l}"
  '\u1D48E': "\\mathbit{m}"
  '\u1D48F': "\\mathbit{n}"
  '\u1D490': "\\mathbit{o}"
  '\u1D491': "\\mathbit{p}"
  '\u1D492': "\\mathbit{q}"
  '\u1D493': "\\mathbit{r}"
  '\u1D494': "\\mathbit{s}"
  '\u1D495': "\\mathbit{t}"
  '\u1D496': "\\mathbit{u}"
  '\u1D497': "\\mathbit{v}"
  '\u1D498': "\\mathbit{w}"
  '\u1D499': "\\mathbit{x}"
  '\u1D49A': "\\mathbit{y}"
  '\u1D49B': "\\mathbit{z}"
  '\u1D49C': "\\mathscr{A}"
  '\u1D49E': "\\mathscr{C}"
  '\u1D49F': "\\mathscr{D}"
  '\u1D4A2': "\\mathscr{G}"
  '\u1D4A5': "\\mathscr{J}"
  '\u1D4A6': "\\mathscr{K}"
  '\u1D4A9': "\\mathscr{N}"
  '\u1D4AA': "\\mathscr{O}"
  '\u1D4AB': "\\mathscr{P}"
  '\u1D4AC': "\\mathscr{Q}"
  '\u1D4AE': "\\mathscr{S}"
  '\u1D4AF': "\\mathscr{T}"
  '\u1D4B0': "\\mathscr{U}"
  '\u1D4B1': "\\mathscr{V}"
  '\u1D4B2': "\\mathscr{W}"
  '\u1D4B3': "\\mathscr{X}"
  '\u1D4B4': "\\mathscr{Y}"
  '\u1D4B5': "\\mathscr{Z}"
  '\u1D4B6': "\\mathscr{a}"
  '\u1D4B7': "\\mathscr{b}"
  '\u1D4B8': "\\mathscr{c}"
  '\u1D4B9': "\\mathscr{d}"
  '\u1D4BB': "\\mathscr{f}"
  '\u1D4BD': "\\mathscr{h}"
  '\u1D4BE': "\\mathscr{i}"
  '\u1D4BF': "\\mathscr{j}"
  '\u1D4C0': "\\mathscr{k}"
  '\u1D4C1': "\\mathscr{l}"
  '\u1D4C2': "\\mathscr{m}"
  '\u1D4C3': "\\mathscr{n}"
  '\u1D4C5': "\\mathscr{p}"
  '\u1D4C6': "\\mathscr{q}"
  '\u1D4C7': "\\mathscr{r}"
  '\u1D4C8': "\\mathscr{s}"
  '\u1D4C9': "\\mathscr{t}"
  '\u1D4CA': "\\mathscr{u}"
  '\u1D4CB': "\\mathscr{v}"
  '\u1D4CC': "\\mathscr{w}"
  '\u1D4CD': "\\mathscr{x}"
  '\u1D4CE': "\\mathscr{y}"
  '\u1D4CF': "\\mathscr{z}"
  '\u1D4D0': "\\mathmit{A}"
  '\u1D4D1': "\\mathmit{B}"
  '\u1D4D2': "\\mathmit{C}"
  '\u1D4D3': "\\mathmit{D}"
  '\u1D4D4': "\\mathmit{E}"
  '\u1D4D5': "\\mathmit{F}"
  '\u1D4D6': "\\mathmit{G}"
  '\u1D4D7': "\\mathmit{H}"
  '\u1D4D8': "\\mathmit{I}"
  '\u1D4D9': "\\mathmit{J}"
  '\u1D4DA': "\\mathmit{K}"
  '\u1D4DB': "\\mathmit{L}"
  '\u1D4DC': "\\mathmit{M}"
  '\u1D4DD': "\\mathmit{N}"
  '\u1D4DE': "\\mathmit{O}"
  '\u1D4DF': "\\mathmit{P}"
  '\u1D4E0': "\\mathmit{Q}"
  '\u1D4E1': "\\mathmit{R}"
  '\u1D4E2': "\\mathmit{S}"
  '\u1D4E3': "\\mathmit{T}"
  '\u1D4E4': "\\mathmit{U}"
  '\u1D4E5': "\\mathmit{V}"
  '\u1D4E6': "\\mathmit{W}"
  '\u1D4E7': "\\mathmit{X}"
  '\u1D4E8': "\\mathmit{Y}"
  '\u1D4E9': "\\mathmit{Z}"
  '\u1D4EA': "\\mathmit{a}"
  '\u1D4EB': "\\mathmit{b}"
  '\u1D4EC': "\\mathmit{c}"
  '\u1D4ED': "\\mathmit{d}"
  '\u1D4EE': "\\mathmit{e}"
  '\u1D4EF': "\\mathmit{f}"
  '\u1D4F0': "\\mathmit{g}"
  '\u1D4F1': "\\mathmit{h}"
  '\u1D4F2': "\\mathmit{i}"
  '\u1D4F3': "\\mathmit{j}"
  '\u1D4F4': "\\mathmit{k}"
  '\u1D4F5': "\\mathmit{l}"
  '\u1D4F6': "\\mathmit{m}"
  '\u1D4F7': "\\mathmit{n}"
  '\u1D4F8': "\\mathmit{o}"
  '\u1D4F9': "\\mathmit{p}"
  '\u1D4FA': "\\mathmit{q}"
  '\u1D4FB': "\\mathmit{r}"
  '\u1D4FC': "\\mathmit{s}"
  '\u1D4FD': "\\mathmit{t}"
  '\u1D4FE': "\\mathmit{u}"
  '\u1D4FF': "\\mathmit{v}"
  '\u1D500': "\\mathmit{w}"
  '\u1D501': "\\mathmit{x}"
  '\u1D502': "\\mathmit{y}"
  '\u1D503': "\\mathmit{z}"
  '\u1D504': "\\mathfrak{A}"
  '\u1D505': "\\mathfrak{B}"
  '\u1D507': "\\mathfrak{D}"
  '\u1D508': "\\mathfrak{E}"
  '\u1D509': "\\mathfrak{F}"
  '\u1D50A': "\\mathfrak{G}"
  '\u1D50D': "\\mathfrak{J}"
  '\u1D50E': "\\mathfrak{K}"
  '\u1D50F': "\\mathfrak{L}"
  '\u1D510': "\\mathfrak{M}"
  '\u1D511': "\\mathfrak{N}"
  '\u1D512': "\\mathfrak{O}"
  '\u1D513': "\\mathfrak{P}"
  '\u1D514': "\\mathfrak{Q}"
  '\u1D516': "\\mathfrak{S}"
  '\u1D517': "\\mathfrak{T}"
  '\u1D518': "\\mathfrak{U}"
  '\u1D519': "\\mathfrak{V}"
  '\u1D51A': "\\mathfrak{W}"
  '\u1D51B': "\\mathfrak{X}"
  '\u1D51C': "\\mathfrak{Y}"
  '\u1D51E': "\\mathfrak{a}"
  '\u1D51F': "\\mathfrak{b}"
  '\u1D520': "\\mathfrak{c}"
  '\u1D521': "\\mathfrak{d}"
  '\u1D522': "\\mathfrak{e}"
  '\u1D523': "\\mathfrak{f}"
  '\u1D524': "\\mathfrak{g}"
  '\u1D525': "\\mathfrak{h}"
  '\u1D526': "\\mathfrak{i}"
  '\u1D527': "\\mathfrak{j}"
  '\u1D528': "\\mathfrak{k}"
  '\u1D529': "\\mathfrak{l}"
  '\u1D52A': "\\mathfrak{m}"
  '\u1D52B': "\\mathfrak{n}"
  '\u1D52C': "\\mathfrak{o}"
  '\u1D52D': "\\mathfrak{p}"
  '\u1D52E': "\\mathfrak{q}"
  '\u1D52F': "\\mathfrak{r}"
  '\u1D530': "\\mathfrak{s}"
  '\u1D531': "\\mathfrak{t}"
  '\u1D532': "\\mathfrak{u}"
  '\u1D533': "\\mathfrak{v}"
  '\u1D534': "\\mathfrak{w}"
  '\u1D535': "\\mathfrak{x}"
  '\u1D536': "\\mathfrak{y}"
  '\u1D537': "\\mathfrak{z}"
  '\u1D538': "\\mathbb{A}"
  '\u1D539': "\\mathbb{B}"
  '\u1D53B': "\\mathbb{D}"
  '\u1D53C': "\\mathbb{E}"
  '\u1D53D': "\\mathbb{F}"
  '\u1D53E': "\\mathbb{G}"
  '\u1D540': "\\mathbb{I}"
  '\u1D541': "\\mathbb{J}"
  '\u1D542': "\\mathbb{K}"
  '\u1D543': "\\mathbb{L}"
  '\u1D544': "\\mathbb{M}"
  '\u1D546': "\\mathbb{O}"
  '\u1D54A': "\\mathbb{S}"
  '\u1D54B': "\\mathbb{T}"
  '\u1D54C': "\\mathbb{U}"
  '\u1D54D': "\\mathbb{V}"
  '\u1D54E': "\\mathbb{W}"
  '\u1D54F': "\\mathbb{X}"
  '\u1D550': "\\mathbb{Y}"
  '\u1D552': "\\mathbb{a}"
  '\u1D553': "\\mathbb{b}"
  '\u1D554': "\\mathbb{c}"
  '\u1D555': "\\mathbb{d}"
  '\u1D556': "\\mathbb{e}"
  '\u1D557': "\\mathbb{f}"
  '\u1D558': "\\mathbb{g}"
  '\u1D559': "\\mathbb{h}"
  '\u1D55A': "\\mathbb{i}"
  '\u1D55B': "\\mathbb{j}"
  '\u1D55C': "\\mathbb{k}"
  '\u1D55D': "\\mathbb{l}"
  '\u1D55E': "\\mathbb{m}"
  '\u1D55F': "\\mathbb{n}"
  '\u1D560': "\\mathbb{o}"
  '\u1D561': "\\mathbb{p}"
  '\u1D562': "\\mathbb{q}"
  '\u1D563': "\\mathbb{r}"
  '\u1D564': "\\mathbb{s}"
  '\u1D565': "\\mathbb{t}"
  '\u1D566': "\\mathbb{u}"
  '\u1D567': "\\mathbb{v}"
  '\u1D568': "\\mathbb{w}"
  '\u1D569': "\\mathbb{x}"
  '\u1D56A': "\\mathbb{y}"
  '\u1D56B': "\\mathbb{z}"
  '\u1D56C': "\\mathslbb{A}"
  '\u1D56D': "\\mathslbb{B}"
  '\u1D56E': "\\mathslbb{C}"
  '\u1D56F': "\\mathslbb{D}"
  '\u1D570': "\\mathslbb{E}"
  '\u1D571': "\\mathslbb{F}"
  '\u1D572': "\\mathslbb{G}"
  '\u1D573': "\\mathslbb{H}"
  '\u1D574': "\\mathslbb{I}"
  '\u1D575': "\\mathslbb{J}"
  '\u1D576': "\\mathslbb{K}"
  '\u1D577': "\\mathslbb{L}"
  '\u1D578': "\\mathslbb{M}"
  '\u1D579': "\\mathslbb{N}"
  '\u1D57A': "\\mathslbb{O}"
  '\u1D57B': "\\mathslbb{P}"
  '\u1D57C': "\\mathslbb{Q}"
  '\u1D57D': "\\mathslbb{R}"
  '\u1D57E': "\\mathslbb{S}"
  '\u1D57F': "\\mathslbb{T}"
  '\u1D580': "\\mathslbb{U}"
  '\u1D581': "\\mathslbb{V}"
  '\u1D582': "\\mathslbb{W}"
  '\u1D583': "\\mathslbb{X}"
  '\u1D584': "\\mathslbb{Y}"
  '\u1D585': "\\mathslbb{Z}"
  '\u1D586': "\\mathslbb{a}"
  '\u1D587': "\\mathslbb{b}"
  '\u1D588': "\\mathslbb{c}"
  '\u1D589': "\\mathslbb{d}"
  '\u1D58A': "\\mathslbb{e}"
  '\u1D58B': "\\mathslbb{f}"
  '\u1D58C': "\\mathslbb{g}"
  '\u1D58D': "\\mathslbb{h}"
  '\u1D58E': "\\mathslbb{i}"
  '\u1D58F': "\\mathslbb{j}"
  '\u1D590': "\\mathslbb{k}"
  '\u1D591': "\\mathslbb{l}"
  '\u1D592': "\\mathslbb{m}"
  '\u1D593': "\\mathslbb{n}"
  '\u1D594': "\\mathslbb{o}"
  '\u1D595': "\\mathslbb{p}"
  '\u1D596': "\\mathslbb{q}"
  '\u1D597': "\\mathslbb{r}"
  '\u1D598': "\\mathslbb{s}"
  '\u1D599': "\\mathslbb{t}"
  '\u1D59A': "\\mathslbb{u}"
  '\u1D59B': "\\mathslbb{v}"
  '\u1D59C': "\\mathslbb{w}"
  '\u1D59D': "\\mathslbb{x}"
  '\u1D59E': "\\mathslbb{y}"
  '\u1D59F': "\\mathslbb{z}"
  '\u1D5A0': "\\mathsf{A}"
  '\u1D5A1': "\\mathsf{B}"
  '\u1D5A2': "\\mathsf{C}"
  '\u1D5A3': "\\mathsf{D}"
  '\u1D5A4': "\\mathsf{E}"
  '\u1D5A5': "\\mathsf{F}"
  '\u1D5A6': "\\mathsf{G}"
  '\u1D5A7': "\\mathsf{H}"
  '\u1D5A8': "\\mathsf{I}"
  '\u1D5A9': "\\mathsf{J}"
  '\u1D5AA': "\\mathsf{K}"
  '\u1D5AB': "\\mathsf{L}"
  '\u1D5AC': "\\mathsf{M}"
  '\u1D5AD': "\\mathsf{N}"
  '\u1D5AE': "\\mathsf{O}"
  '\u1D5AF': "\\mathsf{P}"
  '\u1D5B0': "\\mathsf{Q}"
  '\u1D5B1': "\\mathsf{R}"
  '\u1D5B2': "\\mathsf{S}"
  '\u1D5B3': "\\mathsf{T}"
  '\u1D5B4': "\\mathsf{U}"
  '\u1D5B5': "\\mathsf{V}"
  '\u1D5B6': "\\mathsf{W}"
  '\u1D5B7': "\\mathsf{X}"
  '\u1D5B8': "\\mathsf{Y}"
  '\u1D5B9': "\\mathsf{Z}"
  '\u1D5BA': "\\mathsf{a}"
  '\u1D5BB': "\\mathsf{b}"
  '\u1D5BC': "\\mathsf{c}"
  '\u1D5BD': "\\mathsf{d}"
  '\u1D5BE': "\\mathsf{e}"
  '\u1D5BF': "\\mathsf{f}"
  '\u1D5C0': "\\mathsf{g}"
  '\u1D5C1': "\\mathsf{h}"
  '\u1D5C2': "\\mathsf{i}"
  '\u1D5C3': "\\mathsf{j}"
  '\u1D5C4': "\\mathsf{k}"
  '\u1D5C5': "\\mathsf{l}"
  '\u1D5C6': "\\mathsf{m}"
  '\u1D5C7': "\\mathsf{n}"
  '\u1D5C8': "\\mathsf{o}"
  '\u1D5C9': "\\mathsf{p}"
  '\u1D5CA': "\\mathsf{q}"
  '\u1D5CB': "\\mathsf{r}"
  '\u1D5CC': "\\mathsf{s}"
  '\u1D5CD': "\\mathsf{t}"
  '\u1D5CE': "\\mathsf{u}"
  '\u1D5CF': "\\mathsf{v}"
  '\u1D5D0': "\\mathsf{w}"
  '\u1D5D1': "\\mathsf{x}"
  '\u1D5D2': "\\mathsf{y}"
  '\u1D5D3': "\\mathsf{z}"
  '\u1D5D4': "\\mathsfbf{A}"
  '\u1D5D5': "\\mathsfbf{B}"
  '\u1D5D6': "\\mathsfbf{C}"
  '\u1D5D7': "\\mathsfbf{D}"
  '\u1D5D8': "\\mathsfbf{E}"
  '\u1D5D9': "\\mathsfbf{F}"
  '\u1D5DA': "\\mathsfbf{G}"
  '\u1D5DB': "\\mathsfbf{H}"
  '\u1D5DC': "\\mathsfbf{I}"
  '\u1D5DD': "\\mathsfbf{J}"
  '\u1D5DE': "\\mathsfbf{K}"
  '\u1D5DF': "\\mathsfbf{L}"
  '\u1D5E0': "\\mathsfbf{M}"
  '\u1D5E1': "\\mathsfbf{N}"
  '\u1D5E2': "\\mathsfbf{O}"
  '\u1D5E3': "\\mathsfbf{P}"
  '\u1D5E4': "\\mathsfbf{Q}"
  '\u1D5E5': "\\mathsfbf{R}"
  '\u1D5E6': "\\mathsfbf{S}"
  '\u1D5E7': "\\mathsfbf{T}"
  '\u1D5E8': "\\mathsfbf{U}"
  '\u1D5E9': "\\mathsfbf{V}"
  '\u1D5EA': "\\mathsfbf{W}"
  '\u1D5EB': "\\mathsfbf{X}"
  '\u1D5EC': "\\mathsfbf{Y}"
  '\u1D5ED': "\\mathsfbf{Z}"
  '\u1D5EE': "\\mathsfbf{a}"
  '\u1D5EF': "\\mathsfbf{b}"
  '\u1D5F0': "\\mathsfbf{c}"
  '\u1D5F1': "\\mathsfbf{d}"
  '\u1D5F2': "\\mathsfbf{e}"
  '\u1D5F3': "\\mathsfbf{f}"
  '\u1D5F4': "\\mathsfbf{g}"
  '\u1D5F5': "\\mathsfbf{h}"
  '\u1D5F6': "\\mathsfbf{i}"
  '\u1D5F7': "\\mathsfbf{j}"
  '\u1D5F8': "\\mathsfbf{k}"
  '\u1D5F9': "\\mathsfbf{l}"
  '\u1D5FA': "\\mathsfbf{m}"
  '\u1D5FB': "\\mathsfbf{n}"
  '\u1D5FC': "\\mathsfbf{o}"
  '\u1D5FD': "\\mathsfbf{p}"
  '\u1D5FE': "\\mathsfbf{q}"
  '\u1D5FF': "\\mathsfbf{r}"
  '\u1D600': "\\mathsfbf{s}"
  '\u1D601': "\\mathsfbf{t}"
  '\u1D602': "\\mathsfbf{u}"
  '\u1D603': "\\mathsfbf{v}"
  '\u1D604': "\\mathsfbf{w}"
  '\u1D605': "\\mathsfbf{x}"
  '\u1D606': "\\mathsfbf{y}"
  '\u1D607': "\\mathsfbf{z}"
  '\u1D608': "\\mathsfsl{A}"
  '\u1D609': "\\mathsfsl{B}"
  '\u1D60A': "\\mathsfsl{C}"
  '\u1D60B': "\\mathsfsl{D}"
  '\u1D60C': "\\mathsfsl{E}"
  '\u1D60D': "\\mathsfsl{F}"
  '\u1D60E': "\\mathsfsl{G}"
  '\u1D60F': "\\mathsfsl{H}"
  '\u1D610': "\\mathsfsl{I}"
  '\u1D611': "\\mathsfsl{J}"
  '\u1D612': "\\mathsfsl{K}"
  '\u1D613': "\\mathsfsl{L}"
  '\u1D614': "\\mathsfsl{M}"
  '\u1D615': "\\mathsfsl{N}"
  '\u1D616': "\\mathsfsl{O}"
  '\u1D617': "\\mathsfsl{P}"
  '\u1D618': "\\mathsfsl{Q}"
  '\u1D619': "\\mathsfsl{R}"
  '\u1D61A': "\\mathsfsl{S}"
  '\u1D61B': "\\mathsfsl{T}"
  '\u1D61C': "\\mathsfsl{U}"
  '\u1D61D': "\\mathsfsl{V}"
  '\u1D61E': "\\mathsfsl{W}"
  '\u1D61F': "\\mathsfsl{X}"
  '\u1D620': "\\mathsfsl{Y}"
  '\u1D621': "\\mathsfsl{Z}"
  '\u1D622': "\\mathsfsl{a}"
  '\u1D623': "\\mathsfsl{b}"
  '\u1D624': "\\mathsfsl{c}"
  '\u1D625': "\\mathsfsl{d}"
  '\u1D626': "\\mathsfsl{e}"
  '\u1D627': "\\mathsfsl{f}"
  '\u1D628': "\\mathsfsl{g}"
  '\u1D629': "\\mathsfsl{h}"
  '\u1D62A': "\\mathsfsl{i}"
  '\u1D62B': "\\mathsfsl{j}"
  '\u1D62C': "\\mathsfsl{k}"
  '\u1D62D': "\\mathsfsl{l}"
  '\u1D62E': "\\mathsfsl{m}"
  '\u1D62F': "\\mathsfsl{n}"
  '\u1D630': "\\mathsfsl{o}"
  '\u1D631': "\\mathsfsl{p}"
  '\u1D632': "\\mathsfsl{q}"
  '\u1D633': "\\mathsfsl{r}"
  '\u1D634': "\\mathsfsl{s}"
  '\u1D635': "\\mathsfsl{t}"
  '\u1D636': "\\mathsfsl{u}"
  '\u1D637': "\\mathsfsl{v}"
  '\u1D638': "\\mathsfsl{w}"
  '\u1D639': "\\mathsfsl{x}"
  '\u1D63A': "\\mathsfsl{y}"
  '\u1D63B': "\\mathsfsl{z}"
  '\u1D63C': "\\mathsfbfsl{A}"
  '\u1D63D': "\\mathsfbfsl{B}"
  '\u1D63E': "\\mathsfbfsl{C}"
  '\u1D63F': "\\mathsfbfsl{D}"
  '\u1D640': "\\mathsfbfsl{E}"
  '\u1D641': "\\mathsfbfsl{F}"
  '\u1D642': "\\mathsfbfsl{G}"
  '\u1D643': "\\mathsfbfsl{H}"
  '\u1D644': "\\mathsfbfsl{I}"
  '\u1D645': "\\mathsfbfsl{J}"
  '\u1D646': "\\mathsfbfsl{K}"
  '\u1D647': "\\mathsfbfsl{L}"
  '\u1D648': "\\mathsfbfsl{M}"
  '\u1D649': "\\mathsfbfsl{N}"
  '\u1D64A': "\\mathsfbfsl{O}"
  '\u1D64B': "\\mathsfbfsl{P}"
  '\u1D64C': "\\mathsfbfsl{Q}"
  '\u1D64D': "\\mathsfbfsl{R}"
  '\u1D64E': "\\mathsfbfsl{S}"
  '\u1D64F': "\\mathsfbfsl{T}"
  '\u1D650': "\\mathsfbfsl{U}"
  '\u1D651': "\\mathsfbfsl{V}"
  '\u1D652': "\\mathsfbfsl{W}"
  '\u1D653': "\\mathsfbfsl{X}"
  '\u1D654': "\\mathsfbfsl{Y}"
  '\u1D655': "\\mathsfbfsl{Z}"
  '\u1D656': "\\mathsfbfsl{a}"
  '\u1D657': "\\mathsfbfsl{b}"
  '\u1D658': "\\mathsfbfsl{c}"
  '\u1D659': "\\mathsfbfsl{d}"
  '\u1D65A': "\\mathsfbfsl{e}"
  '\u1D65B': "\\mathsfbfsl{f}"
  '\u1D65C': "\\mathsfbfsl{g}"
  '\u1D65D': "\\mathsfbfsl{h}"
  '\u1D65E': "\\mathsfbfsl{i}"
  '\u1D65F': "\\mathsfbfsl{j}"
  '\u1D660': "\\mathsfbfsl{k}"
  '\u1D661': "\\mathsfbfsl{l}"
  '\u1D662': "\\mathsfbfsl{m}"
  '\u1D663': "\\mathsfbfsl{n}"
  '\u1D664': "\\mathsfbfsl{o}"
  '\u1D665': "\\mathsfbfsl{p}"
  '\u1D666': "\\mathsfbfsl{q}"
  '\u1D667': "\\mathsfbfsl{r}"
  '\u1D668': "\\mathsfbfsl{s}"
  '\u1D669': "\\mathsfbfsl{t}"
  '\u1D66A': "\\mathsfbfsl{u}"
  '\u1D66B': "\\mathsfbfsl{v}"
  '\u1D66C': "\\mathsfbfsl{w}"
  '\u1D66D': "\\mathsfbfsl{x}"
  '\u1D66E': "\\mathsfbfsl{y}"
  '\u1D66F': "\\mathsfbfsl{z}"
  '\u1D670': "\\mathtt{A}"
  '\u1D671': "\\mathtt{B}"
  '\u1D672': "\\mathtt{C}"
  '\u1D673': "\\mathtt{D}"
  '\u1D674': "\\mathtt{E}"
  '\u1D675': "\\mathtt{F}"
  '\u1D676': "\\mathtt{G}"
  '\u1D677': "\\mathtt{H}"
  '\u1D678': "\\mathtt{I}"
  '\u1D679': "\\mathtt{J}"
  '\u1D67A': "\\mathtt{K}"
  '\u1D67B': "\\mathtt{L}"
  '\u1D67C': "\\mathtt{M}"
  '\u1D67D': "\\mathtt{N}"
  '\u1D67E': "\\mathtt{O}"
  '\u1D67F': "\\mathtt{P}"
  '\u1D680': "\\mathtt{Q}"
  '\u1D681': "\\mathtt{R}"
  '\u1D682': "\\mathtt{S}"
  '\u1D683': "\\mathtt{T}"
  '\u1D684': "\\mathtt{U}"
  '\u1D685': "\\mathtt{V}"
  '\u1D686': "\\mathtt{W}"
  '\u1D687': "\\mathtt{X}"
  '\u1D688': "\\mathtt{Y}"
  '\u1D689': "\\mathtt{Z}"
  '\u1D68A': "\\mathtt{a}"
  '\u1D68B': "\\mathtt{b}"
  '\u1D68C': "\\mathtt{c}"
  '\u1D68D': "\\mathtt{d}"
  '\u1D68E': "\\mathtt{e}"
  '\u1D68F': "\\mathtt{f}"
  '\u1D690': "\\mathtt{g}"
  '\u1D691': "\\mathtt{h}"
  '\u1D692': "\\mathtt{i}"
  '\u1D693': "\\mathtt{j}"
  '\u1D694': "\\mathtt{k}"
  '\u1D695': "\\mathtt{l}"
  '\u1D696': "\\mathtt{m}"
  '\u1D697': "\\mathtt{n}"
  '\u1D698': "\\mathtt{o}"
  '\u1D699': "\\mathtt{p}"
  '\u1D69A': "\\mathtt{q}"
  '\u1D69B': "\\mathtt{r}"
  '\u1D69C': "\\mathtt{s}"
  '\u1D69D': "\\mathtt{t}"
  '\u1D69E': "\\mathtt{u}"
  '\u1D69F': "\\mathtt{v}"
  '\u1D6A0': "\\mathtt{w}"
  '\u1D6A1': "\\mathtt{x}"
  '\u1D6A2': "\\mathtt{y}"
  '\u1D6A3': "\\mathtt{z}"
  '\u1D6A8': "\\mathbf{\\Alpha}"
  '\u1D6A9': "\\mathbf{\\Beta}"
  '\u1D6AA': "\\mathbf{\\Gamma}"
  '\u1D6AB': "\\mathbf{\\Delta}"
  '\u1D6AC': "\\mathbf{\\Epsilon}"
  '\u1D6AD': "\\mathbf{\\Zeta}"
  '\u1D6AE': "\\mathbf{\\Eta}"
  '\u1D6AF': "\\mathbf{\\Theta}"
  '\u1D6B0': "\\mathbf{\\Iota}"
  '\u1D6B1': "\\mathbf{\\Kappa}"
  '\u1D6B2': "\\mathbf{\\Lambda}"
  '\u1D6B3': "M"
  '\u1D6B4': "N"
  '\u1D6B5': "\\mathbf{\\Xi}"
  '\u1D6B6': "O"
  '\u1D6B7': "\\mathbf{\\Pi}"
  '\u1D6B8': "\\mathbf{\\Rho}"
  '\u1D6BA': "\\mathbf{\\Sigma}"
  '\u1D6BB': "\\mathbf{\\Tau}"
  '\u1D6BC': "\\mathbf{\\Upsilon}"
  '\u1D6BD': "\\mathbf{\\Phi}"
  '\u1D6BE': "\\mathbf{\\Chi}"
  '\u1D6BF': "\\mathbf{\\Psi}"
  '\u1D6C0': "\\mathbf{\\Omega}"
  '\u1D6C1': "\\mathbf{\\nabla}"
  '\u1D6C2': "\\mathbf{\\Alpha}"
  '\u1D6C3': "\\mathbf{\\Beta}"
  '\u1D6C4': "\\mathbf{\\Gamma}"
  '\u1D6C5': "\\mathbf{\\Delta}"
  '\u1D6C6': "\\mathbf{\\Epsilon}"
  '\u1D6C7': "\\mathbf{\\Zeta}"
  '\u1D6C8': "\\mathbf{\\Eta}"
  '\u1D6C9': "\\mathbf{\\theta}"
  '\u1D6CA': "\\mathbf{\\Iota}"
  '\u1D6CB': "\\mathbf{\\Kappa}"
  '\u1D6CC': "\\mathbf{\\Lambda}"
  '\u1D6CD': "M"
  '\u1D6CE': "N"
  '\u1D6CF': "\\mathbf{\\Xi}"
  '\u1D6D0': "O"
  '\u1D6D1': "\\mathbf{\\Pi}"
  '\u1D6D2': "\\mathbf{\\Rho}"
  '\u1D6D3': "\\mathbf{\\varsigma}"
  '\u1D6D4': "\\mathbf{\\Sigma}"
  '\u1D6D5': "\\mathbf{\\Tau}"
  '\u1D6D6': "\\mathbf{\\Upsilon}"
  '\u1D6D7': "\\mathbf{\\Phi}"
  '\u1D6D8': "\\mathbf{\\Chi}"
  '\u1D6D9': "\\mathbf{\\Psi}"
  '\u1D6DA': "\\mathbf{\\Omega}"
  '\u1D6DB': "{\\partial}"
  '\u1D6DC': "\\in"
  '\u1D6E2': "\\mathsl{\\Alpha}"
  '\u1D6E3': "\\mathsl{\\Beta}"
  '\u1D6E4': "\\mathsl{\\Gamma}"
  '\u1D6E5': "\\mathsl{\\Delta}"
  '\u1D6E6': "\\mathsl{\\Epsilon}"
  '\u1D6E7': "\\mathsl{\\Zeta}"
  '\u1D6E8': "\\mathsl{\\Eta}"
  '\u1D6E9': "\\mathsl{\\Theta}"
  '\u1D6EA': "\\mathsl{\\Iota}"
  '\u1D6EB': "\\mathsl{\\Kappa}"
  '\u1D6EC': "\\mathsl{\\Lambda}"
  '\u1D6ED': "M"
  '\u1D6EE': "N"
  '\u1D6EF': "\\mathsl{\\Xi}"
  '\u1D6F0': "O"
  '\u1D6F1': "\\mathsl{\\Pi}"
  '\u1D6F2': "\\mathsl{\\Rho}"
  '\u1D6F4': "\\mathsl{\\Sigma}"
  '\u1D6F5': "\\mathsl{\\Tau}"
  '\u1D6F6': "\\mathsl{\\Upsilon}"
  '\u1D6F7': "\\mathsl{\\Phi}"
  '\u1D6F8': "\\mathsl{\\Chi}"
  '\u1D6F9': "\\mathsl{\\Psi}"
  '\u1D6FA': "\\mathsl{\\Omega}"
  '\u1D6FB': "\\mathsl{\\nabla}"
  '\u1D6FC': "\\mathsl{\\Alpha}"
  '\u1D6FD': "\\mathsl{\\Beta}"
  '\u1D6FE': "\\mathsl{\\Gamma}"
  '\u1D6FF': "\\mathsl{\\Delta}"
  '\u1D700': "\\mathsl{\\Epsilon}"
  '\u1D701': "\\mathsl{\\Zeta}"
  '\u1D702': "\\mathsl{\\Eta}"
  '\u1D703': "\\mathsl{\\Theta}"
  '\u1D704': "\\mathsl{\\Iota}"
  '\u1D705': "\\mathsl{\\Kappa}"
  '\u1D706': "\\mathsl{\\Lambda}"
  '\u1D707': "M"
  '\u1D708': "N"
  '\u1D709': "\\mathsl{\\Xi}"
  '\u1D70A': "O"
  '\u1D70B': "\\mathsl{\\Pi}"
  '\u1D70C': "\\mathsl{\\Rho}"
  '\u1D70D': "\\mathsl{\\varsigma}"
  '\u1D70E': "\\mathsl{\\Sigma}"
  '\u1D70F': "\\mathsl{\\Tau}"
  '\u1D710': "\\mathsl{\\Upsilon}"
  '\u1D711': "\\mathsl{\\Phi}"
  '\u1D712': "\\mathsl{\\Chi}"
  '\u1D713': "\\mathsl{\\Psi}"
  '\u1D714': "\\mathsl{\\Omega}"
  '\u1D715': "{\\partial}"
  '\u1D716': "\\in"
  '\u1D71C': "\\mathbit{\\Alpha}"
  '\u1D71D': "\\mathbit{\\Beta}"
  '\u1D71E': "\\mathbit{\\Gamma}"
  '\u1D71F': "\\mathbit{\\Delta}"
  '\u1D720': "\\mathbit{\\Epsilon}"
  '\u1D721': "\\mathbit{\\Zeta}"
  '\u1D722': "\\mathbit{\\Eta}"
  '\u1D723': "\\mathbit{\\Theta}"
  '\u1D724': "\\mathbit{\\Iota}"
  '\u1D725': "\\mathbit{\\Kappa}"
  '\u1D726': "\\mathbit{\\Lambda}"
  '\u1D727': "M"
  '\u1D728': "N"
  '\u1D729': "\\mathbit{\\Xi}"
  '\u1D72A': "O"
  '\u1D72B': "\\mathbit{\\Pi}"
  '\u1D72C': "\\mathbit{\\Rho}"
  '\u1D72E': "\\mathbit{\\Sigma}"
  '\u1D72F': "\\mathbit{\\Tau}"
  '\u1D730': "\\mathbit{\\Upsilon}"
  '\u1D731': "\\mathbit{\\Phi}"
  '\u1D732': "\\mathbit{\\Chi}"
  '\u1D733': "\\mathbit{\\Psi}"
  '\u1D734': "\\mathbit{\\Omega}"
  '\u1D735': "\\mathbit{\\nabla}"
  '\u1D736': "\\mathbit{\\Alpha}"
  '\u1D737': "\\mathbit{\\Beta}"
  '\u1D738': "\\mathbit{\\Gamma}"
  '\u1D739': "\\mathbit{\\Delta}"
  '\u1D73A': "\\mathbit{\\Epsilon}"
  '\u1D73B': "\\mathbit{\\Zeta}"
  '\u1D73C': "\\mathbit{\\Eta}"
  '\u1D73D': "\\mathbit{\\Theta}"
  '\u1D73E': "\\mathbit{\\Iota}"
  '\u1D73F': "\\mathbit{\\Kappa}"
  '\u1D740': "\\mathbit{\\Lambda}"
  '\u1D741': "M"
  '\u1D742': "N"
  '\u1D743': "\\mathbit{\\Xi}"
  '\u1D744': "O"
  '\u1D745': "\\mathbit{\\Pi}"
  '\u1D746': "\\mathbit{\\Rho}"
  '\u1D747': "\\mathbit{\\varsigma}"
  '\u1D748': "\\mathbit{\\Sigma}"
  '\u1D749': "\\mathbit{\\Tau}"
  '\u1D74A': "\\mathbit{\\Upsilon}"
  '\u1D74B': "\\mathbit{\\Phi}"
  '\u1D74C': "\\mathbit{\\Chi}"
  '\u1D74D': "\\mathbit{\\Psi}"
  '\u1D74E': "\\mathbit{\\Omega}"
  '\u1D74F': "{\\partial}"
  '\u1D750': "\\in"
  '\u1D756': "\\mathsfbf{\\Alpha}"
  '\u1D757': "\\mathsfbf{\\Beta}"
  '\u1D758': "\\mathsfbf{\\Gamma}"
  '\u1D759': "\\mathsfbf{\\Delta}"
  '\u1D75A': "\\mathsfbf{\\Epsilon}"
  '\u1D75B': "\\mathsfbf{\\Zeta}"
  '\u1D75C': "\\mathsfbf{\\Eta}"
  '\u1D75D': "\\mathsfbf{\\Theta}"
  '\u1D75E': "\\mathsfbf{\\Iota}"
  '\u1D75F': "\\mathsfbf{\\Kappa}"
  '\u1D760': "\\mathsfbf{\\Lambda}"
  '\u1D761': "M"
  '\u1D762': "N"
  '\u1D763': "\\mathsfbf{\\Xi}"
  '\u1D764': "O"
  '\u1D765': "\\mathsfbf{\\Pi}"
  '\u1D766': "\\mathsfbf{\\Rho}"
  '\u1D768': "\\mathsfbf{\\Sigma}"
  '\u1D769': "\\mathsfbf{\\Tau}"
  '\u1D76A': "\\mathsfbf{\\Upsilon}"
  '\u1D76B': "\\mathsfbf{\\Phi}"
  '\u1D76C': "\\mathsfbf{\\Chi}"
  '\u1D76D': "\\mathsfbf{\\Psi}"
  '\u1D76E': "\\mathsfbf{\\Omega}"
  '\u1D76F': "\\mathsfbf{\\nabla}"
  '\u1D770': "\\mathsfbf{\\Alpha}"
  '\u1D771': "\\mathsfbf{\\Beta}"
  '\u1D772': "\\mathsfbf{\\Gamma}"
  '\u1D773': "\\mathsfbf{\\Delta}"
  '\u1D774': "\\mathsfbf{\\Epsilon}"
  '\u1D775': "\\mathsfbf{\\Zeta}"
  '\u1D776': "\\mathsfbf{\\Eta}"
  '\u1D777': "\\mathsfbf{\\Theta}"
  '\u1D778': "\\mathsfbf{\\Iota}"
  '\u1D779': "\\mathsfbf{\\Kappa}"
  '\u1D77A': "\\mathsfbf{\\Lambda}"
  '\u1D77B': "M"
  '\u1D77C': "N"
  '\u1D77D': "\\mathsfbf{\\Xi}"
  '\u1D77E': "O"
  '\u1D77F': "\\mathsfbf{\\Pi}"
  '\u1D780': "\\mathsfbf{\\Rho}"
  '\u1D781': "\\mathsfbf{\\varsigma}"
  '\u1D782': "\\mathsfbf{\\Sigma}"
  '\u1D783': "\\mathsfbf{\\Tau}"
  '\u1D784': "\\mathsfbf{\\Upsilon}"
  '\u1D785': "\\mathsfbf{\\Phi}"
  '\u1D786': "\\mathsfbf{\\Chi}"
  '\u1D787': "\\mathsfbf{\\Psi}"
  '\u1D788': "\\mathsfbf{\\Omega}"
  '\u1D789': "{\\partial}"
  '\u1D78A': "\\in"
  '\u1D790': "\\mathsfbfsl{\\Alpha}"
  '\u1D791': "\\mathsfbfsl{\\Beta}"
  '\u1D792': "\\mathsfbfsl{\\Gamma}"
  '\u1D793': "\\mathsfbfsl{\\Delta}"
  '\u1D794': "\\mathsfbfsl{\\Epsilon}"
  '\u1D795': "\\mathsfbfsl{\\Zeta}"
  '\u1D796': "\\mathsfbfsl{\\Eta}"
  '\u1D797': "\\mathsfbfsl{\\vartheta}"
  '\u1D798': "\\mathsfbfsl{\\Iota}"
  '\u1D799': "\\mathsfbfsl{\\Kappa}"
  '\u1D79A': "\\mathsfbfsl{\\Lambda}"
  '\u1D79B': "M"
  '\u1D79C': "N"
  '\u1D79D': "\\mathsfbfsl{\\Xi}"
  '\u1D79E': "O"
  '\u1D79F': "\\mathsfbfsl{\\Pi}"
  '\u1D7A0': "\\mathsfbfsl{\\Rho}"
  '\u1D7A2': "\\mathsfbfsl{\\Sigma}"
  '\u1D7A3': "\\mathsfbfsl{\\Tau}"
  '\u1D7A4': "\\mathsfbfsl{\\Upsilon}"
  '\u1D7A5': "\\mathsfbfsl{\\Phi}"
  '\u1D7A6': "\\mathsfbfsl{\\Chi}"
  '\u1D7A7': "\\mathsfbfsl{\\Psi}"
  '\u1D7A8': "\\mathsfbfsl{\\Omega}"
  '\u1D7A9': "\\mathsfbfsl{\\nabla}"
  '\u1D7AA': "\\mathsfbfsl{\\Alpha}"
  '\u1D7AB': "\\mathsfbfsl{\\Beta}"
  '\u1D7AC': "\\mathsfbfsl{\\Gamma}"
  '\u1D7AD': "\\mathsfbfsl{\\Delta}"
  '\u1D7AE': "\\mathsfbfsl{\\Epsilon}"
  '\u1D7AF': "\\mathsfbfsl{\\Zeta}"
  '\u1D7B0': "\\mathsfbfsl{\\Eta}"
  '\u1D7B1': "\\mathsfbfsl{\\vartheta}"
  '\u1D7B2': "\\mathsfbfsl{\\Iota}"
  '\u1D7B3': "\\mathsfbfsl{\\Kappa}"
  '\u1D7B4': "\\mathsfbfsl{\\Lambda}"
  '\u1D7B5': "M"
  '\u1D7B6': "N"
  '\u1D7B7': "\\mathsfbfsl{\\Xi}"
  '\u1D7B8': "O"
  '\u1D7B9': "\\mathsfbfsl{\\Pi}"
  '\u1D7BA': "\\mathsfbfsl{\\Rho}"
  '\u1D7BB': "\\mathsfbfsl{\\varsigma}"
  '\u1D7BC': "\\mathsfbfsl{\\Sigma}"
  '\u1D7BD': "\\mathsfbfsl{\\Tau}"
  '\u1D7BE': "\\mathsfbfsl{\\Upsilon}"
  '\u1D7BF': "\\mathsfbfsl{\\Phi}"
  '\u1D7C0': "\\mathsfbfsl{\\Chi}"
  '\u1D7C1': "\\mathsfbfsl{\\Psi}"
  '\u1D7C2': "\\mathsfbfsl{\\Omega}"
  '\u1D7C3': "{\\partial}"
  '\u1D7C4': "\\in"
  '\u1D7CE': "\\mathbf{0}"
  '\u1D7CF': "\\mathbf{1}"
  '\u1D7D0': "\\mathbf{2}"
  '\u1D7D1': "\\mathbf{3}"
  '\u1D7D2': "\\mathbf{4}"
  '\u1D7D3': "\\mathbf{5}"
  '\u1D7D4': "\\mathbf{6}"
  '\u1D7D5': "\\mathbf{7}"
  '\u1D7D6': "\\mathbf{8}"
  '\u1D7D7': "\\mathbf{9}"
  '\u1D7D8': "\\mathbb{0}"
  '\u1D7D9': "\\mathbb{1}"
  '\u1D7DA': "\\mathbb{2}"
  '\u1D7DB': "\\mathbb{3}"
  '\u1D7DC': "\\mathbb{4}"
  '\u1D7DD': "\\mathbb{5}"
  '\u1D7DE': "\\mathbb{6}"
  '\u1D7DF': "\\mathbb{7}"
  '\u1D7E0': "\\mathbb{8}"
  '\u1D7E1': "\\mathbb{9}"
  '\u1D7E2': "\\mathsf{0}"
  '\u1D7E3': "\\mathsf{1}"
  '\u1D7E4': "\\mathsf{2}"
  '\u1D7E5': "\\mathsf{3}"
  '\u1D7E6': "\\mathsf{4}"
  '\u1D7E7': "\\mathsf{5}"
  '\u1D7E8': "\\mathsf{6}"
  '\u1D7E9': "\\mathsf{7}"
  '\u1D7EA': "\\mathsf{8}"
  '\u1D7EB': "\\mathsf{9}"
  '\u1D7EC': "\\mathsfbf{0}"
  '\u1D7ED': "\\mathsfbf{1}"
  '\u1D7EE': "\\mathsfbf{2}"
  '\u1D7EF': "\\mathsfbf{3}"
  '\u1D7F0': "\\mathsfbf{4}"
  '\u1D7F1': "\\mathsfbf{5}"
  '\u1D7F2': "\\mathsfbf{6}"
  '\u1D7F3': "\\mathsfbf{7}"
  '\u1D7F4': "\\mathsfbf{8}"
  '\u1D7F5': "\\mathsfbf{9}"
  '\u1D7F6': "\\mathtt{0}"
  '\u1D7F7': "\\mathtt{1}"
  '\u1D7F8': "\\mathtt{2}"
  '\u1D7F9': "\\mathtt{3}"
  '\u1D7FA': "\\mathtt{4}"
  '\u1D7FB': "\\mathtt{5}"
  '\u1D7FC': "\\mathtt{6}"
  '\u1D7FD': "\\mathtt{7}"
  '\u1D7FE': "\\mathtt{8}"
  '\u1D7FF': "\\mathtt{9}"
  '\u02329': "{\\langle}"
  '\u0232A': "{\\rangle}"
LaTeX.toLaTeX.ascii.text =
  '#': "\\#"
  '$': "{\\textdollar}"
  '%': "\\%"
  '&': "\\&"
  '^': "\\^{}"
  '_': "\\_"
  '{': "\\{"
  '}': "\\}"
  '~': "{\\textasciitilde}"
  '\u000A0': " "
  '\u000A1': "{\\textexclamdown}"
  '\u000A2': "{\\textcent}"
  '\u000A3': "{\\textsterling}"
  '\u000A4': "{\\textcurrency}"
  '\u000A5': "{\\textyen}"
  '\u000A6': "{\\textbrokenbar}"
  '\u000A7': "{\\textsection}"
  '\u000A8': "{\\textasciidieresis}"
  '\u000A9': "{\\textcopyright}"
  '\u000AA': "{\\textordfeminine}"
  '\u000AB': "{\\guillemotleft}"
  '\u000AE': "{\\textregistered}"
  '\u000AF': "{\\textasciimacron}"
  '\u000B0': "{\\textdegree}"
  '\u000B4': "{\\textasciiacute}"
  '\u000B6': "{\\textparagraph}"
  '\u000B8': "\\c{}"
  '\u000BA': "{\\textordmasculine}"
  '\u000BB': "{\\guillemotright}"
  '\u000BC': "{\\textonequarter}"
  '\u000BD': "{\\textonehalf}"
  '\u000BE': "{\\textthreequarters}"
  '\u000BF': "{\\textquestiondown}"
  '\u000C0': "{\\`A}"
  '\u000C1': "{\\'A}"
  '\u000C2': "{\\^A}"
  '\u000C3': "{\\~A}"
  '\u000C4': "{\\\"A}"
  '\u000C5': "{\\AA}"
  '\u000C6': "{\\AE}"
  '\u000C7': "{\\c C}"
  '\u000C8': "{\\`E}"
  '\u000C9': "{\\'E}"
  '\u000CA': "{\\^E}"
  '\u000CB': "{\\\"E}"
  '\u000CC': "{\\`I}"
  '\u000CD': "{\\'I}"
  '\u000CE': "{\\^I}"
  '\u000CF': "{\\\"I}"
  '\u000D0': "{\\DH}"
  '\u000D1': "{\\~N}"
  '\u000D2': "{\\`O}"
  '\u000D3': "{\\'O}"
  '\u000D4': "{\\^O}"
  '\u000D5': "{\\~O}"
  '\u000D6': "{\\\"O}"
  '\u000D7': "{\\texttimes}"
  '\u000D8': "{\\O}"
  '\u000D9': "{\\`U}"
  '\u000DA': "{\\'U}"
  '\u000DB': "{\\^U}"
  '\u000DC': "{\\\"U}"
  '\u000DD': "{\\'Y}"
  '\u000DE': "{\\TH}"
  '\u000DF': "{\\ss}"
  '\u000E0': "{\\`a}"
  '\u000E1': "{\\'a}"
  '\u000E2': "{\\^a}"
  '\u000E3': "{\\~a}"
  '\u000E4': "{\\\"a}"
  '\u000E5': "{\\aa}"
  '\u000E6': "{\\ae}"
  '\u000E7': "{\\c c}"
  '\u000E8': "{\\`e}"
  '\u000E9': "{\\'e}"
  '\u000EA': "{\\^e}"
  '\u000EB': "{\\\"e}"
  '\u000EC': "{\\`\\i}"
  '\u000ED': "{\\'\\i}"
  '\u000EE': "{\\^\\i}"
  '\u000EF': "{\\\"\\i}"
  '\u000F0': "{\\dh}"
  '\u000F1': "{\\~n}"
  '\u000F2': "{\\`o}"
  '\u000F3': "{\\'o}"
  '\u000F4': "{\\^o}"
  '\u000F5': "{\\~o}"
  '\u000F6': "{\\\"o}"
  '\u000F8': "{\\o}"
  '\u000F9': "{\\`u}"
  '\u000FA': "{\\'u}"
  '\u000FB': "{\\^u}"
  '\u000FC': "{\\\"u}"
  '\u000FD': "{\\'y}"
  '\u000FE': "{\\th}"
  '\u000FF': "{\\\"y}"
  '\u00100': "\\={A}"
  '\u00101': "\\={a}"
  '\u00102': "{\\u A}"
  '\u00103': "{\\u a}"
  '\u00104': "\\k{A}"
  '\u00105': "\\k{a}"
  '\u00106': "{\\'C}"
  '\u00107': "{\\'c}"
  '\u00108': "{\\^C}"
  '\u00109': "{\\^c}"
  '\u0010A': "{\\.C}"
  '\u0010B': "{\\.c}"
  '\u0010C': "{\\v C}"
  '\u0010D': "{\\v c}"
  '\u0010E': "{\\v D}"
  '\u0010F': "{\\v d}"
  '\u00110': "{\\DJ}"
  '\u00111': "{\\dj}"
  '\u00112': "\\={E}"
  '\u00113': "\\={e}"
  '\u00114': "{\\u E}"
  '\u00115': "{\\u e}"
  '\u00116': "{\\.E}"
  '\u00117': "{\\.e}"
  '\u00118': "\\k{E}"
  '\u00119': "\\k{e}"
  '\u0011A': "{\\v E}"
  '\u0011B': "{\\v e}"
  '\u0011C': "{\\^G}"
  '\u0011D': "{\\^g}"
  '\u0011E': "{\\u G}"
  '\u0011F': "{\\u g}"
  '\u00120': "{\\.G}"
  '\u00121': "{\\.g}"
  '\u00122': "{\\c G}"
  '\u00123': "{\\c g}"
  '\u00124': "{\\^H}"
  '\u00125': "{\\^h}"
  '\u00126': "{\\fontencoding{LELA}\\selectfont\\char40}"
  '\u00128': "{\\~I}"
  '\u00129': "{\\~\\i}"
  '\u0012A': "\\={I}"
  '\u0012B': "\\={\\i}"
  '\u0012C': "{\\u I}"
  '\u0012D': "{\\u \\i}"
  '\u0012E': "\\k{I}"
  '\u0012F': "\\k{i}"
  '\u00130': "{\\.I}"
  '\u00131': "{\\i}"
  '\u00132': "IJ"
  '\u00133': "ij"
  '\u00134': "{\\^J}"
  '\u00135': "{\\^\\j}"
  '\u00136': "{\\c K}"
  '\u00137': "{\\c k}"
  '\u00138': "{\\fontencoding{LELA}\\selectfont\\char91}"
  '\u00139': "{\\'L}"
  '\u0013A': "{\\'l}"
  '\u0013B': "{\\c L}"
  '\u0013C': "{\\c l}"
  '\u0013D': "{\\v L}"
  '\u0013E': "{\\v l}"
  '\u0013F': "{\\fontencoding{LELA}\\selectfont\\char201}"
  '\u00140': "{\\fontencoding{LELA}\\selectfont\\char202}"
  '\u00141': "{\\L}"
  '\u00142': "{\\l}"
  '\u00143': "{\\'N}"
  '\u00144': "{\\'n}"
  '\u00145': "{\\c N}"
  '\u00146': "{\\c n}"
  '\u00147': "{\\v N}"
  '\u00148': "{\\v n}"
  '\u00149': "'n"
  '\u0014A': "{\\NG}"
  '\u0014B': "{\\ng}"
  '\u0014C': "\\={O}"
  '\u0014D': "\\={o}"
  '\u0014E': "{\\u O}"
  '\u0014F': "{\\u o}"
  '\u00150': "{\\H O}"
  '\u00151': "{\\H o}"
  '\u00152': "{\\OE}"
  '\u00153': "{\\oe}"
  '\u00154': "{\\'R}"
  '\u00155': "{\\'r}"
  '\u00156': "{\\c R}"
  '\u00157': "{\\c r}"
  '\u00158': "{\\v R}"
  '\u00159': "{\\v r}"
  '\u0015A': "{\\'S}"
  '\u0015B': "{\\'s}"
  '\u0015C': "{\\^S}"
  '\u0015D': "{\\^s}"
  '\u0015E': "{\\c S}"
  '\u0015F': "{\\c s}"
  '\u00160': "{\\v S}"
  '\u00161': "{\\v s}"
  '\u00162': "{\\c T}"
  '\u00163': "{\\c t}"
  '\u00164': "{\\v T}"
  '\u00165': "{\\v t}"
  '\u00166': "{\\fontencoding{LELA}\\selectfont\\char47}"
  '\u00167': "{\\fontencoding{LELA}\\selectfont\\char63}"
  '\u00168': "{\\~U}"
  '\u00169': "{\\~u}"
  '\u0016A': "\\={U}"
  '\u0016B': "\\={u}"
  '\u0016C': "{\\u U}"
  '\u0016D': "{\\u u}"
  '\u0016E': "\\r{U}"
  '\u0016F': "\\r{u}"
  '\u00170': "{\\H U}"
  '\u00171': "{\\H u}"
  '\u00172': "\\k{U}"
  '\u00173': "\\k{u}"
  '\u00174': "{\\^W}"
  '\u00175': "{\\^w}"
  '\u00176': "{\\^Y}"
  '\u00177': "{\\^y}"
  '\u00178': "{\\\"Y}"
  '\u00179': "{\\'Z}"
  '\u0017A': "{\\'z}"
  '\u0017B': "{\\.Z}"
  '\u0017C': "{\\.z}"
  '\u0017D': "{\\v Z}"
  '\u0017E': "{\\v z}"
  '\u00195': "{\\texthvlig}"
  '\u0019E': "{\\textnrleg}"
  '\u001BA': "{\\fontencoding{LELA}\\selectfont\\char195}"
  '\u001C2': "{\\textdoublepipe}"
  '\u001F5': "{\\'g}"
  '\u00258': "{\\fontencoding{LEIP}\\selectfont\\char61}"
  '\u00261': "g"
  '\u00272': "{\\Elzltln}"
  '\u00278': "{\\textphi}"
  '\u0027F': "{\\fontencoding{LEIP}\\selectfont\\char202}"
  '\u0029E': "{\\textturnk}"
  '\u002BC': "'"
  '\u002C7': "{\\textasciicaron}"
  '\u002D8': "{\\textasciibreve}"
  '\u002D9': "{\\textperiodcentered}"
  '\u002DA': "\\r{}"
  '\u002DB': "\\k{}"
  '\u002DC': "{\\texttildelow}"
  '\u002DD': "\\H{}"
  '\u002E5': "\\tone{55}"
  '\u002E6': "\\tone{44}"
  '\u002E7': "\\tone{33}"
  '\u002E8': "\\tone{22}"
  '\u002E9': "\\tone{11}"
  '\u00300': "\\`"
  '\u00301': "\\'"
  '\u00302': "\\^"
  '\u00303': "\\~"
  '\u00304': "\\="
  '\u00306': "\\u"
  '\u00307': "\\."
  '\u00308': "\\\""
  '\u0030A': "\\r"
  '\u0030B': "\\H"
  '\u0030C': "\\v"
  '\u0030F': "\\cyrchar\\C"
  '\u00311': "{\\fontencoding{LECO}\\selectfont\\char177}"
  '\u00318': "{\\fontencoding{LECO}\\selectfont\\char184}"
  '\u00319': "{\\fontencoding{LECO}\\selectfont\\char185}"
  '\u00322': "{\\Elzrh}"
  '\u00327': "\\c"
  '\u00328': "\\k"
  '\u0032B': "{\\fontencoding{LECO}\\selectfont\\char203}"
  '\u0032F': "{\\fontencoding{LECO}\\selectfont\\char207}"
  '\u00335': "{\\Elzxl}"
  '\u00336': "{\\Elzbar}"
  '\u00337': "{\\fontencoding{LECO}\\selectfont\\char215}"
  '\u00338': "{\\fontencoding{LECO}\\selectfont\\char216}"
  '\u0033A': "{\\fontencoding{LECO}\\selectfont\\char218}"
  '\u0033B': "{\\fontencoding{LECO}\\selectfont\\char219}"
  '\u0033C': "{\\fontencoding{LECO}\\selectfont\\char220}"
  '\u0033D': "{\\fontencoding{LECO}\\selectfont\\char221}"
  '\u00361': "{\\fontencoding{LECO}\\selectfont\\char225}"
  '\u00386': "{\\'A}"
  '\u00388': "{\\'E}"
  '\u00389': "{\\'H}"
  '\u0038A': "\\'{}{I}"
  '\u0038C': "\\'{}O"
  '\u003AC': "{\\'$\\alpha$}"
  '\u003B8': "{\\texttheta}"
  '\u003CC': "{\\'o}"
  '\u003D0': "\\Pisymbol{ppi022}{87}"
  '\u003D1': "{\\textvartheta}"
  '\u003F4': "{\\textTheta}"
  '\u00401': "{\\cyrchar\\CYRYO}"
  '\u00402': "{\\cyrchar\\CYRDJE}"
  '\u00403': "\\cyrchar{\\'\\CYRG}"
  '\u00404': "{\\cyrchar\\CYRIE}"
  '\u00405': "{\\cyrchar\\CYRDZE}"
  '\u00406': "{\\cyrchar\\CYRII}"
  '\u00407': "{\\cyrchar\\CYRYI}"
  '\u00408': "{\\cyrchar\\CYRJE}"
  '\u00409': "{\\cyrchar\\CYRLJE}"
  '\u0040A': "{\\cyrchar\\CYRNJE}"
  '\u0040B': "{\\cyrchar\\CYRTSHE}"
  '\u0040C': "\\cyrchar{\\'\\CYRK}"
  '\u0040E': "{\\cyrchar\\CYRUSHRT}"
  '\u0040F': "{\\cyrchar\\CYRDZHE}"
  '\u00410': "{\\cyrchar\\CYRA}"
  '\u00411': "{\\cyrchar\\CYRB}"
  '\u00412': "{\\cyrchar\\CYRV}"
  '\u00413': "{\\cyrchar\\CYRG}"
  '\u00414': "{\\cyrchar\\CYRD}"
  '\u00415': "{\\cyrchar\\CYRE}"
  '\u00416': "{\\cyrchar\\CYRZH}"
  '\u00417': "{\\cyrchar\\CYRZ}"
  '\u00418': "{\\cyrchar\\CYRI}"
  '\u00419': "{\\cyrchar\\CYRISHRT}"
  '\u0041A': "{\\cyrchar\\CYRK}"
  '\u0041B': "{\\cyrchar\\CYRL}"
  '\u0041C': "{\\cyrchar\\CYRM}"
  '\u0041D': "{\\cyrchar\\CYRN}"
  '\u0041E': "{\\cyrchar\\CYRO}"
  '\u0041F': "{\\cyrchar\\CYRP}"
  '\u00420': "{\\cyrchar\\CYRR}"
  '\u00421': "{\\cyrchar\\CYRS}"
  '\u00422': "{\\cyrchar\\CYRT}"
  '\u00423': "{\\cyrchar\\CYRU}"
  '\u00424': "{\\cyrchar\\CYRF}"
  '\u00425': "{\\cyrchar\\CYRH}"
  '\u00426': "{\\cyrchar\\CYRC}"
  '\u00427': "{\\cyrchar\\CYRCH}"
  '\u00428': "{\\cyrchar\\CYRSH}"
  '\u00429': "{\\cyrchar\\CYRSHCH}"
  '\u0042A': "{\\cyrchar\\CYRHRDSN}"
  '\u0042B': "{\\cyrchar\\CYRERY}"
  '\u0042C': "{\\cyrchar\\CYRSFTSN}"
  '\u0042D': "{\\cyrchar\\CYREREV}"
  '\u0042E': "{\\cyrchar\\CYRYU}"
  '\u0042F': "{\\cyrchar\\CYRYA}"
  '\u00430': "{\\cyrchar\\cyra}"
  '\u00431': "{\\cyrchar\\cyrb}"
  '\u00432': "{\\cyrchar\\cyrv}"
  '\u00433': "{\\cyrchar\\cyrg}"
  '\u00434': "{\\cyrchar\\cyrd}"
  '\u00435': "{\\cyrchar\\cyre}"
  '\u00436': "{\\cyrchar\\cyrzh}"
  '\u00437': "{\\cyrchar\\cyrz}"
  '\u00438': "{\\cyrchar\\cyri}"
  '\u00439': "{\\cyrchar\\cyrishrt}"
  '\u0043A': "{\\cyrchar\\cyrk}"
  '\u0043B': "{\\cyrchar\\cyrl}"
  '\u0043C': "{\\cyrchar\\cyrm}"
  '\u0043D': "{\\cyrchar\\cyrn}"
  '\u0043E': "{\\cyrchar\\cyro}"
  '\u0043F': "{\\cyrchar\\cyrp}"
  '\u00440': "{\\cyrchar\\cyrr}"
  '\u00441': "{\\cyrchar\\cyrs}"
  '\u00442': "{\\cyrchar\\cyrt}"
  '\u00443': "{\\cyrchar\\cyru}"
  '\u00444': "{\\cyrchar\\cyrf}"
  '\u00445': "{\\cyrchar\\cyrh}"
  '\u00446': "{\\cyrchar\\cyrc}"
  '\u00447': "{\\cyrchar\\cyrch}"
  '\u00448': "{\\cyrchar\\cyrsh}"
  '\u00449': "{\\cyrchar\\cyrshch}"
  '\u0044A': "{\\cyrchar\\cyrhrdsn}"
  '\u0044B': "{\\cyrchar\\cyrery}"
  '\u0044C': "{\\cyrchar\\cyrsftsn}"
  '\u0044D': "{\\cyrchar\\cyrerev}"
  '\u0044E': "{\\cyrchar\\cyryu}"
  '\u0044F': "{\\cyrchar\\cyrya}"
  '\u00451': "{\\cyrchar\\cyryo}"
  '\u00452': "{\\cyrchar\\cyrdje}"
  '\u00453': "\\cyrchar{\\'\\cyrg}"
  '\u00454': "{\\cyrchar\\cyrie}"
  '\u00455': "{\\cyrchar\\cyrdze}"
  '\u00456': "{\\cyrchar\\cyrii}"
  '\u00457': "{\\cyrchar\\cyryi}"
  '\u00458': "{\\cyrchar\\cyrje}"
  '\u00459': "{\\cyrchar\\cyrlje}"
  '\u0045A': "{\\cyrchar\\cyrnje}"
  '\u0045B': "{\\cyrchar\\cyrtshe}"
  '\u0045C': "\\cyrchar{\\'\\cyrk}"
  '\u0045E': "{\\cyrchar\\cyrushrt}"
  '\u0045F': "{\\cyrchar\\cyrdzhe}"
  '\u00460': "{\\cyrchar\\CYROMEGA}"
  '\u00461': "{\\cyrchar\\cyromega}"
  '\u00462': "{\\cyrchar\\CYRYAT}"
  '\u00464': "{\\cyrchar\\CYRIOTE}"
  '\u00465': "{\\cyrchar\\cyriote}"
  '\u00466': "{\\cyrchar\\CYRLYUS}"
  '\u00467': "{\\cyrchar\\cyrlyus}"
  '\u00468': "{\\cyrchar\\CYRIOTLYUS}"
  '\u00469': "{\\cyrchar\\cyriotlyus}"
  '\u0046A': "{\\cyrchar\\CYRBYUS}"
  '\u0046C': "{\\cyrchar\\CYRIOTBYUS}"
  '\u0046D': "{\\cyrchar\\cyriotbyus}"
  '\u0046E': "{\\cyrchar\\CYRKSI}"
  '\u0046F': "{\\cyrchar\\cyrksi}"
  '\u00470': "{\\cyrchar\\CYRPSI}"
  '\u00471': "{\\cyrchar\\cyrpsi}"
  '\u00472': "{\\cyrchar\\CYRFITA}"
  '\u00474': "{\\cyrchar\\CYRIZH}"
  '\u00478': "{\\cyrchar\\CYRUK}"
  '\u00479': "{\\cyrchar\\cyruk}"
  '\u0047A': "{\\cyrchar\\CYROMEGARND}"
  '\u0047B': "{\\cyrchar\\cyromegarnd}"
  '\u0047C': "{\\cyrchar\\CYROMEGATITLO}"
  '\u0047D': "{\\cyrchar\\cyromegatitlo}"
  '\u0047E': "{\\cyrchar\\CYROT}"
  '\u0047F': "{\\cyrchar\\cyrot}"
  '\u00480': "{\\cyrchar\\CYRKOPPA}"
  '\u00481': "{\\cyrchar\\cyrkoppa}"
  '\u00482': "{\\cyrchar\\cyrthousands}"
  '\u00488': "{\\cyrchar\\cyrhundredthousands}"
  '\u00489': "{\\cyrchar\\cyrmillions}"
  '\u0048C': "{\\cyrchar\\CYRSEMISFTSN}"
  '\u0048D': "{\\cyrchar\\cyrsemisftsn}"
  '\u0048E': "{\\cyrchar\\CYRRTICK}"
  '\u0048F': "{\\cyrchar\\cyrrtick}"
  '\u00490': "{\\cyrchar\\CYRGUP}"
  '\u00491': "{\\cyrchar\\cyrgup}"
  '\u00492': "{\\cyrchar\\CYRGHCRS}"
  '\u00493': "{\\cyrchar\\cyrghcrs}"
  '\u00494': "{\\cyrchar\\CYRGHK}"
  '\u00495': "{\\cyrchar\\cyrghk}"
  '\u00496': "{\\cyrchar\\CYRZHDSC}"
  '\u00497': "{\\cyrchar\\cyrzhdsc}"
  '\u00498': "{\\cyrchar\\CYRZDSC}"
  '\u00499': "{\\cyrchar\\cyrzdsc}"
  '\u0049A': "{\\cyrchar\\CYRKDSC}"
  '\u0049B': "{\\cyrchar\\cyrkdsc}"
  '\u0049C': "{\\cyrchar\\CYRKVCRS}"
  '\u0049D': "{\\cyrchar\\cyrkvcrs}"
  '\u0049E': "{\\cyrchar\\CYRKHCRS}"
  '\u0049F': "{\\cyrchar\\cyrkhcrs}"
  '\u004A0': "{\\cyrchar\\CYRKBEAK}"
  '\u004A1': "{\\cyrchar\\cyrkbeak}"
  '\u004A2': "{\\cyrchar\\CYRNDSC}"
  '\u004A3': "{\\cyrchar\\cyrndsc}"
  '\u004A4': "{\\cyrchar\\CYRNG}"
  '\u004A5': "{\\cyrchar\\cyrng}"
  '\u004A6': "{\\cyrchar\\CYRPHK}"
  '\u004A7': "{\\cyrchar\\cyrphk}"
  '\u004A8': "{\\cyrchar\\CYRABHHA}"
  '\u004A9': "{\\cyrchar\\cyrabhha}"
  '\u004AA': "{\\cyrchar\\CYRSDSC}"
  '\u004AB': "{\\cyrchar\\cyrsdsc}"
  '\u004AC': "{\\cyrchar\\CYRTDSC}"
  '\u004AD': "{\\cyrchar\\cyrtdsc}"
  '\u004AE': "{\\cyrchar\\CYRY}"
  '\u004AF': "{\\cyrchar\\cyry}"
  '\u004B0': "{\\cyrchar\\CYRYHCRS}"
  '\u004B1': "{\\cyrchar\\cyryhcrs}"
  '\u004B2': "{\\cyrchar\\CYRHDSC}"
  '\u004B3': "{\\cyrchar\\cyrhdsc}"
  '\u004B4': "{\\cyrchar\\CYRTETSE}"
  '\u004B5': "{\\cyrchar\\cyrtetse}"
  '\u004B6': "{\\cyrchar\\CYRCHRDSC}"
  '\u004B7': "{\\cyrchar\\cyrchrdsc}"
  '\u004B8': "{\\cyrchar\\CYRCHVCRS}"
  '\u004B9': "{\\cyrchar\\cyrchvcrs}"
  '\u004BA': "{\\cyrchar\\CYRSHHA}"
  '\u004BB': "{\\cyrchar\\cyrshha}"
  '\u004BC': "{\\cyrchar\\CYRABHCH}"
  '\u004BD': "{\\cyrchar\\cyrabhch}"
  '\u004BE': "{\\cyrchar\\CYRABHCHDSC}"
  '\u004BF': "{\\cyrchar\\cyrabhchdsc}"
  '\u004C0': "{\\cyrchar\\CYRpalochka}"
  '\u004C3': "{\\cyrchar\\CYRKHK}"
  '\u004C4': "{\\cyrchar\\cyrkhk}"
  '\u004C7': "{\\cyrchar\\CYRNHK}"
  '\u004C8': "{\\cyrchar\\cyrnhk}"
  '\u004CB': "{\\cyrchar\\CYRCHLDSC}"
  '\u004CC': "{\\cyrchar\\cyrchldsc}"
  '\u004D4': "{\\cyrchar\\CYRAE}"
  '\u004D5': "{\\cyrchar\\cyrae}"
  '\u004D8': "{\\cyrchar\\CYRSCHWA}"
  '\u004D9': "{\\cyrchar\\cyrschwa}"
  '\u004E0': "{\\cyrchar\\CYRABHDZE}"
  '\u004E1': "{\\cyrchar\\cyrabhdze}"
  '\u004E8': "{\\cyrchar\\CYROTLD}"
  '\u004E9': "{\\cyrchar\\cyrotld}"
  '\u02002': "\\hspace{0.6em}"
  '\u02003': "\\hspace{1em}"
  '\u02004': "\\hspace{0.33em}"
  '\u02005': "\\hspace{0.25em}"
  '\u02006': "\\hspace{0.166em}"
  '\u02007': "\\hphantom{0}"
  '\u02008': "\\hphantom{,}"
  '\u02009': "\\hspace{0.167em}"
  '\u02010': "-"
  '\u02013': "{\\textendash}"
  '\u02014': "{\\textemdash}"
  '\u02015': "\\rule{1em}{1pt}"
  '\u02018': "`"
  '\u02019': "'"
  '\u0201A': ","
  '\u0201C': "{\\textquotedblleft}"
  '\u0201D': "{\\textquotedblright}"
  '\u0201E': ",,"
  '\u02020': "{\\textdagger}"
  '\u02021': "{\\textdaggerdbl}"
  '\u02022': "{\\textbullet}"
  '\u02024': "."
  '\u02025': ".."
  '\u02026': "{\\ldots}"
  '\u02030': "{\\textperthousand}"
  '\u02031': "{\\textpertenthousand}"
  '\u02039': "{\\guilsinglleft}"
  '\u0203A': "{\\guilsinglright}"
  '\u0205F': "{\\mkern4mu}"
  '\u02060': "{\\nolinebreak}"
  '\u020A7': "\\ensuremath{\\Elzpes}"
  '\u020AC': "{\\mbox{\\texteuro}}"
  '\u0210A': "\\mathscr{g}"
  '\u02116': "{\\cyrchar\\textnumero}"
  '\u02122': "{\\texttrademark}"
  '\u0212B': "{\\AA}"
  '\u02212': "-"
  '\u02254': ":="
  '\u02305': "{\\barwedge}"
  '\u02423': "{\\textvisiblespace}"
  '\u02460': "\\ding{172}"
  '\u02461': "\\ding{173}"
  '\u02462': "\\ding{174}"
  '\u02463': "\\ding{175}"
  '\u02464': "\\ding{176}"
  '\u02465': "\\ding{177}"
  '\u02466': "\\ding{178}"
  '\u02467': "\\ding{179}"
  '\u02468': "\\ding{180}"
  '\u02469': "\\ding{181}"
  '\u025A0': "\\ding{110}"
  '\u025B2': "\\ding{115}"
  '\u025BC': "\\ding{116}"
  '\u025C6': "\\ding{117}"
  '\u025CF': "\\ding{108}"
  '\u025D7': "\\ding{119}"
  '\u02605': "\\ding{72}"
  '\u02606': "\\ding{73}"
  '\u0260E': "\\ding{37}"
  '\u0261B': "\\ding{42}"
  '\u0261E': "\\ding{43}"
  '\u0263E': "{\\rightmoon}"
  '\u0263F': "{\\mercury}"
  '\u02640': "{\\venus}"
  '\u02642': "{\\male}"
  '\u02643': "{\\jupiter}"
  '\u02644': "{\\saturn}"
  '\u02645': "{\\uranus}"
  '\u02646': "{\\neptune}"
  '\u02647': "{\\pluto}"
  '\u02648': "{\\aries}"
  '\u02649': "{\\taurus}"
  '\u0264A': "{\\gemini}"
  '\u0264B': "{\\cancer}"
  '\u0264C': "{\\leo}"
  '\u0264D': "{\\virgo}"
  '\u0264E': "{\\libra}"
  '\u0264F': "{\\scorpio}"
  '\u02650': "{\\sagittarius}"
  '\u02651': "{\\capricornus}"
  '\u02652': "{\\aquarius}"
  '\u02653': "{\\pisces}"
  '\u02660': "\\ding{171}"
  '\u02663': "\\ding{168}"
  '\u02665': "\\ding{170}"
  '\u02666': "\\ding{169}"
  '\u02669': "{\\quarternote}"
  '\u0266A': "{\\eighthnote}"
  '\u02701': "\\ding{33}"
  '\u02702': "\\ding{34}"
  '\u02703': "\\ding{35}"
  '\u02704': "\\ding{36}"
  '\u02706': "\\ding{38}"
  '\u02707': "\\ding{39}"
  '\u02708': "\\ding{40}"
  '\u02709': "\\ding{41}"
  '\u0270C': "\\ding{44}"
  '\u0270D': "\\ding{45}"
  '\u0270E': "\\ding{46}"
  '\u0270F': "\\ding{47}"
  '\u02710': "\\ding{48}"
  '\u02711': "\\ding{49}"
  '\u02712': "\\ding{50}"
  '\u02713': "\\ding{51}"
  '\u02714': "\\ding{52}"
  '\u02715': "\\ding{53}"
  '\u02716': "\\ding{54}"
  '\u02717': "\\ding{55}"
  '\u02718': "\\ding{56}"
  '\u02719': "\\ding{57}"
  '\u0271A': "\\ding{58}"
  '\u0271B': "\\ding{59}"
  '\u0271C': "\\ding{60}"
  '\u0271D': "\\ding{61}"
  '\u0271E': "\\ding{62}"
  '\u0271F': "\\ding{63}"
  '\u02720': "\\ding{64}"
  '\u02721': "\\ding{65}"
  '\u02722': "\\ding{66}"
  '\u02723': "\\ding{67}"
  '\u02724': "\\ding{68}"
  '\u02725': "\\ding{69}"
  '\u02726': "\\ding{70}"
  '\u02727': "\\ding{71}"
  '\u02729': "\\ding{73}"
  '\u0272A': "\\ding{74}"
  '\u0272B': "\\ding{75}"
  '\u0272C': "\\ding{76}"
  '\u0272D': "\\ding{77}"
  '\u0272E': "\\ding{78}"
  '\u0272F': "\\ding{79}"
  '\u02730': "\\ding{80}"
  '\u02731': "\\ding{81}"
  '\u02732': "\\ding{82}"
  '\u02733': "\\ding{83}"
  '\u02734': "\\ding{84}"
  '\u02735': "\\ding{85}"
  '\u02736': "\\ding{86}"
  '\u02737': "\\ding{87}"
  '\u02738': "\\ding{88}"
  '\u02739': "\\ding{89}"
  '\u0273A': "\\ding{90}"
  '\u0273B': "\\ding{91}"
  '\u0273C': "\\ding{92}"
  '\u0273D': "\\ding{93}"
  '\u0273E': "\\ding{94}"
  '\u0273F': "\\ding{95}"
  '\u02740': "\\ding{96}"
  '\u02741': "\\ding{97}"
  '\u02742': "\\ding{98}"
  '\u02743': "\\ding{99}"
  '\u02744': "\\ding{100}"
  '\u02745': "\\ding{101}"
  '\u02746': "\\ding{102}"
  '\u02747': "\\ding{103}"
  '\u02748': "\\ding{104}"
  '\u02749': "\\ding{105}"
  '\u0274A': "\\ding{106}"
  '\u0274B': "\\ding{107}"
  '\u0274D': "\\ding{109}"
  '\u0274F': "\\ding{111}"
  '\u02750': "\\ding{112}"
  '\u02751': "\\ding{113}"
  '\u02752': "\\ding{114}"
  '\u02756': "\\ding{118}"
  '\u02758': "\\ding{120}"
  '\u02759': "\\ding{121}"
  '\u0275A': "\\ding{122}"
  '\u0275B': "\\ding{123}"
  '\u0275C': "\\ding{124}"
  '\u0275D': "\\ding{125}"
  '\u0275E': "\\ding{126}"
  '\u02761': "\\ding{161}"
  '\u02762': "\\ding{162}"
  '\u02763': "\\ding{163}"
  '\u02764': "\\ding{164}"
  '\u02765': "\\ding{165}"
  '\u02766': "\\ding{166}"
  '\u02767': "\\ding{167}"
  '\u02776': "\\ding{182}"
  '\u02777': "\\ding{183}"
  '\u02778': "\\ding{184}"
  '\u02779': "\\ding{185}"
  '\u0277A': "\\ding{186}"
  '\u0277B': "\\ding{187}"
  '\u0277C': "\\ding{188}"
  '\u0277D': "\\ding{189}"
  '\u0277E': "\\ding{190}"
  '\u0277F': "\\ding{191}"
  '\u02780': "\\ding{192}"
  '\u02781': "\\ding{193}"
  '\u02782': "\\ding{194}"
  '\u02783': "\\ding{195}"
  '\u02784': "\\ding{196}"
  '\u02785': "\\ding{197}"
  '\u02786': "\\ding{198}"
  '\u02787': "\\ding{199}"
  '\u02788': "\\ding{200}"
  '\u02789': "\\ding{201}"
  '\u0278A': "\\ding{202}"
  '\u0278B': "\\ding{203}"
  '\u0278C': "\\ding{204}"
  '\u0278D': "\\ding{205}"
  '\u0278E': "\\ding{206}"
  '\u0278F': "\\ding{207}"
  '\u02790': "\\ding{208}"
  '\u02791': "\\ding{209}"
  '\u02792': "\\ding{210}"
  '\u02793': "\\ding{211}"
  '\u02794': "\\ding{212}"
  '\u02798': "\\ding{216}"
  '\u02799': "\\ding{217}"
  '\u0279A': "\\ding{218}"
  '\u0279B': "\\ding{219}"
  '\u0279C': "\\ding{220}"
  '\u0279D': "\\ding{221}"
  '\u0279E': "\\ding{222}"
  '\u0279F': "\\ding{223}"
  '\u027A0': "\\ding{224}"
  '\u027A1': "\\ding{225}"
  '\u027A2': "\\ding{226}"
  '\u027A3': "\\ding{227}"
  '\u027A4': "\\ding{228}"
  '\u027A5': "\\ding{229}"
  '\u027A6': "\\ding{230}"
  '\u027A7': "\\ding{231}"
  '\u027A8': "\\ding{232}"
  '\u027A9': "\\ding{233}"
  '\u027AA': "\\ding{234}"
  '\u027AB': "\\ding{235}"
  '\u027AC': "\\ding{236}"
  '\u027AD': "\\ding{237}"
  '\u027AE': "\\ding{238}"
  '\u027AF': "\\ding{239}"
  '\u027B1': "\\ding{241}"
  '\u027B2': "\\ding{242}"
  '\u027B3': "\\ding{243}"
  '\u027B4': "\\ding{244}"
  '\u027B5': "\\ding{245}"
  '\u027B6': "\\ding{246}"
  '\u027B7': "\\ding{247}"
  '\u027B8': "\\ding{248}"
  '\u027B9': "\\ding{249}"
  '\u027BA': "\\ding{250}"
  '\u027BB': "\\ding{251}"
  '\u027BC': "\\ding{252}"
  '\u027BD': "\\ding{253}"
  '\u027BE': "\\ding{254}"
  '\u027E8': "{\\langle}"
  '\u027E9': "{\\rangle}"
  '\u0FB00': "ff"
  '\u0FB01': "fi"
  '\u0FB02': "fl"
  '\u0FB03': "ffi"
  '\u0FB04': "ffl"
  '\u1D6B9': "\\mathbf{\\vartheta}"
  '\u1D6DD': "\\mathbf{\\vartheta}"
  '\u1D6DE': "\\mathbf{\\varkappa}"
  '\u1D6DF': "\\mathbf{\\phi}"
  '\u1D6E0': "\\mathbf{\\varrho}"
  '\u1D6E1': "\\mathbf{\\varpi}"
  '\u1D6F3': "\\mathsl{\\vartheta}"
  '\u1D717': "\\mathsl{\\vartheta}"
  '\u1D718': "\\mathsl{\\varkappa}"
  '\u1D719': "\\mathsl{\\phi}"
  '\u1D71A': "\\mathsl{\\varrho}"
  '\u1D71B': "\\mathsl{\\varpi}"
  '\u1D72D': "\\mathbit{O}"
  '\u1D751': "\\mathbit{\\vartheta}"
  '\u1D752': "\\mathbit{\\varkappa}"
  '\u1D753': "\\mathbit{\\phi}"
  '\u1D754': "\\mathbit{\\varrho}"
  '\u1D755': "\\mathbit{\\varpi}"
  '\u1D767': "\\mathsfbf{\\vartheta}"
  '\u1D78B': "\\mathsfbf{\\vartheta}"
  '\u1D78C': "\\mathsfbf{\\varkappa}"
  '\u1D78D': "\\mathsfbf{\\phi}"
  '\u1D78E': "\\mathsfbf{\\varrho}"
  '\u1D78F': "\\mathsfbf{\\varpi}"
  '\u1D7A1': "\\mathsfbfsl{\\vartheta}"
  '\u1D7C5': "\\mathsfbfsl{\\vartheta}"
  '\u1D7C6': "\\mathsfbfsl{\\varkappa}"
  '\u1D7C7': "\\mathsfbfsl{\\phi}"
  '\u1D7C8': "\\mathsfbfsl{\\varrho}"
  '\u1D7C9': "\\mathsfbfsl{\\varpi}"
  '&': "\\&"
  '\uFFFD': "\\dbend"
LaTeX.toUnicode =
  "\\#": '#'
  "{\\textdollar}": '$'
  "\\textdollar ": '$'
  "\\%": '%'
  "\\&": '&'
  "<": '<'
  ">": '>'
  "\\backslash": '\\'
  "\\^{}": '^'
  "\\_": '_'
  "\\{": '{'
  "\\}": '}'
  "{\\textasciitilde}": '~'
  "\\textasciitilde ": '~'
  " ": '\u000A0'
  "{\\textexclamdown}": '\u000A1'
  "\\textexclamdown ": '\u000A1'
  "{\\textcent}": '\u000A2'
  "\\textcent ": '\u000A2'
  "{\\textsterling}": '\u000A3'
  "\\textsterling ": '\u000A3'
  "{\\textcurrency}": '\u000A4'
  "\\textcurrency ": '\u000A4'
  "{\\textyen}": '\u000A5'
  "\\textyen ": '\u000A5'
  "{\\textbrokenbar}": '\u000A6'
  "\\textbrokenbar ": '\u000A6'
  "{\\textsection}": '\u000A7'
  "\\textsection ": '\u000A7'
  "{\\textasciidieresis}": '\u000A8'
  "\\textasciidieresis ": '\u000A8'
  "{\\textcopyright}": '\u000A9'
  "\\textcopyright ": '\u000A9'
  "{\\textordfeminine}": '\u000AA'
  "\\textordfeminine ": '\u000AA'
  "{\\guillemotleft}": '\u000AB'
  "\\guillemotleft ": '\u000AB'
  "{\\lnot}": '\u000AC'
  "\\lnot ": '\u000AC'
  "\\-": '\u000AD'
  "{\\textregistered}": '\u000AE'
  "\\textregistered ": '\u000AE'
  "{\\textasciimacron}": '\u000AF'
  "\\textasciimacron ": '\u000AF'
  "{\\textdegree}": '\u000B0'
  "\\textdegree ": '\u000B0'
  "{\\pm}": '\u000B1'
  "\\pm ": '\u000B1'
  "{^2}": '\u000B2'
  "{^3}": '\u000B3'
  "{\\textasciiacute}": '\u000B4'
  "\\textasciiacute ": '\u000B4'
  "\\mathrm{\\mu}": '\u000B5'
  "{\\textparagraph}": '\u000B6'
  "\\textparagraph ": '\u000B6'
  "{\\cdot}": '\u000B7'
  "\\cdot ": '\u000B7'
  "\\c{}": '\u000B8'
  "{^1}": '\u000B9'
  "{\\textordmasculine}": '\u000BA'
  "\\textordmasculine ": '\u000BA'
  "{\\guillemotright}": '\u000BB'
  "\\guillemotright ": '\u000BB'
  "{\\textonequarter}": '\u000BC'
  "\\textonequarter ": '\u000BC'
  "{\\textonehalf}": '\u000BD'
  "\\textonehalf ": '\u000BD'
  "{\\textthreequarters}": '\u000BE'
  "\\textthreequarters ": '\u000BE'
  "{\\textquestiondown}": '\u000BF'
  "\\textquestiondown ": '\u000BF'
  "{\\`A}": '\u000C0'
  "{\\'A}": '\u000C1'
  "{\\^A}": '\u000C2'
  "{\\~A}": '\u000C3'
  "{\\\"A}": '\u000C4'
  "{\\AA}": '\u000C5'
  "\\AA ": '\u000C5'
  "{\\AE}": '\u000C6'
  "\\AE ": '\u000C6'
  "{\\c C}": '\u000C7'
  "{\\`E}": '\u000C8'
  "{\\'E}": '\u000C9'
  "{\\^E}": '\u000CA'
  "{\\\"E}": '\u000CB'
  "{\\`I}": '\u000CC'
  "{\\'I}": '\u000CD'
  "{\\^I}": '\u000CE'
  "{\\\"I}": '\u000CF'
  "{\\DH}": '\u000D0'
  "\\DH ": '\u000D0'
  "{\\~N}": '\u000D1'
  "{\\`O}": '\u000D2'
  "{\\'O}": '\u000D3'
  "{\\^O}": '\u000D4'
  "{\\~O}": '\u000D5'
  "{\\\"O}": '\u000D6'
  "{\\texttimes}": '\u000D7'
  "\\texttimes ": '\u000D7'
  "{\\O}": '\u000D8'
  "\\O ": '\u000D8'
  "{\\`U}": '\u000D9'
  "{\\'U}": '\u000DA'
  "{\\^U}": '\u000DB'
  "{\\\"U}": '\u000DC'
  "{\\'Y}": '\u000DD'
  "{\\TH}": '\u000DE'
  "\\TH ": '\u000DE'
  "{\\ss}": '\u000DF'
  "\\ss ": '\u000DF'
  "{\\`a}": '\u000E0'
  "{\\'a}": '\u000E1'
  "{\\^a}": '\u000E2'
  "{\\~a}": '\u000E3'
  "{\\\"a}": '\u000E4'
  "{\\aa}": '\u000E5'
  "\\aa ": '\u000E5'
  "{\\ae}": '\u000E6'
  "\\ae ": '\u000E6'
  "{\\c c}": '\u000E7'
  "{\\`e}": '\u000E8'
  "{\\'e}": '\u000E9'
  "{\\^e}": '\u000EA'
  "{\\\"e}": '\u000EB'
  "{\\`\\i}": '\u000EC'
  "{\\'\\i}": '\u000ED'
  "{\\^\\i}": '\u000EE'
  "{\\\"\\i}": '\u000EF'
  "{\\dh}": '\u000F0'
  "\\dh ": '\u000F0'
  "{\\~n}": '\u000F1'
  "{\\`o}": '\u000F2'
  "{\\'o}": '\u000F3'
  "{\\^o}": '\u000F4'
  "{\\~o}": '\u000F5'
  "{\\\"o}": '\u000F6'
  "{\\div}": '\u000F7'
  "\\div ": '\u000F7'
  "{\\o}": '\u000F8'
  "\\o ": '\u000F8'
  "{\\`u}": '\u000F9'
  "{\\'u}": '\u000FA'
  "{\\^u}": '\u000FB'
  "{\\\"u}": '\u000FC'
  "{\\'y}": '\u000FD'
  "{\\th}": '\u000FE'
  "\\th ": '\u000FE'
  "{\\\"y}": '\u000FF'
  "\\={A}": '\u00100'
  "\\=A": '\u00100'
  "\\={a}": '\u00101'
  "\\=a": '\u00101'
  "{\\u A}": '\u00102'
  "{\\u a}": '\u00103'
  "\\k{A}": '\u00104'
  "\\k{a}": '\u00105'
  "{\\'C}": '\u00106'
  "{\\'c}": '\u00107'
  "{\\^C}": '\u00108'
  "{\\^c}": '\u00109'
  "{\\.C}": '\u0010A'
  "{\\.c}": '\u0010B'
  "{\\v C}": '\u0010C'
  "{\\v c}": '\u0010D'
  "{\\v D}": '\u0010E'
  "{\\v d}": '\u0010F'
  "{\\DJ}": '\u00110'
  "\\DJ ": '\u00110'
  "{\\dj}": '\u00111'
  "\\dj ": '\u00111'
  "\\={E}": '\u00112'
  "\\=E": '\u00112'
  "\\={e}": '\u00113'
  "\\=e": '\u00113'
  "{\\u E}": '\u00114'
  "{\\u e}": '\u00115'
  "{\\.E}": '\u00116'
  "{\\.e}": '\u00117'
  "\\k{E}": '\u00118'
  "\\k{e}": '\u00119'
  "{\\v E}": '\u0011A'
  "{\\v e}": '\u0011B'
  "{\\^G}": '\u0011C'
  "{\\^g}": '\u0011D'
  "{\\u G}": '\u0011E'
  "{\\u g}": '\u0011F'
  "{\\.G}": '\u00120'
  "{\\.g}": '\u00121'
  "{\\c G}": '\u00122'
  "{\\c g}": '\u00123'
  "{\\^H}": '\u00124'
  "{\\^h}": '\u00125'
  "{\\fontencoding{LELA}\\selectfont\\char40}": '\u00126'
  "{\\Elzxh}": '\u00127'
  "\\Elzxh ": '\u00127'
  "{\\~I}": '\u00128'
  "{\\~\\i}": '\u00129'
  "\\={I}": '\u0012A'
  "\\=I": '\u0012A'
  "\\={\\i}": '\u0012B'
  "{\\u I}": '\u0012C'
  "{\\u \\i}": '\u0012D'
  "\\k{I}": '\u0012E'
  "\\k{i}": '\u0012F'
  "{\\.I}": '\u00130'
  "{\\i}": '\u00131'
  "\\i ": '\u00131'
  "{\\^J}": '\u00134'
  "{\\^\\j}": '\u00135'
  "{\\c K}": '\u00136'
  "{\\c k}": '\u00137'
  "{\\fontencoding{LELA}\\selectfont\\char91}": '\u00138'
  "{\\'L}": '\u00139'
  "{\\'l}": '\u0013A'
  "{\\c L}": '\u0013B'
  "{\\c l}": '\u0013C'
  "{\\v L}": '\u0013D'
  "{\\v l}": '\u0013E'
  "{\\fontencoding{LELA}\\selectfont\\char201}": '\u0013F'
  "{\\fontencoding{LELA}\\selectfont\\char202}": '\u00140'
  "{\\L}": '\u00141'
  "\\L ": '\u00141'
  "{\\l}": '\u00142'
  "\\l ": '\u00142'
  "{\\'N}": '\u00143'
  "{\\'n}": '\u00144'
  "{\\c N}": '\u00145'
  "{\\c n}": '\u00146'
  "{\\v N}": '\u00147'
  "{\\v n}": '\u00148'
  "'n": '\u00149'
  "{\\NG}": '\u0014A'
  "\\NG ": '\u0014A'
  "{\\ng}": '\u0014B'
  "\\ng ": '\u0014B'
  "\\={O}": '\u0014C'
  "\\=O": '\u0014C'
  "\\={o}": '\u0014D'
  "\\=o": '\u0014D'
  "{\\u O}": '\u0014E'
  "{\\u o}": '\u0014F'
  "{\\H O}": '\u00150'
  "{\\H o}": '\u00151'
  "{\\OE}": '\u00152'
  "\\OE ": '\u00152'
  "{\\oe}": '\u00153'
  "\\oe ": '\u00153'
  "{\\'R}": '\u00154'
  "{\\'r}": '\u00155'
  "{\\c R}": '\u00156'
  "{\\c r}": '\u00157'
  "{\\v R}": '\u00158'
  "{\\v r}": '\u00159'
  "{\\'S}": '\u0015A'
  "{\\'s}": '\u0015B'
  "{\\^S}": '\u0015C'
  "{\\^s}": '\u0015D'
  "{\\c S}": '\u0015E'
  "{\\c s}": '\u0015F'
  "{\\v S}": '\u00160'
  "{\\v s}": '\u00161'
  "{\\c T}": '\u00162'
  "{\\c t}": '\u00163'
  "{\\v T}": '\u00164'
  "{\\v t}": '\u00165'
  "{\\fontencoding{LELA}\\selectfont\\char47}": '\u00166'
  "{\\fontencoding{LELA}\\selectfont\\char63}": '\u00167'
  "{\\~U}": '\u00168'
  "{\\~u}": '\u00169'
  "\\={U}": '\u0016A'
  "\\=U": '\u0016A'
  "\\={u}": '\u0016B'
  "\\=u": '\u0016B'
  "{\\u U}": '\u0016C'
  "{\\u u}": '\u0016D'
  "\\r{U}": '\u0016E'
  "\\r{u}": '\u0016F'
  "{\\H U}": '\u00170'
  "{\\H u}": '\u00171'
  "\\k{U}": '\u00172'
  "\\k{u}": '\u00173'
  "{\\^W}": '\u00174'
  "{\\^w}": '\u00175'
  "{\\^Y}": '\u00176'
  "{\\^y}": '\u00177'
  "{\\\"Y}": '\u00178'
  "{\\'Z}": '\u00179'
  "{\\'z}": '\u0017A'
  "{\\.Z}": '\u0017B'
  "{\\.z}": '\u0017C'
  "{\\v Z}": '\u0017D'
  "{\\v z}": '\u0017E'
  "{\\texthvlig}": '\u00195'
  "\\texthvlig ": '\u00195'
  "{\\textnrleg}": '\u0019E'
  "\\textnrleg ": '\u0019E'
  "{\\eth}": '\u001AA'
  "\\eth ": '\u001AA'
  "{\\fontencoding{LELA}\\selectfont\\char195}": '\u001BA'
  "{\\textdoublepipe}": '\u001C2'
  "\\textdoublepipe ": '\u001C2'
  "{\\'g}": '\u001F5'
  "{\\Elztrna}": '\u00250'
  "\\Elztrna ": '\u00250'
  "{\\Elztrnsa}": '\u00252'
  "\\Elztrnsa ": '\u00252'
  "{\\Elzopeno}": '\u00254'
  "\\Elzopeno ": '\u00254'
  "{\\Elzrtld}": '\u00256'
  "\\Elzrtld ": '\u00256'
  "{\\fontencoding{LEIP}\\selectfont\\char61}": '\u00258'
  "{\\Elzschwa}": '\u00259'
  "\\Elzschwa ": '\u00259'
  "{\\varepsilon}": '\u0025B'
  "\\varepsilon ": '\u0025B'
  "{\\Elzpgamma}": '\u00263'
  "\\Elzpgamma ": '\u00263'
  "{\\Elzpbgam}": '\u00264'
  "\\Elzpbgam ": '\u00264'
  "{\\Elztrnh}": '\u00265'
  "\\Elztrnh ": '\u00265'
  "{\\Elzbtdl}": '\u0026C'
  "\\Elzbtdl ": '\u0026C'
  "{\\Elzrtll}": '\u0026D'
  "\\Elzrtll ": '\u0026D'
  "{\\Elztrnm}": '\u0026F'
  "\\Elztrnm ": '\u0026F'
  "{\\Elztrnmlr}": '\u00270'
  "\\Elztrnmlr ": '\u00270'
  "{\\Elzltlmr}": '\u00271'
  "\\Elzltlmr ": '\u00271'
  "{\\Elzltln}": '\u00272'
  "\\Elzltln ": '\u00272'
  "{\\Elzrtln}": '\u00273'
  "\\Elzrtln ": '\u00273'
  "{\\Elzclomeg}": '\u00277'
  "\\Elzclomeg ": '\u00277'
  "{\\textphi}": '\u00278'
  "\\textphi ": '\u00278'
  "{\\Elztrnr}": '\u00279'
  "\\Elztrnr ": '\u00279'
  "{\\Elztrnrl}": '\u0027A'
  "\\Elztrnrl ": '\u0027A'
  "{\\Elzrttrnr}": '\u0027B'
  "\\Elzrttrnr ": '\u0027B'
  "{\\Elzrl}": '\u0027C'
  "\\Elzrl ": '\u0027C'
  "{\\Elzrtlr}": '\u0027D'
  "\\Elzrtlr ": '\u0027D'
  "{\\Elzfhr}": '\u0027E'
  "\\Elzfhr ": '\u0027E'
  "{\\fontencoding{LEIP}\\selectfont\\char202}": '\u0027F'
  "{\\Elzrtls}": '\u00282'
  "\\Elzrtls ": '\u00282'
  "{\\Elzesh}": '\u00283'
  "\\Elzesh ": '\u00283'
  "{\\Elztrnt}": '\u00287'
  "\\Elztrnt ": '\u00287'
  "{\\Elzrtlt}": '\u00288'
  "\\Elzrtlt ": '\u00288'
  "{\\Elzpupsil}": '\u0028A'
  "\\Elzpupsil ": '\u0028A'
  "{\\Elzpscrv}": '\u0028B'
  "\\Elzpscrv ": '\u0028B'
  "{\\Elzinvv}": '\u0028C'
  "\\Elzinvv ": '\u0028C'
  "{\\Elzinvw}": '\u0028D'
  "\\Elzinvw ": '\u0028D'
  "{\\Elztrny}": '\u0028E'
  "\\Elztrny ": '\u0028E'
  "{\\Elzrtlz}": '\u00290'
  "\\Elzrtlz ": '\u00290'
  "{\\Elzyogh}": '\u00292'
  "\\Elzyogh ": '\u00292'
  "{\\Elzglst}": '\u00294'
  "\\Elzglst ": '\u00294'
  "{\\Elzreglst}": '\u00295'
  "\\Elzreglst ": '\u00295'
  "{\\Elzinglst}": '\u00296'
  "\\Elzinglst ": '\u00296'
  "{\\textturnk}": '\u0029E'
  "\\textturnk ": '\u0029E'
  "{\\Elzdyogh}": '\u002A4'
  "\\Elzdyogh ": '\u002A4'
  "{\\Elztesh}": '\u002A7'
  "\\Elztesh ": '\u002A7'
  "'": '\u002BC'
  "{\\textasciicaron}": '\u002C7'
  "\\textasciicaron ": '\u002C7'
  "{\\Elzverts}": '\u002C8'
  "\\Elzverts ": '\u002C8'
  "{\\Elzverti}": '\u002CC'
  "\\Elzverti ": '\u002CC'
  "{\\Elzlmrk}": '\u002D0'
  "\\Elzlmrk ": '\u002D0'
  "{\\Elzhlmrk}": '\u002D1'
  "\\Elzhlmrk ": '\u002D1'
  "{\\Elzsbrhr}": '\u002D2'
  "\\Elzsbrhr ": '\u002D2'
  "{\\Elzsblhr}": '\u002D3'
  "\\Elzsblhr ": '\u002D3'
  "{\\Elzrais}": '\u002D4'
  "\\Elzrais ": '\u002D4'
  "{\\Elzlow}": '\u002D5'
  "\\Elzlow ": '\u002D5'
  "{\\textasciibreve}": '\u002D8'
  "\\textasciibreve ": '\u002D8'
  "{\\textperiodcentered}": '\u002D9'
  "\\textperiodcentered ": '\u002D9'
  "\\r{}": '\u002DA'
  "\\k{}": '\u002DB'
  "{\\texttildelow}": '\u002DC'
  "\\texttildelow ": '\u002DC'
  "\\H{}": '\u002DD'
  "\\tone{55}": '\u002E5'
  "\\tone{44}": '\u002E6'
  "\\tone{33}": '\u002E7'
  "\\tone{22}": '\u002E8'
  "\\tone{11}": '\u002E9'
  "\\`": '\u00300'
  "\\'": '\u00301'
  "\\^": '\u00302'
  "\\~": '\u00303'
  "\\=": '\u00304'
  "\\u": '\u00306'
  "\\.": '\u00307'
  "\\\"": '\u00308'
  "\\r": '\u0030A'
  "\\H": '\u0030B'
  "\\v": '\u0030C'
  "\\cyrchar\\C": '\u0030F'
  "{\\fontencoding{LECO}\\selectfont\\char177}": '\u00311'
  "{\\fontencoding{LECO}\\selectfont\\char184}": '\u00318'
  "{\\fontencoding{LECO}\\selectfont\\char185}": '\u00319'
  "{\\Elzpalh}": '\u00321'
  "\\Elzpalh ": '\u00321'
  "{\\Elzrh}": '\u00322'
  "\\Elzrh ": '\u00322'
  "\\c": '\u00327'
  "\\k": '\u00328'
  "{\\Elzsbbrg}": '\u0032A'
  "\\Elzsbbrg ": '\u0032A'
  "{\\fontencoding{LECO}\\selectfont\\char203}": '\u0032B'
  "{\\fontencoding{LECO}\\selectfont\\char207}": '\u0032F'
  "{\\Elzxl}": '\u00335'
  "\\Elzxl ": '\u00335'
  "{\\Elzbar}": '\u00336'
  "\\Elzbar ": '\u00336'
  "{\\fontencoding{LECO}\\selectfont\\char215}": '\u00337'
  "{\\fontencoding{LECO}\\selectfont\\char216}": '\u00338'
  "{\\fontencoding{LECO}\\selectfont\\char218}": '\u0033A'
  "{\\fontencoding{LECO}\\selectfont\\char219}": '\u0033B'
  "{\\fontencoding{LECO}\\selectfont\\char220}": '\u0033C'
  "{\\fontencoding{LECO}\\selectfont\\char221}": '\u0033D'
  "{\\fontencoding{LECO}\\selectfont\\char225}": '\u00361'
  "{\\'A}": '\u00386'
  "{\\'E}": '\u00388'
  "{\\'H}": '\u00389'
  "\\'{}{I}": '\u0038A'
  "\\'{}O": '\u0038C'
  "\\mathrm{'Y}": '\u0038E'
  "\\mathrm{'\\Omega}": '\u0038F'
  "\\acute{\\ddot{\\iota}}": '\u00390'
  "{\\Alpha}": '\u00391'
  "\\Alpha ": '\u00391'
  "{\\Beta}": '\u00392'
  "\\Beta ": '\u00392'
  "{\\Gamma}": '\u00393'
  "\\Gamma ": '\u00393'
  "{\\Delta}": '\u00394'
  "\\Delta ": '\u00394'
  "{\\Epsilon}": '\u00395'
  "\\Epsilon ": '\u00395'
  "{\\Zeta}": '\u00396'
  "\\Zeta ": '\u00396'
  "{\\Eta}": '\u00397'
  "\\Eta ": '\u00397'
  "{\\Theta}": '\u00398'
  "\\Theta ": '\u00398'
  "{\\Iota}": '\u00399'
  "\\Iota ": '\u00399'
  "{\\Kappa}": '\u0039A'
  "\\Kappa ": '\u0039A'
  "{\\Lambda}": '\u0039B'
  "\\Lambda ": '\u0039B'
  "{\\Xi}": '\u0039E'
  "\\Xi ": '\u0039E'
  "{\\Pi}": '\u003A0'
  "\\Pi ": '\u003A0'
  "{\\Rho}": '\u003A1'
  "\\Rho ": '\u003A1'
  "{\\Sigma}": '\u003A3'
  "\\Sigma ": '\u003A3'
  "{\\Tau}": '\u003A4'
  "\\Tau ": '\u003A4'
  "{\\Upsilon}": '\u003A5'
  "\\Upsilon ": '\u003A5'
  "{\\Phi}": '\u003A6'
  "\\Phi ": '\u003A6'
  "{\\Chi}": '\u003A7'
  "\\Chi ": '\u003A7'
  "{\\Psi}": '\u003A8'
  "\\Psi ": '\u003A8'
  "{\\Omega}": '\u003A9'
  "\\Omega ": '\u003A9'
  "\\mathrm{\\ddot{I}}": '\u003AA'
  "\\mathrm{\\ddot{Y}}": '\u003AB'
  "{\\'$\\alpha$}": '\u003AC'
  "\\acute{\\epsilon}": '\u003AD'
  "\\acute{\\eta}": '\u003AE'
  "\\acute{\\iota}": '\u003AF'
  "\\acute{\\ddot{\\upsilon}}": '\u003B0'
  "{\\alpha}": '\u003B1'
  "\\alpha ": '\u003B1'
  "{\\beta}": '\u003B2'
  "\\beta ": '\u003B2'
  "{\\gamma}": '\u003B3'
  "\\gamma ": '\u003B3'
  "{\\delta}": '\u003B4'
  "\\delta ": '\u003B4'
  "{\\epsilon}": '\u003B5'
  "\\epsilon ": '\u003B5'
  "{\\zeta}": '\u003B6'
  "\\zeta ": '\u003B6'
  "{\\eta}": '\u003B7'
  "\\eta ": '\u003B7'
  "{\\texttheta}": '\u003B8'
  "\\texttheta ": '\u003B8'
  "{\\iota}": '\u003B9'
  "\\iota ": '\u003B9'
  "{\\kappa}": '\u003BA'
  "\\kappa ": '\u003BA'
  "{\\lambda}": '\u003BB'
  "\\lambda ": '\u003BB'
  "{\\mu}": '\u003BC'
  "\\mu ": '\u003BC'
  "{\\nu}": '\u003BD'
  "\\nu ": '\u003BD'
  "{\\xi}": '\u003BE'
  "\\xi ": '\u003BE'
  "{\\pi}": '\u003C0'
  "\\pi ": '\u003C0'
  "{\\rho}": '\u003C1'
  "\\rho ": '\u003C1'
  "{\\varsigma}": '\u003C2'
  "\\varsigma ": '\u003C2'
  "{\\sigma}": '\u003C3'
  "\\sigma ": '\u003C3'
  "{\\tau}": '\u003C4'
  "\\tau ": '\u003C4'
  "{\\upsilon}": '\u003C5'
  "\\upsilon ": '\u003C5'
  "{\\varphi}": '\u003C6'
  "\\varphi ": '\u003C6'
  "{\\chi}": '\u003C7'
  "\\chi ": '\u003C7'
  "{\\psi}": '\u003C8'
  "\\psi ": '\u003C8'
  "{\\omega}": '\u003C9'
  "\\omega ": '\u003C9'
  "\\ddot{\\iota}": '\u003CA'
  "\\ddot{\\upsilon}": '\u003CB'
  "{\\'o}": '\u003CC'
  "\\acute{\\upsilon}": '\u003CD'
  "\\acute{\\omega}": '\u003CE'
  "\\Pisymbol{ppi022}{87}": '\u003D0'
  "{\\textvartheta}": '\u003D1'
  "\\textvartheta ": '\u003D1'
  "{\\Upsilon}": '\u003D2'
  "\\Upsilon ": '\u003D2'
  "{\\phi}": '\u003D5'
  "\\phi ": '\u003D5'
  "{\\varpi}": '\u003D6'
  "\\varpi ": '\u003D6'
  "{\\Stigma}": '\u003DA'
  "\\Stigma ": '\u003DA'
  "{\\Digamma}": '\u003DC'
  "\\Digamma ": '\u003DC'
  "{\\digamma}": '\u003DD'
  "\\digamma ": '\u003DD'
  "{\\Koppa}": '\u003DE'
  "\\Koppa ": '\u003DE'
  "{\\Sampi}": '\u003E0'
  "\\Sampi ": '\u003E0'
  "{\\varkappa}": '\u003F0'
  "\\varkappa ": '\u003F0'
  "{\\varrho}": '\u003F1'
  "\\varrho ": '\u003F1'
  "{\\textTheta}": '\u003F4'
  "\\textTheta ": '\u003F4'
  "{\\backepsilon}": '\u003F6'
  "\\backepsilon ": '\u003F6'
  "{\\cyrchar\\CYRYO}": '\u00401'
  "\\cyrchar\\CYRYO ": '\u00401'
  "{\\cyrchar\\CYRDJE}": '\u00402'
  "\\cyrchar\\CYRDJE ": '\u00402'
  "\\cyrchar{\\'\\CYRG}": '\u00403'
  "{\\cyrchar\\CYRIE}": '\u00404'
  "\\cyrchar\\CYRIE ": '\u00404'
  "{\\cyrchar\\CYRDZE}": '\u00405'
  "\\cyrchar\\CYRDZE ": '\u00405'
  "{\\cyrchar\\CYRII}": '\u00406'
  "\\cyrchar\\CYRII ": '\u00406'
  "{\\cyrchar\\CYRYI}": '\u00407'
  "\\cyrchar\\CYRYI ": '\u00407'
  "{\\cyrchar\\CYRJE}": '\u00408'
  "\\cyrchar\\CYRJE ": '\u00408'
  "{\\cyrchar\\CYRLJE}": '\u00409'
  "\\cyrchar\\CYRLJE ": '\u00409'
  "{\\cyrchar\\CYRNJE}": '\u0040A'
  "\\cyrchar\\CYRNJE ": '\u0040A'
  "{\\cyrchar\\CYRTSHE}": '\u0040B'
  "\\cyrchar\\CYRTSHE ": '\u0040B'
  "\\cyrchar{\\'\\CYRK}": '\u0040C'
  "{\\cyrchar\\CYRUSHRT}": '\u0040E'
  "\\cyrchar\\CYRUSHRT ": '\u0040E'
  "{\\cyrchar\\CYRDZHE}": '\u0040F'
  "\\cyrchar\\CYRDZHE ": '\u0040F'
  "{\\cyrchar\\CYRA}": '\u00410'
  "\\cyrchar\\CYRA ": '\u00410'
  "{\\cyrchar\\CYRB}": '\u00411'
  "\\cyrchar\\CYRB ": '\u00411'
  "{\\cyrchar\\CYRV}": '\u00412'
  "\\cyrchar\\CYRV ": '\u00412'
  "{\\cyrchar\\CYRG}": '\u00413'
  "\\cyrchar\\CYRG ": '\u00413'
  "{\\cyrchar\\CYRD}": '\u00414'
  "\\cyrchar\\CYRD ": '\u00414'
  "{\\cyrchar\\CYRE}": '\u00415'
  "\\cyrchar\\CYRE ": '\u00415'
  "{\\cyrchar\\CYRZH}": '\u00416'
  "\\cyrchar\\CYRZH ": '\u00416'
  "{\\cyrchar\\CYRZ}": '\u00417'
  "\\cyrchar\\CYRZ ": '\u00417'
  "{\\cyrchar\\CYRI}": '\u00418'
  "\\cyrchar\\CYRI ": '\u00418'
  "{\\cyrchar\\CYRISHRT}": '\u00419'
  "\\cyrchar\\CYRISHRT ": '\u00419'
  "{\\cyrchar\\CYRK}": '\u0041A'
  "\\cyrchar\\CYRK ": '\u0041A'
  "{\\cyrchar\\CYRL}": '\u0041B'
  "\\cyrchar\\CYRL ": '\u0041B'
  "{\\cyrchar\\CYRM}": '\u0041C'
  "\\cyrchar\\CYRM ": '\u0041C'
  "{\\cyrchar\\CYRN}": '\u0041D'
  "\\cyrchar\\CYRN ": '\u0041D'
  "{\\cyrchar\\CYRO}": '\u0041E'
  "\\cyrchar\\CYRO ": '\u0041E'
  "{\\cyrchar\\CYRP}": '\u0041F'
  "\\cyrchar\\CYRP ": '\u0041F'
  "{\\cyrchar\\CYRR}": '\u00420'
  "\\cyrchar\\CYRR ": '\u00420'
  "{\\cyrchar\\CYRS}": '\u00421'
  "\\cyrchar\\CYRS ": '\u00421'
  "{\\cyrchar\\CYRT}": '\u00422'
  "\\cyrchar\\CYRT ": '\u00422'
  "{\\cyrchar\\CYRU}": '\u00423'
  "\\cyrchar\\CYRU ": '\u00423'
  "{\\cyrchar\\CYRF}": '\u00424'
  "\\cyrchar\\CYRF ": '\u00424'
  "{\\cyrchar\\CYRH}": '\u00425'
  "\\cyrchar\\CYRH ": '\u00425'
  "{\\cyrchar\\CYRC}": '\u00426'
  "\\cyrchar\\CYRC ": '\u00426'
  "{\\cyrchar\\CYRCH}": '\u00427'
  "\\cyrchar\\CYRCH ": '\u00427'
  "{\\cyrchar\\CYRSH}": '\u00428'
  "\\cyrchar\\CYRSH ": '\u00428'
  "{\\cyrchar\\CYRSHCH}": '\u00429'
  "\\cyrchar\\CYRSHCH ": '\u00429'
  "{\\cyrchar\\CYRHRDSN}": '\u0042A'
  "\\cyrchar\\CYRHRDSN ": '\u0042A'
  "{\\cyrchar\\CYRERY}": '\u0042B'
  "\\cyrchar\\CYRERY ": '\u0042B'
  "{\\cyrchar\\CYRSFTSN}": '\u0042C'
  "\\cyrchar\\CYRSFTSN ": '\u0042C'
  "{\\cyrchar\\CYREREV}": '\u0042D'
  "\\cyrchar\\CYREREV ": '\u0042D'
  "{\\cyrchar\\CYRYU}": '\u0042E'
  "\\cyrchar\\CYRYU ": '\u0042E'
  "{\\cyrchar\\CYRYA}": '\u0042F'
  "\\cyrchar\\CYRYA ": '\u0042F'
  "{\\cyrchar\\cyra}": '\u00430'
  "\\cyrchar\\cyra ": '\u00430'
  "{\\cyrchar\\cyrb}": '\u00431'
  "\\cyrchar\\cyrb ": '\u00431'
  "{\\cyrchar\\cyrv}": '\u00432'
  "\\cyrchar\\cyrv ": '\u00432'
  "{\\cyrchar\\cyrg}": '\u00433'
  "\\cyrchar\\cyrg ": '\u00433'
  "{\\cyrchar\\cyrd}": '\u00434'
  "\\cyrchar\\cyrd ": '\u00434'
  "{\\cyrchar\\cyre}": '\u00435'
  "\\cyrchar\\cyre ": '\u00435'
  "{\\cyrchar\\cyrzh}": '\u00436'
  "\\cyrchar\\cyrzh ": '\u00436'
  "{\\cyrchar\\cyrz}": '\u00437'
  "\\cyrchar\\cyrz ": '\u00437'
  "{\\cyrchar\\cyri}": '\u00438'
  "\\cyrchar\\cyri ": '\u00438'
  "{\\cyrchar\\cyrishrt}": '\u00439'
  "\\cyrchar\\cyrishrt ": '\u00439'
  "{\\cyrchar\\cyrk}": '\u0043A'
  "\\cyrchar\\cyrk ": '\u0043A'
  "{\\cyrchar\\cyrl}": '\u0043B'
  "\\cyrchar\\cyrl ": '\u0043B'
  "{\\cyrchar\\cyrm}": '\u0043C'
  "\\cyrchar\\cyrm ": '\u0043C'
  "{\\cyrchar\\cyrn}": '\u0043D'
  "\\cyrchar\\cyrn ": '\u0043D'
  "{\\cyrchar\\cyro}": '\u0043E'
  "\\cyrchar\\cyro ": '\u0043E'
  "{\\cyrchar\\cyrp}": '\u0043F'
  "\\cyrchar\\cyrp ": '\u0043F'
  "{\\cyrchar\\cyrr}": '\u00440'
  "\\cyrchar\\cyrr ": '\u00440'
  "{\\cyrchar\\cyrs}": '\u00441'
  "\\cyrchar\\cyrs ": '\u00441'
  "{\\cyrchar\\cyrt}": '\u00442'
  "\\cyrchar\\cyrt ": '\u00442'
  "{\\cyrchar\\cyru}": '\u00443'
  "\\cyrchar\\cyru ": '\u00443'
  "{\\cyrchar\\cyrf}": '\u00444'
  "\\cyrchar\\cyrf ": '\u00444'
  "{\\cyrchar\\cyrh}": '\u00445'
  "\\cyrchar\\cyrh ": '\u00445'
  "{\\cyrchar\\cyrc}": '\u00446'
  "\\cyrchar\\cyrc ": '\u00446'
  "{\\cyrchar\\cyrch}": '\u00447'
  "\\cyrchar\\cyrch ": '\u00447'
  "{\\cyrchar\\cyrsh}": '\u00448'
  "\\cyrchar\\cyrsh ": '\u00448'
  "{\\cyrchar\\cyrshch}": '\u00449'
  "\\cyrchar\\cyrshch ": '\u00449'
  "{\\cyrchar\\cyrhrdsn}": '\u0044A'
  "\\cyrchar\\cyrhrdsn ": '\u0044A'
  "{\\cyrchar\\cyrery}": '\u0044B'
  "\\cyrchar\\cyrery ": '\u0044B'
  "{\\cyrchar\\cyrsftsn}": '\u0044C'
  "\\cyrchar\\cyrsftsn ": '\u0044C'
  "{\\cyrchar\\cyrerev}": '\u0044D'
  "\\cyrchar\\cyrerev ": '\u0044D'
  "{\\cyrchar\\cyryu}": '\u0044E'
  "\\cyrchar\\cyryu ": '\u0044E'
  "{\\cyrchar\\cyrya}": '\u0044F'
  "\\cyrchar\\cyrya ": '\u0044F'
  "{\\cyrchar\\cyryo}": '\u00451'
  "\\cyrchar\\cyryo ": '\u00451'
  "{\\cyrchar\\cyrdje}": '\u00452'
  "\\cyrchar\\cyrdje ": '\u00452'
  "\\cyrchar{\\'\\cyrg}": '\u00453'
  "{\\cyrchar\\cyrie}": '\u00454'
  "\\cyrchar\\cyrie ": '\u00454'
  "{\\cyrchar\\cyrdze}": '\u00455'
  "\\cyrchar\\cyrdze ": '\u00455'
  "{\\cyrchar\\cyrii}": '\u00456'
  "\\cyrchar\\cyrii ": '\u00456'
  "{\\cyrchar\\cyryi}": '\u00457'
  "\\cyrchar\\cyryi ": '\u00457'
  "{\\cyrchar\\cyrje}": '\u00458'
  "\\cyrchar\\cyrje ": '\u00458'
  "{\\cyrchar\\cyrlje}": '\u00459'
  "\\cyrchar\\cyrlje ": '\u00459'
  "{\\cyrchar\\cyrnje}": '\u0045A'
  "\\cyrchar\\cyrnje ": '\u0045A'
  "{\\cyrchar\\cyrtshe}": '\u0045B'
  "\\cyrchar\\cyrtshe ": '\u0045B'
  "\\cyrchar{\\'\\cyrk}": '\u0045C'
  "{\\cyrchar\\cyrushrt}": '\u0045E'
  "\\cyrchar\\cyrushrt ": '\u0045E'
  "{\\cyrchar\\cyrdzhe}": '\u0045F'
  "\\cyrchar\\cyrdzhe ": '\u0045F'
  "{\\cyrchar\\CYROMEGA}": '\u00460'
  "\\cyrchar\\CYROMEGA ": '\u00460'
  "{\\cyrchar\\cyromega}": '\u00461'
  "\\cyrchar\\cyromega ": '\u00461'
  "{\\cyrchar\\CYRYAT}": '\u00462'
  "\\cyrchar\\CYRYAT ": '\u00462'
  "{\\cyrchar\\CYRIOTE}": '\u00464'
  "\\cyrchar\\CYRIOTE ": '\u00464'
  "{\\cyrchar\\cyriote}": '\u00465'
  "\\cyrchar\\cyriote ": '\u00465'
  "{\\cyrchar\\CYRLYUS}": '\u00466'
  "\\cyrchar\\CYRLYUS ": '\u00466'
  "{\\cyrchar\\cyrlyus}": '\u00467'
  "\\cyrchar\\cyrlyus ": '\u00467'
  "{\\cyrchar\\CYRIOTLYUS}": '\u00468'
  "\\cyrchar\\CYRIOTLYUS ": '\u00468'
  "{\\cyrchar\\cyriotlyus}": '\u00469'
  "\\cyrchar\\cyriotlyus ": '\u00469'
  "{\\cyrchar\\CYRBYUS}": '\u0046A'
  "\\cyrchar\\CYRBYUS ": '\u0046A'
  "{\\cyrchar\\CYRIOTBYUS}": '\u0046C'
  "\\cyrchar\\CYRIOTBYUS ": '\u0046C'
  "{\\cyrchar\\cyriotbyus}": '\u0046D'
  "\\cyrchar\\cyriotbyus ": '\u0046D'
  "{\\cyrchar\\CYRKSI}": '\u0046E'
  "\\cyrchar\\CYRKSI ": '\u0046E'
  "{\\cyrchar\\cyrksi}": '\u0046F'
  "\\cyrchar\\cyrksi ": '\u0046F'
  "{\\cyrchar\\CYRPSI}": '\u00470'
  "\\cyrchar\\CYRPSI ": '\u00470'
  "{\\cyrchar\\cyrpsi}": '\u00471'
  "\\cyrchar\\cyrpsi ": '\u00471'
  "{\\cyrchar\\CYRFITA}": '\u00472'
  "\\cyrchar\\CYRFITA ": '\u00472'
  "{\\cyrchar\\CYRIZH}": '\u00474'
  "\\cyrchar\\CYRIZH ": '\u00474'
  "{\\cyrchar\\CYRUK}": '\u00478'
  "\\cyrchar\\CYRUK ": '\u00478'
  "{\\cyrchar\\cyruk}": '\u00479'
  "\\cyrchar\\cyruk ": '\u00479'
  "{\\cyrchar\\CYROMEGARND}": '\u0047A'
  "\\cyrchar\\CYROMEGARND ": '\u0047A'
  "{\\cyrchar\\cyromegarnd}": '\u0047B'
  "\\cyrchar\\cyromegarnd ": '\u0047B'
  "{\\cyrchar\\CYROMEGATITLO}": '\u0047C'
  "\\cyrchar\\CYROMEGATITLO ": '\u0047C'
  "{\\cyrchar\\cyromegatitlo}": '\u0047D'
  "\\cyrchar\\cyromegatitlo ": '\u0047D'
  "{\\cyrchar\\CYROT}": '\u0047E'
  "\\cyrchar\\CYROT ": '\u0047E'
  "{\\cyrchar\\cyrot}": '\u0047F'
  "\\cyrchar\\cyrot ": '\u0047F'
  "{\\cyrchar\\CYRKOPPA}": '\u00480'
  "\\cyrchar\\CYRKOPPA ": '\u00480'
  "{\\cyrchar\\cyrkoppa}": '\u00481'
  "\\cyrchar\\cyrkoppa ": '\u00481'
  "{\\cyrchar\\cyrthousands}": '\u00482'
  "\\cyrchar\\cyrthousands ": '\u00482'
  "{\\cyrchar\\cyrhundredthousands}": '\u00488'
  "\\cyrchar\\cyrhundredthousands ": '\u00488'
  "{\\cyrchar\\cyrmillions}": '\u00489'
  "\\cyrchar\\cyrmillions ": '\u00489'
  "{\\cyrchar\\CYRSEMISFTSN}": '\u0048C'
  "\\cyrchar\\CYRSEMISFTSN ": '\u0048C'
  "{\\cyrchar\\cyrsemisftsn}": '\u0048D'
  "\\cyrchar\\cyrsemisftsn ": '\u0048D'
  "{\\cyrchar\\CYRRTICK}": '\u0048E'
  "\\cyrchar\\CYRRTICK ": '\u0048E'
  "{\\cyrchar\\cyrrtick}": '\u0048F'
  "\\cyrchar\\cyrrtick ": '\u0048F'
  "{\\cyrchar\\CYRGUP}": '\u00490'
  "\\cyrchar\\CYRGUP ": '\u00490'
  "{\\cyrchar\\cyrgup}": '\u00491'
  "\\cyrchar\\cyrgup ": '\u00491'
  "{\\cyrchar\\CYRGHCRS}": '\u00492'
  "\\cyrchar\\CYRGHCRS ": '\u00492'
  "{\\cyrchar\\cyrghcrs}": '\u00493'
  "\\cyrchar\\cyrghcrs ": '\u00493'
  "{\\cyrchar\\CYRGHK}": '\u00494'
  "\\cyrchar\\CYRGHK ": '\u00494'
  "{\\cyrchar\\cyrghk}": '\u00495'
  "\\cyrchar\\cyrghk ": '\u00495'
  "{\\cyrchar\\CYRZHDSC}": '\u00496'
  "\\cyrchar\\CYRZHDSC ": '\u00496'
  "{\\cyrchar\\cyrzhdsc}": '\u00497'
  "\\cyrchar\\cyrzhdsc ": '\u00497'
  "{\\cyrchar\\CYRZDSC}": '\u00498'
  "\\cyrchar\\CYRZDSC ": '\u00498'
  "{\\cyrchar\\cyrzdsc}": '\u00499'
  "\\cyrchar\\cyrzdsc ": '\u00499'
  "{\\cyrchar\\CYRKDSC}": '\u0049A'
  "\\cyrchar\\CYRKDSC ": '\u0049A'
  "{\\cyrchar\\cyrkdsc}": '\u0049B'
  "\\cyrchar\\cyrkdsc ": '\u0049B'
  "{\\cyrchar\\CYRKVCRS}": '\u0049C'
  "\\cyrchar\\CYRKVCRS ": '\u0049C'
  "{\\cyrchar\\cyrkvcrs}": '\u0049D'
  "\\cyrchar\\cyrkvcrs ": '\u0049D'
  "{\\cyrchar\\CYRKHCRS}": '\u0049E'
  "\\cyrchar\\CYRKHCRS ": '\u0049E'
  "{\\cyrchar\\cyrkhcrs}": '\u0049F'
  "\\cyrchar\\cyrkhcrs ": '\u0049F'
  "{\\cyrchar\\CYRKBEAK}": '\u004A0'
  "\\cyrchar\\CYRKBEAK ": '\u004A0'
  "{\\cyrchar\\cyrkbeak}": '\u004A1'
  "\\cyrchar\\cyrkbeak ": '\u004A1'
  "{\\cyrchar\\CYRNDSC}": '\u004A2'
  "\\cyrchar\\CYRNDSC ": '\u004A2'
  "{\\cyrchar\\cyrndsc}": '\u004A3'
  "\\cyrchar\\cyrndsc ": '\u004A3'
  "{\\cyrchar\\CYRNG}": '\u004A4'
  "\\cyrchar\\CYRNG ": '\u004A4'
  "{\\cyrchar\\cyrng}": '\u004A5'
  "\\cyrchar\\cyrng ": '\u004A5'
  "{\\cyrchar\\CYRPHK}": '\u004A6'
  "\\cyrchar\\CYRPHK ": '\u004A6'
  "{\\cyrchar\\cyrphk}": '\u004A7'
  "\\cyrchar\\cyrphk ": '\u004A7'
  "{\\cyrchar\\CYRABHHA}": '\u004A8'
  "\\cyrchar\\CYRABHHA ": '\u004A8'
  "{\\cyrchar\\cyrabhha}": '\u004A9'
  "\\cyrchar\\cyrabhha ": '\u004A9'
  "{\\cyrchar\\CYRSDSC}": '\u004AA'
  "\\cyrchar\\CYRSDSC ": '\u004AA'
  "{\\cyrchar\\cyrsdsc}": '\u004AB'
  "\\cyrchar\\cyrsdsc ": '\u004AB'
  "{\\cyrchar\\CYRTDSC}": '\u004AC'
  "\\cyrchar\\CYRTDSC ": '\u004AC'
  "{\\cyrchar\\cyrtdsc}": '\u004AD'
  "\\cyrchar\\cyrtdsc ": '\u004AD'
  "{\\cyrchar\\CYRY}": '\u004AE'
  "\\cyrchar\\CYRY ": '\u004AE'
  "{\\cyrchar\\cyry}": '\u004AF'
  "\\cyrchar\\cyry ": '\u004AF'
  "{\\cyrchar\\CYRYHCRS}": '\u004B0'
  "\\cyrchar\\CYRYHCRS ": '\u004B0'
  "{\\cyrchar\\cyryhcrs}": '\u004B1'
  "\\cyrchar\\cyryhcrs ": '\u004B1'
  "{\\cyrchar\\CYRHDSC}": '\u004B2'
  "\\cyrchar\\CYRHDSC ": '\u004B2'
  "{\\cyrchar\\cyrhdsc}": '\u004B3'
  "\\cyrchar\\cyrhdsc ": '\u004B3'
  "{\\cyrchar\\CYRTETSE}": '\u004B4'
  "\\cyrchar\\CYRTETSE ": '\u004B4'
  "{\\cyrchar\\cyrtetse}": '\u004B5'
  "\\cyrchar\\cyrtetse ": '\u004B5'
  "{\\cyrchar\\CYRCHRDSC}": '\u004B6'
  "\\cyrchar\\CYRCHRDSC ": '\u004B6'
  "{\\cyrchar\\cyrchrdsc}": '\u004B7'
  "\\cyrchar\\cyrchrdsc ": '\u004B7'
  "{\\cyrchar\\CYRCHVCRS}": '\u004B8'
  "\\cyrchar\\CYRCHVCRS ": '\u004B8'
  "{\\cyrchar\\cyrchvcrs}": '\u004B9'
  "\\cyrchar\\cyrchvcrs ": '\u004B9'
  "{\\cyrchar\\CYRSHHA}": '\u004BA'
  "\\cyrchar\\CYRSHHA ": '\u004BA'
  "{\\cyrchar\\cyrshha}": '\u004BB'
  "\\cyrchar\\cyrshha ": '\u004BB'
  "{\\cyrchar\\CYRABHCH}": '\u004BC'
  "\\cyrchar\\CYRABHCH ": '\u004BC'
  "{\\cyrchar\\cyrabhch}": '\u004BD'
  "\\cyrchar\\cyrabhch ": '\u004BD'
  "{\\cyrchar\\CYRABHCHDSC}": '\u004BE'
  "\\cyrchar\\CYRABHCHDSC ": '\u004BE'
  "{\\cyrchar\\cyrabhchdsc}": '\u004BF'
  "\\cyrchar\\cyrabhchdsc ": '\u004BF'
  "{\\cyrchar\\CYRpalochka}": '\u004C0'
  "\\cyrchar\\CYRpalochka ": '\u004C0'
  "{\\cyrchar\\CYRKHK}": '\u004C3'
  "\\cyrchar\\CYRKHK ": '\u004C3'
  "{\\cyrchar\\cyrkhk}": '\u004C4'
  "\\cyrchar\\cyrkhk ": '\u004C4'
  "{\\cyrchar\\CYRNHK}": '\u004C7'
  "\\cyrchar\\CYRNHK ": '\u004C7'
  "{\\cyrchar\\cyrnhk}": '\u004C8'
  "\\cyrchar\\cyrnhk ": '\u004C8'
  "{\\cyrchar\\CYRCHLDSC}": '\u004CB'
  "\\cyrchar\\CYRCHLDSC ": '\u004CB'
  "{\\cyrchar\\cyrchldsc}": '\u004CC'
  "\\cyrchar\\cyrchldsc ": '\u004CC'
  "{\\cyrchar\\CYRAE}": '\u004D4'
  "\\cyrchar\\CYRAE ": '\u004D4'
  "{\\cyrchar\\cyrae}": '\u004D5'
  "\\cyrchar\\cyrae ": '\u004D5'
  "{\\cyrchar\\CYRSCHWA}": '\u004D8'
  "\\cyrchar\\CYRSCHWA ": '\u004D8'
  "{\\cyrchar\\cyrschwa}": '\u004D9'
  "\\cyrchar\\cyrschwa ": '\u004D9'
  "{\\cyrchar\\CYRABHDZE}": '\u004E0'
  "\\cyrchar\\CYRABHDZE ": '\u004E0'
  "{\\cyrchar\\cyrabhdze}": '\u004E1'
  "\\cyrchar\\cyrabhdze ": '\u004E1'
  "{\\cyrchar\\CYROTLD}": '\u004E8'
  "\\cyrchar\\CYROTLD ": '\u004E8'
  "{\\cyrchar\\cyrotld}": '\u004E9'
  "\\cyrchar\\cyrotld ": '\u004E9'
  "\\hspace{0.6em}": '\u02002'
  "\\hspace{1em}": '\u02003'
  "\\hspace{0.33em}": '\u02004'
  "\\hspace{0.25em}": '\u02005'
  "\\hspace{0.166em}": '\u02006'
  "\\hphantom{0}": '\u02007'
  "\\hphantom{,}": '\u02008'
  "\\hspace{0.167em}": '\u02009'
  "{\\mkern1mu}": '\u0200A'
  "\\mkern1mu ": '\u0200A'
  "-": '\u02010'
  "{\\textendash}": '\u02013'
  "\\textendash ": '\u02013'
  "{\\textemdash}": '\u02014'
  "\\textemdash ": '\u02014'
  "\\rule{1em}{1pt}": '\u02015'
  "{\\Vert}": '\u02016'
  "\\Vert ": '\u02016'
  "`": '\u02018'
  "'": '\u02019'
  ",": '\u0201A'
  "{\\Elzreapos}": '\u0201B'
  "\\Elzreapos ": '\u0201B'
  "{\\textquotedblleft}": '\u0201C'
  "\\textquotedblleft ": '\u0201C'
  "{\\textquotedblright}": '\u0201D'
  "\\textquotedblright ": '\u0201D'
  ",,": '\u0201E'
  "{\\textdagger}": '\u02020'
  "\\textdagger ": '\u02020'
  "{\\textdaggerdbl}": '\u02021'
  "\\textdaggerdbl ": '\u02021'
  "{\\textbullet}": '\u02022'
  "\\textbullet ": '\u02022'
  ".": '\u02024'
  "..": '\u02025'
  "{\\ldots}": '\u02026'
  "\\ldots ": '\u02026'
  "{\\textperthousand}": '\u02030'
  "\\textperthousand ": '\u02030'
  "{\\textpertenthousand}": '\u02031'
  "\\textpertenthousand ": '\u02031'
  "{'}": '\u02032'
  "{''}": '\u02033'
  "{'''}": '\u02034'
  "{\\backprime}": '\u02035'
  "\\backprime ": '\u02035'
  "{\\guilsinglleft}": '\u02039'
  "\\guilsinglleft ": '\u02039'
  "{\\guilsinglright}": '\u0203A'
  "\\guilsinglright ": '\u0203A'
  "''''": '\u02057'
  "{\\mkern4mu}": '\u0205F'
  "\\mkern4mu ": '\u0205F'
  "{\\nolinebreak}": '\u02060'
  "\\nolinebreak ": '\u02060'
  "\\ensuremath{\\Elzpes}": '\u020A7'
  "{\\mbox{\\texteuro}}": '\u020AC'
  "\\mbox{\\texteuro} ": '\u020AC'
  "{\\dddot}": '\u020DB'
  "\\dddot ": '\u020DB'
  "{\\ddddot}": '\u020DC'
  "\\ddddot ": '\u020DC'
  "\\mathbb{C}": '\u02102'
  "\\mathscr{g}": '\u0210A'
  "\\mathscr{H}": '\u0210B'
  "\\mathfrak{H}": '\u0210C'
  "\\mathbb{H}": '\u0210D'
  "{\\hslash}": '\u0210F'
  "\\hslash ": '\u0210F'
  "\\mathscr{I}": '\u02110'
  "\\mathfrak{I}": '\u02111'
  "\\mathscr{L}": '\u02112'
  "\\mathscr{l}": '\u02113'
  "\\mathbb{N}": '\u02115'
  "{\\cyrchar\\textnumero}": '\u02116'
  "\\cyrchar\\textnumero ": '\u02116'
  "{\\wp}": '\u02118'
  "\\wp ": '\u02118'
  "\\mathbb{P}": '\u02119'
  "\\mathbb{Q}": '\u0211A'
  "\\mathscr{R}": '\u0211B'
  "\\mathfrak{R}": '\u0211C'
  "\\mathbb{R}": '\u0211D'
  "{\\Elzxrat}": '\u0211E'
  "\\Elzxrat ": '\u0211E'
  "{\\texttrademark}": '\u02122'
  "\\texttrademark ": '\u02122'
  "\\mathbb{Z}": '\u02124'
  "{\\Omega}": '\u02126'
  "\\Omega ": '\u02126'
  "{\\mho}": '\u02127'
  "\\mho ": '\u02127'
  "\\mathfrak{Z}": '\u02128'
  "\\ElsevierGlyph{2129}": '\u02129'
  "{\\AA}": '\u0212B'
  "\\AA ": '\u0212B'
  "\\mathscr{B}": '\u0212C'
  "\\mathfrak{C}": '\u0212D'
  "\\mathscr{e}": '\u0212F'
  "\\mathscr{E}": '\u02130'
  "\\mathscr{F}": '\u02131'
  "\\mathscr{M}": '\u02133'
  "\\mathscr{o}": '\u02134'
  "{\\aleph}": '\u02135'
  "\\aleph ": '\u02135'
  "{\\beth}": '\u02136'
  "\\beth ": '\u02136'
  "{\\gimel}": '\u02137'
  "\\gimel ": '\u02137'
  "{\\daleth}": '\u02138'
  "\\daleth ": '\u02138'
  "\\textfrac{1}{3}": '\u02153'
  "\\textfrac{2}{3}": '\u02154'
  "\\textfrac{1}{5}": '\u02155'
  "\\textfrac{2}{5}": '\u02156'
  "\\textfrac{3}{5}": '\u02157'
  "\\textfrac{4}{5}": '\u02158'
  "\\textfrac{1}{6}": '\u02159'
  "\\textfrac{5}{6}": '\u0215A'
  "\\textfrac{1}{8}": '\u0215B'
  "\\textfrac{3}{8}": '\u0215C'
  "\\textfrac{5}{8}": '\u0215D'
  "\\textfrac{7}{8}": '\u0215E'
  "{\\leftarrow}": '\u02190'
  "\\leftarrow ": '\u02190'
  "{\\uparrow}": '\u02191'
  "\\uparrow ": '\u02191'
  "{\\rightarrow}": '\u02192'
  "\\rightarrow ": '\u02192'
  "{\\downarrow}": '\u02193'
  "\\downarrow ": '\u02193'
  "{\\leftrightarrow}": '\u02194'
  "\\leftrightarrow ": '\u02194'
  "{\\updownarrow}": '\u02195'
  "\\updownarrow ": '\u02195'
  "{\\nwarrow}": '\u02196'
  "\\nwarrow ": '\u02196'
  "{\\nearrow}": '\u02197'
  "\\nearrow ": '\u02197'
  "{\\searrow}": '\u02198'
  "\\searrow ": '\u02198'
  "{\\swarrow}": '\u02199'
  "\\swarrow ": '\u02199'
  "{\\nleftarrow}": '\u0219A'
  "\\nleftarrow ": '\u0219A'
  "{\\nrightarrow}": '\u0219B'
  "\\nrightarrow ": '\u0219B'
  "{\\arrowwaveright}": '\u0219C'
  "\\arrowwaveright ": '\u0219C'
  "{\\arrowwaveright}": '\u0219D'
  "\\arrowwaveright ": '\u0219D'
  "{\\twoheadleftarrow}": '\u0219E'
  "\\twoheadleftarrow ": '\u0219E'
  "{\\twoheadrightarrow}": '\u021A0'
  "\\twoheadrightarrow ": '\u021A0'
  "{\\leftarrowtail}": '\u021A2'
  "\\leftarrowtail ": '\u021A2'
  "{\\rightarrowtail}": '\u021A3'
  "\\rightarrowtail ": '\u021A3'
  "{\\mapsto}": '\u021A6'
  "\\mapsto ": '\u021A6'
  "{\\hookleftarrow}": '\u021A9'
  "\\hookleftarrow ": '\u021A9'
  "{\\hookrightarrow}": '\u021AA'
  "\\hookrightarrow ": '\u021AA'
  "{\\looparrowleft}": '\u021AB'
  "\\looparrowleft ": '\u021AB'
  "{\\looparrowright}": '\u021AC'
  "\\looparrowright ": '\u021AC'
  "{\\leftrightsquigarrow}": '\u021AD'
  "\\leftrightsquigarrow ": '\u021AD'
  "{\\nleftrightarrow}": '\u021AE'
  "\\nleftrightarrow ": '\u021AE'
  "{\\Lsh}": '\u021B0'
  "\\Lsh ": '\u021B0'
  "{\\Rsh}": '\u021B1'
  "\\Rsh ": '\u021B1'
  "\\ElsevierGlyph{21B3}": '\u021B3'
  "{\\curvearrowleft}": '\u021B6'
  "\\curvearrowleft ": '\u021B6'
  "{\\curvearrowright}": '\u021B7'
  "\\curvearrowright ": '\u021B7'
  "{\\circlearrowleft}": '\u021BA'
  "\\circlearrowleft ": '\u021BA'
  "{\\circlearrowright}": '\u021BB'
  "\\circlearrowright ": '\u021BB'
  "{\\leftharpoonup}": '\u021BC'
  "\\leftharpoonup ": '\u021BC'
  "{\\leftharpoondown}": '\u021BD'
  "\\leftharpoondown ": '\u021BD'
  "{\\upharpoonright}": '\u021BE'
  "\\upharpoonright ": '\u021BE'
  "{\\upharpoonleft}": '\u021BF'
  "\\upharpoonleft ": '\u021BF'
  "{\\rightharpoonup}": '\u021C0'
  "\\rightharpoonup ": '\u021C0'
  "{\\rightharpoondown}": '\u021C1'
  "\\rightharpoondown ": '\u021C1'
  "{\\downharpoonright}": '\u021C2'
  "\\downharpoonright ": '\u021C2'
  "{\\downharpoonleft}": '\u021C3'
  "\\downharpoonleft ": '\u021C3'
  "{\\rightleftarrows}": '\u021C4'
  "\\rightleftarrows ": '\u021C4'
  "{\\dblarrowupdown}": '\u021C5'
  "\\dblarrowupdown ": '\u021C5'
  "{\\leftrightarrows}": '\u021C6'
  "\\leftrightarrows ": '\u021C6'
  "{\\leftleftarrows}": '\u021C7'
  "\\leftleftarrows ": '\u021C7'
  "{\\upuparrows}": '\u021C8'
  "\\upuparrows ": '\u021C8'
  "{\\rightrightarrows}": '\u021C9'
  "\\rightrightarrows ": '\u021C9'
  "{\\downdownarrows}": '\u021CA'
  "\\downdownarrows ": '\u021CA'
  "{\\leftrightharpoons}": '\u021CB'
  "\\leftrightharpoons ": '\u021CB'
  "{\\rightleftharpoons}": '\u021CC'
  "\\rightleftharpoons ": '\u021CC'
  "{\\nLeftarrow}": '\u021CD'
  "\\nLeftarrow ": '\u021CD'
  "{\\nLeftrightarrow}": '\u021CE'
  "\\nLeftrightarrow ": '\u021CE'
  "{\\nRightarrow}": '\u021CF'
  "\\nRightarrow ": '\u021CF'
  "{\\Leftarrow}": '\u021D0'
  "\\Leftarrow ": '\u021D0'
  "{\\Uparrow}": '\u021D1'
  "\\Uparrow ": '\u021D1'
  "{\\Rightarrow}": '\u021D2'
  "\\Rightarrow ": '\u021D2'
  "{\\Downarrow}": '\u021D3'
  "\\Downarrow ": '\u021D3'
  "{\\Leftrightarrow}": '\u021D4'
  "\\Leftrightarrow ": '\u021D4'
  "{\\Updownarrow}": '\u021D5'
  "\\Updownarrow ": '\u021D5'
  "{\\Lleftarrow}": '\u021DA'
  "\\Lleftarrow ": '\u021DA'
  "{\\Rrightarrow}": '\u021DB'
  "\\Rrightarrow ": '\u021DB'
  "{\\rightsquigarrow}": '\u021DD'
  "\\rightsquigarrow ": '\u021DD'
  "{\\DownArrowUpArrow}": '\u021F5'
  "\\DownArrowUpArrow ": '\u021F5'
  "{\\forall}": '\u02200'
  "\\forall ": '\u02200'
  "{\\complement}": '\u02201'
  "\\complement ": '\u02201'
  "{\\partial}": '\u02202'
  "\\partial ": '\u02202'
  "{\\exists}": '\u02203'
  "\\exists ": '\u02203'
  "{\\nexists}": '\u02204'
  "\\nexists ": '\u02204'
  "{\\varnothing}": '\u02205'
  "\\varnothing ": '\u02205'
  "{\\nabla}": '\u02207'
  "\\nabla ": '\u02207'
  "{\\in}": '\u02208'
  "\\in ": '\u02208'
  "{\\not\\in}": '\u02209'
  "\\not\\in ": '\u02209'
  "{\\ni}": '\u0220B'
  "\\ni ": '\u0220B'
  "{\\not\\ni}": '\u0220C'
  "\\not\\ni ": '\u0220C'
  "{\\prod}": '\u0220F'
  "\\prod ": '\u0220F'
  "{\\coprod}": '\u02210'
  "\\coprod ": '\u02210'
  "{\\sum}": '\u02211'
  "\\sum ": '\u02211'
  "-": '\u02212'
  "{\\mp}": '\u02213'
  "\\mp ": '\u02213'
  "{\\dotplus}": '\u02214'
  "\\dotplus ": '\u02214'
  "{\\setminus}": '\u02216'
  "\\setminus ": '\u02216'
  "{_\\ast}": '\u02217'
  "{\\circ}": '\u02218'
  "\\circ ": '\u02218'
  "{\\bullet}": '\u02219'
  "\\bullet ": '\u02219'
  "{\\surd}": '\u0221A'
  "\\surd ": '\u0221A'
  "{\\propto}": '\u0221D'
  "\\propto ": '\u0221D'
  "{\\infty}": '\u0221E'
  "\\infty ": '\u0221E'
  "{\\rightangle}": '\u0221F'
  "\\rightangle ": '\u0221F'
  "{\\angle}": '\u02220'
  "\\angle ": '\u02220'
  "{\\measuredangle}": '\u02221'
  "\\measuredangle ": '\u02221'
  "{\\sphericalangle}": '\u02222'
  "\\sphericalangle ": '\u02222'
  "{\\mid}": '\u02223'
  "\\mid ": '\u02223'
  "{\\nmid}": '\u02224'
  "\\nmid ": '\u02224'
  "{\\parallel}": '\u02225'
  "\\parallel ": '\u02225'
  "{\\nparallel}": '\u02226'
  "\\nparallel ": '\u02226'
  "{\\wedge}": '\u02227'
  "\\wedge ": '\u02227'
  "{\\vee}": '\u02228'
  "\\vee ": '\u02228'
  "{\\cap}": '\u02229'
  "\\cap ": '\u02229'
  "{\\cup}": '\u0222A'
  "\\cup ": '\u0222A'
  "{\\int}": '\u0222B'
  "\\int ": '\u0222B'
  "{\\int\\!\\int}": '\u0222C'
  "\\int\\!\\int ": '\u0222C'
  "{\\int\\!\\int\\!\\int}": '\u0222D'
  "\\int\\!\\int\\!\\int ": '\u0222D'
  "{\\oint}": '\u0222E'
  "\\oint ": '\u0222E'
  "{\\surfintegral}": '\u0222F'
  "\\surfintegral ": '\u0222F'
  "{\\volintegral}": '\u02230'
  "\\volintegral ": '\u02230'
  "{\\clwintegral}": '\u02231'
  "\\clwintegral ": '\u02231'
  "\\ElsevierGlyph{2232}": '\u02232'
  "\\ElsevierGlyph{2233}": '\u02233'
  "{\\therefore}": '\u02234'
  "\\therefore ": '\u02234'
  "{\\because}": '\u02235'
  "\\because ": '\u02235'
  "{\\Colon}": '\u02237'
  "\\Colon ": '\u02237'
  "\\ElsevierGlyph{2238}": '\u02238'
  "\\mathbin{{:}\\!\\!{-}\\!\\!{:}}": '\u0223A'
  "{\\homothetic}": '\u0223B'
  "\\homothetic ": '\u0223B'
  "{\\sim}": '\u0223C'
  "\\sim ": '\u0223C'
  "{\\backsim}": '\u0223D'
  "\\backsim ": '\u0223D'
  "{\\lazysinv}": '\u0223E'
  "\\lazysinv ": '\u0223E'
  "{\\wr}": '\u02240'
  "\\wr ": '\u02240'
  "{\\not\\sim}": '\u02241'
  "\\not\\sim ": '\u02241'
  "\\ElsevierGlyph{2242}": '\u02242'
  "{\\simeq}": '\u02243'
  "\\simeq ": '\u02243'
  "{\\not\\simeq}": '\u02244'
  "\\not\\simeq ": '\u02244'
  "{\\cong}": '\u02245'
  "\\cong ": '\u02245'
  "{\\approxnotequal}": '\u02246'
  "\\approxnotequal ": '\u02246'
  "{\\not\\cong}": '\u02247'
  "\\not\\cong ": '\u02247'
  "{\\approx}": '\u02248'
  "\\approx ": '\u02248'
  "{\\not\\approx}": '\u02249'
  "\\not\\approx ": '\u02249'
  "{\\approxeq}": '\u0224A'
  "\\approxeq ": '\u0224A'
  "{\\tildetrpl}": '\u0224B'
  "\\tildetrpl ": '\u0224B'
  "{\\allequal}": '\u0224C'
  "\\allequal ": '\u0224C'
  "{\\asymp}": '\u0224D'
  "\\asymp ": '\u0224D'
  "{\\Bumpeq}": '\u0224E'
  "\\Bumpeq ": '\u0224E'
  "{\\bumpeq}": '\u0224F'
  "\\bumpeq ": '\u0224F'
  "{\\doteq}": '\u02250'
  "\\doteq ": '\u02250'
  "{\\doteqdot}": '\u02251'
  "\\doteqdot ": '\u02251'
  "{\\fallingdotseq}": '\u02252'
  "\\fallingdotseq ": '\u02252'
  "{\\risingdotseq}": '\u02253'
  "\\risingdotseq ": '\u02253'
  ":=": '\u02254'
  "=:": '\u02255'
  "{\\eqcirc}": '\u02256'
  "\\eqcirc ": '\u02256'
  "{\\circeq}": '\u02257'
  "\\circeq ": '\u02257'
  "{\\estimates}": '\u02259'
  "\\estimates ": '\u02259'
  "\\ElsevierGlyph{225A}": '\u0225A'
  "{\\starequal}": '\u0225B'
  "\\starequal ": '\u0225B'
  "{\\triangleq}": '\u0225C'
  "\\triangleq ": '\u0225C'
  "\\ElsevierGlyph{225F}": '\u0225F'
  "\\not =": '\u02260'
  "{\\equiv}": '\u02261'
  "\\equiv ": '\u02261'
  "{\\not\\equiv}": '\u02262'
  "\\not\\equiv ": '\u02262'
  "{\\leq}": '\u02264'
  "\\leq ": '\u02264'
  "{\\geq}": '\u02265'
  "\\geq ": '\u02265'
  "{\\leqq}": '\u02266'
  "\\leqq ": '\u02266'
  "{\\geqq}": '\u02267'
  "\\geqq ": '\u02267'
  "{\\lneqq}": '\u02268'
  "\\lneqq ": '\u02268'
  "{\\gneqq}": '\u02269'
  "\\gneqq ": '\u02269'
  "{\\ll}": '\u0226A'
  "\\ll ": '\u0226A'
  "{\\gg}": '\u0226B'
  "\\gg ": '\u0226B'
  "{\\between}": '\u0226C'
  "\\between ": '\u0226C'
  "{\\not\\kern-0.3em\\times}": '\u0226D'
  "\\not\\kern-0.3em\\times ": '\u0226D'
  "\\not<": '\u0226E'
  "\\not>": '\u0226F'
  "{\\not\\leq}": '\u02270'
  "\\not\\leq ": '\u02270'
  "{\\not\\geq}": '\u02271'
  "\\not\\geq ": '\u02271'
  "{\\lessequivlnt}": '\u02272'
  "\\lessequivlnt ": '\u02272'
  "{\\greaterequivlnt}": '\u02273'
  "\\greaterequivlnt ": '\u02273'
  "\\ElsevierGlyph{2274}": '\u02274'
  "\\ElsevierGlyph{2275}": '\u02275'
  "{\\lessgtr}": '\u02276'
  "\\lessgtr ": '\u02276'
  "{\\gtrless}": '\u02277'
  "\\gtrless ": '\u02277'
  "{\\notlessgreater}": '\u02278'
  "\\notlessgreater ": '\u02278'
  "{\\notgreaterless}": '\u02279'
  "\\notgreaterless ": '\u02279'
  "{\\prec}": '\u0227A'
  "\\prec ": '\u0227A'
  "{\\succ}": '\u0227B'
  "\\succ ": '\u0227B'
  "{\\preccurlyeq}": '\u0227C'
  "\\preccurlyeq ": '\u0227C'
  "{\\succcurlyeq}": '\u0227D'
  "\\succcurlyeq ": '\u0227D'
  "{\\precapprox}": '\u0227E'
  "\\precapprox ": '\u0227E'
  "{\\succapprox}": '\u0227F'
  "\\succapprox ": '\u0227F'
  "{\\not\\prec}": '\u02280'
  "\\not\\prec ": '\u02280'
  "{\\not\\succ}": '\u02281'
  "\\not\\succ ": '\u02281'
  "{\\subset}": '\u02282'
  "\\subset ": '\u02282'
  "{\\supset}": '\u02283'
  "\\supset ": '\u02283'
  "{\\not\\subset}": '\u02284'
  "\\not\\subset ": '\u02284'
  "{\\not\\supset}": '\u02285'
  "\\not\\supset ": '\u02285'
  "{\\subseteq}": '\u02286'
  "\\subseteq ": '\u02286'
  "{\\supseteq}": '\u02287'
  "\\supseteq ": '\u02287'
  "{\\not\\subseteq}": '\u02288'
  "\\not\\subseteq ": '\u02288'
  "{\\not\\supseteq}": '\u02289'
  "\\not\\supseteq ": '\u02289'
  "{\\subsetneq}": '\u0228A'
  "\\subsetneq ": '\u0228A'
  "{\\supsetneq}": '\u0228B'
  "\\supsetneq ": '\u0228B'
  "{\\uplus}": '\u0228E'
  "\\uplus ": '\u0228E'
  "{\\sqsubset}": '\u0228F'
  "\\sqsubset ": '\u0228F'
  "{\\sqsupset}": '\u02290'
  "\\sqsupset ": '\u02290'
  "{\\sqsubseteq}": '\u02291'
  "\\sqsubseteq ": '\u02291'
  "{\\sqsupseteq}": '\u02292'
  "\\sqsupseteq ": '\u02292'
  "{\\sqcap}": '\u02293'
  "\\sqcap ": '\u02293'
  "{\\sqcup}": '\u02294'
  "\\sqcup ": '\u02294'
  "{\\oplus}": '\u02295'
  "\\oplus ": '\u02295'
  "{\\ominus}": '\u02296'
  "\\ominus ": '\u02296'
  "{\\otimes}": '\u02297'
  "\\otimes ": '\u02297'
  "{\\oslash}": '\u02298'
  "\\oslash ": '\u02298'
  "{\\odot}": '\u02299'
  "\\odot ": '\u02299'
  "{\\circledcirc}": '\u0229A'
  "\\circledcirc ": '\u0229A'
  "{\\circledast}": '\u0229B'
  "\\circledast ": '\u0229B'
  "{\\circleddash}": '\u0229D'
  "\\circleddash ": '\u0229D'
  "{\\boxplus}": '\u0229E'
  "\\boxplus ": '\u0229E'
  "{\\boxminus}": '\u0229F'
  "\\boxminus ": '\u0229F'
  "{\\boxtimes}": '\u022A0'
  "\\boxtimes ": '\u022A0'
  "{\\boxdot}": '\u022A1'
  "\\boxdot ": '\u022A1'
  "{\\vdash}": '\u022A2'
  "\\vdash ": '\u022A2'
  "{\\dashv}": '\u022A3'
  "\\dashv ": '\u022A3'
  "{\\top}": '\u022A4'
  "\\top ": '\u022A4'
  "{\\perp}": '\u022A5'
  "\\perp ": '\u022A5'
  "{\\truestate}": '\u022A7'
  "\\truestate ": '\u022A7'
  "{\\forcesextra}": '\u022A8'
  "\\forcesextra ": '\u022A8'
  "{\\Vdash}": '\u022A9'
  "\\Vdash ": '\u022A9'
  "{\\Vvdash}": '\u022AA'
  "\\Vvdash ": '\u022AA'
  "{\\VDash}": '\u022AB'
  "\\VDash ": '\u022AB'
  "{\\nvdash}": '\u022AC'
  "\\nvdash ": '\u022AC'
  "{\\nvDash}": '\u022AD'
  "\\nvDash ": '\u022AD'
  "{\\nVdash}": '\u022AE'
  "\\nVdash ": '\u022AE'
  "{\\nVDash}": '\u022AF'
  "\\nVDash ": '\u022AF'
  "{\\vartriangleleft}": '\u022B2'
  "\\vartriangleleft ": '\u022B2'
  "{\\vartriangleright}": '\u022B3'
  "\\vartriangleright ": '\u022B3'
  "{\\trianglelefteq}": '\u022B4'
  "\\trianglelefteq ": '\u022B4'
  "{\\trianglerighteq}": '\u022B5'
  "\\trianglerighteq ": '\u022B5'
  "{\\original}": '\u022B6'
  "\\original ": '\u022B6'
  "{\\image}": '\u022B7'
  "\\image ": '\u022B7'
  "{\\multimap}": '\u022B8'
  "\\multimap ": '\u022B8'
  "{\\hermitconjmatrix}": '\u022B9'
  "\\hermitconjmatrix ": '\u022B9'
  "{\\intercal}": '\u022BA'
  "\\intercal ": '\u022BA'
  "{\\veebar}": '\u022BB'
  "\\veebar ": '\u022BB'
  "{\\rightanglearc}": '\u022BE'
  "\\rightanglearc ": '\u022BE'
  "\\ElsevierGlyph{22C0}": '\u022C0'
  "\\ElsevierGlyph{22C1}": '\u022C1'
  "{\\bigcap}": '\u022C2'
  "\\bigcap ": '\u022C2'
  "{\\bigcup}": '\u022C3'
  "\\bigcup ": '\u022C3'
  "{\\diamond}": '\u022C4'
  "\\diamond ": '\u022C4'
  "{\\cdot}": '\u022C5'
  "\\cdot ": '\u022C5'
  "{\\star}": '\u022C6'
  "\\star ": '\u022C6'
  "{\\divideontimes}": '\u022C7'
  "\\divideontimes ": '\u022C7'
  "{\\bowtie}": '\u022C8'
  "\\bowtie ": '\u022C8'
  "{\\ltimes}": '\u022C9'
  "\\ltimes ": '\u022C9'
  "{\\rtimes}": '\u022CA'
  "\\rtimes ": '\u022CA'
  "{\\leftthreetimes}": '\u022CB'
  "\\leftthreetimes ": '\u022CB'
  "{\\rightthreetimes}": '\u022CC'
  "\\rightthreetimes ": '\u022CC'
  "{\\backsimeq}": '\u022CD'
  "\\backsimeq ": '\u022CD'
  "{\\curlyvee}": '\u022CE'
  "\\curlyvee ": '\u022CE'
  "{\\curlywedge}": '\u022CF'
  "\\curlywedge ": '\u022CF'
  "{\\Subset}": '\u022D0'
  "\\Subset ": '\u022D0'
  "{\\Supset}": '\u022D1'
  "\\Supset ": '\u022D1'
  "{\\Cap}": '\u022D2'
  "\\Cap ": '\u022D2'
  "{\\Cup}": '\u022D3'
  "\\Cup ": '\u022D3'
  "{\\pitchfork}": '\u022D4'
  "\\pitchfork ": '\u022D4'
  "{\\lessdot}": '\u022D6'
  "\\lessdot ": '\u022D6'
  "{\\gtrdot}": '\u022D7'
  "\\gtrdot ": '\u022D7'
  "{\\verymuchless}": '\u022D8'
  "\\verymuchless ": '\u022D8'
  "{\\verymuchgreater}": '\u022D9'
  "\\verymuchgreater ": '\u022D9'
  "{\\lesseqgtr}": '\u022DA'
  "\\lesseqgtr ": '\u022DA'
  "{\\gtreqless}": '\u022DB'
  "\\gtreqless ": '\u022DB'
  "{\\curlyeqprec}": '\u022DE'
  "\\curlyeqprec ": '\u022DE'
  "{\\curlyeqsucc}": '\u022DF'
  "\\curlyeqsucc ": '\u022DF'
  "{\\not\\sqsubseteq}": '\u022E2'
  "\\not\\sqsubseteq ": '\u022E2'
  "{\\not\\sqsupseteq}": '\u022E3'
  "\\not\\sqsupseteq ": '\u022E3'
  "{\\Elzsqspne}": '\u022E5'
  "\\Elzsqspne ": '\u022E5'
  "{\\lnsim}": '\u022E6'
  "\\lnsim ": '\u022E6'
  "{\\gnsim}": '\u022E7'
  "\\gnsim ": '\u022E7'
  "{\\precedesnotsimilar}": '\u022E8'
  "\\precedesnotsimilar ": '\u022E8'
  "{\\succnsim}": '\u022E9'
  "\\succnsim ": '\u022E9'
  "{\\ntriangleleft}": '\u022EA'
  "\\ntriangleleft ": '\u022EA'
  "{\\ntriangleright}": '\u022EB'
  "\\ntriangleright ": '\u022EB'
  "{\\ntrianglelefteq}": '\u022EC'
  "\\ntrianglelefteq ": '\u022EC'
  "{\\ntrianglerighteq}": '\u022ED'
  "\\ntrianglerighteq ": '\u022ED'
  "{\\vdots}": '\u022EE'
  "\\vdots ": '\u022EE'
  "{\\cdots}": '\u022EF'
  "\\cdots ": '\u022EF'
  "{\\upslopeellipsis}": '\u022F0'
  "\\upslopeellipsis ": '\u022F0'
  "{\\downslopeellipsis}": '\u022F1'
  "\\downslopeellipsis ": '\u022F1'
  "{\\barwedge}": '\u02305'
  "\\barwedge ": '\u02305'
  "{\\perspcorrespond}": '\u02306'
  "\\perspcorrespond ": '\u02306'
  "{\\lceil}": '\u02308'
  "\\lceil ": '\u02308'
  "{\\rceil}": '\u02309'
  "\\rceil ": '\u02309'
  "{\\lfloor}": '\u0230A'
  "\\lfloor ": '\u0230A'
  "{\\rfloor}": '\u0230B'
  "\\rfloor ": '\u0230B'
  "{\\recorder}": '\u02315'
  "\\recorder ": '\u02315'
  "\\mathchar\"2208": '\u02316'
  "{\\ulcorner}": '\u0231C'
  "\\ulcorner ": '\u0231C'
  "{\\urcorner}": '\u0231D'
  "\\urcorner ": '\u0231D'
  "{\\llcorner}": '\u0231E'
  "\\llcorner ": '\u0231E'
  "{\\lrcorner}": '\u0231F'
  "\\lrcorner ": '\u0231F'
  "{\\frown}": '\u02322'
  "\\frown ": '\u02322'
  "{\\smile}": '\u02323'
  "\\smile ": '\u02323'
  "\\ElsevierGlyph{E838}": '\u0233D'
  "{\\Elzdlcorn}": '\u023A3'
  "\\Elzdlcorn ": '\u023A3'
  "{\\lmoustache}": '\u023B0'
  "\\lmoustache ": '\u023B0'
  "{\\rmoustache}": '\u023B1'
  "\\rmoustache ": '\u023B1'
  "{\\textvisiblespace}": '\u02423'
  "\\textvisiblespace ": '\u02423'
  "\\ding{172}": '\u02460'
  "\\ding{173}": '\u02461'
  "\\ding{174}": '\u02462'
  "\\ding{175}": '\u02463'
  "\\ding{176}": '\u02464'
  "\\ding{177}": '\u02465'
  "\\ding{178}": '\u02466'
  "\\ding{179}": '\u02467'
  "\\ding{180}": '\u02468'
  "\\ding{181}": '\u02469'
  "{\\circledS}": '\u024C8'
  "\\circledS ": '\u024C8'
  "{\\Elzdshfnc}": '\u02506'
  "\\Elzdshfnc ": '\u02506'
  "{\\Elzsqfnw}": '\u02519'
  "\\Elzsqfnw ": '\u02519'
  "{\\diagup}": '\u02571'
  "\\diagup ": '\u02571'
  "\\ding{110}": '\u025A0'
  "{\\square}": '\u025A1'
  "\\square ": '\u025A1'
  "{\\blacksquare}": '\u025AA'
  "\\blacksquare ": '\u025AA'
  "\\fbox{~~}": '\u025AD'
  "{\\Elzvrecto}": '\u025AF'
  "\\Elzvrecto ": '\u025AF'
  "\\ElsevierGlyph{E381}": '\u025B1'
  "\\ding{115}": '\u025B2'
  "{\\bigtriangleup}": '\u025B3'
  "\\bigtriangleup ": '\u025B3'
  "{\\blacktriangle}": '\u025B4'
  "\\blacktriangle ": '\u025B4'
  "{\\vartriangle}": '\u025B5'
  "\\vartriangle ": '\u025B5'
  "{\\blacktriangleright}": '\u025B8'
  "\\blacktriangleright ": '\u025B8'
  "{\\triangleright}": '\u025B9'
  "\\triangleright ": '\u025B9'
  "\\ding{116}": '\u025BC'
  "{\\bigtriangledown}": '\u025BD'
  "\\bigtriangledown ": '\u025BD'
  "{\\blacktriangledown}": '\u025BE'
  "\\blacktriangledown ": '\u025BE'
  "{\\triangledown}": '\u025BF'
  "\\triangledown ": '\u025BF'
  "{\\blacktriangleleft}": '\u025C2'
  "\\blacktriangleleft ": '\u025C2'
  "{\\triangleleft}": '\u025C3'
  "\\triangleleft ": '\u025C3'
  "\\ding{117}": '\u025C6'
  "{\\lozenge}": '\u025CA'
  "\\lozenge ": '\u025CA'
  "{\\bigcirc}": '\u025CB'
  "\\bigcirc ": '\u025CB'
  "\\ding{108}": '\u025CF'
  "{\\Elzcirfl}": '\u025D0'
  "\\Elzcirfl ": '\u025D0'
  "{\\Elzcirfr}": '\u025D1'
  "\\Elzcirfr ": '\u025D1'
  "{\\Elzcirfb}": '\u025D2'
  "\\Elzcirfb ": '\u025D2'
  "\\ding{119}": '\u025D7'
  "{\\Elzrvbull}": '\u025D8'
  "\\Elzrvbull ": '\u025D8'
  "{\\Elzsqfl}": '\u025E7'
  "\\Elzsqfl ": '\u025E7'
  "{\\Elzsqfr}": '\u025E8'
  "\\Elzsqfr ": '\u025E8'
  "{\\Elzsqfse}": '\u025EA'
  "\\Elzsqfse ": '\u025EA'
  "{\\bigcirc}": '\u025EF'
  "\\bigcirc ": '\u025EF'
  "\\ding{72}": '\u02605'
  "\\ding{73}": '\u02606'
  "\\ding{37}": '\u0260E'
  "\\ding{42}": '\u0261B'
  "\\ding{43}": '\u0261E'
  "{\\rightmoon}": '\u0263E'
  "\\rightmoon ": '\u0263E'
  "{\\mercury}": '\u0263F'
  "\\mercury ": '\u0263F'
  "{\\venus}": '\u02640'
  "\\venus ": '\u02640'
  "{\\male}": '\u02642'
  "\\male ": '\u02642'
  "{\\jupiter}": '\u02643'
  "\\jupiter ": '\u02643'
  "{\\saturn}": '\u02644'
  "\\saturn ": '\u02644'
  "{\\uranus}": '\u02645'
  "\\uranus ": '\u02645'
  "{\\neptune}": '\u02646'
  "\\neptune ": '\u02646'
  "{\\pluto}": '\u02647'
  "\\pluto ": '\u02647'
  "{\\aries}": '\u02648'
  "\\aries ": '\u02648'
  "{\\taurus}": '\u02649'
  "\\taurus ": '\u02649'
  "{\\gemini}": '\u0264A'
  "\\gemini ": '\u0264A'
  "{\\cancer}": '\u0264B'
  "\\cancer ": '\u0264B'
  "{\\leo}": '\u0264C'
  "\\leo ": '\u0264C'
  "{\\virgo}": '\u0264D'
  "\\virgo ": '\u0264D'
  "{\\libra}": '\u0264E'
  "\\libra ": '\u0264E'
  "{\\scorpio}": '\u0264F'
  "\\scorpio ": '\u0264F'
  "{\\sagittarius}": '\u02650'
  "\\sagittarius ": '\u02650'
  "{\\capricornus}": '\u02651'
  "\\capricornus ": '\u02651'
  "{\\aquarius}": '\u02652'
  "\\aquarius ": '\u02652'
  "{\\pisces}": '\u02653'
  "\\pisces ": '\u02653'
  "\\ding{171}": '\u02660'
  "{\\diamond}": '\u02662'
  "\\diamond ": '\u02662'
  "\\ding{168}": '\u02663'
  "\\ding{170}": '\u02665'
  "\\ding{169}": '\u02666'
  "{\\quarternote}": '\u02669'
  "\\quarternote ": '\u02669'
  "{\\eighthnote}": '\u0266A'
  "\\eighthnote ": '\u0266A'
  "{\\flat}": '\u0266D'
  "\\flat ": '\u0266D'
  "{\\natural}": '\u0266E'
  "\\natural ": '\u0266E'
  "{\\sharp}": '\u0266F'
  "\\sharp ": '\u0266F'
  "\\ding{33}": '\u02701'
  "\\ding{34}": '\u02702'
  "\\ding{35}": '\u02703'
  "\\ding{36}": '\u02704'
  "\\ding{38}": '\u02706'
  "\\ding{39}": '\u02707'
  "\\ding{40}": '\u02708'
  "\\ding{41}": '\u02709'
  "\\ding{44}": '\u0270C'
  "\\ding{45}": '\u0270D'
  "\\ding{46}": '\u0270E'
  "\\ding{47}": '\u0270F'
  "\\ding{48}": '\u02710'
  "\\ding{49}": '\u02711'
  "\\ding{50}": '\u02712'
  "\\ding{51}": '\u02713'
  "\\ding{52}": '\u02714'
  "\\ding{53}": '\u02715'
  "\\ding{54}": '\u02716'
  "\\ding{55}": '\u02717'
  "\\ding{56}": '\u02718'
  "\\ding{57}": '\u02719'
  "\\ding{58}": '\u0271A'
  "\\ding{59}": '\u0271B'
  "\\ding{60}": '\u0271C'
  "\\ding{61}": '\u0271D'
  "\\ding{62}": '\u0271E'
  "\\ding{63}": '\u0271F'
  "\\ding{64}": '\u02720'
  "\\ding{65}": '\u02721'
  "\\ding{66}": '\u02722'
  "\\ding{67}": '\u02723'
  "\\ding{68}": '\u02724'
  "\\ding{69}": '\u02725'
  "\\ding{70}": '\u02726'
  "\\ding{71}": '\u02727'
  "\\ding{73}": '\u02729'
  "\\ding{74}": '\u0272A'
  "\\ding{75}": '\u0272B'
  "\\ding{76}": '\u0272C'
  "\\ding{77}": '\u0272D'
  "\\ding{78}": '\u0272E'
  "\\ding{79}": '\u0272F'
  "\\ding{80}": '\u02730'
  "\\ding{81}": '\u02731'
  "\\ding{82}": '\u02732'
  "\\ding{83}": '\u02733'
  "\\ding{84}": '\u02734'
  "\\ding{85}": '\u02735'
  "\\ding{86}": '\u02736'
  "\\ding{87}": '\u02737'
  "\\ding{88}": '\u02738'
  "\\ding{89}": '\u02739'
  "\\ding{90}": '\u0273A'
  "\\ding{91}": '\u0273B'
  "\\ding{92}": '\u0273C'
  "\\ding{93}": '\u0273D'
  "\\ding{94}": '\u0273E'
  "\\ding{95}": '\u0273F'
  "\\ding{96}": '\u02740'
  "\\ding{97}": '\u02741'
  "\\ding{98}": '\u02742'
  "\\ding{99}": '\u02743'
  "\\ding{100}": '\u02744'
  "\\ding{101}": '\u02745'
  "\\ding{102}": '\u02746'
  "\\ding{103}": '\u02747'
  "\\ding{104}": '\u02748'
  "\\ding{105}": '\u02749'
  "\\ding{106}": '\u0274A'
  "\\ding{107}": '\u0274B'
  "\\ding{109}": '\u0274D'
  "\\ding{111}": '\u0274F'
  "\\ding{112}": '\u02750'
  "\\ding{113}": '\u02751'
  "\\ding{114}": '\u02752'
  "\\ding{118}": '\u02756'
  "\\ding{120}": '\u02758'
  "\\ding{121}": '\u02759'
  "\\ding{122}": '\u0275A'
  "\\ding{123}": '\u0275B'
  "\\ding{124}": '\u0275C'
  "\\ding{125}": '\u0275D'
  "\\ding{126}": '\u0275E'
  "\\ding{161}": '\u02761'
  "\\ding{162}": '\u02762'
  "\\ding{163}": '\u02763'
  "\\ding{164}": '\u02764'
  "\\ding{165}": '\u02765'
  "\\ding{166}": '\u02766'
  "\\ding{167}": '\u02767'
  "\\ding{182}": '\u02776'
  "\\ding{183}": '\u02777'
  "\\ding{184}": '\u02778'
  "\\ding{185}": '\u02779'
  "\\ding{186}": '\u0277A'
  "\\ding{187}": '\u0277B'
  "\\ding{188}": '\u0277C'
  "\\ding{189}": '\u0277D'
  "\\ding{190}": '\u0277E'
  "\\ding{191}": '\u0277F'
  "\\ding{192}": '\u02780'
  "\\ding{193}": '\u02781'
  "\\ding{194}": '\u02782'
  "\\ding{195}": '\u02783'
  "\\ding{196}": '\u02784'
  "\\ding{197}": '\u02785'
  "\\ding{198}": '\u02786'
  "\\ding{199}": '\u02787'
  "\\ding{200}": '\u02788'
  "\\ding{201}": '\u02789'
  "\\ding{202}": '\u0278A'
  "\\ding{203}": '\u0278B'
  "\\ding{204}": '\u0278C'
  "\\ding{205}": '\u0278D'
  "\\ding{206}": '\u0278E'
  "\\ding{207}": '\u0278F'
  "\\ding{208}": '\u02790'
  "\\ding{209}": '\u02791'
  "\\ding{210}": '\u02792'
  "\\ding{211}": '\u02793'
  "\\ding{212}": '\u02794'
  "\\ding{216}": '\u02798'
  "\\ding{217}": '\u02799'
  "\\ding{218}": '\u0279A'
  "\\ding{219}": '\u0279B'
  "\\ding{220}": '\u0279C'
  "\\ding{221}": '\u0279D'
  "\\ding{222}": '\u0279E'
  "\\ding{223}": '\u0279F'
  "\\ding{224}": '\u027A0'
  "\\ding{225}": '\u027A1'
  "\\ding{226}": '\u027A2'
  "\\ding{227}": '\u027A3'
  "\\ding{228}": '\u027A4'
  "\\ding{229}": '\u027A5'
  "\\ding{230}": '\u027A6'
  "\\ding{231}": '\u027A7'
  "\\ding{232}": '\u027A8'
  "\\ding{233}": '\u027A9'
  "\\ding{234}": '\u027AA'
  "\\ding{235}": '\u027AB'
  "\\ding{236}": '\u027AC'
  "\\ding{237}": '\u027AD'
  "\\ding{238}": '\u027AE'
  "\\ding{239}": '\u027AF'
  "\\ding{241}": '\u027B1'
  "\\ding{242}": '\u027B2'
  "\\ding{243}": '\u027B3'
  "\\ding{244}": '\u027B4'
  "\\ding{245}": '\u027B5'
  "\\ding{246}": '\u027B6'
  "\\ding{247}": '\u027B7'
  "\\ding{248}": '\u027B8'
  "\\ding{249}": '\u027B9'
  "\\ding{250}": '\u027BA'
  "\\ding{251}": '\u027BB'
  "\\ding{252}": '\u027BC'
  "\\ding{253}": '\u027BD'
  "\\ding{254}": '\u027BE'
  "{\\langle}": '\u027E8'
  "\\langle ": '\u027E8'
  "{\\rangle}": '\u027E9'
  "\\rangle ": '\u027E9'
  "{\\longleftarrow}": '\u027F5'
  "\\longleftarrow ": '\u027F5'
  "{\\longrightarrow}": '\u027F6'
  "\\longrightarrow ": '\u027F6'
  "{\\longleftrightarrow}": '\u027F7'
  "\\longleftrightarrow ": '\u027F7'
  "{\\Longleftarrow}": '\u027F8'
  "\\Longleftarrow ": '\u027F8'
  "{\\Longrightarrow}": '\u027F9'
  "\\Longrightarrow ": '\u027F9'
  "{\\Longleftrightarrow}": '\u027FA'
  "\\Longleftrightarrow ": '\u027FA'
  "{\\longmapsto}": '\u027FC'
  "\\longmapsto ": '\u027FC'
  "\\sim\\joinrel\\leadsto": '\u027FF'
  "\\ElsevierGlyph{E212}": '\u02905'
  "{\\UpArrowBar}": '\u02912'
  "\\UpArrowBar ": '\u02912'
  "{\\DownArrowBar}": '\u02913'
  "\\DownArrowBar ": '\u02913'
  "\\ElsevierGlyph{E20C}": '\u02923'
  "\\ElsevierGlyph{E20D}": '\u02924'
  "\\ElsevierGlyph{E20B}": '\u02925'
  "\\ElsevierGlyph{E20A}": '\u02926'
  "\\ElsevierGlyph{E211}": '\u02927'
  "\\ElsevierGlyph{E20E}": '\u02928'
  "\\ElsevierGlyph{E20F}": '\u02929'
  "\\ElsevierGlyph{E210}": '\u0292A'
  "\\ElsevierGlyph{E21C}": '\u02933'
  "\\ElsevierGlyph{E21A}": '\u02936'
  "\\ElsevierGlyph{E219}": '\u02937'
  "{\\Elolarr}": '\u02940'
  "\\Elolarr ": '\u02940'
  "{\\Elorarr}": '\u02941'
  "\\Elorarr ": '\u02941'
  "{\\ElzRlarr}": '\u02942'
  "\\ElzRlarr ": '\u02942'
  "{\\ElzrLarr}": '\u02944'
  "\\ElzrLarr ": '\u02944'
  "{\\Elzrarrx}": '\u02947'
  "\\Elzrarrx ": '\u02947'
  "{\\LeftRightVector}": '\u0294E'
  "\\LeftRightVector ": '\u0294E'
  "{\\RightUpDownVector}": '\u0294F'
  "\\RightUpDownVector ": '\u0294F'
  "{\\DownLeftRightVector}": '\u02950'
  "\\DownLeftRightVector ": '\u02950'
  "{\\LeftUpDownVector}": '\u02951'
  "\\LeftUpDownVector ": '\u02951'
  "{\\LeftVectorBar}": '\u02952'
  "\\LeftVectorBar ": '\u02952'
  "{\\RightVectorBar}": '\u02953'
  "\\RightVectorBar ": '\u02953'
  "{\\RightUpVectorBar}": '\u02954'
  "\\RightUpVectorBar ": '\u02954'
  "{\\RightDownVectorBar}": '\u02955'
  "\\RightDownVectorBar ": '\u02955'
  "{\\DownLeftVectorBar}": '\u02956'
  "\\DownLeftVectorBar ": '\u02956'
  "{\\DownRightVectorBar}": '\u02957'
  "\\DownRightVectorBar ": '\u02957'
  "{\\LeftUpVectorBar}": '\u02958'
  "\\LeftUpVectorBar ": '\u02958'
  "{\\LeftDownVectorBar}": '\u02959'
  "\\LeftDownVectorBar ": '\u02959'
  "{\\LeftTeeVector}": '\u0295A'
  "\\LeftTeeVector ": '\u0295A'
  "{\\RightTeeVector}": '\u0295B'
  "\\RightTeeVector ": '\u0295B'
  "{\\RightUpTeeVector}": '\u0295C'
  "\\RightUpTeeVector ": '\u0295C'
  "{\\RightDownTeeVector}": '\u0295D'
  "\\RightDownTeeVector ": '\u0295D'
  "{\\DownLeftTeeVector}": '\u0295E'
  "\\DownLeftTeeVector ": '\u0295E'
  "{\\DownRightTeeVector}": '\u0295F'
  "\\DownRightTeeVector ": '\u0295F'
  "{\\LeftUpTeeVector}": '\u02960'
  "\\LeftUpTeeVector ": '\u02960'
  "{\\LeftDownTeeVector}": '\u02961'
  "\\LeftDownTeeVector ": '\u02961'
  "{\\UpEquilibrium}": '\u0296E'
  "\\UpEquilibrium ": '\u0296E'
  "{\\ReverseUpEquilibrium}": '\u0296F'
  "\\ReverseUpEquilibrium ": '\u0296F'
  "{\\RoundImplies}": '\u02970'
  "\\RoundImplies ": '\u02970'
  "\\ElsevierGlyph{E214}": '\u0297C'
  "\\ElsevierGlyph{E215}": '\u0297D'
  "{\\Elztfnc}": '\u02980'
  "\\Elztfnc ": '\u02980'
  "\\ElsevierGlyph{3018}": '\u02985'
  "{\\Elroang}": '\u02986'
  "\\Elroang ": '\u02986'
  "<\\kern-0.58em(": '\u02993'
  "\\ElsevierGlyph{E291}": '\u02994'
  "{\\Elzddfnc}": '\u02999'
  "\\Elzddfnc ": '\u02999'
  "{\\Angle}": '\u0299C'
  "\\Angle ": '\u0299C'
  "{\\Elzlpargt}": '\u029A0'
  "\\Elzlpargt ": '\u029A0'
  "\\ElsevierGlyph{E260}": '\u029B5'
  "\\ElsevierGlyph{E61B}": '\u029B6'
  "{\\ElzLap}": '\u029CA'
  "\\ElzLap ": '\u029CA'
  "{\\Elzdefas}": '\u029CB'
  "\\Elzdefas ": '\u029CB'
  "{\\LeftTriangleBar}": '\u029CF'
  "\\LeftTriangleBar ": '\u029CF'
  "{\\RightTriangleBar}": '\u029D0'
  "\\RightTriangleBar ": '\u029D0'
  "\\ElsevierGlyph{E372}": '\u029DC'
  "{\\blacklozenge}": '\u029EB'
  "\\blacklozenge ": '\u029EB'
  "{\\RuleDelayed}": '\u029F4'
  "\\RuleDelayed ": '\u029F4'
  "{\\Elxuplus}": '\u02A04'
  "\\Elxuplus ": '\u02A04'
  "{\\ElzThr}": '\u02A05'
  "\\ElzThr ": '\u02A05'
  "{\\Elxsqcup}": '\u02A06'
  "\\Elxsqcup ": '\u02A06'
  "{\\ElzInf}": '\u02A07'
  "\\ElzInf ": '\u02A07'
  "{\\ElzSup}": '\u02A08'
  "\\ElzSup ": '\u02A08'
  "{\\ElzCint}": '\u02A0D'
  "\\ElzCint ": '\u02A0D'
  "{\\clockoint}": '\u02A0F'
  "\\clockoint ": '\u02A0F'
  "\\ElsevierGlyph{E395}": '\u02A10'
  "{\\sqrint}": '\u02A16'
  "\\sqrint ": '\u02A16'
  "\\ElsevierGlyph{E25A}": '\u02A25'
  "\\ElsevierGlyph{E25B}": '\u02A2A'
  "\\ElsevierGlyph{E25C}": '\u02A2D'
  "\\ElsevierGlyph{E25D}": '\u02A2E'
  "{\\ElzTimes}": '\u02A2F'
  "\\ElzTimes ": '\u02A2F'
  "\\ElsevierGlyph{E25E}": '\u02A34'
  "\\ElsevierGlyph{E25E}": '\u02A35'
  "\\ElsevierGlyph{E259}": '\u02A3C'
  "{\\amalg}": '\u02A3F'
  "\\amalg ": '\u02A3F'
  "{\\ElzAnd}": '\u02A53'
  "\\ElzAnd ": '\u02A53'
  "{\\ElzOr}": '\u02A54'
  "\\ElzOr ": '\u02A54'
  "\\ElsevierGlyph{E36E}": '\u02A55'
  "{\\ElOr}": '\u02A56'
  "\\ElOr ": '\u02A56'
  "{\\perspcorrespond}": '\u02A5E'
  "\\perspcorrespond ": '\u02A5E'
  "{\\Elzminhat}": '\u02A5F'
  "\\Elzminhat ": '\u02A5F'
  "\\ElsevierGlyph{225A}": '\u02A63'
  "\\stackrel{*}{=}": '\u02A6E'
  "{\\Equal}": '\u02A75'
  "\\Equal ": '\u02A75'
  "{\\leqslant}": '\u02A7D'
  "\\leqslant ": '\u02A7D'
  "{\\geqslant}": '\u02A7E'
  "\\geqslant ": '\u02A7E'
  "{\\lessapprox}": '\u02A85'
  "\\lessapprox ": '\u02A85'
  "{\\gtrapprox}": '\u02A86'
  "\\gtrapprox ": '\u02A86'
  "{\\lneq}": '\u02A87'
  "\\lneq ": '\u02A87'
  "{\\gneq}": '\u02A88'
  "\\gneq ": '\u02A88'
  "{\\lnapprox}": '\u02A89'
  "\\lnapprox ": '\u02A89'
  "{\\gnapprox}": '\u02A8A'
  "\\gnapprox ": '\u02A8A'
  "{\\lesseqqgtr}": '\u02A8B'
  "\\lesseqqgtr ": '\u02A8B'
  "{\\gtreqqless}": '\u02A8C'
  "\\gtreqqless ": '\u02A8C'
  "{\\eqslantless}": '\u02A95'
  "\\eqslantless ": '\u02A95'
  "{\\eqslantgtr}": '\u02A96'
  "\\eqslantgtr ": '\u02A96'
  "\\Pisymbol{ppi020}{117}": '\u02A9D'
  "\\Pisymbol{ppi020}{105}": '\u02A9E'
  "{\\NestedLessLess}": '\u02AA1'
  "\\NestedLessLess ": '\u02AA1'
  "{\\NestedGreaterGreater}": '\u02AA2'
  "\\NestedGreaterGreater ": '\u02AA2'
  "{\\preceq}": '\u02AAF'
  "\\preceq ": '\u02AAF'
  "{\\succeq}": '\u02AB0'
  "\\succeq ": '\u02AB0'
  "{\\precneqq}": '\u02AB5'
  "\\precneqq ": '\u02AB5'
  "{\\succneqq}": '\u02AB6'
  "\\succneqq ": '\u02AB6'
  "{\\precapprox}": '\u02AB7'
  "\\precapprox ": '\u02AB7'
  "{\\succapprox}": '\u02AB8'
  "\\succapprox ": '\u02AB8'
  "{\\precnapprox}": '\u02AB9'
  "\\precnapprox ": '\u02AB9'
  "{\\succnapprox}": '\u02ABA'
  "\\succnapprox ": '\u02ABA'
  "{\\subseteqq}": '\u02AC5'
  "\\subseteqq ": '\u02AC5'
  "{\\supseteqq}": '\u02AC6'
  "\\supseteqq ": '\u02AC6'
  "{\\subsetneqq}": '\u02ACB'
  "\\subsetneqq ": '\u02ACB'
  "{\\supsetneqq}": '\u02ACC'
  "\\supsetneqq ": '\u02ACC'
  "\\ElsevierGlyph{E30D}": '\u02AEB'
  "{\\Elztdcol}": '\u02AF6'
  "\\Elztdcol ": '\u02AF6'
  "{{/}\\!\\!{/}}": '\u02AFD'
  "\\ElsevierGlyph{300A}": '\u0300A'
  "\\ElsevierGlyph{300B}": '\u0300B'
  "\\ElsevierGlyph{3018}": '\u03018'
  "\\ElsevierGlyph{3019}": '\u03019'
  "{\\openbracketleft}": '\u0301A'
  "\\openbracketleft ": '\u0301A'
  "{\\openbracketright}": '\u0301B'
  "\\openbracketright ": '\u0301B'
  "\\mathbf{A}": '\u1D400'
  "\\mathbf{B}": '\u1D401'
  "\\mathbf{C}": '\u1D402'
  "\\mathbf{D}": '\u1D403'
  "\\mathbf{E}": '\u1D404'
  "\\mathbf{F}": '\u1D405'
  "\\mathbf{G}": '\u1D406'
  "\\mathbf{H}": '\u1D407'
  "\\mathbf{I}": '\u1D408'
  "\\mathbf{J}": '\u1D409'
  "\\mathbf{K}": '\u1D40A'
  "\\mathbf{L}": '\u1D40B'
  "\\mathbf{M}": '\u1D40C'
  "\\mathbf{N}": '\u1D40D'
  "\\mathbf{O}": '\u1D40E'
  "\\mathbf{P}": '\u1D40F'
  "\\mathbf{Q}": '\u1D410'
  "\\mathbf{R}": '\u1D411'
  "\\mathbf{S}": '\u1D412'
  "\\mathbf{T}": '\u1D413'
  "\\mathbf{U}": '\u1D414'
  "\\mathbf{V}": '\u1D415'
  "\\mathbf{W}": '\u1D416'
  "\\mathbf{X}": '\u1D417'
  "\\mathbf{Y}": '\u1D418'
  "\\mathbf{Z}": '\u1D419'
  "\\mathbf{a}": '\u1D41A'
  "\\mathbf{b}": '\u1D41B'
  "\\mathbf{c}": '\u1D41C'
  "\\mathbf{d}": '\u1D41D'
  "\\mathbf{e}": '\u1D41E'
  "\\mathbf{f}": '\u1D41F'
  "\\mathbf{g}": '\u1D420'
  "\\mathbf{h}": '\u1D421'
  "\\mathbf{i}": '\u1D422'
  "\\mathbf{j}": '\u1D423'
  "\\mathbf{k}": '\u1D424'
  "\\mathbf{l}": '\u1D425'
  "\\mathbf{m}": '\u1D426'
  "\\mathbf{n}": '\u1D427'
  "\\mathbf{o}": '\u1D428'
  "\\mathbf{p}": '\u1D429'
  "\\mathbf{q}": '\u1D42A'
  "\\mathbf{r}": '\u1D42B'
  "\\mathbf{s}": '\u1D42C'
  "\\mathbf{t}": '\u1D42D'
  "\\mathbf{u}": '\u1D42E'
  "\\mathbf{v}": '\u1D42F'
  "\\mathbf{w}": '\u1D430'
  "\\mathbf{x}": '\u1D431'
  "\\mathbf{y}": '\u1D432'
  "\\mathbf{z}": '\u1D433'
  "\\mathsl{A}": '\u1D434'
  "\\mathsl{B}": '\u1D435'
  "\\mathsl{C}": '\u1D436'
  "\\mathsl{D}": '\u1D437'
  "\\mathsl{E}": '\u1D438'
  "\\mathsl{F}": '\u1D439'
  "\\mathsl{G}": '\u1D43A'
  "\\mathsl{H}": '\u1D43B'
  "\\mathsl{I}": '\u1D43C'
  "\\mathsl{J}": '\u1D43D'
  "\\mathsl{K}": '\u1D43E'
  "\\mathsl{L}": '\u1D43F'
  "\\mathsl{M}": '\u1D440'
  "\\mathsl{N}": '\u1D441'
  "\\mathsl{O}": '\u1D442'
  "\\mathsl{P}": '\u1D443'
  "\\mathsl{Q}": '\u1D444'
  "\\mathsl{R}": '\u1D445'
  "\\mathsl{S}": '\u1D446'
  "\\mathsl{T}": '\u1D447'
  "\\mathsl{U}": '\u1D448'
  "\\mathsl{V}": '\u1D449'
  "\\mathsl{W}": '\u1D44A'
  "\\mathsl{X}": '\u1D44B'
  "\\mathsl{Y}": '\u1D44C'
  "\\mathsl{Z}": '\u1D44D'
  "\\mathsl{a}": '\u1D44E'
  "\\mathsl{b}": '\u1D44F'
  "\\mathsl{c}": '\u1D450'
  "\\mathsl{d}": '\u1D451'
  "\\mathsl{e}": '\u1D452'
  "\\mathsl{f}": '\u1D453'
  "\\mathsl{g}": '\u1D454'
  "\\mathsl{i}": '\u1D456'
  "\\mathsl{j}": '\u1D457'
  "\\mathsl{k}": '\u1D458'
  "\\mathsl{l}": '\u1D459'
  "\\mathsl{m}": '\u1D45A'
  "\\mathsl{n}": '\u1D45B'
  "\\mathsl{o}": '\u1D45C'
  "\\mathsl{p}": '\u1D45D'
  "\\mathsl{q}": '\u1D45E'
  "\\mathsl{r}": '\u1D45F'
  "\\mathsl{s}": '\u1D460'
  "\\mathsl{t}": '\u1D461'
  "\\mathsl{u}": '\u1D462'
  "\\mathsl{v}": '\u1D463'
  "\\mathsl{w}": '\u1D464'
  "\\mathsl{x}": '\u1D465'
  "\\mathsl{y}": '\u1D466'
  "\\mathsl{z}": '\u1D467'
  "\\mathbit{A}": '\u1D468'
  "\\mathbit{B}": '\u1D469'
  "\\mathbit{C}": '\u1D46A'
  "\\mathbit{D}": '\u1D46B'
  "\\mathbit{E}": '\u1D46C'
  "\\mathbit{F}": '\u1D46D'
  "\\mathbit{G}": '\u1D46E'
  "\\mathbit{H}": '\u1D46F'
  "\\mathbit{I}": '\u1D470'
  "\\mathbit{J}": '\u1D471'
  "\\mathbit{K}": '\u1D472'
  "\\mathbit{L}": '\u1D473'
  "\\mathbit{M}": '\u1D474'
  "\\mathbit{N}": '\u1D475'
  "\\mathbit{O}": '\u1D476'
  "\\mathbit{P}": '\u1D477'
  "\\mathbit{Q}": '\u1D478'
  "\\mathbit{R}": '\u1D479'
  "\\mathbit{S}": '\u1D47A'
  "\\mathbit{T}": '\u1D47B'
  "\\mathbit{U}": '\u1D47C'
  "\\mathbit{V}": '\u1D47D'
  "\\mathbit{W}": '\u1D47E'
  "\\mathbit{X}": '\u1D47F'
  "\\mathbit{Y}": '\u1D480'
  "\\mathbit{Z}": '\u1D481'
  "\\mathbit{a}": '\u1D482'
  "\\mathbit{b}": '\u1D483'
  "\\mathbit{c}": '\u1D484'
  "\\mathbit{d}": '\u1D485'
  "\\mathbit{e}": '\u1D486'
  "\\mathbit{f}": '\u1D487'
  "\\mathbit{g}": '\u1D488'
  "\\mathbit{h}": '\u1D489'
  "\\mathbit{i}": '\u1D48A'
  "\\mathbit{j}": '\u1D48B'
  "\\mathbit{k}": '\u1D48C'
  "\\mathbit{l}": '\u1D48D'
  "\\mathbit{m}": '\u1D48E'
  "\\mathbit{n}": '\u1D48F'
  "\\mathbit{o}": '\u1D490'
  "\\mathbit{p}": '\u1D491'
  "\\mathbit{q}": '\u1D492'
  "\\mathbit{r}": '\u1D493'
  "\\mathbit{s}": '\u1D494'
  "\\mathbit{t}": '\u1D495'
  "\\mathbit{u}": '\u1D496'
  "\\mathbit{v}": '\u1D497'
  "\\mathbit{w}": '\u1D498'
  "\\mathbit{x}": '\u1D499'
  "\\mathbit{y}": '\u1D49A'
  "\\mathbit{z}": '\u1D49B'
  "\\mathscr{A}": '\u1D49C'
  "\\mathscr{C}": '\u1D49E'
  "\\mathscr{D}": '\u1D49F'
  "\\mathscr{G}": '\u1D4A2'
  "\\mathscr{J}": '\u1D4A5'
  "\\mathscr{K}": '\u1D4A6'
  "\\mathscr{N}": '\u1D4A9'
  "\\mathscr{O}": '\u1D4AA'
  "\\mathscr{P}": '\u1D4AB'
  "\\mathscr{Q}": '\u1D4AC'
  "\\mathscr{S}": '\u1D4AE'
  "\\mathscr{T}": '\u1D4AF'
  "\\mathscr{U}": '\u1D4B0'
  "\\mathscr{V}": '\u1D4B1'
  "\\mathscr{W}": '\u1D4B2'
  "\\mathscr{X}": '\u1D4B3'
  "\\mathscr{Y}": '\u1D4B4'
  "\\mathscr{Z}": '\u1D4B5'
  "\\mathscr{a}": '\u1D4B6'
  "\\mathscr{b}": '\u1D4B7'
  "\\mathscr{c}": '\u1D4B8'
  "\\mathscr{d}": '\u1D4B9'
  "\\mathscr{f}": '\u1D4BB'
  "\\mathscr{h}": '\u1D4BD'
  "\\mathscr{i}": '\u1D4BE'
  "\\mathscr{j}": '\u1D4BF'
  "\\mathscr{k}": '\u1D4C0'
  "\\mathscr{l}": '\u1D4C1'
  "\\mathscr{m}": '\u1D4C2'
  "\\mathscr{n}": '\u1D4C3'
  "\\mathscr{p}": '\u1D4C5'
  "\\mathscr{q}": '\u1D4C6'
  "\\mathscr{r}": '\u1D4C7'
  "\\mathscr{s}": '\u1D4C8'
  "\\mathscr{t}": '\u1D4C9'
  "\\mathscr{u}": '\u1D4CA'
  "\\mathscr{v}": '\u1D4CB'
  "\\mathscr{w}": '\u1D4CC'
  "\\mathscr{x}": '\u1D4CD'
  "\\mathscr{y}": '\u1D4CE'
  "\\mathscr{z}": '\u1D4CF'
  "\\mathmit{A}": '\u1D4D0'
  "\\mathmit{B}": '\u1D4D1'
  "\\mathmit{C}": '\u1D4D2'
  "\\mathmit{D}": '\u1D4D3'
  "\\mathmit{E}": '\u1D4D4'
  "\\mathmit{F}": '\u1D4D5'
  "\\mathmit{G}": '\u1D4D6'
  "\\mathmit{H}": '\u1D4D7'
  "\\mathmit{I}": '\u1D4D8'
  "\\mathmit{J}": '\u1D4D9'
  "\\mathmit{K}": '\u1D4DA'
  "\\mathmit{L}": '\u1D4DB'
  "\\mathmit{M}": '\u1D4DC'
  "\\mathmit{N}": '\u1D4DD'
  "\\mathmit{O}": '\u1D4DE'
  "\\mathmit{P}": '\u1D4DF'
  "\\mathmit{Q}": '\u1D4E0'
  "\\mathmit{R}": '\u1D4E1'
  "\\mathmit{S}": '\u1D4E2'
  "\\mathmit{T}": '\u1D4E3'
  "\\mathmit{U}": '\u1D4E4'
  "\\mathmit{V}": '\u1D4E5'
  "\\mathmit{W}": '\u1D4E6'
  "\\mathmit{X}": '\u1D4E7'
  "\\mathmit{Y}": '\u1D4E8'
  "\\mathmit{Z}": '\u1D4E9'
  "\\mathmit{a}": '\u1D4EA'
  "\\mathmit{b}": '\u1D4EB'
  "\\mathmit{c}": '\u1D4EC'
  "\\mathmit{d}": '\u1D4ED'
  "\\mathmit{e}": '\u1D4EE'
  "\\mathmit{f}": '\u1D4EF'
  "\\mathmit{g}": '\u1D4F0'
  "\\mathmit{h}": '\u1D4F1'
  "\\mathmit{i}": '\u1D4F2'
  "\\mathmit{j}": '\u1D4F3'
  "\\mathmit{k}": '\u1D4F4'
  "\\mathmit{l}": '\u1D4F5'
  "\\mathmit{m}": '\u1D4F6'
  "\\mathmit{n}": '\u1D4F7'
  "\\mathmit{o}": '\u1D4F8'
  "\\mathmit{p}": '\u1D4F9'
  "\\mathmit{q}": '\u1D4FA'
  "\\mathmit{r}": '\u1D4FB'
  "\\mathmit{s}": '\u1D4FC'
  "\\mathmit{t}": '\u1D4FD'
  "\\mathmit{u}": '\u1D4FE'
  "\\mathmit{v}": '\u1D4FF'
  "\\mathmit{w}": '\u1D500'
  "\\mathmit{x}": '\u1D501'
  "\\mathmit{y}": '\u1D502'
  "\\mathmit{z}": '\u1D503'
  "\\mathfrak{A}": '\u1D504'
  "\\mathfrak{B}": '\u1D505'
  "\\mathfrak{D}": '\u1D507'
  "\\mathfrak{E}": '\u1D508'
  "\\mathfrak{F}": '\u1D509'
  "\\mathfrak{G}": '\u1D50A'
  "\\mathfrak{J}": '\u1D50D'
  "\\mathfrak{K}": '\u1D50E'
  "\\mathfrak{L}": '\u1D50F'
  "\\mathfrak{M}": '\u1D510'
  "\\mathfrak{N}": '\u1D511'
  "\\mathfrak{O}": '\u1D512'
  "\\mathfrak{P}": '\u1D513'
  "\\mathfrak{Q}": '\u1D514'
  "\\mathfrak{S}": '\u1D516'
  "\\mathfrak{T}": '\u1D517'
  "\\mathfrak{U}": '\u1D518'
  "\\mathfrak{V}": '\u1D519'
  "\\mathfrak{W}": '\u1D51A'
  "\\mathfrak{X}": '\u1D51B'
  "\\mathfrak{Y}": '\u1D51C'
  "\\mathfrak{a}": '\u1D51E'
  "\\mathfrak{b}": '\u1D51F'
  "\\mathfrak{c}": '\u1D520'
  "\\mathfrak{d}": '\u1D521'
  "\\mathfrak{e}": '\u1D522'
  "\\mathfrak{f}": '\u1D523'
  "\\mathfrak{g}": '\u1D524'
  "\\mathfrak{h}": '\u1D525'
  "\\mathfrak{i}": '\u1D526'
  "\\mathfrak{j}": '\u1D527'
  "\\mathfrak{k}": '\u1D528'
  "\\mathfrak{l}": '\u1D529'
  "\\mathfrak{m}": '\u1D52A'
  "\\mathfrak{n}": '\u1D52B'
  "\\mathfrak{o}": '\u1D52C'
  "\\mathfrak{p}": '\u1D52D'
  "\\mathfrak{q}": '\u1D52E'
  "\\mathfrak{r}": '\u1D52F'
  "\\mathfrak{s}": '\u1D530'
  "\\mathfrak{t}": '\u1D531'
  "\\mathfrak{u}": '\u1D532'
  "\\mathfrak{v}": '\u1D533'
  "\\mathfrak{w}": '\u1D534'
  "\\mathfrak{x}": '\u1D535'
  "\\mathfrak{y}": '\u1D536'
  "\\mathfrak{z}": '\u1D537'
  "\\mathbb{A}": '\u1D538'
  "\\mathbb{B}": '\u1D539'
  "\\mathbb{D}": '\u1D53B'
  "\\mathbb{E}": '\u1D53C'
  "\\mathbb{F}": '\u1D53D'
  "\\mathbb{G}": '\u1D53E'
  "\\mathbb{I}": '\u1D540'
  "\\mathbb{J}": '\u1D541'
  "\\mathbb{K}": '\u1D542'
  "\\mathbb{L}": '\u1D543'
  "\\mathbb{M}": '\u1D544'
  "\\mathbb{O}": '\u1D546'
  "\\mathbb{S}": '\u1D54A'
  "\\mathbb{T}": '\u1D54B'
  "\\mathbb{U}": '\u1D54C'
  "\\mathbb{V}": '\u1D54D'
  "\\mathbb{W}": '\u1D54E'
  "\\mathbb{X}": '\u1D54F'
  "\\mathbb{Y}": '\u1D550'
  "\\mathbb{a}": '\u1D552'
  "\\mathbb{b}": '\u1D553'
  "\\mathbb{c}": '\u1D554'
  "\\mathbb{d}": '\u1D555'
  "\\mathbb{e}": '\u1D556'
  "\\mathbb{f}": '\u1D557'
  "\\mathbb{g}": '\u1D558'
  "\\mathbb{h}": '\u1D559'
  "\\mathbb{i}": '\u1D55A'
  "\\mathbb{j}": '\u1D55B'
  "\\mathbb{k}": '\u1D55C'
  "\\mathbb{l}": '\u1D55D'
  "\\mathbb{m}": '\u1D55E'
  "\\mathbb{n}": '\u1D55F'
  "\\mathbb{o}": '\u1D560'
  "\\mathbb{p}": '\u1D561'
  "\\mathbb{q}": '\u1D562'
  "\\mathbb{r}": '\u1D563'
  "\\mathbb{s}": '\u1D564'
  "\\mathbb{t}": '\u1D565'
  "\\mathbb{u}": '\u1D566'
  "\\mathbb{v}": '\u1D567'
  "\\mathbb{w}": '\u1D568'
  "\\mathbb{x}": '\u1D569'
  "\\mathbb{y}": '\u1D56A'
  "\\mathbb{z}": '\u1D56B'
  "\\mathslbb{A}": '\u1D56C'
  "\\mathslbb{B}": '\u1D56D'
  "\\mathslbb{C}": '\u1D56E'
  "\\mathslbb{D}": '\u1D56F'
  "\\mathslbb{E}": '\u1D570'
  "\\mathslbb{F}": '\u1D571'
  "\\mathslbb{G}": '\u1D572'
  "\\mathslbb{H}": '\u1D573'
  "\\mathslbb{I}": '\u1D574'
  "\\mathslbb{J}": '\u1D575'
  "\\mathslbb{K}": '\u1D576'
  "\\mathslbb{L}": '\u1D577'
  "\\mathslbb{M}": '\u1D578'
  "\\mathslbb{N}": '\u1D579'
  "\\mathslbb{O}": '\u1D57A'
  "\\mathslbb{P}": '\u1D57B'
  "\\mathslbb{Q}": '\u1D57C'
  "\\mathslbb{R}": '\u1D57D'
  "\\mathslbb{S}": '\u1D57E'
  "\\mathslbb{T}": '\u1D57F'
  "\\mathslbb{U}": '\u1D580'
  "\\mathslbb{V}": '\u1D581'
  "\\mathslbb{W}": '\u1D582'
  "\\mathslbb{X}": '\u1D583'
  "\\mathslbb{Y}": '\u1D584'
  "\\mathslbb{Z}": '\u1D585'
  "\\mathslbb{a}": '\u1D586'
  "\\mathslbb{b}": '\u1D587'
  "\\mathslbb{c}": '\u1D588'
  "\\mathslbb{d}": '\u1D589'
  "\\mathslbb{e}": '\u1D58A'
  "\\mathslbb{f}": '\u1D58B'
  "\\mathslbb{g}": '\u1D58C'
  "\\mathslbb{h}": '\u1D58D'
  "\\mathslbb{i}": '\u1D58E'
  "\\mathslbb{j}": '\u1D58F'
  "\\mathslbb{k}": '\u1D590'
  "\\mathslbb{l}": '\u1D591'
  "\\mathslbb{m}": '\u1D592'
  "\\mathslbb{n}": '\u1D593'
  "\\mathslbb{o}": '\u1D594'
  "\\mathslbb{p}": '\u1D595'
  "\\mathslbb{q}": '\u1D596'
  "\\mathslbb{r}": '\u1D597'
  "\\mathslbb{s}": '\u1D598'
  "\\mathslbb{t}": '\u1D599'
  "\\mathslbb{u}": '\u1D59A'
  "\\mathslbb{v}": '\u1D59B'
  "\\mathslbb{w}": '\u1D59C'
  "\\mathslbb{x}": '\u1D59D'
  "\\mathslbb{y}": '\u1D59E'
  "\\mathslbb{z}": '\u1D59F'
  "\\mathsf{A}": '\u1D5A0'
  "\\mathsf{B}": '\u1D5A1'
  "\\mathsf{C}": '\u1D5A2'
  "\\mathsf{D}": '\u1D5A3'
  "\\mathsf{E}": '\u1D5A4'
  "\\mathsf{F}": '\u1D5A5'
  "\\mathsf{G}": '\u1D5A6'
  "\\mathsf{H}": '\u1D5A7'
  "\\mathsf{I}": '\u1D5A8'
  "\\mathsf{J}": '\u1D5A9'
  "\\mathsf{K}": '\u1D5AA'
  "\\mathsf{L}": '\u1D5AB'
  "\\mathsf{M}": '\u1D5AC'
  "\\mathsf{N}": '\u1D5AD'
  "\\mathsf{O}": '\u1D5AE'
  "\\mathsf{P}": '\u1D5AF'
  "\\mathsf{Q}": '\u1D5B0'
  "\\mathsf{R}": '\u1D5B1'
  "\\mathsf{S}": '\u1D5B2'
  "\\mathsf{T}": '\u1D5B3'
  "\\mathsf{U}": '\u1D5B4'
  "\\mathsf{V}": '\u1D5B5'
  "\\mathsf{W}": '\u1D5B6'
  "\\mathsf{X}": '\u1D5B7'
  "\\mathsf{Y}": '\u1D5B8'
  "\\mathsf{Z}": '\u1D5B9'
  "\\mathsf{a}": '\u1D5BA'
  "\\mathsf{b}": '\u1D5BB'
  "\\mathsf{c}": '\u1D5BC'
  "\\mathsf{d}": '\u1D5BD'
  "\\mathsf{e}": '\u1D5BE'
  "\\mathsf{f}": '\u1D5BF'
  "\\mathsf{g}": '\u1D5C0'
  "\\mathsf{h}": '\u1D5C1'
  "\\mathsf{i}": '\u1D5C2'
  "\\mathsf{j}": '\u1D5C3'
  "\\mathsf{k}": '\u1D5C4'
  "\\mathsf{l}": '\u1D5C5'
  "\\mathsf{m}": '\u1D5C6'
  "\\mathsf{n}": '\u1D5C7'
  "\\mathsf{o}": '\u1D5C8'
  "\\mathsf{p}": '\u1D5C9'
  "\\mathsf{q}": '\u1D5CA'
  "\\mathsf{r}": '\u1D5CB'
  "\\mathsf{s}": '\u1D5CC'
  "\\mathsf{t}": '\u1D5CD'
  "\\mathsf{u}": '\u1D5CE'
  "\\mathsf{v}": '\u1D5CF'
  "\\mathsf{w}": '\u1D5D0'
  "\\mathsf{x}": '\u1D5D1'
  "\\mathsf{y}": '\u1D5D2'
  "\\mathsf{z}": '\u1D5D3'
  "\\mathsfbf{A}": '\u1D5D4'
  "\\mathsfbf{B}": '\u1D5D5'
  "\\mathsfbf{C}": '\u1D5D6'
  "\\mathsfbf{D}": '\u1D5D7'
  "\\mathsfbf{E}": '\u1D5D8'
  "\\mathsfbf{F}": '\u1D5D9'
  "\\mathsfbf{G}": '\u1D5DA'
  "\\mathsfbf{H}": '\u1D5DB'
  "\\mathsfbf{I}": '\u1D5DC'
  "\\mathsfbf{J}": '\u1D5DD'
  "\\mathsfbf{K}": '\u1D5DE'
  "\\mathsfbf{L}": '\u1D5DF'
  "\\mathsfbf{M}": '\u1D5E0'
  "\\mathsfbf{N}": '\u1D5E1'
  "\\mathsfbf{O}": '\u1D5E2'
  "\\mathsfbf{P}": '\u1D5E3'
  "\\mathsfbf{Q}": '\u1D5E4'
  "\\mathsfbf{R}": '\u1D5E5'
  "\\mathsfbf{S}": '\u1D5E6'
  "\\mathsfbf{T}": '\u1D5E7'
  "\\mathsfbf{U}": '\u1D5E8'
  "\\mathsfbf{V}": '\u1D5E9'
  "\\mathsfbf{W}": '\u1D5EA'
  "\\mathsfbf{X}": '\u1D5EB'
  "\\mathsfbf{Y}": '\u1D5EC'
  "\\mathsfbf{Z}": '\u1D5ED'
  "\\mathsfbf{a}": '\u1D5EE'
  "\\mathsfbf{b}": '\u1D5EF'
  "\\mathsfbf{c}": '\u1D5F0'
  "\\mathsfbf{d}": '\u1D5F1'
  "\\mathsfbf{e}": '\u1D5F2'
  "\\mathsfbf{f}": '\u1D5F3'
  "\\mathsfbf{g}": '\u1D5F4'
  "\\mathsfbf{h}": '\u1D5F5'
  "\\mathsfbf{i}": '\u1D5F6'
  "\\mathsfbf{j}": '\u1D5F7'
  "\\mathsfbf{k}": '\u1D5F8'
  "\\mathsfbf{l}": '\u1D5F9'
  "\\mathsfbf{m}": '\u1D5FA'
  "\\mathsfbf{n}": '\u1D5FB'
  "\\mathsfbf{o}": '\u1D5FC'
  "\\mathsfbf{p}": '\u1D5FD'
  "\\mathsfbf{q}": '\u1D5FE'
  "\\mathsfbf{r}": '\u1D5FF'
  "\\mathsfbf{s}": '\u1D600'
  "\\mathsfbf{t}": '\u1D601'
  "\\mathsfbf{u}": '\u1D602'
  "\\mathsfbf{v}": '\u1D603'
  "\\mathsfbf{w}": '\u1D604'
  "\\mathsfbf{x}": '\u1D605'
  "\\mathsfbf{y}": '\u1D606'
  "\\mathsfbf{z}": '\u1D607'
  "\\mathsfsl{A}": '\u1D608'
  "\\mathsfsl{B}": '\u1D609'
  "\\mathsfsl{C}": '\u1D60A'
  "\\mathsfsl{D}": '\u1D60B'
  "\\mathsfsl{E}": '\u1D60C'
  "\\mathsfsl{F}": '\u1D60D'
  "\\mathsfsl{G}": '\u1D60E'
  "\\mathsfsl{H}": '\u1D60F'
  "\\mathsfsl{I}": '\u1D610'
  "\\mathsfsl{J}": '\u1D611'
  "\\mathsfsl{K}": '\u1D612'
  "\\mathsfsl{L}": '\u1D613'
  "\\mathsfsl{M}": '\u1D614'
  "\\mathsfsl{N}": '\u1D615'
  "\\mathsfsl{O}": '\u1D616'
  "\\mathsfsl{P}": '\u1D617'
  "\\mathsfsl{Q}": '\u1D618'
  "\\mathsfsl{R}": '\u1D619'
  "\\mathsfsl{S}": '\u1D61A'
  "\\mathsfsl{T}": '\u1D61B'
  "\\mathsfsl{U}": '\u1D61C'
  "\\mathsfsl{V}": '\u1D61D'
  "\\mathsfsl{W}": '\u1D61E'
  "\\mathsfsl{X}": '\u1D61F'
  "\\mathsfsl{Y}": '\u1D620'
  "\\mathsfsl{Z}": '\u1D621'
  "\\mathsfsl{a}": '\u1D622'
  "\\mathsfsl{b}": '\u1D623'
  "\\mathsfsl{c}": '\u1D624'
  "\\mathsfsl{d}": '\u1D625'
  "\\mathsfsl{e}": '\u1D626'
  "\\mathsfsl{f}": '\u1D627'
  "\\mathsfsl{g}": '\u1D628'
  "\\mathsfsl{h}": '\u1D629'
  "\\mathsfsl{i}": '\u1D62A'
  "\\mathsfsl{j}": '\u1D62B'
  "\\mathsfsl{k}": '\u1D62C'
  "\\mathsfsl{l}": '\u1D62D'
  "\\mathsfsl{m}": '\u1D62E'
  "\\mathsfsl{n}": '\u1D62F'
  "\\mathsfsl{o}": '\u1D630'
  "\\mathsfsl{p}": '\u1D631'
  "\\mathsfsl{q}": '\u1D632'
  "\\mathsfsl{r}": '\u1D633'
  "\\mathsfsl{s}": '\u1D634'
  "\\mathsfsl{t}": '\u1D635'
  "\\mathsfsl{u}": '\u1D636'
  "\\mathsfsl{v}": '\u1D637'
  "\\mathsfsl{w}": '\u1D638'
  "\\mathsfsl{x}": '\u1D639'
  "\\mathsfsl{y}": '\u1D63A'
  "\\mathsfsl{z}": '\u1D63B'
  "\\mathsfbfsl{A}": '\u1D63C'
  "\\mathsfbfsl{B}": '\u1D63D'
  "\\mathsfbfsl{C}": '\u1D63E'
  "\\mathsfbfsl{D}": '\u1D63F'
  "\\mathsfbfsl{E}": '\u1D640'
  "\\mathsfbfsl{F}": '\u1D641'
  "\\mathsfbfsl{G}": '\u1D642'
  "\\mathsfbfsl{H}": '\u1D643'
  "\\mathsfbfsl{I}": '\u1D644'
  "\\mathsfbfsl{J}": '\u1D645'
  "\\mathsfbfsl{K}": '\u1D646'
  "\\mathsfbfsl{L}": '\u1D647'
  "\\mathsfbfsl{M}": '\u1D648'
  "\\mathsfbfsl{N}": '\u1D649'
  "\\mathsfbfsl{O}": '\u1D64A'
  "\\mathsfbfsl{P}": '\u1D64B'
  "\\mathsfbfsl{Q}": '\u1D64C'
  "\\mathsfbfsl{R}": '\u1D64D'
  "\\mathsfbfsl{S}": '\u1D64E'
  "\\mathsfbfsl{T}": '\u1D64F'
  "\\mathsfbfsl{U}": '\u1D650'
  "\\mathsfbfsl{V}": '\u1D651'
  "\\mathsfbfsl{W}": '\u1D652'
  "\\mathsfbfsl{X}": '\u1D653'
  "\\mathsfbfsl{Y}": '\u1D654'
  "\\mathsfbfsl{Z}": '\u1D655'
  "\\mathsfbfsl{a}": '\u1D656'
  "\\mathsfbfsl{b}": '\u1D657'
  "\\mathsfbfsl{c}": '\u1D658'
  "\\mathsfbfsl{d}": '\u1D659'
  "\\mathsfbfsl{e}": '\u1D65A'
  "\\mathsfbfsl{f}": '\u1D65B'
  "\\mathsfbfsl{g}": '\u1D65C'
  "\\mathsfbfsl{h}": '\u1D65D'
  "\\mathsfbfsl{i}": '\u1D65E'
  "\\mathsfbfsl{j}": '\u1D65F'
  "\\mathsfbfsl{k}": '\u1D660'
  "\\mathsfbfsl{l}": '\u1D661'
  "\\mathsfbfsl{m}": '\u1D662'
  "\\mathsfbfsl{n}": '\u1D663'
  "\\mathsfbfsl{o}": '\u1D664'
  "\\mathsfbfsl{p}": '\u1D665'
  "\\mathsfbfsl{q}": '\u1D666'
  "\\mathsfbfsl{r}": '\u1D667'
  "\\mathsfbfsl{s}": '\u1D668'
  "\\mathsfbfsl{t}": '\u1D669'
  "\\mathsfbfsl{u}": '\u1D66A'
  "\\mathsfbfsl{v}": '\u1D66B'
  "\\mathsfbfsl{w}": '\u1D66C'
  "\\mathsfbfsl{x}": '\u1D66D'
  "\\mathsfbfsl{y}": '\u1D66E'
  "\\mathsfbfsl{z}": '\u1D66F'
  "\\mathtt{A}": '\u1D670'
  "\\mathtt{B}": '\u1D671'
  "\\mathtt{C}": '\u1D672'
  "\\mathtt{D}": '\u1D673'
  "\\mathtt{E}": '\u1D674'
  "\\mathtt{F}": '\u1D675'
  "\\mathtt{G}": '\u1D676'
  "\\mathtt{H}": '\u1D677'
  "\\mathtt{I}": '\u1D678'
  "\\mathtt{J}": '\u1D679'
  "\\mathtt{K}": '\u1D67A'
  "\\mathtt{L}": '\u1D67B'
  "\\mathtt{M}": '\u1D67C'
  "\\mathtt{N}": '\u1D67D'
  "\\mathtt{O}": '\u1D67E'
  "\\mathtt{P}": '\u1D67F'
  "\\mathtt{Q}": '\u1D680'
  "\\mathtt{R}": '\u1D681'
  "\\mathtt{S}": '\u1D682'
  "\\mathtt{T}": '\u1D683'
  "\\mathtt{U}": '\u1D684'
  "\\mathtt{V}": '\u1D685'
  "\\mathtt{W}": '\u1D686'
  "\\mathtt{X}": '\u1D687'
  "\\mathtt{Y}": '\u1D688'
  "\\mathtt{Z}": '\u1D689'
  "\\mathtt{a}": '\u1D68A'
  "\\mathtt{b}": '\u1D68B'
  "\\mathtt{c}": '\u1D68C'
  "\\mathtt{d}": '\u1D68D'
  "\\mathtt{e}": '\u1D68E'
  "\\mathtt{f}": '\u1D68F'
  "\\mathtt{g}": '\u1D690'
  "\\mathtt{h}": '\u1D691'
  "\\mathtt{i}": '\u1D692'
  "\\mathtt{j}": '\u1D693'
  "\\mathtt{k}": '\u1D694'
  "\\mathtt{l}": '\u1D695'
  "\\mathtt{m}": '\u1D696'
  "\\mathtt{n}": '\u1D697'
  "\\mathtt{o}": '\u1D698'
  "\\mathtt{p}": '\u1D699'
  "\\mathtt{q}": '\u1D69A'
  "\\mathtt{r}": '\u1D69B'
  "\\mathtt{s}": '\u1D69C'
  "\\mathtt{t}": '\u1D69D'
  "\\mathtt{u}": '\u1D69E'
  "\\mathtt{v}": '\u1D69F'
  "\\mathtt{w}": '\u1D6A0'
  "\\mathtt{x}": '\u1D6A1'
  "\\mathtt{y}": '\u1D6A2'
  "\\mathtt{z}": '\u1D6A3'
  "\\mathbf{\\Alpha}": '\u1D6A8'
  "\\mathbf{\\Beta}": '\u1D6A9'
  "\\mathbf{\\Gamma}": '\u1D6AA'
  "\\mathbf{\\Delta}": '\u1D6AB'
  "\\mathbf{\\Epsilon}": '\u1D6AC'
  "\\mathbf{\\Zeta}": '\u1D6AD'
  "\\mathbf{\\Eta}": '\u1D6AE'
  "\\mathbf{\\Theta}": '\u1D6AF'
  "\\mathbf{\\Iota}": '\u1D6B0'
  "\\mathbf{\\Kappa}": '\u1D6B1'
  "\\mathbf{\\Lambda}": '\u1D6B2'
  "\\mathbf{\\Xi}": '\u1D6B5'
  "\\mathbf{\\Pi}": '\u1D6B7'
  "\\mathbf{\\Rho}": '\u1D6B8'
  "\\mathbf{\\vartheta}": '\u1D6B9'
  "\\mathbf{\\Sigma}": '\u1D6BA'
  "\\mathbf{\\Tau}": '\u1D6BB'
  "\\mathbf{\\Upsilon}": '\u1D6BC'
  "\\mathbf{\\Phi}": '\u1D6BD'
  "\\mathbf{\\Chi}": '\u1D6BE'
  "\\mathbf{\\Psi}": '\u1D6BF'
  "\\mathbf{\\Omega}": '\u1D6C0'
  "\\mathbf{\\nabla}": '\u1D6C1'
  "\\mathbf{\\Alpha}": '\u1D6C2'
  "\\mathbf{\\Beta}": '\u1D6C3'
  "\\mathbf{\\Gamma}": '\u1D6C4'
  "\\mathbf{\\Delta}": '\u1D6C5'
  "\\mathbf{\\Epsilon}": '\u1D6C6'
  "\\mathbf{\\Zeta}": '\u1D6C7'
  "\\mathbf{\\Eta}": '\u1D6C8'
  "\\mathbf{\\theta}": '\u1D6C9'
  "\\mathbf{\\Iota}": '\u1D6CA'
  "\\mathbf{\\Kappa}": '\u1D6CB'
  "\\mathbf{\\Lambda}": '\u1D6CC'
  "\\mathbf{\\Xi}": '\u1D6CF'
  "\\mathbf{\\Pi}": '\u1D6D1'
  "\\mathbf{\\Rho}": '\u1D6D2'
  "\\mathbf{\\varsigma}": '\u1D6D3'
  "\\mathbf{\\Sigma}": '\u1D6D4'
  "\\mathbf{\\Tau}": '\u1D6D5'
  "\\mathbf{\\Upsilon}": '\u1D6D6'
  "\\mathbf{\\Phi}": '\u1D6D7'
  "\\mathbf{\\Chi}": '\u1D6D8'
  "\\mathbf{\\Psi}": '\u1D6D9'
  "\\mathbf{\\Omega}": '\u1D6DA'
  "{\\partial}": '\u1D6DB'
  "\\partial ": '\u1D6DB'
  "\\in": '\u1D6DC'
  "\\mathbf{\\vartheta}": '\u1D6DD'
  "\\mathbf{\\varkappa}": '\u1D6DE'
  "\\mathbf{\\phi}": '\u1D6DF'
  "\\mathbf{\\varrho}": '\u1D6E0'
  "\\mathbf{\\varpi}": '\u1D6E1'
  "\\mathsl{\\Alpha}": '\u1D6E2'
  "\\mathsl{\\Beta}": '\u1D6E3'
  "\\mathsl{\\Gamma}": '\u1D6E4'
  "\\mathsl{\\Delta}": '\u1D6E5'
  "\\mathsl{\\Epsilon}": '\u1D6E6'
  "\\mathsl{\\Zeta}": '\u1D6E7'
  "\\mathsl{\\Eta}": '\u1D6E8'
  "\\mathsl{\\Theta}": '\u1D6E9'
  "\\mathsl{\\Iota}": '\u1D6EA'
  "\\mathsl{\\Kappa}": '\u1D6EB'
  "\\mathsl{\\Lambda}": '\u1D6EC'
  "\\mathsl{\\Xi}": '\u1D6EF'
  "\\mathsl{\\Pi}": '\u1D6F1'
  "\\mathsl{\\Rho}": '\u1D6F2'
  "\\mathsl{\\vartheta}": '\u1D6F3'
  "\\mathsl{\\Sigma}": '\u1D6F4'
  "\\mathsl{\\Tau}": '\u1D6F5'
  "\\mathsl{\\Upsilon}": '\u1D6F6'
  "\\mathsl{\\Phi}": '\u1D6F7'
  "\\mathsl{\\Chi}": '\u1D6F8'
  "\\mathsl{\\Psi}": '\u1D6F9'
  "\\mathsl{\\Omega}": '\u1D6FA'
  "\\mathsl{\\nabla}": '\u1D6FB'
  "\\mathsl{\\Alpha}": '\u1D6FC'
  "\\mathsl{\\Beta}": '\u1D6FD'
  "\\mathsl{\\Gamma}": '\u1D6FE'
  "\\mathsl{\\Delta}": '\u1D6FF'
  "\\mathsl{\\Epsilon}": '\u1D700'
  "\\mathsl{\\Zeta}": '\u1D701'
  "\\mathsl{\\Eta}": '\u1D702'
  "\\mathsl{\\Theta}": '\u1D703'
  "\\mathsl{\\Iota}": '\u1D704'
  "\\mathsl{\\Kappa}": '\u1D705'
  "\\mathsl{\\Lambda}": '\u1D706'
  "\\mathsl{\\Xi}": '\u1D709'
  "\\mathsl{\\Pi}": '\u1D70B'
  "\\mathsl{\\Rho}": '\u1D70C'
  "\\mathsl{\\varsigma}": '\u1D70D'
  "\\mathsl{\\Sigma}": '\u1D70E'
  "\\mathsl{\\Tau}": '\u1D70F'
  "\\mathsl{\\Upsilon}": '\u1D710'
  "\\mathsl{\\Phi}": '\u1D711'
  "\\mathsl{\\Chi}": '\u1D712'
  "\\mathsl{\\Psi}": '\u1D713'
  "\\mathsl{\\Omega}": '\u1D714'
  "{\\partial}": '\u1D715'
  "\\partial ": '\u1D715'
  "\\in": '\u1D716'
  "\\mathsl{\\vartheta}": '\u1D717'
  "\\mathsl{\\varkappa}": '\u1D718'
  "\\mathsl{\\phi}": '\u1D719'
  "\\mathsl{\\varrho}": '\u1D71A'
  "\\mathsl{\\varpi}": '\u1D71B'
  "\\mathbit{\\Alpha}": '\u1D71C'
  "\\mathbit{\\Beta}": '\u1D71D'
  "\\mathbit{\\Gamma}": '\u1D71E'
  "\\mathbit{\\Delta}": '\u1D71F'
  "\\mathbit{\\Epsilon}": '\u1D720'
  "\\mathbit{\\Zeta}": '\u1D721'
  "\\mathbit{\\Eta}": '\u1D722'
  "\\mathbit{\\Theta}": '\u1D723'
  "\\mathbit{\\Iota}": '\u1D724'
  "\\mathbit{\\Kappa}": '\u1D725'
  "\\mathbit{\\Lambda}": '\u1D726'
  "\\mathbit{\\Xi}": '\u1D729'
  "\\mathbit{\\Pi}": '\u1D72B'
  "\\mathbit{\\Rho}": '\u1D72C'
  "\\mathbit{O}": '\u1D72D'
  "\\mathbit{\\Sigma}": '\u1D72E'
  "\\mathbit{\\Tau}": '\u1D72F'
  "\\mathbit{\\Upsilon}": '\u1D730'
  "\\mathbit{\\Phi}": '\u1D731'
  "\\mathbit{\\Chi}": '\u1D732'
  "\\mathbit{\\Psi}": '\u1D733'
  "\\mathbit{\\Omega}": '\u1D734'
  "\\mathbit{\\nabla}": '\u1D735'
  "\\mathbit{\\Alpha}": '\u1D736'
  "\\mathbit{\\Beta}": '\u1D737'
  "\\mathbit{\\Gamma}": '\u1D738'
  "\\mathbit{\\Delta}": '\u1D739'
  "\\mathbit{\\Epsilon}": '\u1D73A'
  "\\mathbit{\\Zeta}": '\u1D73B'
  "\\mathbit{\\Eta}": '\u1D73C'
  "\\mathbit{\\Theta}": '\u1D73D'
  "\\mathbit{\\Iota}": '\u1D73E'
  "\\mathbit{\\Kappa}": '\u1D73F'
  "\\mathbit{\\Lambda}": '\u1D740'
  "\\mathbit{\\Xi}": '\u1D743'
  "\\mathbit{\\Pi}": '\u1D745'
  "\\mathbit{\\Rho}": '\u1D746'
  "\\mathbit{\\varsigma}": '\u1D747'
  "\\mathbit{\\Sigma}": '\u1D748'
  "\\mathbit{\\Tau}": '\u1D749'
  "\\mathbit{\\Upsilon}": '\u1D74A'
  "\\mathbit{\\Phi}": '\u1D74B'
  "\\mathbit{\\Chi}": '\u1D74C'
  "\\mathbit{\\Psi}": '\u1D74D'
  "\\mathbit{\\Omega}": '\u1D74E'
  "{\\partial}": '\u1D74F'
  "\\partial ": '\u1D74F'
  "\\in": '\u1D750'
  "\\mathbit{\\vartheta}": '\u1D751'
  "\\mathbit{\\varkappa}": '\u1D752'
  "\\mathbit{\\phi}": '\u1D753'
  "\\mathbit{\\varrho}": '\u1D754'
  "\\mathbit{\\varpi}": '\u1D755'
  "\\mathsfbf{\\Alpha}": '\u1D756'
  "\\mathsfbf{\\Beta}": '\u1D757'
  "\\mathsfbf{\\Gamma}": '\u1D758'
  "\\mathsfbf{\\Delta}": '\u1D759'
  "\\mathsfbf{\\Epsilon}": '\u1D75A'
  "\\mathsfbf{\\Zeta}": '\u1D75B'
  "\\mathsfbf{\\Eta}": '\u1D75C'
  "\\mathsfbf{\\Theta}": '\u1D75D'
  "\\mathsfbf{\\Iota}": '\u1D75E'
  "\\mathsfbf{\\Kappa}": '\u1D75F'
  "\\mathsfbf{\\Lambda}": '\u1D760'
  "\\mathsfbf{\\Xi}": '\u1D763'
  "\\mathsfbf{\\Pi}": '\u1D765'
  "\\mathsfbf{\\Rho}": '\u1D766'
  "\\mathsfbf{\\vartheta}": '\u1D767'
  "\\mathsfbf{\\Sigma}": '\u1D768'
  "\\mathsfbf{\\Tau}": '\u1D769'
  "\\mathsfbf{\\Upsilon}": '\u1D76A'
  "\\mathsfbf{\\Phi}": '\u1D76B'
  "\\mathsfbf{\\Chi}": '\u1D76C'
  "\\mathsfbf{\\Psi}": '\u1D76D'
  "\\mathsfbf{\\Omega}": '\u1D76E'
  "\\mathsfbf{\\nabla}": '\u1D76F'
  "\\mathsfbf{\\Alpha}": '\u1D770'
  "\\mathsfbf{\\Beta}": '\u1D771'
  "\\mathsfbf{\\Gamma}": '\u1D772'
  "\\mathsfbf{\\Delta}": '\u1D773'
  "\\mathsfbf{\\Epsilon}": '\u1D774'
  "\\mathsfbf{\\Zeta}": '\u1D775'
  "\\mathsfbf{\\Eta}": '\u1D776'
  "\\mathsfbf{\\Theta}": '\u1D777'
  "\\mathsfbf{\\Iota}": '\u1D778'
  "\\mathsfbf{\\Kappa}": '\u1D779'
  "\\mathsfbf{\\Lambda}": '\u1D77A'
  "\\mathsfbf{\\Xi}": '\u1D77D'
  "\\mathsfbf{\\Pi}": '\u1D77F'
  "\\mathsfbf{\\Rho}": '\u1D780'
  "\\mathsfbf{\\varsigma}": '\u1D781'
  "\\mathsfbf{\\Sigma}": '\u1D782'
  "\\mathsfbf{\\Tau}": '\u1D783'
  "\\mathsfbf{\\Upsilon}": '\u1D784'
  "\\mathsfbf{\\Phi}": '\u1D785'
  "\\mathsfbf{\\Chi}": '\u1D786'
  "\\mathsfbf{\\Psi}": '\u1D787'
  "\\mathsfbf{\\Omega}": '\u1D788'
  "{\\partial}": '\u1D789'
  "\\partial ": '\u1D789'
  "\\in": '\u1D78A'
  "\\mathsfbf{\\vartheta}": '\u1D78B'
  "\\mathsfbf{\\varkappa}": '\u1D78C'
  "\\mathsfbf{\\phi}": '\u1D78D'
  "\\mathsfbf{\\varrho}": '\u1D78E'
  "\\mathsfbf{\\varpi}": '\u1D78F'
  "\\mathsfbfsl{\\Alpha}": '\u1D790'
  "\\mathsfbfsl{\\Beta}": '\u1D791'
  "\\mathsfbfsl{\\Gamma}": '\u1D792'
  "\\mathsfbfsl{\\Delta}": '\u1D793'
  "\\mathsfbfsl{\\Epsilon}": '\u1D794'
  "\\mathsfbfsl{\\Zeta}": '\u1D795'
  "\\mathsfbfsl{\\Eta}": '\u1D796'
  "\\mathsfbfsl{\\vartheta}": '\u1D797'
  "\\mathsfbfsl{\\Iota}": '\u1D798'
  "\\mathsfbfsl{\\Kappa}": '\u1D799'
  "\\mathsfbfsl{\\Lambda}": '\u1D79A'
  "\\mathsfbfsl{\\Xi}": '\u1D79D'
  "\\mathsfbfsl{\\Pi}": '\u1D79F'
  "\\mathsfbfsl{\\Rho}": '\u1D7A0'
  "\\mathsfbfsl{\\vartheta}": '\u1D7A1'
  "\\mathsfbfsl{\\Sigma}": '\u1D7A2'
  "\\mathsfbfsl{\\Tau}": '\u1D7A3'
  "\\mathsfbfsl{\\Upsilon}": '\u1D7A4'
  "\\mathsfbfsl{\\Phi}": '\u1D7A5'
  "\\mathsfbfsl{\\Chi}": '\u1D7A6'
  "\\mathsfbfsl{\\Psi}": '\u1D7A7'
  "\\mathsfbfsl{\\Omega}": '\u1D7A8'
  "\\mathsfbfsl{\\nabla}": '\u1D7A9'
  "\\mathsfbfsl{\\Alpha}": '\u1D7AA'
  "\\mathsfbfsl{\\Beta}": '\u1D7AB'
  "\\mathsfbfsl{\\Gamma}": '\u1D7AC'
  "\\mathsfbfsl{\\Delta}": '\u1D7AD'
  "\\mathsfbfsl{\\Epsilon}": '\u1D7AE'
  "\\mathsfbfsl{\\Zeta}": '\u1D7AF'
  "\\mathsfbfsl{\\Eta}": '\u1D7B0'
  "\\mathsfbfsl{\\vartheta}": '\u1D7B1'
  "\\mathsfbfsl{\\Iota}": '\u1D7B2'
  "\\mathsfbfsl{\\Kappa}": '\u1D7B3'
  "\\mathsfbfsl{\\Lambda}": '\u1D7B4'
  "\\mathsfbfsl{\\Xi}": '\u1D7B7'
  "\\mathsfbfsl{\\Pi}": '\u1D7B9'
  "\\mathsfbfsl{\\Rho}": '\u1D7BA'
  "\\mathsfbfsl{\\varsigma}": '\u1D7BB'
  "\\mathsfbfsl{\\Sigma}": '\u1D7BC'
  "\\mathsfbfsl{\\Tau}": '\u1D7BD'
  "\\mathsfbfsl{\\Upsilon}": '\u1D7BE'
  "\\mathsfbfsl{\\Phi}": '\u1D7BF'
  "\\mathsfbfsl{\\Chi}": '\u1D7C0'
  "\\mathsfbfsl{\\Psi}": '\u1D7C1'
  "\\mathsfbfsl{\\Omega}": '\u1D7C2'
  "{\\partial}": '\u1D7C3'
  "\\partial ": '\u1D7C3'
  "\\in": '\u1D7C4'
  "\\mathsfbfsl{\\vartheta}": '\u1D7C5'
  "\\mathsfbfsl{\\varkappa}": '\u1D7C6'
  "\\mathsfbfsl{\\phi}": '\u1D7C7'
  "\\mathsfbfsl{\\varrho}": '\u1D7C8'
  "\\mathsfbfsl{\\varpi}": '\u1D7C9'
  "\\mathbf{0}": '\u1D7CE'
  "\\mathbf{1}": '\u1D7CF'
  "\\mathbf{2}": '\u1D7D0'
  "\\mathbf{3}": '\u1D7D1'
  "\\mathbf{4}": '\u1D7D2'
  "\\mathbf{5}": '\u1D7D3'
  "\\mathbf{6}": '\u1D7D4'
  "\\mathbf{7}": '\u1D7D5'
  "\\mathbf{8}": '\u1D7D6'
  "\\mathbf{9}": '\u1D7D7'
  "\\mathbb{0}": '\u1D7D8'
  "\\mathbb{1}": '\u1D7D9'
  "\\mathbb{2}": '\u1D7DA'
  "\\mathbb{3}": '\u1D7DB'
  "\\mathbb{4}": '\u1D7DC'
  "\\mathbb{5}": '\u1D7DD'
  "\\mathbb{6}": '\u1D7DE'
  "\\mathbb{7}": '\u1D7DF'
  "\\mathbb{8}": '\u1D7E0'
  "\\mathbb{9}": '\u1D7E1'
  "\\mathsf{0}": '\u1D7E2'
  "\\mathsf{1}": '\u1D7E3'
  "\\mathsf{2}": '\u1D7E4'
  "\\mathsf{3}": '\u1D7E5'
  "\\mathsf{4}": '\u1D7E6'
  "\\mathsf{5}": '\u1D7E7'
  "\\mathsf{6}": '\u1D7E8'
  "\\mathsf{7}": '\u1D7E9'
  "\\mathsf{8}": '\u1D7EA'
  "\\mathsf{9}": '\u1D7EB'
  "\\mathsfbf{0}": '\u1D7EC'
  "\\mathsfbf{1}": '\u1D7ED'
  "\\mathsfbf{2}": '\u1D7EE'
  "\\mathsfbf{3}": '\u1D7EF'
  "\\mathsfbf{4}": '\u1D7F0'
  "\\mathsfbf{5}": '\u1D7F1'
  "\\mathsfbf{6}": '\u1D7F2'
  "\\mathsfbf{7}": '\u1D7F3'
  "\\mathsfbf{8}": '\u1D7F4'
  "\\mathsfbf{9}": '\u1D7F5'
  "\\mathtt{0}": '\u1D7F6'
  "\\mathtt{1}": '\u1D7F7'
  "\\mathtt{2}": '\u1D7F8'
  "\\mathtt{3}": '\u1D7F9'
  "\\mathtt{4}": '\u1D7FA'
  "\\mathtt{5}": '\u1D7FB'
  "\\mathtt{6}": '\u1D7FC'
  "\\mathtt{7}": '\u1D7FD'
  "\\mathtt{8}": '\u1D7FE'
  "\\mathtt{9}": '\u1D7FF'
  "{\\langle}": '\u02329'
  "\\langle ": '\u02329'
  "{\\rangle}": '\u0232A'
  "\\rangle ": '\u0232A'
  "\\&": '&'
  "\\dbend": '\uFFFD'
