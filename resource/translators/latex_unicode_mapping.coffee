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
  '[': "{[}"
  '\u00A0': " "
LaTeX.toLaTeX.ascii.math =
  '<': "<"
  '>': ">"
  '\\': "\\backslash"
  '\u00AC': "{\\lnot}"
  '\u00AD': "\\-"
  '\u00B1': "{\\pm}"
  '\u00B2': "{^2}"
  '\u00B3': "{^3}"
  '\u00B5': "\\mathrm{\\mu}"
  '\u00B7': "{\\cdot}"
  '\u00B9': "{^1}"
  '\u00F7': "{\\div}"
  '\u0127': "{\\Elzxh}"
  '\u0192': "f"
  '\u01AA': "{\\eth}"
  '\u0250': "{\\Elztrna}"
  '\u0252': "{\\Elztrnsa}"
  '\u0254': "{\\Elzopeno}"
  '\u0256': "{\\Elzrtld}"
  '\u0259': "{\\Elzschwa}"
  '\u025B': "{\\varepsilon}"
  '\u0263': "{\\Elzpgamma}"
  '\u0264': "{\\Elzpbgam}"
  '\u0265': "{\\Elztrnh}"
  '\u026C': "{\\Elzbtdl}"
  '\u026D': "{\\Elzrtll}"
  '\u026F': "{\\Elztrnm}"
  '\u0270': "{\\Elztrnmlr}"
  '\u0271': "{\\Elzltlmr}"
  '\u0273': "{\\Elzrtln}"
  '\u0277': "{\\Elzclomeg}"
  '\u0279': "{\\Elztrnr}"
  '\u027A': "{\\Elztrnrl}"
  '\u027B': "{\\Elzrttrnr}"
  '\u027C': "{\\Elzrl}"
  '\u027D': "{\\Elzrtlr}"
  '\u027E': "{\\Elzfhr}"
  '\u0282': "{\\Elzrtls}"
  '\u0283': "{\\Elzesh}"
  '\u0287': "{\\Elztrnt}"
  '\u0288': "{\\Elzrtlt}"
  '\u028A': "{\\Elzpupsil}"
  '\u028B': "{\\Elzpscrv}"
  '\u028C': "{\\Elzinvv}"
  '\u028D': "{\\Elzinvw}"
  '\u028E': "{\\Elztrny}"
  '\u0290': "{\\Elzrtlz}"
  '\u0292': "{\\Elzyogh}"
  '\u0294': "{\\Elzglst}"
  '\u0295': "{\\Elzreglst}"
  '\u0296': "{\\Elzinglst}"
  '\u02A4': "{\\Elzdyogh}"
  '\u02A7': "{\\Elztesh}"
  '\u02C8': "{\\Elzverts}"
  '\u02CC': "{\\Elzverti}"
  '\u02D0': "{\\Elzlmrk}"
  '\u02D1': "{\\Elzhlmrk}"
  '\u02D2': "{\\Elzsbrhr}"
  '\u02D3': "{\\Elzsblhr}"
  '\u02D4': "{\\Elzrais}"
  '\u02D5': "{\\Elzlow}"
  '\u0321': "{\\Elzpalh}"
  '\u032A': "{\\Elzsbbrg}"
  '\u038E': "\\mathrm{'Y}"
  '\u038F': "\\mathrm{'\\Omega}"
  '\u0390': "\\acute{\\ddot{\\iota}}"
  '\u0391': "{\\Alpha}"
  '\u0392': "{\\Beta}"
  '\u0393': "{\\Gamma}"
  '\u0394': "{\\Delta}"
  '\u0395': "{\\Epsilon}"
  '\u0396': "{\\Zeta}"
  '\u0397': "{\\Eta}"
  '\u0398': "{\\Theta}"
  '\u0399': "{\\Iota}"
  '\u039A': "{\\Kappa}"
  '\u039B': "{\\Lambda}"
  '\u039C': "M"
  '\u039D': "N"
  '\u039E': "{\\Xi}"
  '\u039F': "O"
  '\u03A0': "{\\Pi}"
  '\u03A1': "{\\Rho}"
  '\u03A3': "{\\Sigma}"
  '\u03A4': "{\\Tau}"
  '\u03A5': "{\\Upsilon}"
  '\u03A6': "{\\Phi}"
  '\u03A7': "{\\Chi}"
  '\u03A8': "{\\Psi}"
  '\u03A9': "{\\Omega}"
  '\u03AA': "\\mathrm{\\ddot{I}}"
  '\u03AB': "\\mathrm{\\ddot{Y}}"
  '\u03AD': "\\acute{\\epsilon}"
  '\u03AE': "\\acute{\\eta}"
  '\u03AF': "\\acute{\\iota}"
  '\u03B0': "\\acute{\\ddot{\\upsilon}}"
  '\u03B1': "{\\alpha}"
  '\u03B2': "{\\beta}"
  '\u03B3': "{\\gamma}"
  '\u03B4': "{\\delta}"
  '\u03B5': "{\\epsilon}"
  '\u03B6': "{\\zeta}"
  '\u03B7': "{\\eta}"
  '\u03B9': "{\\iota}"
  '\u03BA': "{\\kappa}"
  '\u03BB': "{\\lambda}"
  '\u03BC': "{\\mu}"
  '\u03BD': "{\\nu}"
  '\u03BE': "{\\xi}"
  '\u03BF': "o"
  '\u03C0': "{\\pi}"
  '\u03C1': "{\\rho}"
  '\u03C2': "{\\varsigma}"
  '\u03C3': "{\\sigma}"
  '\u03C4': "{\\tau}"
  '\u03C5': "{\\upsilon}"
  '\u03C6': "{\\varphi}"
  '\u03C7': "{\\chi}"
  '\u03C8': "{\\psi}"
  '\u03C9': "{\\omega}"
  '\u03CA': "\\ddot{\\iota}"
  '\u03CB': "\\ddot{\\upsilon}"
  '\u03CD': "\\acute{\\upsilon}"
  '\u03CE': "\\acute{\\omega}"
  '\u03D2': "{\\Upsilon}"
  '\u03D5': "{\\phi}"
  '\u03D6': "{\\varpi}"
  '\u03DA': "{\\Stigma}"
  '\u03DC': "{\\Digamma}"
  '\u03DD': "{\\digamma}"
  '\u03DE': "{\\Koppa}"
  '\u03E0': "{\\Sampi}"
  '\u03F0': "{\\varkappa}"
  '\u03F1': "{\\varrho}"
  '\u03F6': "{\\backepsilon}"
  '\u200A': "{\\mkern1mu}"
  '\u2016': "{\\Vert}"
  '\u201B': "{\\Elzreapos}"
  '\u2032': "{'}"
  '\u2033': "{''}"
  '\u2034': "{'''}"
  '\u2035': "{\\backprime}"
  '\u2057': "''''"
  '\u20DB': "{\\dddot}"
  '\u20DC': "{\\ddddot}"
  '\u2102': "\\mathbb{C}"
  '\u210B': "\\mathscr{H}"
  '\u210C': "\\mathfrak{H}"
  '\u210D': "\\mathbb{H}"
  '\u210F': "{\\hslash}"
  '\u2110': "\\mathscr{I}"
  '\u2111': "\\mathfrak{I}"
  '\u2112': "\\mathscr{L}"
  '\u2113': "\\mathscr{l}"
  '\u2115': "\\mathbb{N}"
  '\u2118': "{\\wp}"
  '\u2119': "\\mathbb{P}"
  '\u211A': "\\mathbb{Q}"
  '\u211B': "\\mathscr{R}"
  '\u211C': "\\mathfrak{R}"
  '\u211D': "\\mathbb{R}"
  '\u211E': "{\\Elzxrat}"
  '\u2124': "\\mathbb{Z}"
  '\u2126': "{\\Omega}"
  '\u2127': "{\\mho}"
  '\u2128': "\\mathfrak{Z}"
  '\u2129': "\\ElsevierGlyph{2129}"
  '\u212C': "\\mathscr{B}"
  '\u212D': "\\mathfrak{C}"
  '\u212F': "\\mathscr{e}"
  '\u2130': "\\mathscr{E}"
  '\u2131': "\\mathscr{F}"
  '\u2133': "\\mathscr{M}"
  '\u2134': "\\mathscr{o}"
  '\u2135': "{\\aleph}"
  '\u2136': "{\\beth}"
  '\u2137': "{\\gimel}"
  '\u2138': "{\\daleth}"
  '\u2153': "\\textfrac{1}{3}"
  '\u2154': "\\textfrac{2}{3}"
  '\u2155': "\\textfrac{1}{5}"
  '\u2156': "\\textfrac{2}{5}"
  '\u2157': "\\textfrac{3}{5}"
  '\u2158': "\\textfrac{4}{5}"
  '\u2159': "\\textfrac{1}{6}"
  '\u215A': "\\textfrac{5}{6}"
  '\u215B': "\\textfrac{1}{8}"
  '\u215C': "\\textfrac{3}{8}"
  '\u215D': "\\textfrac{5}{8}"
  '\u215E': "\\textfrac{7}{8}"
  '\u2190': "{\\leftarrow}"
  '\u2191': "{\\uparrow}"
  '\u2192': "{\\rightarrow}"
  '\u2193': "{\\downarrow}"
  '\u2194': "{\\leftrightarrow}"
  '\u2195': "{\\updownarrow}"
  '\u2196': "{\\nwarrow}"
  '\u2197': "{\\nearrow}"
  '\u2198': "{\\searrow}"
  '\u2199': "{\\swarrow}"
  '\u219A': "{\\nleftarrow}"
  '\u219B': "{\\nrightarrow}"
  '\u219C': "{\\arrowwaveright}"
  '\u219D': "{\\arrowwaveright}"
  '\u219E': "{\\twoheadleftarrow}"
  '\u21A0': "{\\twoheadrightarrow}"
  '\u21A2': "{\\leftarrowtail}"
  '\u21A3': "{\\rightarrowtail}"
  '\u21A6': "{\\mapsto}"
  '\u21A9': "{\\hookleftarrow}"
  '\u21AA': "{\\hookrightarrow}"
  '\u21AB': "{\\looparrowleft}"
  '\u21AC': "{\\looparrowright}"
  '\u21AD': "{\\leftrightsquigarrow}"
  '\u21AE': "{\\nleftrightarrow}"
  '\u21B0': "{\\Lsh}"
  '\u21B1': "{\\Rsh}"
  '\u21B3': "\\ElsevierGlyph{21B3}"
  '\u21B6': "{\\curvearrowleft}"
  '\u21B7': "{\\curvearrowright}"
  '\u21BA': "{\\circlearrowleft}"
  '\u21BB': "{\\circlearrowright}"
  '\u21BC': "{\\leftharpoonup}"
  '\u21BD': "{\\leftharpoondown}"
  '\u21BE': "{\\upharpoonright}"
  '\u21BF': "{\\upharpoonleft}"
  '\u21C0': "{\\rightharpoonup}"
  '\u21C1': "{\\rightharpoondown}"
  '\u21C2': "{\\downharpoonright}"
  '\u21C3': "{\\downharpoonleft}"
  '\u21C4': "{\\rightleftarrows}"
  '\u21C5': "{\\dblarrowupdown}"
  '\u21C6': "{\\leftrightarrows}"
  '\u21C7': "{\\leftleftarrows}"
  '\u21C8': "{\\upuparrows}"
  '\u21C9': "{\\rightrightarrows}"
  '\u21CA': "{\\downdownarrows}"
  '\u21CB': "{\\leftrightharpoons}"
  '\u21CC': "{\\rightleftharpoons}"
  '\u21CD': "{\\nLeftarrow}"
  '\u21CE': "{\\nLeftrightarrow}"
  '\u21CF': "{\\nRightarrow}"
  '\u21D0': "{\\Leftarrow}"
  '\u21D1': "{\\Uparrow}"
  '\u21D2': "{\\Rightarrow}"
  '\u21D3': "{\\Downarrow}"
  '\u21D4': "{\\Leftrightarrow}"
  '\u21D5': "{\\Updownarrow}"
  '\u21DA': "{\\Lleftarrow}"
  '\u21DB': "{\\Rrightarrow}"
  '\u21DD': "{\\rightsquigarrow}"
  '\u21F5': "{\\DownArrowUpArrow}"
  '\u2200': "{\\forall}"
  '\u2201': "{\\complement}"
  '\u2202': "{\\partial}"
  '\u2203': "{\\exists}"
  '\u2204': "{\\nexists}"
  '\u2205': "{\\varnothing}"
  '\u2207': "{\\nabla}"
  '\u2208': "{\\in}"
  '\u2209': "{\\not\\in}"
  '\u220B': "{\\ni}"
  '\u220C': "{\\not\\ni}"
  '\u220F': "{\\prod}"
  '\u2210': "{\\coprod}"
  '\u2211': "{\\sum}"
  '\u2213': "{\\mp}"
  '\u2214': "{\\dotplus}"
  '\u2216': "{\\setminus}"
  '\u2217': "{_\\ast}"
  '\u2218': "{\\circ}"
  '\u2219': "{\\bullet}"
  '\u221A': "{\\surd}"
  '\u221D': "{\\propto}"
  '\u221E': "{\\infty}"
  '\u221F': "{\\rightangle}"
  '\u2220': "{\\angle}"
  '\u2221': "{\\measuredangle}"
  '\u2222': "{\\sphericalangle}"
  '\u2223': "{\\mid}"
  '\u2224': "{\\nmid}"
  '\u2225': "{\\parallel}"
  '\u2226': "{\\nparallel}"
  '\u2227': "{\\wedge}"
  '\u2228': "{\\vee}"
  '\u2229': "{\\cap}"
  '\u222A': "{\\cup}"
  '\u222B': "{\\int}"
  '\u222C': "{\\int\\!\\int}"
  '\u222D': "{\\int\\!\\int\\!\\int}"
  '\u222E': "{\\oint}"
  '\u222F': "{\\surfintegral}"
  '\u2230': "{\\volintegral}"
  '\u2231': "{\\clwintegral}"
  '\u2232': "\\ElsevierGlyph{2232}"
  '\u2233': "\\ElsevierGlyph{2233}"
  '\u2234': "{\\therefore}"
  '\u2235': "{\\because}"
  '\u2237': "{\\Colon}"
  '\u2238': "\\ElsevierGlyph{2238}"
  '\u223A': "\\mathbin{{:}\\!\\!{-}\\!\\!{:}}"
  '\u223B': "{\\homothetic}"
  '\u223C': "{\\sim}"
  '\u223D': "{\\backsim}"
  '\u223E': "{\\lazysinv}"
  '\u2240': "{\\wr}"
  '\u2241': "{\\not\\sim}"
  '\u2242': "\\ElsevierGlyph{2242}"
  '\u2243': "{\\simeq}"
  '\u2244': "{\\not\\simeq}"
  '\u2245': "{\\cong}"
  '\u2246': "{\\approxnotequal}"
  '\u2247': "{\\not\\cong}"
  '\u2248': "{\\approx}"
  '\u2249': "{\\not\\approx}"
  '\u224A': "{\\approxeq}"
  '\u224B': "{\\tildetrpl}"
  '\u224C': "{\\allequal}"
  '\u224D': "{\\asymp}"
  '\u224E': "{\\Bumpeq}"
  '\u224F': "{\\bumpeq}"
  '\u2250': "{\\doteq}"
  '\u2251': "{\\doteqdot}"
  '\u2252': "{\\fallingdotseq}"
  '\u2253': "{\\risingdotseq}"
  '\u2255': "=:"
  '\u2256': "{\\eqcirc}"
  '\u2257': "{\\circeq}"
  '\u2259': "{\\estimates}"
  '\u225A': "\\ElsevierGlyph{225A}"
  '\u225B': "{\\starequal}"
  '\u225C': "{\\triangleq}"
  '\u225F': "\\ElsevierGlyph{225F}"
  '\u2260': "\\not ="
  '\u2261': "{\\equiv}"
  '\u2262': "{\\not\\equiv}"
  '\u2264': "{\\leq}"
  '\u2265': "{\\geq}"
  '\u2266': "{\\leqq}"
  '\u2267': "{\\geqq}"
  '\u2268': "{\\lneqq}"
  '\u2269': "{\\gneqq}"
  '\u226A': "{\\ll}"
  '\u226B': "{\\gg}"
  '\u226C': "{\\between}"
  '\u226D': "{\\not\\kern-0.3em\\times}"
  '\u226E': "\\not<"
  '\u226F': "\\not>"
  '\u2270': "{\\not\\leq}"
  '\u2271': "{\\not\\geq}"
  '\u2272': "{\\lessequivlnt}"
  '\u2273': "{\\greaterequivlnt}"
  '\u2274': "\\ElsevierGlyph{2274}"
  '\u2275': "\\ElsevierGlyph{2275}"
  '\u2276': "{\\lessgtr}"
  '\u2277': "{\\gtrless}"
  '\u2278': "{\\notlessgreater}"
  '\u2279': "{\\notgreaterless}"
  '\u227A': "{\\prec}"
  '\u227B': "{\\succ}"
  '\u227C': "{\\preccurlyeq}"
  '\u227D': "{\\succcurlyeq}"
  '\u227E': "{\\precapprox}"
  '\u227F': "{\\succapprox}"
  '\u2280': "{\\not\\prec}"
  '\u2281': "{\\not\\succ}"
  '\u2282': "{\\subset}"
  '\u2283': "{\\supset}"
  '\u2284': "{\\not\\subset}"
  '\u2285': "{\\not\\supset}"
  '\u2286': "{\\subseteq}"
  '\u2287': "{\\supseteq}"
  '\u2288': "{\\not\\subseteq}"
  '\u2289': "{\\not\\supseteq}"
  '\u228A': "{\\subsetneq}"
  '\u228B': "{\\supsetneq}"
  '\u228E': "{\\uplus}"
  '\u228F': "{\\sqsubset}"
  '\u2290': "{\\sqsupset}"
  '\u2291': "{\\sqsubseteq}"
  '\u2292': "{\\sqsupseteq}"
  '\u2293': "{\\sqcap}"
  '\u2294': "{\\sqcup}"
  '\u2295': "{\\oplus}"
  '\u2296': "{\\ominus}"
  '\u2297': "{\\otimes}"
  '\u2298': "{\\oslash}"
  '\u2299': "{\\odot}"
  '\u229A': "{\\circledcirc}"
  '\u229B': "{\\circledast}"
  '\u229D': "{\\circleddash}"
  '\u229E': "{\\boxplus}"
  '\u229F': "{\\boxminus}"
  '\u22A0': "{\\boxtimes}"
  '\u22A1': "{\\boxdot}"
  '\u22A2': "{\\vdash}"
  '\u22A3': "{\\dashv}"
  '\u22A4': "{\\top}"
  '\u22A5': "{\\perp}"
  '\u22A7': "{\\truestate}"
  '\u22A8': "{\\forcesextra}"
  '\u22A9': "{\\Vdash}"
  '\u22AA': "{\\Vvdash}"
  '\u22AB': "{\\VDash}"
  '\u22AC': "{\\nvdash}"
  '\u22AD': "{\\nvDash}"
  '\u22AE': "{\\nVdash}"
  '\u22AF': "{\\nVDash}"
  '\u22B2': "{\\vartriangleleft}"
  '\u22B3': "{\\vartriangleright}"
  '\u22B4': "{\\trianglelefteq}"
  '\u22B5': "{\\trianglerighteq}"
  '\u22B6': "{\\original}"
  '\u22B7': "{\\image}"
  '\u22B8': "{\\multimap}"
  '\u22B9': "{\\hermitconjmatrix}"
  '\u22BA': "{\\intercal}"
  '\u22BB': "{\\veebar}"
  '\u22BE': "{\\rightanglearc}"
  '\u22C0': "\\ElsevierGlyph{22C0}"
  '\u22C1': "\\ElsevierGlyph{22C1}"
  '\u22C2': "{\\bigcap}"
  '\u22C3': "{\\bigcup}"
  '\u22C4': "{\\diamond}"
  '\u22C5': "{\\cdot}"
  '\u22C6': "{\\star}"
  '\u22C7': "{\\divideontimes}"
  '\u22C8': "{\\bowtie}"
  '\u22C9': "{\\ltimes}"
  '\u22CA': "{\\rtimes}"
  '\u22CB': "{\\leftthreetimes}"
  '\u22CC': "{\\rightthreetimes}"
  '\u22CD': "{\\backsimeq}"
  '\u22CE': "{\\curlyvee}"
  '\u22CF': "{\\curlywedge}"
  '\u22D0': "{\\Subset}"
  '\u22D1': "{\\Supset}"
  '\u22D2': "{\\Cap}"
  '\u22D3': "{\\Cup}"
  '\u22D4': "{\\pitchfork}"
  '\u22D6': "{\\lessdot}"
  '\u22D7': "{\\gtrdot}"
  '\u22D8': "{\\verymuchless}"
  '\u22D9': "{\\verymuchgreater}"
  '\u22DA': "{\\lesseqgtr}"
  '\u22DB': "{\\gtreqless}"
  '\u22DE': "{\\curlyeqprec}"
  '\u22DF': "{\\curlyeqsucc}"
  '\u22E2': "{\\not\\sqsubseteq}"
  '\u22E3': "{\\not\\sqsupseteq}"
  '\u22E5': "{\\Elzsqspne}"
  '\u22E6': "{\\lnsim}"
  '\u22E7': "{\\gnsim}"
  '\u22E8': "{\\precedesnotsimilar}"
  '\u22E9': "{\\succnsim}"
  '\u22EA': "{\\ntriangleleft}"
  '\u22EB': "{\\ntriangleright}"
  '\u22EC': "{\\ntrianglelefteq}"
  '\u22ED': "{\\ntrianglerighteq}"
  '\u22EE': "{\\vdots}"
  '\u22EF': "{\\cdots}"
  '\u22F0': "{\\upslopeellipsis}"
  '\u22F1': "{\\downslopeellipsis}"
  '\u2306': "{\\perspcorrespond}"
  '\u2308': "{\\lceil}"
  '\u2309': "{\\rceil}"
  '\u230A': "{\\lfloor}"
  '\u230B': "{\\rfloor}"
  '\u2315': "{\\recorder}"
  '\u2316': "\\mathchar\"2208"
  '\u231C': "{\\ulcorner}"
  '\u231D': "{\\urcorner}"
  '\u231E': "{\\llcorner}"
  '\u231F': "{\\lrcorner}"
  '\u2322': "{\\frown}"
  '\u2323': "{\\smile}"
  '\u233D': "\\ElsevierGlyph{E838}"
  '\u23A3': "{\\Elzdlcorn}"
  '\u23B0': "{\\lmoustache}"
  '\u23B1': "{\\rmoustache}"
  '\u24C8': "{\\circledS}"
  '\u2506': "{\\Elzdshfnc}"
  '\u2519': "{\\Elzsqfnw}"
  '\u2571': "{\\diagup}"
  '\u25A1': "{\\square}"
  '\u25AA': "{\\blacksquare}"
  '\u25AD': "\\fbox{~~}"
  '\u25AF': "{\\Elzvrecto}"
  '\u25B1': "\\ElsevierGlyph{E381}"
  '\u25B3': "{\\bigtriangleup}"
  '\u25B4': "{\\blacktriangle}"
  '\u25B5': "{\\vartriangle}"
  '\u25B8': "{\\blacktriangleright}"
  '\u25B9': "{\\triangleright}"
  '\u25BD': "{\\bigtriangledown}"
  '\u25BE': "{\\blacktriangledown}"
  '\u25BF': "{\\triangledown}"
  '\u25C2': "{\\blacktriangleleft}"
  '\u25C3': "{\\triangleleft}"
  '\u25CA': "{\\lozenge}"
  '\u25CB': "{\\bigcirc}"
  '\u25D0': "{\\Elzcirfl}"
  '\u25D1': "{\\Elzcirfr}"
  '\u25D2': "{\\Elzcirfb}"
  '\u25D8': "{\\Elzrvbull}"
  '\u25E7': "{\\Elzsqfl}"
  '\u25E8': "{\\Elzsqfr}"
  '\u25EA': "{\\Elzsqfse}"
  '\u25EF': "{\\bigcirc}"
  '\u2662': "{\\diamond}"
  '\u266D': "{\\flat}"
  '\u266E': "{\\natural}"
  '\u266F': "{\\sharp}"
  '\u27F5': "{\\longleftarrow}"
  '\u27F6': "{\\longrightarrow}"
  '\u27F7': "{\\longleftrightarrow}"
  '\u27F8': "{\\Longleftarrow}"
  '\u27F9': "{\\Longrightarrow}"
  '\u27FA': "{\\Longleftrightarrow}"
  '\u27FC': "{\\longmapsto}"
  '\u27FF': "\\sim\\joinrel\\leadsto"
  '\u2905': "\\ElsevierGlyph{E212}"
  '\u2912': "{\\UpArrowBar}"
  '\u2913': "{\\DownArrowBar}"
  '\u2923': "\\ElsevierGlyph{E20C}"
  '\u2924': "\\ElsevierGlyph{E20D}"
  '\u2925': "\\ElsevierGlyph{E20B}"
  '\u2926': "\\ElsevierGlyph{E20A}"
  '\u2927': "\\ElsevierGlyph{E211}"
  '\u2928': "\\ElsevierGlyph{E20E}"
  '\u2929': "\\ElsevierGlyph{E20F}"
  '\u292A': "\\ElsevierGlyph{E210}"
  '\u2933': "\\ElsevierGlyph{E21C}"
  '\u2936': "\\ElsevierGlyph{E21A}"
  '\u2937': "\\ElsevierGlyph{E219}"
  '\u2940': "{\\Elolarr}"
  '\u2941': "{\\Elorarr}"
  '\u2942': "{\\ElzRlarr}"
  '\u2944': "{\\ElzrLarr}"
  '\u2947': "{\\Elzrarrx}"
  '\u294E': "{\\LeftRightVector}"
  '\u294F': "{\\RightUpDownVector}"
  '\u2950': "{\\DownLeftRightVector}"
  '\u2951': "{\\LeftUpDownVector}"
  '\u2952': "{\\LeftVectorBar}"
  '\u2953': "{\\RightVectorBar}"
  '\u2954': "{\\RightUpVectorBar}"
  '\u2955': "{\\RightDownVectorBar}"
  '\u2956': "{\\DownLeftVectorBar}"
  '\u2957': "{\\DownRightVectorBar}"
  '\u2958': "{\\LeftUpVectorBar}"
  '\u2959': "{\\LeftDownVectorBar}"
  '\u295A': "{\\LeftTeeVector}"
  '\u295B': "{\\RightTeeVector}"
  '\u295C': "{\\RightUpTeeVector}"
  '\u295D': "{\\RightDownTeeVector}"
  '\u295E': "{\\DownLeftTeeVector}"
  '\u295F': "{\\DownRightTeeVector}"
  '\u2960': "{\\LeftUpTeeVector}"
  '\u2961': "{\\LeftDownTeeVector}"
  '\u296E': "{\\UpEquilibrium}"
  '\u296F': "{\\ReverseUpEquilibrium}"
  '\u2970': "{\\RoundImplies}"
  '\u297C': "\\ElsevierGlyph{E214}"
  '\u297D': "\\ElsevierGlyph{E215}"
  '\u2980': "{\\Elztfnc}"
  '\u2985': "\\ElsevierGlyph{3018}"
  '\u2986': "{\\Elroang}"
  '\u2993': "<\\kern-0.58em("
  '\u2994': "\\ElsevierGlyph{E291}"
  '\u2999': "{\\Elzddfnc}"
  '\u299C': "{\\Angle}"
  '\u29A0': "{\\Elzlpargt}"
  '\u29B5': "\\ElsevierGlyph{E260}"
  '\u29B6': "\\ElsevierGlyph{E61B}"
  '\u29CA': "{\\ElzLap}"
  '\u29CB': "{\\Elzdefas}"
  '\u29CF': "{\\LeftTriangleBar}"
  '\u29D0': "{\\RightTriangleBar}"
  '\u29DC': "\\ElsevierGlyph{E372}"
  '\u29EB': "{\\blacklozenge}"
  '\u29F4': "{\\RuleDelayed}"
  '\u2A04': "{\\Elxuplus}"
  '\u2A05': "{\\ElzThr}"
  '\u2A06': "{\\Elxsqcup}"
  '\u2A07': "{\\ElzInf}"
  '\u2A08': "{\\ElzSup}"
  '\u2A0D': "{\\ElzCint}"
  '\u2A0F': "{\\clockoint}"
  '\u2A10': "\\ElsevierGlyph{E395}"
  '\u2A16': "{\\sqrint}"
  '\u2A25': "\\ElsevierGlyph{E25A}"
  '\u2A2A': "\\ElsevierGlyph{E25B}"
  '\u2A2D': "\\ElsevierGlyph{E25C}"
  '\u2A2E': "\\ElsevierGlyph{E25D}"
  '\u2A2F': "{\\ElzTimes}"
  '\u2A34': "\\ElsevierGlyph{E25E}"
  '\u2A35': "\\ElsevierGlyph{E25E}"
  '\u2A3C': "\\ElsevierGlyph{E259}"
  '\u2A3F': "{\\amalg}"
  '\u2A53': "{\\ElzAnd}"
  '\u2A54': "{\\ElzOr}"
  '\u2A55': "\\ElsevierGlyph{E36E}"
  '\u2A56': "{\\ElOr}"
  '\u2A5E': "{\\perspcorrespond}"
  '\u2A5F': "{\\Elzminhat}"
  '\u2A63': "\\ElsevierGlyph{225A}"
  '\u2A6E': "\\stackrel{*}{=}"
  '\u2A75': "{\\Equal}"
  '\u2A7D': "{\\leqslant}"
  '\u2A7E': "{\\geqslant}"
  '\u2A85': "{\\lessapprox}"
  '\u2A86': "{\\gtrapprox}"
  '\u2A87': "{\\lneq}"
  '\u2A88': "{\\gneq}"
  '\u2A89': "{\\lnapprox}"
  '\u2A8A': "{\\gnapprox}"
  '\u2A8B': "{\\lesseqqgtr}"
  '\u2A8C': "{\\gtreqqless}"
  '\u2A95': "{\\eqslantless}"
  '\u2A96': "{\\eqslantgtr}"
  '\u2A9D': "\\Pisymbol{ppi020}{117}"
  '\u2A9E': "\\Pisymbol{ppi020}{105}"
  '\u2AA1': "{\\NestedLessLess}"
  '\u2AA2': "{\\NestedGreaterGreater}"
  '\u2AAF': "{\\preceq}"
  '\u2AB0': "{\\succeq}"
  '\u2AB5': "{\\precneqq}"
  '\u2AB6': "{\\succneqq}"
  '\u2AB7': "{\\precapprox}"
  '\u2AB8': "{\\succapprox}"
  '\u2AB9': "{\\precnapprox}"
  '\u2ABA': "{\\succnapprox}"
  '\u2AC5': "{\\subseteqq}"
  '\u2AC6': "{\\supseteqq}"
  '\u2ACB': "{\\subsetneqq}"
  '\u2ACC': "{\\supsetneqq}"
  '\u2AEB': "\\ElsevierGlyph{E30D}"
  '\u2AF6': "{\\Elztdcol}"
  '\u2AFD': "{{/}\\!\\!{/}}"
  '\u300A': "\\ElsevierGlyph{300A}"
  '\u300B': "\\ElsevierGlyph{300B}"
  '\u3018': "\\ElsevierGlyph{3018}"
  '\u3019': "\\ElsevierGlyph{3019}"
  '\u301A': "{\\openbracketleft}"
  '\u301B': "{\\openbracketright}"
  '\ud835\udc00': "\\mathbf{A}"
  '\ud835\udc01': "\\mathbf{B}"
  '\ud835\udc02': "\\mathbf{C}"
  '\ud835\udc03': "\\mathbf{D}"
  '\ud835\udc04': "\\mathbf{E}"
  '\ud835\udc05': "\\mathbf{F}"
  '\ud835\udc06': "\\mathbf{G}"
  '\ud835\udc07': "\\mathbf{H}"
  '\ud835\udc08': "\\mathbf{I}"
  '\ud835\udc09': "\\mathbf{J}"
  '\ud835\udc0a': "\\mathbf{K}"
  '\ud835\udc0b': "\\mathbf{L}"
  '\ud835\udc0c': "\\mathbf{M}"
  '\ud835\udc0d': "\\mathbf{N}"
  '\ud835\udc0e': "\\mathbf{O}"
  '\ud835\udc0f': "\\mathbf{P}"
  '\ud835\udc10': "\\mathbf{Q}"
  '\ud835\udc11': "\\mathbf{R}"
  '\ud835\udc12': "\\mathbf{S}"
  '\ud835\udc13': "\\mathbf{T}"
  '\ud835\udc14': "\\mathbf{U}"
  '\ud835\udc15': "\\mathbf{V}"
  '\ud835\udc16': "\\mathbf{W}"
  '\ud835\udc17': "\\mathbf{X}"
  '\ud835\udc18': "\\mathbf{Y}"
  '\ud835\udc19': "\\mathbf{Z}"
  '\ud835\udc1a': "\\mathbf{a}"
  '\ud835\udc1b': "\\mathbf{b}"
  '\ud835\udc1c': "\\mathbf{c}"
  '\ud835\udc1d': "\\mathbf{d}"
  '\ud835\udc1e': "\\mathbf{e}"
  '\ud835\udc1f': "\\mathbf{f}"
  '\ud835\udc20': "\\mathbf{g}"
  '\ud835\udc21': "\\mathbf{h}"
  '\ud835\udc22': "\\mathbf{i}"
  '\ud835\udc23': "\\mathbf{j}"
  '\ud835\udc24': "\\mathbf{k}"
  '\ud835\udc25': "\\mathbf{l}"
  '\ud835\udc26': "\\mathbf{m}"
  '\ud835\udc27': "\\mathbf{n}"
  '\ud835\udc28': "\\mathbf{o}"
  '\ud835\udc29': "\\mathbf{p}"
  '\ud835\udc2a': "\\mathbf{q}"
  '\ud835\udc2b': "\\mathbf{r}"
  '\ud835\udc2c': "\\mathbf{s}"
  '\ud835\udc2d': "\\mathbf{t}"
  '\ud835\udc2e': "\\mathbf{u}"
  '\ud835\udc2f': "\\mathbf{v}"
  '\ud835\udc30': "\\mathbf{w}"
  '\ud835\udc31': "\\mathbf{x}"
  '\ud835\udc32': "\\mathbf{y}"
  '\ud835\udc33': "\\mathbf{z}"
  '\ud835\udc34': "\\mathsl{A}"
  '\ud835\udc35': "\\mathsl{B}"
  '\ud835\udc36': "\\mathsl{C}"
  '\ud835\udc37': "\\mathsl{D}"
  '\ud835\udc38': "\\mathsl{E}"
  '\ud835\udc39': "\\mathsl{F}"
  '\ud835\udc3a': "\\mathsl{G}"
  '\ud835\udc3b': "\\mathsl{H}"
  '\ud835\udc3c': "\\mathsl{I}"
  '\ud835\udc3d': "\\mathsl{J}"
  '\ud835\udc3e': "\\mathsl{K}"
  '\ud835\udc3f': "\\mathsl{L}"
  '\ud835\udc40': "\\mathsl{M}"
  '\ud835\udc41': "\\mathsl{N}"
  '\ud835\udc42': "\\mathsl{O}"
  '\ud835\udc43': "\\mathsl{P}"
  '\ud835\udc44': "\\mathsl{Q}"
  '\ud835\udc45': "\\mathsl{R}"
  '\ud835\udc46': "\\mathsl{S}"
  '\ud835\udc47': "\\mathsl{T}"
  '\ud835\udc48': "\\mathsl{U}"
  '\ud835\udc49': "\\mathsl{V}"
  '\ud835\udc4a': "\\mathsl{W}"
  '\ud835\udc4b': "\\mathsl{X}"
  '\ud835\udc4c': "\\mathsl{Y}"
  '\ud835\udc4d': "\\mathsl{Z}"
  '\ud835\udc4e': "\\mathsl{a}"
  '\ud835\udc4f': "\\mathsl{b}"
  '\ud835\udc50': "\\mathsl{c}"
  '\ud835\udc51': "\\mathsl{d}"
  '\ud835\udc52': "\\mathsl{e}"
  '\ud835\udc53': "\\mathsl{f}"
  '\ud835\udc54': "\\mathsl{g}"
  '\ud835\udc56': "\\mathsl{i}"
  '\ud835\udc57': "\\mathsl{j}"
  '\ud835\udc58': "\\mathsl{k}"
  '\ud835\udc59': "\\mathsl{l}"
  '\ud835\udc5a': "\\mathsl{m}"
  '\ud835\udc5b': "\\mathsl{n}"
  '\ud835\udc5c': "\\mathsl{o}"
  '\ud835\udc5d': "\\mathsl{p}"
  '\ud835\udc5e': "\\mathsl{q}"
  '\ud835\udc5f': "\\mathsl{r}"
  '\ud835\udc60': "\\mathsl{s}"
  '\ud835\udc61': "\\mathsl{t}"
  '\ud835\udc62': "\\mathsl{u}"
  '\ud835\udc63': "\\mathsl{v}"
  '\ud835\udc64': "\\mathsl{w}"
  '\ud835\udc65': "\\mathsl{x}"
  '\ud835\udc66': "\\mathsl{y}"
  '\ud835\udc67': "\\mathsl{z}"
  '\ud835\udc68': "\\mathbit{A}"
  '\ud835\udc69': "\\mathbit{B}"
  '\ud835\udc6a': "\\mathbit{C}"
  '\ud835\udc6b': "\\mathbit{D}"
  '\ud835\udc6c': "\\mathbit{E}"
  '\ud835\udc6d': "\\mathbit{F}"
  '\ud835\udc6e': "\\mathbit{G}"
  '\ud835\udc6f': "\\mathbit{H}"
  '\ud835\udc70': "\\mathbit{I}"
  '\ud835\udc71': "\\mathbit{J}"
  '\ud835\udc72': "\\mathbit{K}"
  '\ud835\udc73': "\\mathbit{L}"
  '\ud835\udc74': "\\mathbit{M}"
  '\ud835\udc75': "\\mathbit{N}"
  '\ud835\udc76': "\\mathbit{O}"
  '\ud835\udc77': "\\mathbit{P}"
  '\ud835\udc78': "\\mathbit{Q}"
  '\ud835\udc79': "\\mathbit{R}"
  '\ud835\udc7a': "\\mathbit{S}"
  '\ud835\udc7b': "\\mathbit{T}"
  '\ud835\udc7c': "\\mathbit{U}"
  '\ud835\udc7d': "\\mathbit{V}"
  '\ud835\udc7e': "\\mathbit{W}"
  '\ud835\udc7f': "\\mathbit{X}"
  '\ud835\udc80': "\\mathbit{Y}"
  '\ud835\udc81': "\\mathbit{Z}"
  '\ud835\udc82': "\\mathbit{a}"
  '\ud835\udc83': "\\mathbit{b}"
  '\ud835\udc84': "\\mathbit{c}"
  '\ud835\udc85': "\\mathbit{d}"
  '\ud835\udc86': "\\mathbit{e}"
  '\ud835\udc87': "\\mathbit{f}"
  '\ud835\udc88': "\\mathbit{g}"
  '\ud835\udc89': "\\mathbit{h}"
  '\ud835\udc8a': "\\mathbit{i}"
  '\ud835\udc8b': "\\mathbit{j}"
  '\ud835\udc8c': "\\mathbit{k}"
  '\ud835\udc8d': "\\mathbit{l}"
  '\ud835\udc8e': "\\mathbit{m}"
  '\ud835\udc8f': "\\mathbit{n}"
  '\ud835\udc90': "\\mathbit{o}"
  '\ud835\udc91': "\\mathbit{p}"
  '\ud835\udc92': "\\mathbit{q}"
  '\ud835\udc93': "\\mathbit{r}"
  '\ud835\udc94': "\\mathbit{s}"
  '\ud835\udc95': "\\mathbit{t}"
  '\ud835\udc96': "\\mathbit{u}"
  '\ud835\udc97': "\\mathbit{v}"
  '\ud835\udc98': "\\mathbit{w}"
  '\ud835\udc99': "\\mathbit{x}"
  '\ud835\udc9a': "\\mathbit{y}"
  '\ud835\udc9b': "\\mathbit{z}"
  '\ud835\udc9c': "\\mathscr{A}"
  '\ud835\udc9e': "\\mathscr{C}"
  '\ud835\udc9f': "\\mathscr{D}"
  '\ud835\udca2': "\\mathscr{G}"
  '\ud835\udca5': "\\mathscr{J}"
  '\ud835\udca6': "\\mathscr{K}"
  '\ud835\udca9': "\\mathscr{N}"
  '\ud835\udcaa': "\\mathscr{O}"
  '\ud835\udcab': "\\mathscr{P}"
  '\ud835\udcac': "\\mathscr{Q}"
  '\ud835\udcae': "\\mathscr{S}"
  '\ud835\udcaf': "\\mathscr{T}"
  '\ud835\udcb0': "\\mathscr{U}"
  '\ud835\udcb1': "\\mathscr{V}"
  '\ud835\udcb2': "\\mathscr{W}"
  '\ud835\udcb3': "\\mathscr{X}"
  '\ud835\udcb4': "\\mathscr{Y}"
  '\ud835\udcb5': "\\mathscr{Z}"
  '\ud835\udcb6': "\\mathscr{a}"
  '\ud835\udcb7': "\\mathscr{b}"
  '\ud835\udcb8': "\\mathscr{c}"
  '\ud835\udcb9': "\\mathscr{d}"
  '\ud835\udcbb': "\\mathscr{f}"
  '\ud835\udcbd': "\\mathscr{h}"
  '\ud835\udcbe': "\\mathscr{i}"
  '\ud835\udcbf': "\\mathscr{j}"
  '\ud835\udcc0': "\\mathscr{k}"
  '\ud835\udcc1': "\\mathscr{l}"
  '\ud835\udcc2': "\\mathscr{m}"
  '\ud835\udcc3': "\\mathscr{n}"
  '\ud835\udcc5': "\\mathscr{p}"
  '\ud835\udcc6': "\\mathscr{q}"
  '\ud835\udcc7': "\\mathscr{r}"
  '\ud835\udcc8': "\\mathscr{s}"
  '\ud835\udcc9': "\\mathscr{t}"
  '\ud835\udcca': "\\mathscr{u}"
  '\ud835\udccb': "\\mathscr{v}"
  '\ud835\udccc': "\\mathscr{w}"
  '\ud835\udccd': "\\mathscr{x}"
  '\ud835\udcce': "\\mathscr{y}"
  '\ud835\udccf': "\\mathscr{z}"
  '\ud835\udcd0': "\\mathmit{A}"
  '\ud835\udcd1': "\\mathmit{B}"
  '\ud835\udcd2': "\\mathmit{C}"
  '\ud835\udcd3': "\\mathmit{D}"
  '\ud835\udcd4': "\\mathmit{E}"
  '\ud835\udcd5': "\\mathmit{F}"
  '\ud835\udcd6': "\\mathmit{G}"
  '\ud835\udcd7': "\\mathmit{H}"
  '\ud835\udcd8': "\\mathmit{I}"
  '\ud835\udcd9': "\\mathmit{J}"
  '\ud835\udcda': "\\mathmit{K}"
  '\ud835\udcdb': "\\mathmit{L}"
  '\ud835\udcdc': "\\mathmit{M}"
  '\ud835\udcdd': "\\mathmit{N}"
  '\ud835\udcde': "\\mathmit{O}"
  '\ud835\udcdf': "\\mathmit{P}"
  '\ud835\udce0': "\\mathmit{Q}"
  '\ud835\udce1': "\\mathmit{R}"
  '\ud835\udce2': "\\mathmit{S}"
  '\ud835\udce3': "\\mathmit{T}"
  '\ud835\udce4': "\\mathmit{U}"
  '\ud835\udce5': "\\mathmit{V}"
  '\ud835\udce6': "\\mathmit{W}"
  '\ud835\udce7': "\\mathmit{X}"
  '\ud835\udce8': "\\mathmit{Y}"
  '\ud835\udce9': "\\mathmit{Z}"
  '\ud835\udcea': "\\mathmit{a}"
  '\ud835\udceb': "\\mathmit{b}"
  '\ud835\udcec': "\\mathmit{c}"
  '\ud835\udced': "\\mathmit{d}"
  '\ud835\udcee': "\\mathmit{e}"
  '\ud835\udcef': "\\mathmit{f}"
  '\ud835\udcf0': "\\mathmit{g}"
  '\ud835\udcf1': "\\mathmit{h}"
  '\ud835\udcf2': "\\mathmit{i}"
  '\ud835\udcf3': "\\mathmit{j}"
  '\ud835\udcf4': "\\mathmit{k}"
  '\ud835\udcf5': "\\mathmit{l}"
  '\ud835\udcf6': "\\mathmit{m}"
  '\ud835\udcf7': "\\mathmit{n}"
  '\ud835\udcf8': "\\mathmit{o}"
  '\ud835\udcf9': "\\mathmit{p}"
  '\ud835\udcfa': "\\mathmit{q}"
  '\ud835\udcfb': "\\mathmit{r}"
  '\ud835\udcfc': "\\mathmit{s}"
  '\ud835\udcfd': "\\mathmit{t}"
  '\ud835\udcfe': "\\mathmit{u}"
  '\ud835\udcff': "\\mathmit{v}"
  '\ud835\udd00': "\\mathmit{w}"
  '\ud835\udd01': "\\mathmit{x}"
  '\ud835\udd02': "\\mathmit{y}"
  '\ud835\udd03': "\\mathmit{z}"
  '\ud835\udd04': "\\mathfrak{A}"
  '\ud835\udd05': "\\mathfrak{B}"
  '\ud835\udd07': "\\mathfrak{D}"
  '\ud835\udd08': "\\mathfrak{E}"
  '\ud835\udd09': "\\mathfrak{F}"
  '\ud835\udd0a': "\\mathfrak{G}"
  '\ud835\udd0d': "\\mathfrak{J}"
  '\ud835\udd0e': "\\mathfrak{K}"
  '\ud835\udd0f': "\\mathfrak{L}"
  '\ud835\udd10': "\\mathfrak{M}"
  '\ud835\udd11': "\\mathfrak{N}"
  '\ud835\udd12': "\\mathfrak{O}"
  '\ud835\udd13': "\\mathfrak{P}"
  '\ud835\udd14': "\\mathfrak{Q}"
  '\ud835\udd16': "\\mathfrak{S}"
  '\ud835\udd17': "\\mathfrak{T}"
  '\ud835\udd18': "\\mathfrak{U}"
  '\ud835\udd19': "\\mathfrak{V}"
  '\ud835\udd1a': "\\mathfrak{W}"
  '\ud835\udd1b': "\\mathfrak{X}"
  '\ud835\udd1c': "\\mathfrak{Y}"
  '\ud835\udd1e': "\\mathfrak{a}"
  '\ud835\udd1f': "\\mathfrak{b}"
  '\ud835\udd20': "\\mathfrak{c}"
  '\ud835\udd21': "\\mathfrak{d}"
  '\ud835\udd22': "\\mathfrak{e}"
  '\ud835\udd23': "\\mathfrak{f}"
  '\ud835\udd24': "\\mathfrak{g}"
  '\ud835\udd25': "\\mathfrak{h}"
  '\ud835\udd26': "\\mathfrak{i}"
  '\ud835\udd27': "\\mathfrak{j}"
  '\ud835\udd28': "\\mathfrak{k}"
  '\ud835\udd29': "\\mathfrak{l}"
  '\ud835\udd2a': "\\mathfrak{m}"
  '\ud835\udd2b': "\\mathfrak{n}"
  '\ud835\udd2c': "\\mathfrak{o}"
  '\ud835\udd2d': "\\mathfrak{p}"
  '\ud835\udd2e': "\\mathfrak{q}"
  '\ud835\udd2f': "\\mathfrak{r}"
  '\ud835\udd30': "\\mathfrak{s}"
  '\ud835\udd31': "\\mathfrak{t}"
  '\ud835\udd32': "\\mathfrak{u}"
  '\ud835\udd33': "\\mathfrak{v}"
  '\ud835\udd34': "\\mathfrak{w}"
  '\ud835\udd35': "\\mathfrak{x}"
  '\ud835\udd36': "\\mathfrak{y}"
  '\ud835\udd37': "\\mathfrak{z}"
  '\ud835\udd38': "\\mathbb{A}"
  '\ud835\udd39': "\\mathbb{B}"
  '\ud835\udd3b': "\\mathbb{D}"
  '\ud835\udd3c': "\\mathbb{E}"
  '\ud835\udd3d': "\\mathbb{F}"
  '\ud835\udd3e': "\\mathbb{G}"
  '\ud835\udd40': "\\mathbb{I}"
  '\ud835\udd41': "\\mathbb{J}"
  '\ud835\udd42': "\\mathbb{K}"
  '\ud835\udd43': "\\mathbb{L}"
  '\ud835\udd44': "\\mathbb{M}"
  '\ud835\udd46': "\\mathbb{O}"
  '\ud835\udd4a': "\\mathbb{S}"
  '\ud835\udd4b': "\\mathbb{T}"
  '\ud835\udd4c': "\\mathbb{U}"
  '\ud835\udd4d': "\\mathbb{V}"
  '\ud835\udd4e': "\\mathbb{W}"
  '\ud835\udd4f': "\\mathbb{X}"
  '\ud835\udd50': "\\mathbb{Y}"
  '\ud835\udd52': "\\mathbb{a}"
  '\ud835\udd53': "\\mathbb{b}"
  '\ud835\udd54': "\\mathbb{c}"
  '\ud835\udd55': "\\mathbb{d}"
  '\ud835\udd56': "\\mathbb{e}"
  '\ud835\udd57': "\\mathbb{f}"
  '\ud835\udd58': "\\mathbb{g}"
  '\ud835\udd59': "\\mathbb{h}"
  '\ud835\udd5a': "\\mathbb{i}"
  '\ud835\udd5b': "\\mathbb{j}"
  '\ud835\udd5c': "\\mathbb{k}"
  '\ud835\udd5d': "\\mathbb{l}"
  '\ud835\udd5e': "\\mathbb{m}"
  '\ud835\udd5f': "\\mathbb{n}"
  '\ud835\udd60': "\\mathbb{o}"
  '\ud835\udd61': "\\mathbb{p}"
  '\ud835\udd62': "\\mathbb{q}"
  '\ud835\udd63': "\\mathbb{r}"
  '\ud835\udd64': "\\mathbb{s}"
  '\ud835\udd65': "\\mathbb{t}"
  '\ud835\udd66': "\\mathbb{u}"
  '\ud835\udd67': "\\mathbb{v}"
  '\ud835\udd68': "\\mathbb{w}"
  '\ud835\udd69': "\\mathbb{x}"
  '\ud835\udd6a': "\\mathbb{y}"
  '\ud835\udd6b': "\\mathbb{z}"
  '\ud835\udd6c': "\\mathslbb{A}"
  '\ud835\udd6d': "\\mathslbb{B}"
  '\ud835\udd6e': "\\mathslbb{C}"
  '\ud835\udd6f': "\\mathslbb{D}"
  '\ud835\udd70': "\\mathslbb{E}"
  '\ud835\udd71': "\\mathslbb{F}"
  '\ud835\udd72': "\\mathslbb{G}"
  '\ud835\udd73': "\\mathslbb{H}"
  '\ud835\udd74': "\\mathslbb{I}"
  '\ud835\udd75': "\\mathslbb{J}"
  '\ud835\udd76': "\\mathslbb{K}"
  '\ud835\udd77': "\\mathslbb{L}"
  '\ud835\udd78': "\\mathslbb{M}"
  '\ud835\udd79': "\\mathslbb{N}"
  '\ud835\udd7a': "\\mathslbb{O}"
  '\ud835\udd7b': "\\mathslbb{P}"
  '\ud835\udd7c': "\\mathslbb{Q}"
  '\ud835\udd7d': "\\mathslbb{R}"
  '\ud835\udd7e': "\\mathslbb{S}"
  '\ud835\udd7f': "\\mathslbb{T}"
  '\ud835\udd80': "\\mathslbb{U}"
  '\ud835\udd81': "\\mathslbb{V}"
  '\ud835\udd82': "\\mathslbb{W}"
  '\ud835\udd83': "\\mathslbb{X}"
  '\ud835\udd84': "\\mathslbb{Y}"
  '\ud835\udd85': "\\mathslbb{Z}"
  '\ud835\udd86': "\\mathslbb{a}"
  '\ud835\udd87': "\\mathslbb{b}"
  '\ud835\udd88': "\\mathslbb{c}"
  '\ud835\udd89': "\\mathslbb{d}"
  '\ud835\udd8a': "\\mathslbb{e}"
  '\ud835\udd8b': "\\mathslbb{f}"
  '\ud835\udd8c': "\\mathslbb{g}"
  '\ud835\udd8d': "\\mathslbb{h}"
  '\ud835\udd8e': "\\mathslbb{i}"
  '\ud835\udd8f': "\\mathslbb{j}"
  '\ud835\udd90': "\\mathslbb{k}"
  '\ud835\udd91': "\\mathslbb{l}"
  '\ud835\udd92': "\\mathslbb{m}"
  '\ud835\udd93': "\\mathslbb{n}"
  '\ud835\udd94': "\\mathslbb{o}"
  '\ud835\udd95': "\\mathslbb{p}"
  '\ud835\udd96': "\\mathslbb{q}"
  '\ud835\udd97': "\\mathslbb{r}"
  '\ud835\udd98': "\\mathslbb{s}"
  '\ud835\udd99': "\\mathslbb{t}"
  '\ud835\udd9a': "\\mathslbb{u}"
  '\ud835\udd9b': "\\mathslbb{v}"
  '\ud835\udd9c': "\\mathslbb{w}"
  '\ud835\udd9d': "\\mathslbb{x}"
  '\ud835\udd9e': "\\mathslbb{y}"
  '\ud835\udd9f': "\\mathslbb{z}"
  '\ud835\udda0': "\\mathsf{A}"
  '\ud835\udda1': "\\mathsf{B}"
  '\ud835\udda2': "\\mathsf{C}"
  '\ud835\udda3': "\\mathsf{D}"
  '\ud835\udda4': "\\mathsf{E}"
  '\ud835\udda5': "\\mathsf{F}"
  '\ud835\udda6': "\\mathsf{G}"
  '\ud835\udda7': "\\mathsf{H}"
  '\ud835\udda8': "\\mathsf{I}"
  '\ud835\udda9': "\\mathsf{J}"
  '\ud835\uddaa': "\\mathsf{K}"
  '\ud835\uddab': "\\mathsf{L}"
  '\ud835\uddac': "\\mathsf{M}"
  '\ud835\uddad': "\\mathsf{N}"
  '\ud835\uddae': "\\mathsf{O}"
  '\ud835\uddaf': "\\mathsf{P}"
  '\ud835\uddb0': "\\mathsf{Q}"
  '\ud835\uddb1': "\\mathsf{R}"
  '\ud835\uddb2': "\\mathsf{S}"
  '\ud835\uddb3': "\\mathsf{T}"
  '\ud835\uddb4': "\\mathsf{U}"
  '\ud835\uddb5': "\\mathsf{V}"
  '\ud835\uddb6': "\\mathsf{W}"
  '\ud835\uddb7': "\\mathsf{X}"
  '\ud835\uddb8': "\\mathsf{Y}"
  '\ud835\uddb9': "\\mathsf{Z}"
  '\ud835\uddba': "\\mathsf{a}"
  '\ud835\uddbb': "\\mathsf{b}"
  '\ud835\uddbc': "\\mathsf{c}"
  '\ud835\uddbd': "\\mathsf{d}"
  '\ud835\uddbe': "\\mathsf{e}"
  '\ud835\uddbf': "\\mathsf{f}"
  '\ud835\uddc0': "\\mathsf{g}"
  '\ud835\uddc1': "\\mathsf{h}"
  '\ud835\uddc2': "\\mathsf{i}"
  '\ud835\uddc3': "\\mathsf{j}"
  '\ud835\uddc4': "\\mathsf{k}"
  '\ud835\uddc5': "\\mathsf{l}"
  '\ud835\uddc6': "\\mathsf{m}"
  '\ud835\uddc7': "\\mathsf{n}"
  '\ud835\uddc8': "\\mathsf{o}"
  '\ud835\uddc9': "\\mathsf{p}"
  '\ud835\uddca': "\\mathsf{q}"
  '\ud835\uddcb': "\\mathsf{r}"
  '\ud835\uddcc': "\\mathsf{s}"
  '\ud835\uddcd': "\\mathsf{t}"
  '\ud835\uddce': "\\mathsf{u}"
  '\ud835\uddcf': "\\mathsf{v}"
  '\ud835\uddd0': "\\mathsf{w}"
  '\ud835\uddd1': "\\mathsf{x}"
  '\ud835\uddd2': "\\mathsf{y}"
  '\ud835\uddd3': "\\mathsf{z}"
  '\ud835\uddd4': "\\mathsfbf{A}"
  '\ud835\uddd5': "\\mathsfbf{B}"
  '\ud835\uddd6': "\\mathsfbf{C}"
  '\ud835\uddd7': "\\mathsfbf{D}"
  '\ud835\uddd8': "\\mathsfbf{E}"
  '\ud835\uddd9': "\\mathsfbf{F}"
  '\ud835\uddda': "\\mathsfbf{G}"
  '\ud835\udddb': "\\mathsfbf{H}"
  '\ud835\udddc': "\\mathsfbf{I}"
  '\ud835\udddd': "\\mathsfbf{J}"
  '\ud835\uddde': "\\mathsfbf{K}"
  '\ud835\udddf': "\\mathsfbf{L}"
  '\ud835\udde0': "\\mathsfbf{M}"
  '\ud835\udde1': "\\mathsfbf{N}"
  '\ud835\udde2': "\\mathsfbf{O}"
  '\ud835\udde3': "\\mathsfbf{P}"
  '\ud835\udde4': "\\mathsfbf{Q}"
  '\ud835\udde5': "\\mathsfbf{R}"
  '\ud835\udde6': "\\mathsfbf{S}"
  '\ud835\udde7': "\\mathsfbf{T}"
  '\ud835\udde8': "\\mathsfbf{U}"
  '\ud835\udde9': "\\mathsfbf{V}"
  '\ud835\uddea': "\\mathsfbf{W}"
  '\ud835\uddeb': "\\mathsfbf{X}"
  '\ud835\uddec': "\\mathsfbf{Y}"
  '\ud835\udded': "\\mathsfbf{Z}"
  '\ud835\uddee': "\\mathsfbf{a}"
  '\ud835\uddef': "\\mathsfbf{b}"
  '\ud835\uddf0': "\\mathsfbf{c}"
  '\ud835\uddf1': "\\mathsfbf{d}"
  '\ud835\uddf2': "\\mathsfbf{e}"
  '\ud835\uddf3': "\\mathsfbf{f}"
  '\ud835\uddf4': "\\mathsfbf{g}"
  '\ud835\uddf5': "\\mathsfbf{h}"
  '\ud835\uddf6': "\\mathsfbf{i}"
  '\ud835\uddf7': "\\mathsfbf{j}"
  '\ud835\uddf8': "\\mathsfbf{k}"
  '\ud835\uddf9': "\\mathsfbf{l}"
  '\ud835\uddfa': "\\mathsfbf{m}"
  '\ud835\uddfb': "\\mathsfbf{n}"
  '\ud835\uddfc': "\\mathsfbf{o}"
  '\ud835\uddfd': "\\mathsfbf{p}"
  '\ud835\uddfe': "\\mathsfbf{q}"
  '\ud835\uddff': "\\mathsfbf{r}"
  '\ud835\ude00': "\\mathsfbf{s}"
  '\ud835\ude01': "\\mathsfbf{t}"
  '\ud835\ude02': "\\mathsfbf{u}"
  '\ud835\ude03': "\\mathsfbf{v}"
  '\ud835\ude04': "\\mathsfbf{w}"
  '\ud835\ude05': "\\mathsfbf{x}"
  '\ud835\ude06': "\\mathsfbf{y}"
  '\ud835\ude07': "\\mathsfbf{z}"
  '\ud835\ude08': "\\mathsfsl{A}"
  '\ud835\ude09': "\\mathsfsl{B}"
  '\ud835\ude0a': "\\mathsfsl{C}"
  '\ud835\ude0b': "\\mathsfsl{D}"
  '\ud835\ude0c': "\\mathsfsl{E}"
  '\ud835\ude0d': "\\mathsfsl{F}"
  '\ud835\ude0e': "\\mathsfsl{G}"
  '\ud835\ude0f': "\\mathsfsl{H}"
  '\ud835\ude10': "\\mathsfsl{I}"
  '\ud835\ude11': "\\mathsfsl{J}"
  '\ud835\ude12': "\\mathsfsl{K}"
  '\ud835\ude13': "\\mathsfsl{L}"
  '\ud835\ude14': "\\mathsfsl{M}"
  '\ud835\ude15': "\\mathsfsl{N}"
  '\ud835\ude16': "\\mathsfsl{O}"
  '\ud835\ude17': "\\mathsfsl{P}"
  '\ud835\ude18': "\\mathsfsl{Q}"
  '\ud835\ude19': "\\mathsfsl{R}"
  '\ud835\ude1a': "\\mathsfsl{S}"
  '\ud835\ude1b': "\\mathsfsl{T}"
  '\ud835\ude1c': "\\mathsfsl{U}"
  '\ud835\ude1d': "\\mathsfsl{V}"
  '\ud835\ude1e': "\\mathsfsl{W}"
  '\ud835\ude1f': "\\mathsfsl{X}"
  '\ud835\ude20': "\\mathsfsl{Y}"
  '\ud835\ude21': "\\mathsfsl{Z}"
  '\ud835\ude22': "\\mathsfsl{a}"
  '\ud835\ude23': "\\mathsfsl{b}"
  '\ud835\ude24': "\\mathsfsl{c}"
  '\ud835\ude25': "\\mathsfsl{d}"
  '\ud835\ude26': "\\mathsfsl{e}"
  '\ud835\ude27': "\\mathsfsl{f}"
  '\ud835\ude28': "\\mathsfsl{g}"
  '\ud835\ude29': "\\mathsfsl{h}"
  '\ud835\ude2a': "\\mathsfsl{i}"
  '\ud835\ude2b': "\\mathsfsl{j}"
  '\ud835\ude2c': "\\mathsfsl{k}"
  '\ud835\ude2d': "\\mathsfsl{l}"
  '\ud835\ude2e': "\\mathsfsl{m}"
  '\ud835\ude2f': "\\mathsfsl{n}"
  '\ud835\ude30': "\\mathsfsl{o}"
  '\ud835\ude31': "\\mathsfsl{p}"
  '\ud835\ude32': "\\mathsfsl{q}"
  '\ud835\ude33': "\\mathsfsl{r}"
  '\ud835\ude34': "\\mathsfsl{s}"
  '\ud835\ude35': "\\mathsfsl{t}"
  '\ud835\ude36': "\\mathsfsl{u}"
  '\ud835\ude37': "\\mathsfsl{v}"
  '\ud835\ude38': "\\mathsfsl{w}"
  '\ud835\ude39': "\\mathsfsl{x}"
  '\ud835\ude3a': "\\mathsfsl{y}"
  '\ud835\ude3b': "\\mathsfsl{z}"
  '\ud835\ude3c': "\\mathsfbfsl{A}"
  '\ud835\ude3d': "\\mathsfbfsl{B}"
  '\ud835\ude3e': "\\mathsfbfsl{C}"
  '\ud835\ude3f': "\\mathsfbfsl{D}"
  '\ud835\ude40': "\\mathsfbfsl{E}"
  '\ud835\ude41': "\\mathsfbfsl{F}"
  '\ud835\ude42': "\\mathsfbfsl{G}"
  '\ud835\ude43': "\\mathsfbfsl{H}"
  '\ud835\ude44': "\\mathsfbfsl{I}"
  '\ud835\ude45': "\\mathsfbfsl{J}"
  '\ud835\ude46': "\\mathsfbfsl{K}"
  '\ud835\ude47': "\\mathsfbfsl{L}"
  '\ud835\ude48': "\\mathsfbfsl{M}"
  '\ud835\ude49': "\\mathsfbfsl{N}"
  '\ud835\ude4a': "\\mathsfbfsl{O}"
  '\ud835\ude4b': "\\mathsfbfsl{P}"
  '\ud835\ude4c': "\\mathsfbfsl{Q}"
  '\ud835\ude4d': "\\mathsfbfsl{R}"
  '\ud835\ude4e': "\\mathsfbfsl{S}"
  '\ud835\ude4f': "\\mathsfbfsl{T}"
  '\ud835\ude50': "\\mathsfbfsl{U}"
  '\ud835\ude51': "\\mathsfbfsl{V}"
  '\ud835\ude52': "\\mathsfbfsl{W}"
  '\ud835\ude53': "\\mathsfbfsl{X}"
  '\ud835\ude54': "\\mathsfbfsl{Y}"
  '\ud835\ude55': "\\mathsfbfsl{Z}"
  '\ud835\ude56': "\\mathsfbfsl{a}"
  '\ud835\ude57': "\\mathsfbfsl{b}"
  '\ud835\ude58': "\\mathsfbfsl{c}"
  '\ud835\ude59': "\\mathsfbfsl{d}"
  '\ud835\ude5a': "\\mathsfbfsl{e}"
  '\ud835\ude5b': "\\mathsfbfsl{f}"
  '\ud835\ude5c': "\\mathsfbfsl{g}"
  '\ud835\ude5d': "\\mathsfbfsl{h}"
  '\ud835\ude5e': "\\mathsfbfsl{i}"
  '\ud835\ude5f': "\\mathsfbfsl{j}"
  '\ud835\ude60': "\\mathsfbfsl{k}"
  '\ud835\ude61': "\\mathsfbfsl{l}"
  '\ud835\ude62': "\\mathsfbfsl{m}"
  '\ud835\ude63': "\\mathsfbfsl{n}"
  '\ud835\ude64': "\\mathsfbfsl{o}"
  '\ud835\ude65': "\\mathsfbfsl{p}"
  '\ud835\ude66': "\\mathsfbfsl{q}"
  '\ud835\ude67': "\\mathsfbfsl{r}"
  '\ud835\ude68': "\\mathsfbfsl{s}"
  '\ud835\ude69': "\\mathsfbfsl{t}"
  '\ud835\ude6a': "\\mathsfbfsl{u}"
  '\ud835\ude6b': "\\mathsfbfsl{v}"
  '\ud835\ude6c': "\\mathsfbfsl{w}"
  '\ud835\ude6d': "\\mathsfbfsl{x}"
  '\ud835\ude6e': "\\mathsfbfsl{y}"
  '\ud835\ude6f': "\\mathsfbfsl{z}"
  '\ud835\ude70': "\\mathtt{A}"
  '\ud835\ude71': "\\mathtt{B}"
  '\ud835\ude72': "\\mathtt{C}"
  '\ud835\ude73': "\\mathtt{D}"
  '\ud835\ude74': "\\mathtt{E}"
  '\ud835\ude75': "\\mathtt{F}"
  '\ud835\ude76': "\\mathtt{G}"
  '\ud835\ude77': "\\mathtt{H}"
  '\ud835\ude78': "\\mathtt{I}"
  '\ud835\ude79': "\\mathtt{J}"
  '\ud835\ude7a': "\\mathtt{K}"
  '\ud835\ude7b': "\\mathtt{L}"
  '\ud835\ude7c': "\\mathtt{M}"
  '\ud835\ude7d': "\\mathtt{N}"
  '\ud835\ude7e': "\\mathtt{O}"
  '\ud835\ude7f': "\\mathtt{P}"
  '\ud835\ude80': "\\mathtt{Q}"
  '\ud835\ude81': "\\mathtt{R}"
  '\ud835\ude82': "\\mathtt{S}"
  '\ud835\ude83': "\\mathtt{T}"
  '\ud835\ude84': "\\mathtt{U}"
  '\ud835\ude85': "\\mathtt{V}"
  '\ud835\ude86': "\\mathtt{W}"
  '\ud835\ude87': "\\mathtt{X}"
  '\ud835\ude88': "\\mathtt{Y}"
  '\ud835\ude89': "\\mathtt{Z}"
  '\ud835\ude8a': "\\mathtt{a}"
  '\ud835\ude8b': "\\mathtt{b}"
  '\ud835\ude8c': "\\mathtt{c}"
  '\ud835\ude8d': "\\mathtt{d}"
  '\ud835\ude8e': "\\mathtt{e}"
  '\ud835\ude8f': "\\mathtt{f}"
  '\ud835\ude90': "\\mathtt{g}"
  '\ud835\ude91': "\\mathtt{h}"
  '\ud835\ude92': "\\mathtt{i}"
  '\ud835\ude93': "\\mathtt{j}"
  '\ud835\ude94': "\\mathtt{k}"
  '\ud835\ude95': "\\mathtt{l}"
  '\ud835\ude96': "\\mathtt{m}"
  '\ud835\ude97': "\\mathtt{n}"
  '\ud835\ude98': "\\mathtt{o}"
  '\ud835\ude99': "\\mathtt{p}"
  '\ud835\ude9a': "\\mathtt{q}"
  '\ud835\ude9b': "\\mathtt{r}"
  '\ud835\ude9c': "\\mathtt{s}"
  '\ud835\ude9d': "\\mathtt{t}"
  '\ud835\ude9e': "\\mathtt{u}"
  '\ud835\ude9f': "\\mathtt{v}"
  '\ud835\udea0': "\\mathtt{w}"
  '\ud835\udea1': "\\mathtt{x}"
  '\ud835\udea2': "\\mathtt{y}"
  '\ud835\udea3': "\\mathtt{z}"
  '\ud835\udea8': "\\mathbf{\\Alpha}"
  '\ud835\udea9': "\\mathbf{\\Beta}"
  '\ud835\udeaa': "\\mathbf{\\Gamma}"
  '\ud835\udeab': "\\mathbf{\\Delta}"
  '\ud835\udeac': "\\mathbf{\\Epsilon}"
  '\ud835\udead': "\\mathbf{\\Zeta}"
  '\ud835\udeae': "\\mathbf{\\Eta}"
  '\ud835\udeaf': "\\mathbf{\\Theta}"
  '\ud835\udeb0': "\\mathbf{\\Iota}"
  '\ud835\udeb1': "\\mathbf{\\Kappa}"
  '\ud835\udeb2': "\\mathbf{\\Lambda}"
  '\ud835\udeb3': "M"
  '\ud835\udeb4': "N"
  '\ud835\udeb5': "\\mathbf{\\Xi}"
  '\ud835\udeb6': "O"
  '\ud835\udeb7': "\\mathbf{\\Pi}"
  '\ud835\udeb8': "\\mathbf{\\Rho}"
  '\ud835\udeba': "\\mathbf{\\Sigma}"
  '\ud835\udebb': "\\mathbf{\\Tau}"
  '\ud835\udebc': "\\mathbf{\\Upsilon}"
  '\ud835\udebd': "\\mathbf{\\Phi}"
  '\ud835\udebe': "\\mathbf{\\Chi}"
  '\ud835\udebf': "\\mathbf{\\Psi}"
  '\ud835\udec0': "\\mathbf{\\Omega}"
  '\ud835\udec1': "\\mathbf{\\nabla}"
  '\ud835\udec2': "\\mathbf{\\Alpha}"
  '\ud835\udec3': "\\mathbf{\\Beta}"
  '\ud835\udec4': "\\mathbf{\\Gamma}"
  '\ud835\udec5': "\\mathbf{\\Delta}"
  '\ud835\udec6': "\\mathbf{\\Epsilon}"
  '\ud835\udec7': "\\mathbf{\\Zeta}"
  '\ud835\udec8': "\\mathbf{\\Eta}"
  '\ud835\udec9': "\\mathbf{\\theta}"
  '\ud835\udeca': "\\mathbf{\\Iota}"
  '\ud835\udecb': "\\mathbf{\\Kappa}"
  '\ud835\udecc': "\\mathbf{\\Lambda}"
  '\ud835\udecd': "M"
  '\ud835\udece': "N"
  '\ud835\udecf': "\\mathbf{\\Xi}"
  '\ud835\uded0': "O"
  '\ud835\uded1': "\\mathbf{\\Pi}"
  '\ud835\uded2': "\\mathbf{\\Rho}"
  '\ud835\uded3': "\\mathbf{\\varsigma}"
  '\ud835\uded4': "\\mathbf{\\Sigma}"
  '\ud835\uded5': "\\mathbf{\\Tau}"
  '\ud835\uded6': "\\mathbf{\\Upsilon}"
  '\ud835\uded7': "\\mathbf{\\Phi}"
  '\ud835\uded8': "\\mathbf{\\Chi}"
  '\ud835\uded9': "\\mathbf{\\Psi}"
  '\ud835\udeda': "\\mathbf{\\Omega}"
  '\ud835\udedb': "{\\partial}"
  '\ud835\udedc': "\\in"
  '\ud835\udee2': "\\mathsl{\\Alpha}"
  '\ud835\udee3': "\\mathsl{\\Beta}"
  '\ud835\udee4': "\\mathsl{\\Gamma}"
  '\ud835\udee5': "\\mathsl{\\Delta}"
  '\ud835\udee6': "\\mathsl{\\Epsilon}"
  '\ud835\udee7': "\\mathsl{\\Zeta}"
  '\ud835\udee8': "\\mathsl{\\Eta}"
  '\ud835\udee9': "\\mathsl{\\Theta}"
  '\ud835\udeea': "\\mathsl{\\Iota}"
  '\ud835\udeeb': "\\mathsl{\\Kappa}"
  '\ud835\udeec': "\\mathsl{\\Lambda}"
  '\ud835\udeed': "M"
  '\ud835\udeee': "N"
  '\ud835\udeef': "\\mathsl{\\Xi}"
  '\ud835\udef0': "O"
  '\ud835\udef1': "\\mathsl{\\Pi}"
  '\ud835\udef2': "\\mathsl{\\Rho}"
  '\ud835\udef4': "\\mathsl{\\Sigma}"
  '\ud835\udef5': "\\mathsl{\\Tau}"
  '\ud835\udef6': "\\mathsl{\\Upsilon}"
  '\ud835\udef7': "\\mathsl{\\Phi}"
  '\ud835\udef8': "\\mathsl{\\Chi}"
  '\ud835\udef9': "\\mathsl{\\Psi}"
  '\ud835\udefa': "\\mathsl{\\Omega}"
  '\ud835\udefb': "\\mathsl{\\nabla}"
  '\ud835\udefc': "\\mathsl{\\Alpha}"
  '\ud835\udefd': "\\mathsl{\\Beta}"
  '\ud835\udefe': "\\mathsl{\\Gamma}"
  '\ud835\udeff': "\\mathsl{\\Delta}"
  '\ud835\udf00': "\\mathsl{\\Epsilon}"
  '\ud835\udf01': "\\mathsl{\\Zeta}"
  '\ud835\udf02': "\\mathsl{\\Eta}"
  '\ud835\udf03': "\\mathsl{\\Theta}"
  '\ud835\udf04': "\\mathsl{\\Iota}"
  '\ud835\udf05': "\\mathsl{\\Kappa}"
  '\ud835\udf06': "\\mathsl{\\Lambda}"
  '\ud835\udf07': "M"
  '\ud835\udf08': "N"
  '\ud835\udf09': "\\mathsl{\\Xi}"
  '\ud835\udf0a': "O"
  '\ud835\udf0b': "\\mathsl{\\Pi}"
  '\ud835\udf0c': "\\mathsl{\\Rho}"
  '\ud835\udf0d': "\\mathsl{\\varsigma}"
  '\ud835\udf0e': "\\mathsl{\\Sigma}"
  '\ud835\udf0f': "\\mathsl{\\Tau}"
  '\ud835\udf10': "\\mathsl{\\Upsilon}"
  '\ud835\udf11': "\\mathsl{\\Phi}"
  '\ud835\udf12': "\\mathsl{\\Chi}"
  '\ud835\udf13': "\\mathsl{\\Psi}"
  '\ud835\udf14': "\\mathsl{\\Omega}"
  '\ud835\udf15': "{\\partial}"
  '\ud835\udf16': "\\in"
  '\ud835\udf1c': "\\mathbit{\\Alpha}"
  '\ud835\udf1d': "\\mathbit{\\Beta}"
  '\ud835\udf1e': "\\mathbit{\\Gamma}"
  '\ud835\udf1f': "\\mathbit{\\Delta}"
  '\ud835\udf20': "\\mathbit{\\Epsilon}"
  '\ud835\udf21': "\\mathbit{\\Zeta}"
  '\ud835\udf22': "\\mathbit{\\Eta}"
  '\ud835\udf23': "\\mathbit{\\Theta}"
  '\ud835\udf24': "\\mathbit{\\Iota}"
  '\ud835\udf25': "\\mathbit{\\Kappa}"
  '\ud835\udf26': "\\mathbit{\\Lambda}"
  '\ud835\udf27': "M"
  '\ud835\udf28': "N"
  '\ud835\udf29': "\\mathbit{\\Xi}"
  '\ud835\udf2a': "O"
  '\ud835\udf2b': "\\mathbit{\\Pi}"
  '\ud835\udf2c': "\\mathbit{\\Rho}"
  '\ud835\udf2e': "\\mathbit{\\Sigma}"
  '\ud835\udf2f': "\\mathbit{\\Tau}"
  '\ud835\udf30': "\\mathbit{\\Upsilon}"
  '\ud835\udf31': "\\mathbit{\\Phi}"
  '\ud835\udf32': "\\mathbit{\\Chi}"
  '\ud835\udf33': "\\mathbit{\\Psi}"
  '\ud835\udf34': "\\mathbit{\\Omega}"
  '\ud835\udf35': "\\mathbit{\\nabla}"
  '\ud835\udf36': "\\mathbit{\\Alpha}"
  '\ud835\udf37': "\\mathbit{\\Beta}"
  '\ud835\udf38': "\\mathbit{\\Gamma}"
  '\ud835\udf39': "\\mathbit{\\Delta}"
  '\ud835\udf3a': "\\mathbit{\\Epsilon}"
  '\ud835\udf3b': "\\mathbit{\\Zeta}"
  '\ud835\udf3c': "\\mathbit{\\Eta}"
  '\ud835\udf3d': "\\mathbit{\\Theta}"
  '\ud835\udf3e': "\\mathbit{\\Iota}"
  '\ud835\udf3f': "\\mathbit{\\Kappa}"
  '\ud835\udf40': "\\mathbit{\\Lambda}"
  '\ud835\udf41': "M"
  '\ud835\udf42': "N"
  '\ud835\udf43': "\\mathbit{\\Xi}"
  '\ud835\udf44': "O"
  '\ud835\udf45': "\\mathbit{\\Pi}"
  '\ud835\udf46': "\\mathbit{\\Rho}"
  '\ud835\udf47': "\\mathbit{\\varsigma}"
  '\ud835\udf48': "\\mathbit{\\Sigma}"
  '\ud835\udf49': "\\mathbit{\\Tau}"
  '\ud835\udf4a': "\\mathbit{\\Upsilon}"
  '\ud835\udf4b': "\\mathbit{\\Phi}"
  '\ud835\udf4c': "\\mathbit{\\Chi}"
  '\ud835\udf4d': "\\mathbit{\\Psi}"
  '\ud835\udf4e': "\\mathbit{\\Omega}"
  '\ud835\udf4f': "{\\partial}"
  '\ud835\udf50': "\\in"
  '\ud835\udf56': "\\mathsfbf{\\Alpha}"
  '\ud835\udf57': "\\mathsfbf{\\Beta}"
  '\ud835\udf58': "\\mathsfbf{\\Gamma}"
  '\ud835\udf59': "\\mathsfbf{\\Delta}"
  '\ud835\udf5a': "\\mathsfbf{\\Epsilon}"
  '\ud835\udf5b': "\\mathsfbf{\\Zeta}"
  '\ud835\udf5c': "\\mathsfbf{\\Eta}"
  '\ud835\udf5d': "\\mathsfbf{\\Theta}"
  '\ud835\udf5e': "\\mathsfbf{\\Iota}"
  '\ud835\udf5f': "\\mathsfbf{\\Kappa}"
  '\ud835\udf60': "\\mathsfbf{\\Lambda}"
  '\ud835\udf61': "M"
  '\ud835\udf62': "N"
  '\ud835\udf63': "\\mathsfbf{\\Xi}"
  '\ud835\udf64': "O"
  '\ud835\udf65': "\\mathsfbf{\\Pi}"
  '\ud835\udf66': "\\mathsfbf{\\Rho}"
  '\ud835\udf68': "\\mathsfbf{\\Sigma}"
  '\ud835\udf69': "\\mathsfbf{\\Tau}"
  '\ud835\udf6a': "\\mathsfbf{\\Upsilon}"
  '\ud835\udf6b': "\\mathsfbf{\\Phi}"
  '\ud835\udf6c': "\\mathsfbf{\\Chi}"
  '\ud835\udf6d': "\\mathsfbf{\\Psi}"
  '\ud835\udf6e': "\\mathsfbf{\\Omega}"
  '\ud835\udf6f': "\\mathsfbf{\\nabla}"
  '\ud835\udf70': "\\mathsfbf{\\Alpha}"
  '\ud835\udf71': "\\mathsfbf{\\Beta}"
  '\ud835\udf72': "\\mathsfbf{\\Gamma}"
  '\ud835\udf73': "\\mathsfbf{\\Delta}"
  '\ud835\udf74': "\\mathsfbf{\\Epsilon}"
  '\ud835\udf75': "\\mathsfbf{\\Zeta}"
  '\ud835\udf76': "\\mathsfbf{\\Eta}"
  '\ud835\udf77': "\\mathsfbf{\\Theta}"
  '\ud835\udf78': "\\mathsfbf{\\Iota}"
  '\ud835\udf79': "\\mathsfbf{\\Kappa}"
  '\ud835\udf7a': "\\mathsfbf{\\Lambda}"
  '\ud835\udf7b': "M"
  '\ud835\udf7c': "N"
  '\ud835\udf7d': "\\mathsfbf{\\Xi}"
  '\ud835\udf7e': "O"
  '\ud835\udf7f': "\\mathsfbf{\\Pi}"
  '\ud835\udf80': "\\mathsfbf{\\Rho}"
  '\ud835\udf81': "\\mathsfbf{\\varsigma}"
  '\ud835\udf82': "\\mathsfbf{\\Sigma}"
  '\ud835\udf83': "\\mathsfbf{\\Tau}"
  '\ud835\udf84': "\\mathsfbf{\\Upsilon}"
  '\ud835\udf85': "\\mathsfbf{\\Phi}"
  '\ud835\udf86': "\\mathsfbf{\\Chi}"
  '\ud835\udf87': "\\mathsfbf{\\Psi}"
  '\ud835\udf88': "\\mathsfbf{\\Omega}"
  '\ud835\udf89': "{\\partial}"
  '\ud835\udf8a': "\\in"
  '\ud835\udf90': "\\mathsfbfsl{\\Alpha}"
  '\ud835\udf91': "\\mathsfbfsl{\\Beta}"
  '\ud835\udf92': "\\mathsfbfsl{\\Gamma}"
  '\ud835\udf93': "\\mathsfbfsl{\\Delta}"
  '\ud835\udf94': "\\mathsfbfsl{\\Epsilon}"
  '\ud835\udf95': "\\mathsfbfsl{\\Zeta}"
  '\ud835\udf96': "\\mathsfbfsl{\\Eta}"
  '\ud835\udf97': "\\mathsfbfsl{\\vartheta}"
  '\ud835\udf98': "\\mathsfbfsl{\\Iota}"
  '\ud835\udf99': "\\mathsfbfsl{\\Kappa}"
  '\ud835\udf9a': "\\mathsfbfsl{\\Lambda}"
  '\ud835\udf9b': "M"
  '\ud835\udf9c': "N"
  '\ud835\udf9d': "\\mathsfbfsl{\\Xi}"
  '\ud835\udf9e': "O"
  '\ud835\udf9f': "\\mathsfbfsl{\\Pi}"
  '\ud835\udfa0': "\\mathsfbfsl{\\Rho}"
  '\ud835\udfa2': "\\mathsfbfsl{\\Sigma}"
  '\ud835\udfa3': "\\mathsfbfsl{\\Tau}"
  '\ud835\udfa4': "\\mathsfbfsl{\\Upsilon}"
  '\ud835\udfa5': "\\mathsfbfsl{\\Phi}"
  '\ud835\udfa6': "\\mathsfbfsl{\\Chi}"
  '\ud835\udfa7': "\\mathsfbfsl{\\Psi}"
  '\ud835\udfa8': "\\mathsfbfsl{\\Omega}"
  '\ud835\udfa9': "\\mathsfbfsl{\\nabla}"
  '\ud835\udfaa': "\\mathsfbfsl{\\Alpha}"
  '\ud835\udfab': "\\mathsfbfsl{\\Beta}"
  '\ud835\udfac': "\\mathsfbfsl{\\Gamma}"
  '\ud835\udfad': "\\mathsfbfsl{\\Delta}"
  '\ud835\udfae': "\\mathsfbfsl{\\Epsilon}"
  '\ud835\udfaf': "\\mathsfbfsl{\\Zeta}"
  '\ud835\udfb0': "\\mathsfbfsl{\\Eta}"
  '\ud835\udfb1': "\\mathsfbfsl{\\vartheta}"
  '\ud835\udfb2': "\\mathsfbfsl{\\Iota}"
  '\ud835\udfb3': "\\mathsfbfsl{\\Kappa}"
  '\ud835\udfb4': "\\mathsfbfsl{\\Lambda}"
  '\ud835\udfb5': "M"
  '\ud835\udfb6': "N"
  '\ud835\udfb7': "\\mathsfbfsl{\\Xi}"
  '\ud835\udfb8': "O"
  '\ud835\udfb9': "\\mathsfbfsl{\\Pi}"
  '\ud835\udfba': "\\mathsfbfsl{\\Rho}"
  '\ud835\udfbb': "\\mathsfbfsl{\\varsigma}"
  '\ud835\udfbc': "\\mathsfbfsl{\\Sigma}"
  '\ud835\udfbd': "\\mathsfbfsl{\\Tau}"
  '\ud835\udfbe': "\\mathsfbfsl{\\Upsilon}"
  '\ud835\udfbf': "\\mathsfbfsl{\\Phi}"
  '\ud835\udfc0': "\\mathsfbfsl{\\Chi}"
  '\ud835\udfc1': "\\mathsfbfsl{\\Psi}"
  '\ud835\udfc2': "\\mathsfbfsl{\\Omega}"
  '\ud835\udfc3': "{\\partial}"
  '\ud835\udfc4': "\\in"
  '\ud835\udfce': "\\mathbf{0}"
  '\ud835\udfcf': "\\mathbf{1}"
  '\ud835\udfd0': "\\mathbf{2}"
  '\ud835\udfd1': "\\mathbf{3}"
  '\ud835\udfd2': "\\mathbf{4}"
  '\ud835\udfd3': "\\mathbf{5}"
  '\ud835\udfd4': "\\mathbf{6}"
  '\ud835\udfd5': "\\mathbf{7}"
  '\ud835\udfd6': "\\mathbf{8}"
  '\ud835\udfd7': "\\mathbf{9}"
  '\ud835\udfd8': "\\mathbb{0}"
  '\ud835\udfd9': "\\mathbb{1}"
  '\ud835\udfda': "\\mathbb{2}"
  '\ud835\udfdb': "\\mathbb{3}"
  '\ud835\udfdc': "\\mathbb{4}"
  '\ud835\udfdd': "\\mathbb{5}"
  '\ud835\udfde': "\\mathbb{6}"
  '\ud835\udfdf': "\\mathbb{7}"
  '\ud835\udfe0': "\\mathbb{8}"
  '\ud835\udfe1': "\\mathbb{9}"
  '\ud835\udfe2': "\\mathsf{0}"
  '\ud835\udfe3': "\\mathsf{1}"
  '\ud835\udfe4': "\\mathsf{2}"
  '\ud835\udfe5': "\\mathsf{3}"
  '\ud835\udfe6': "\\mathsf{4}"
  '\ud835\udfe7': "\\mathsf{5}"
  '\ud835\udfe8': "\\mathsf{6}"
  '\ud835\udfe9': "\\mathsf{7}"
  '\ud835\udfea': "\\mathsf{8}"
  '\ud835\udfeb': "\\mathsf{9}"
  '\ud835\udfec': "\\mathsfbf{0}"
  '\ud835\udfed': "\\mathsfbf{1}"
  '\ud835\udfee': "\\mathsfbf{2}"
  '\ud835\udfef': "\\mathsfbf{3}"
  '\ud835\udff0': "\\mathsfbf{4}"
  '\ud835\udff1': "\\mathsfbf{5}"
  '\ud835\udff2': "\\mathsfbf{6}"
  '\ud835\udff3': "\\mathsfbf{7}"
  '\ud835\udff4': "\\mathsfbf{8}"
  '\ud835\udff5': "\\mathsfbf{9}"
  '\ud835\udff6': "\\mathtt{0}"
  '\ud835\udff7': "\\mathtt{1}"
  '\ud835\udff8': "\\mathtt{2}"
  '\ud835\udff9': "\\mathtt{3}"
  '\ud835\udffa': "\\mathtt{4}"
  '\ud835\udffb': "\\mathtt{5}"
  '\ud835\udffc': "\\mathtt{6}"
  '\ud835\udffd': "\\mathtt{7}"
  '\ud835\udffe': "\\mathtt{8}"
  '\ud835\udfff': "\\mathtt{9}"
  '\u2329': "{\\langle}"
  '\u232A': "{\\rangle}"
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
  '\u00A0': " "
  '\u00A1': "{\\textexclamdown}"
  '\u00A2': "{\\textcent}"
  '\u00A3': "{\\textsterling}"
  '\u00A4': "{\\textcurrency}"
  '\u00A5': "{\\textyen}"
  '\u00A6': "{\\textbrokenbar}"
  '\u00A7': "{\\textsection}"
  '\u00A8': "{\\textasciidieresis}"
  '\u00A9': "{\\textcopyright}"
  '\u00AA': "{\\textordfeminine}"
  '\u00AB': "{\\guillemotleft}"
  '\u00AE': "{\\textregistered}"
  '\u00AF': "{\\textasciimacron}"
  '\u00B0': "{\\textdegree}"
  '\u00B4': "{\\textasciiacute}"
  '\u00B6': "{\\textparagraph}"
  '\u00B8': "\\c{}"
  '\u00BA': "{\\textordmasculine}"
  '\u00BB': "{\\guillemotright}"
  '\u00BC': "{\\textonequarter}"
  '\u00BD': "{\\textonehalf}"
  '\u00BE': "{\\textthreequarters}"
  '\u00BF': "{\\textquestiondown}"
  '\u00C0': "{\\`A}"
  '\u00C1': "{\\'A}"
  '\u00C2': "{\\^A}"
  '\u00C3': "{\\~A}"
  '\u00C4': "{\\\"A}"
  '\u00C5': "{\\AA}"
  '\u00C6': "{\\AE}"
  '\u00C7': "{\\c C}"
  '\u00C8': "{\\`E}"
  '\u00C9': "{\\'E}"
  '\u00CA': "{\\^E}"
  '\u00CB': "{\\\"E}"
  '\u00CC': "{\\`I}"
  '\u00CD': "{\\'I}"
  '\u00CE': "{\\^I}"
  '\u00CF': "{\\\"I}"
  '\u00D0': "{\\DH}"
  '\u00D1': "{\\~N}"
  '\u00D2': "{\\`O}"
  '\u00D3': "{\\'O}"
  '\u00D4': "{\\^O}"
  '\u00D5': "{\\~O}"
  '\u00D6': "{\\\"O}"
  '\u00D7': "{\\texttimes}"
  '\u00D8': "{\\O}"
  '\u00D9': "{\\`U}"
  '\u00DA': "{\\'U}"
  '\u00DB': "{\\^U}"
  '\u00DC': "{\\\"U}"
  '\u00DD': "{\\'Y}"
  '\u00DE': "{\\TH}"
  '\u00DF': "{\\ss}"
  '\u00E0': "{\\`a}"
  '\u00E1': "{\\'a}"
  '\u00E2': "{\\^a}"
  '\u00E3': "{\\~a}"
  '\u00E4': "{\\\"a}"
  '\u00E5': "{\\aa}"
  '\u00E6': "{\\ae}"
  '\u00E7': "{\\c c}"
  '\u00E8': "{\\`e}"
  '\u00E9': "{\\'e}"
  '\u00EA': "{\\^e}"
  '\u00EB': "{\\\"e}"
  '\u00EC': "{\\`\\i}"
  '\u00ED': "{\\'\\i}"
  '\u00EE': "{\\^\\i}"
  '\u00EF': "{\\\"\\i}"
  '\u00F0': "{\\dh}"
  '\u00F1': "{\\~n}"
  '\u00F2': "{\\`o}"
  '\u00F3': "{\\'o}"
  '\u00F4': "{\\^o}"
  '\u00F5': "{\\~o}"
  '\u00F6': "{\\\"o}"
  '\u00F8': "{\\o}"
  '\u00F9': "{\\`u}"
  '\u00FA': "{\\'u}"
  '\u00FB': "{\\^u}"
  '\u00FC': "{\\\"u}"
  '\u00FD': "{\\'y}"
  '\u00FE': "{\\th}"
  '\u00FF': "{\\\"y}"
  '\u0100': "\\={A}"
  '\u0101': "\\={a}"
  '\u0102': "{\\u A}"
  '\u0103': "{\\u a}"
  '\u0104': "\\k{A}"
  '\u0105': "\\k{a}"
  '\u0106': "{\\'C}"
  '\u0107': "{\\'c}"
  '\u0108': "{\\^C}"
  '\u0109': "{\\^c}"
  '\u010A': "{\\.C}"
  '\u010B': "{\\.c}"
  '\u010C': "{\\v C}"
  '\u010D': "{\\v c}"
  '\u010E': "{\\v D}"
  '\u010F': "{\\v d}"
  '\u0110': "{\\DJ}"
  '\u0111': "{\\dj}"
  '\u0112': "\\={E}"
  '\u0113': "\\={e}"
  '\u0114': "{\\u E}"
  '\u0115': "{\\u e}"
  '\u0116': "{\\.E}"
  '\u0117': "{\\.e}"
  '\u0118': "\\k{E}"
  '\u0119': "\\k{e}"
  '\u011A': "{\\v E}"
  '\u011B': "{\\v e}"
  '\u011C': "{\\^G}"
  '\u011D': "{\\^g}"
  '\u011E': "{\\u G}"
  '\u011F': "{\\u g}"
  '\u0120': "{\\.G}"
  '\u0121': "{\\.g}"
  '\u0122': "{\\c G}"
  '\u0123': "{\\c g}"
  '\u0124': "{\\^H}"
  '\u0125': "{\\^h}"
  '\u0126': "{\\fontencoding{LELA}\\selectfont\\char40}"
  '\u0128': "{\\~I}"
  '\u0129': "{\\~\\i}"
  '\u012A': "\\={I}"
  '\u012B': "\\={\\i}"
  '\u012C': "{\\u I}"
  '\u012D': "{\\u \\i}"
  '\u012E': "\\k{I}"
  '\u012F': "\\k{i}"
  '\u0130': "{\\.I}"
  '\u0131': "{\\i}"
  '\u0132': "IJ"
  '\u0133': "ij"
  '\u0134': "{\\^J}"
  '\u0135': "{\\^\\j}"
  '\u0136': "{\\c K}"
  '\u0137': "{\\c k}"
  '\u0138': "{\\fontencoding{LELA}\\selectfont\\char91}"
  '\u0139': "{\\'L}"
  '\u013A': "{\\'l}"
  '\u013B': "{\\c L}"
  '\u013C': "{\\c l}"
  '\u013D': "{\\v L}"
  '\u013E': "{\\v l}"
  '\u013F': "{\\fontencoding{LELA}\\selectfont\\char201}"
  '\u0140': "{\\fontencoding{LELA}\\selectfont\\char202}"
  '\u0141': "{\\L}"
  '\u0142': "{\\l}"
  '\u0143': "{\\'N}"
  '\u0144': "{\\'n}"
  '\u0145': "{\\c N}"
  '\u0146': "{\\c n}"
  '\u0147': "{\\v N}"
  '\u0148': "{\\v n}"
  '\u0149': "'n"
  '\u014A': "{\\NG}"
  '\u014B': "{\\ng}"
  '\u014C': "\\={O}"
  '\u014D': "\\={o}"
  '\u014E': "{\\u O}"
  '\u014F': "{\\u o}"
  '\u0150': "{\\H O}"
  '\u0151': "{\\H o}"
  '\u0152': "{\\OE}"
  '\u0153': "{\\oe}"
  '\u0154': "{\\'R}"
  '\u0155': "{\\'r}"
  '\u0156': "{\\c R}"
  '\u0157': "{\\c r}"
  '\u0158': "{\\v R}"
  '\u0159': "{\\v r}"
  '\u015A': "{\\'S}"
  '\u015B': "{\\'s}"
  '\u015C': "{\\^S}"
  '\u015D': "{\\^s}"
  '\u015E': "{\\c S}"
  '\u015F': "{\\c s}"
  '\u0160': "{\\v S}"
  '\u0161': "{\\v s}"
  '\u0162': "{\\c T}"
  '\u0163': "{\\c t}"
  '\u0164': "{\\v T}"
  '\u0165': "{\\v t}"
  '\u0166': "{\\fontencoding{LELA}\\selectfont\\char47}"
  '\u0167': "{\\fontencoding{LELA}\\selectfont\\char63}"
  '\u0168': "{\\~U}"
  '\u0169': "{\\~u}"
  '\u016A': "\\={U}"
  '\u016B': "\\={u}"
  '\u016C': "{\\u U}"
  '\u016D': "{\\u u}"
  '\u016E': "\\r{U}"
  '\u016F': "\\r{u}"
  '\u0170': "{\\H U}"
  '\u0171': "{\\H u}"
  '\u0172': "\\k{U}"
  '\u0173': "\\k{u}"
  '\u0174': "{\\^W}"
  '\u0175': "{\\^w}"
  '\u0176': "{\\^Y}"
  '\u0177': "{\\^y}"
  '\u0178': "{\\\"Y}"
  '\u0179': "{\\'Z}"
  '\u017A': "{\\'z}"
  '\u017B': "{\\.Z}"
  '\u017C': "{\\.z}"
  '\u017D': "{\\v Z}"
  '\u017E': "{\\v z}"
  '\u0195': "{\\texthvlig}"
  '\u019E': "{\\textnrleg}"
  '\u01BA': "{\\fontencoding{LELA}\\selectfont\\char195}"
  '\u01C2': "{\\textdoublepipe}"
  '\u01F5': "{\\'g}"
  '\u0258': "{\\fontencoding{LEIP}\\selectfont\\char61}"
  '\u0261': "g"
  '\u0272': "{\\Elzltln}"
  '\u0278': "{\\textphi}"
  '\u027F': "{\\fontencoding{LEIP}\\selectfont\\char202}"
  '\u029E': "{\\textturnk}"
  '\u02BC': "'"
  '\u02C7': "{\\textasciicaron}"
  '\u02D8': "{\\textasciibreve}"
  '\u02D9': "{\\textperiodcentered}"
  '\u02DA': "\\r{}"
  '\u02DB': "\\k{}"
  '\u02DC': "{\\texttildelow}"
  '\u02DD': "\\H{}"
  '\u02E5': "\\tone{55}"
  '\u02E6': "\\tone{44}"
  '\u02E7': "\\tone{33}"
  '\u02E8': "\\tone{22}"
  '\u02E9': "\\tone{11}"
  '\u0300': "\\`"
  '\u0301': "\\'"
  '\u0302': "\\^"
  '\u0303': "\\~"
  '\u0304': "\\="
  '\u0306': "\\u"
  '\u0307': "\\."
  '\u0308': "\\\""
  '\u030A': "\\r"
  '\u030B': "\\H"
  '\u030C': "\\v"
  '\u030F': "\\cyrchar\\C"
  '\u0311': "{\\fontencoding{LECO}\\selectfont\\char177}"
  '\u0318': "{\\fontencoding{LECO}\\selectfont\\char184}"
  '\u0319': "{\\fontencoding{LECO}\\selectfont\\char185}"
  '\u0322': "{\\Elzrh}"
  '\u0327': "\\c"
  '\u0328': "\\k"
  '\u032B': "{\\fontencoding{LECO}\\selectfont\\char203}"
  '\u032F': "{\\fontencoding{LECO}\\selectfont\\char207}"
  '\u0335': "{\\Elzxl}"
  '\u0336': "{\\Elzbar}"
  '\u0337': "{\\fontencoding{LECO}\\selectfont\\char215}"
  '\u0338': "{\\fontencoding{LECO}\\selectfont\\char216}"
  '\u033A': "{\\fontencoding{LECO}\\selectfont\\char218}"
  '\u033B': "{\\fontencoding{LECO}\\selectfont\\char219}"
  '\u033C': "{\\fontencoding{LECO}\\selectfont\\char220}"
  '\u033D': "{\\fontencoding{LECO}\\selectfont\\char221}"
  '\u0361': "{\\fontencoding{LECO}\\selectfont\\char225}"
  '\u0386': "{\\'A}"
  '\u0388': "{\\'E}"
  '\u0389': "{\\'H}"
  '\u038A': "\\'{}{I}"
  '\u038C': "\\'{}O"
  '\u03AC': "{\\'$\\alpha$}"
  '\u03B8': "{\\texttheta}"
  '\u03CC': "{\\'o}"
  '\u03D0': "\\Pisymbol{ppi022}{87}"
  '\u03D1': "{\\textvartheta}"
  '\u03F4': "{\\textTheta}"
  '\u0401': "{\\cyrchar\\CYRYO}"
  '\u0402': "{\\cyrchar\\CYRDJE}"
  '\u0403': "\\cyrchar{\\'\\CYRG}"
  '\u0404': "{\\cyrchar\\CYRIE}"
  '\u0405': "{\\cyrchar\\CYRDZE}"
  '\u0406': "{\\cyrchar\\CYRII}"
  '\u0407': "{\\cyrchar\\CYRYI}"
  '\u0408': "{\\cyrchar\\CYRJE}"
  '\u0409': "{\\cyrchar\\CYRLJE}"
  '\u040A': "{\\cyrchar\\CYRNJE}"
  '\u040B': "{\\cyrchar\\CYRTSHE}"
  '\u040C': "\\cyrchar{\\'\\CYRK}"
  '\u040E': "{\\cyrchar\\CYRUSHRT}"
  '\u040F': "{\\cyrchar\\CYRDZHE}"
  '\u0410': "{\\cyrchar\\CYRA}"
  '\u0411': "{\\cyrchar\\CYRB}"
  '\u0412': "{\\cyrchar\\CYRV}"
  '\u0413': "{\\cyrchar\\CYRG}"
  '\u0414': "{\\cyrchar\\CYRD}"
  '\u0415': "{\\cyrchar\\CYRE}"
  '\u0416': "{\\cyrchar\\CYRZH}"
  '\u0417': "{\\cyrchar\\CYRZ}"
  '\u0418': "{\\cyrchar\\CYRI}"
  '\u0419': "{\\cyrchar\\CYRISHRT}"
  '\u041A': "{\\cyrchar\\CYRK}"
  '\u041B': "{\\cyrchar\\CYRL}"
  '\u041C': "{\\cyrchar\\CYRM}"
  '\u041D': "{\\cyrchar\\CYRN}"
  '\u041E': "{\\cyrchar\\CYRO}"
  '\u041F': "{\\cyrchar\\CYRP}"
  '\u0420': "{\\cyrchar\\CYRR}"
  '\u0421': "{\\cyrchar\\CYRS}"
  '\u0422': "{\\cyrchar\\CYRT}"
  '\u0423': "{\\cyrchar\\CYRU}"
  '\u0424': "{\\cyrchar\\CYRF}"
  '\u0425': "{\\cyrchar\\CYRH}"
  '\u0426': "{\\cyrchar\\CYRC}"
  '\u0427': "{\\cyrchar\\CYRCH}"
  '\u0428': "{\\cyrchar\\CYRSH}"
  '\u0429': "{\\cyrchar\\CYRSHCH}"
  '\u042A': "{\\cyrchar\\CYRHRDSN}"
  '\u042B': "{\\cyrchar\\CYRERY}"
  '\u042C': "{\\cyrchar\\CYRSFTSN}"
  '\u042D': "{\\cyrchar\\CYREREV}"
  '\u042E': "{\\cyrchar\\CYRYU}"
  '\u042F': "{\\cyrchar\\CYRYA}"
  '\u0430': "{\\cyrchar\\cyra}"
  '\u0431': "{\\cyrchar\\cyrb}"
  '\u0432': "{\\cyrchar\\cyrv}"
  '\u0433': "{\\cyrchar\\cyrg}"
  '\u0434': "{\\cyrchar\\cyrd}"
  '\u0435': "{\\cyrchar\\cyre}"
  '\u0436': "{\\cyrchar\\cyrzh}"
  '\u0437': "{\\cyrchar\\cyrz}"
  '\u0438': "{\\cyrchar\\cyri}"
  '\u0439': "{\\cyrchar\\cyrishrt}"
  '\u043A': "{\\cyrchar\\cyrk}"
  '\u043B': "{\\cyrchar\\cyrl}"
  '\u043C': "{\\cyrchar\\cyrm}"
  '\u043D': "{\\cyrchar\\cyrn}"
  '\u043E': "{\\cyrchar\\cyro}"
  '\u043F': "{\\cyrchar\\cyrp}"
  '\u0440': "{\\cyrchar\\cyrr}"
  '\u0441': "{\\cyrchar\\cyrs}"
  '\u0442': "{\\cyrchar\\cyrt}"
  '\u0443': "{\\cyrchar\\cyru}"
  '\u0444': "{\\cyrchar\\cyrf}"
  '\u0445': "{\\cyrchar\\cyrh}"
  '\u0446': "{\\cyrchar\\cyrc}"
  '\u0447': "{\\cyrchar\\cyrch}"
  '\u0448': "{\\cyrchar\\cyrsh}"
  '\u0449': "{\\cyrchar\\cyrshch}"
  '\u044A': "{\\cyrchar\\cyrhrdsn}"
  '\u044B': "{\\cyrchar\\cyrery}"
  '\u044C': "{\\cyrchar\\cyrsftsn}"
  '\u044D': "{\\cyrchar\\cyrerev}"
  '\u044E': "{\\cyrchar\\cyryu}"
  '\u044F': "{\\cyrchar\\cyrya}"
  '\u0451': "{\\cyrchar\\cyryo}"
  '\u0452': "{\\cyrchar\\cyrdje}"
  '\u0453': "\\cyrchar{\\'\\cyrg}"
  '\u0454': "{\\cyrchar\\cyrie}"
  '\u0455': "{\\cyrchar\\cyrdze}"
  '\u0456': "{\\cyrchar\\cyrii}"
  '\u0457': "{\\cyrchar\\cyryi}"
  '\u0458': "{\\cyrchar\\cyrje}"
  '\u0459': "{\\cyrchar\\cyrlje}"
  '\u045A': "{\\cyrchar\\cyrnje}"
  '\u045B': "{\\cyrchar\\cyrtshe}"
  '\u045C': "\\cyrchar{\\'\\cyrk}"
  '\u045E': "{\\cyrchar\\cyrushrt}"
  '\u045F': "{\\cyrchar\\cyrdzhe}"
  '\u0460': "{\\cyrchar\\CYROMEGA}"
  '\u0461': "{\\cyrchar\\cyromega}"
  '\u0462': "{\\cyrchar\\CYRYAT}"
  '\u0464': "{\\cyrchar\\CYRIOTE}"
  '\u0465': "{\\cyrchar\\cyriote}"
  '\u0466': "{\\cyrchar\\CYRLYUS}"
  '\u0467': "{\\cyrchar\\cyrlyus}"
  '\u0468': "{\\cyrchar\\CYRIOTLYUS}"
  '\u0469': "{\\cyrchar\\cyriotlyus}"
  '\u046A': "{\\cyrchar\\CYRBYUS}"
  '\u046C': "{\\cyrchar\\CYRIOTBYUS}"
  '\u046D': "{\\cyrchar\\cyriotbyus}"
  '\u046E': "{\\cyrchar\\CYRKSI}"
  '\u046F': "{\\cyrchar\\cyrksi}"
  '\u0470': "{\\cyrchar\\CYRPSI}"
  '\u0471': "{\\cyrchar\\cyrpsi}"
  '\u0472': "{\\cyrchar\\CYRFITA}"
  '\u0474': "{\\cyrchar\\CYRIZH}"
  '\u0478': "{\\cyrchar\\CYRUK}"
  '\u0479': "{\\cyrchar\\cyruk}"
  '\u047A': "{\\cyrchar\\CYROMEGARND}"
  '\u047B': "{\\cyrchar\\cyromegarnd}"
  '\u047C': "{\\cyrchar\\CYROMEGATITLO}"
  '\u047D': "{\\cyrchar\\cyromegatitlo}"
  '\u047E': "{\\cyrchar\\CYROT}"
  '\u047F': "{\\cyrchar\\cyrot}"
  '\u0480': "{\\cyrchar\\CYRKOPPA}"
  '\u0481': "{\\cyrchar\\cyrkoppa}"
  '\u0482': "{\\cyrchar\\cyrthousands}"
  '\u0488': "{\\cyrchar\\cyrhundredthousands}"
  '\u0489': "{\\cyrchar\\cyrmillions}"
  '\u048C': "{\\cyrchar\\CYRSEMISFTSN}"
  '\u048D': "{\\cyrchar\\cyrsemisftsn}"
  '\u048E': "{\\cyrchar\\CYRRTICK}"
  '\u048F': "{\\cyrchar\\cyrrtick}"
  '\u0490': "{\\cyrchar\\CYRGUP}"
  '\u0491': "{\\cyrchar\\cyrgup}"
  '\u0492': "{\\cyrchar\\CYRGHCRS}"
  '\u0493': "{\\cyrchar\\cyrghcrs}"
  '\u0494': "{\\cyrchar\\CYRGHK}"
  '\u0495': "{\\cyrchar\\cyrghk}"
  '\u0496': "{\\cyrchar\\CYRZHDSC}"
  '\u0497': "{\\cyrchar\\cyrzhdsc}"
  '\u0498': "{\\cyrchar\\CYRZDSC}"
  '\u0499': "{\\cyrchar\\cyrzdsc}"
  '\u049A': "{\\cyrchar\\CYRKDSC}"
  '\u049B': "{\\cyrchar\\cyrkdsc}"
  '\u049C': "{\\cyrchar\\CYRKVCRS}"
  '\u049D': "{\\cyrchar\\cyrkvcrs}"
  '\u049E': "{\\cyrchar\\CYRKHCRS}"
  '\u049F': "{\\cyrchar\\cyrkhcrs}"
  '\u04A0': "{\\cyrchar\\CYRKBEAK}"
  '\u04A1': "{\\cyrchar\\cyrkbeak}"
  '\u04A2': "{\\cyrchar\\CYRNDSC}"
  '\u04A3': "{\\cyrchar\\cyrndsc}"
  '\u04A4': "{\\cyrchar\\CYRNG}"
  '\u04A5': "{\\cyrchar\\cyrng}"
  '\u04A6': "{\\cyrchar\\CYRPHK}"
  '\u04A7': "{\\cyrchar\\cyrphk}"
  '\u04A8': "{\\cyrchar\\CYRABHHA}"
  '\u04A9': "{\\cyrchar\\cyrabhha}"
  '\u04AA': "{\\cyrchar\\CYRSDSC}"
  '\u04AB': "{\\cyrchar\\cyrsdsc}"
  '\u04AC': "{\\cyrchar\\CYRTDSC}"
  '\u04AD': "{\\cyrchar\\cyrtdsc}"
  '\u04AE': "{\\cyrchar\\CYRY}"
  '\u04AF': "{\\cyrchar\\cyry}"
  '\u04B0': "{\\cyrchar\\CYRYHCRS}"
  '\u04B1': "{\\cyrchar\\cyryhcrs}"
  '\u04B2': "{\\cyrchar\\CYRHDSC}"
  '\u04B3': "{\\cyrchar\\cyrhdsc}"
  '\u04B4': "{\\cyrchar\\CYRTETSE}"
  '\u04B5': "{\\cyrchar\\cyrtetse}"
  '\u04B6': "{\\cyrchar\\CYRCHRDSC}"
  '\u04B7': "{\\cyrchar\\cyrchrdsc}"
  '\u04B8': "{\\cyrchar\\CYRCHVCRS}"
  '\u04B9': "{\\cyrchar\\cyrchvcrs}"
  '\u04BA': "{\\cyrchar\\CYRSHHA}"
  '\u04BB': "{\\cyrchar\\cyrshha}"
  '\u04BC': "{\\cyrchar\\CYRABHCH}"
  '\u04BD': "{\\cyrchar\\cyrabhch}"
  '\u04BE': "{\\cyrchar\\CYRABHCHDSC}"
  '\u04BF': "{\\cyrchar\\cyrabhchdsc}"
  '\u04C0': "{\\cyrchar\\CYRpalochka}"
  '\u04C3': "{\\cyrchar\\CYRKHK}"
  '\u04C4': "{\\cyrchar\\cyrkhk}"
  '\u04C7': "{\\cyrchar\\CYRNHK}"
  '\u04C8': "{\\cyrchar\\cyrnhk}"
  '\u04CB': "{\\cyrchar\\CYRCHLDSC}"
  '\u04CC': "{\\cyrchar\\cyrchldsc}"
  '\u04D4': "{\\cyrchar\\CYRAE}"
  '\u04D5': "{\\cyrchar\\cyrae}"
  '\u04D8': "{\\cyrchar\\CYRSCHWA}"
  '\u04D9': "{\\cyrchar\\cyrschwa}"
  '\u04E0': "{\\cyrchar\\CYRABHDZE}"
  '\u04E1': "{\\cyrchar\\cyrabhdze}"
  '\u04E8': "{\\cyrchar\\CYROTLD}"
  '\u04E9': "{\\cyrchar\\cyrotld}"
  '\u2002': "\\hspace{0.6em}"
  '\u2003': "\\hspace{1em}"
  '\u2004': "\\hspace{0.33em}"
  '\u2005': "\\hspace{0.25em}"
  '\u2006': "\\hspace{0.166em}"
  '\u2007': "\\hphantom{0}"
  '\u2008': "\\hphantom{,}"
  '\u2009': "\\hspace{0.167em}"
  '\u2010': "-"
  '\u2013': "{\\textendash}"
  '\u2014': "{\\textemdash}"
  '\u2015': "\\rule{1em}{1pt}"
  '\u2018': "`"
  '\u2019': "'"
  '\u201A': ","
  '\u201C': "{\\textquotedblleft}"
  '\u201D': "{\\textquotedblright}"
  '\u201E': ",,"
  '\u2020': "{\\textdagger}"
  '\u2021': "{\\textdaggerdbl}"
  '\u2022': "{\\textbullet}"
  '\u2024': "."
  '\u2025': ".."
  '\u2026': "{\\ldots}"
  '\u2030': "{\\textperthousand}"
  '\u2031': "{\\textpertenthousand}"
  '\u2039': "{\\guilsinglleft}"
  '\u203A': "{\\guilsinglright}"
  '\u205F': "{\\mkern4mu}"
  '\u2060': "{\\nolinebreak}"
  '\u20A7': "\\ensuremath{\\Elzpes}"
  '\u20AC': "{\\mbox{\\texteuro}}"
  '\u210A': "\\mathscr{g}"
  '\u2116': "{\\cyrchar\\textnumero}"
  '\u2122': "{\\texttrademark}"
  '\u212B': "{\\AA}"
  '\u2212': "-"
  '\u2254': ":="
  '\u2305': "{\\barwedge}"
  '\u2423': "{\\textvisiblespace}"
  '\u2460': "\\ding{172}"
  '\u2461': "\\ding{173}"
  '\u2462': "\\ding{174}"
  '\u2463': "\\ding{175}"
  '\u2464': "\\ding{176}"
  '\u2465': "\\ding{177}"
  '\u2466': "\\ding{178}"
  '\u2467': "\\ding{179}"
  '\u2468': "\\ding{180}"
  '\u2469': "\\ding{181}"
  '\u25A0': "\\ding{110}"
  '\u25B2': "\\ding{115}"
  '\u25BC': "\\ding{116}"
  '\u25C6': "\\ding{117}"
  '\u25CF': "\\ding{108}"
  '\u25D7': "\\ding{119}"
  '\u2605': "\\ding{72}"
  '\u2606': "\\ding{73}"
  '\u260E': "\\ding{37}"
  '\u261B': "\\ding{42}"
  '\u261E': "\\ding{43}"
  '\u263E': "{\\rightmoon}"
  '\u263F': "{\\mercury}"
  '\u2640': "{\\venus}"
  '\u2642': "{\\male}"
  '\u2643': "{\\jupiter}"
  '\u2644': "{\\saturn}"
  '\u2645': "{\\uranus}"
  '\u2646': "{\\neptune}"
  '\u2647': "{\\pluto}"
  '\u2648': "{\\aries}"
  '\u2649': "{\\taurus}"
  '\u264A': "{\\gemini}"
  '\u264B': "{\\cancer}"
  '\u264C': "{\\leo}"
  '\u264D': "{\\virgo}"
  '\u264E': "{\\libra}"
  '\u264F': "{\\scorpio}"
  '\u2650': "{\\sagittarius}"
  '\u2651': "{\\capricornus}"
  '\u2652': "{\\aquarius}"
  '\u2653': "{\\pisces}"
  '\u2660': "\\ding{171}"
  '\u2663': "\\ding{168}"
  '\u2665': "\\ding{170}"
  '\u2666': "\\ding{169}"
  '\u2669': "{\\quarternote}"
  '\u266A': "{\\eighthnote}"
  '\u2701': "\\ding{33}"
  '\u2702': "\\ding{34}"
  '\u2703': "\\ding{35}"
  '\u2704': "\\ding{36}"
  '\u2706': "\\ding{38}"
  '\u2707': "\\ding{39}"
  '\u2708': "\\ding{40}"
  '\u2709': "\\ding{41}"
  '\u270C': "\\ding{44}"
  '\u270D': "\\ding{45}"
  '\u270E': "\\ding{46}"
  '\u270F': "\\ding{47}"
  '\u2710': "\\ding{48}"
  '\u2711': "\\ding{49}"
  '\u2712': "\\ding{50}"
  '\u2713': "\\ding{51}"
  '\u2714': "\\ding{52}"
  '\u2715': "\\ding{53}"
  '\u2716': "\\ding{54}"
  '\u2717': "\\ding{55}"
  '\u2718': "\\ding{56}"
  '\u2719': "\\ding{57}"
  '\u271A': "\\ding{58}"
  '\u271B': "\\ding{59}"
  '\u271C': "\\ding{60}"
  '\u271D': "\\ding{61}"
  '\u271E': "\\ding{62}"
  '\u271F': "\\ding{63}"
  '\u2720': "\\ding{64}"
  '\u2721': "\\ding{65}"
  '\u2722': "\\ding{66}"
  '\u2723': "\\ding{67}"
  '\u2724': "\\ding{68}"
  '\u2725': "\\ding{69}"
  '\u2726': "\\ding{70}"
  '\u2727': "\\ding{71}"
  '\u2729': "\\ding{73}"
  '\u272A': "\\ding{74}"
  '\u272B': "\\ding{75}"
  '\u272C': "\\ding{76}"
  '\u272D': "\\ding{77}"
  '\u272E': "\\ding{78}"
  '\u272F': "\\ding{79}"
  '\u2730': "\\ding{80}"
  '\u2731': "\\ding{81}"
  '\u2732': "\\ding{82}"
  '\u2733': "\\ding{83}"
  '\u2734': "\\ding{84}"
  '\u2735': "\\ding{85}"
  '\u2736': "\\ding{86}"
  '\u2737': "\\ding{87}"
  '\u2738': "\\ding{88}"
  '\u2739': "\\ding{89}"
  '\u273A': "\\ding{90}"
  '\u273B': "\\ding{91}"
  '\u273C': "\\ding{92}"
  '\u273D': "\\ding{93}"
  '\u273E': "\\ding{94}"
  '\u273F': "\\ding{95}"
  '\u2740': "\\ding{96}"
  '\u2741': "\\ding{97}"
  '\u2742': "\\ding{98}"
  '\u2743': "\\ding{99}"
  '\u2744': "\\ding{100}"
  '\u2745': "\\ding{101}"
  '\u2746': "\\ding{102}"
  '\u2747': "\\ding{103}"
  '\u2748': "\\ding{104}"
  '\u2749': "\\ding{105}"
  '\u274A': "\\ding{106}"
  '\u274B': "\\ding{107}"
  '\u274D': "\\ding{109}"
  '\u274F': "\\ding{111}"
  '\u2750': "\\ding{112}"
  '\u2751': "\\ding{113}"
  '\u2752': "\\ding{114}"
  '\u2756': "\\ding{118}"
  '\u2758': "\\ding{120}"
  '\u2759': "\\ding{121}"
  '\u275A': "\\ding{122}"
  '\u275B': "\\ding{123}"
  '\u275C': "\\ding{124}"
  '\u275D': "\\ding{125}"
  '\u275E': "\\ding{126}"
  '\u2761': "\\ding{161}"
  '\u2762': "\\ding{162}"
  '\u2763': "\\ding{163}"
  '\u2764': "\\ding{164}"
  '\u2765': "\\ding{165}"
  '\u2766': "\\ding{166}"
  '\u2767': "\\ding{167}"
  '\u2776': "\\ding{182}"
  '\u2777': "\\ding{183}"
  '\u2778': "\\ding{184}"
  '\u2779': "\\ding{185}"
  '\u277A': "\\ding{186}"
  '\u277B': "\\ding{187}"
  '\u277C': "\\ding{188}"
  '\u277D': "\\ding{189}"
  '\u277E': "\\ding{190}"
  '\u277F': "\\ding{191}"
  '\u2780': "\\ding{192}"
  '\u2781': "\\ding{193}"
  '\u2782': "\\ding{194}"
  '\u2783': "\\ding{195}"
  '\u2784': "\\ding{196}"
  '\u2785': "\\ding{197}"
  '\u2786': "\\ding{198}"
  '\u2787': "\\ding{199}"
  '\u2788': "\\ding{200}"
  '\u2789': "\\ding{201}"
  '\u278A': "\\ding{202}"
  '\u278B': "\\ding{203}"
  '\u278C': "\\ding{204}"
  '\u278D': "\\ding{205}"
  '\u278E': "\\ding{206}"
  '\u278F': "\\ding{207}"
  '\u2790': "\\ding{208}"
  '\u2791': "\\ding{209}"
  '\u2792': "\\ding{210}"
  '\u2793': "\\ding{211}"
  '\u2794': "\\ding{212}"
  '\u2798': "\\ding{216}"
  '\u2799': "\\ding{217}"
  '\u279A': "\\ding{218}"
  '\u279B': "\\ding{219}"
  '\u279C': "\\ding{220}"
  '\u279D': "\\ding{221}"
  '\u279E': "\\ding{222}"
  '\u279F': "\\ding{223}"
  '\u27A0': "\\ding{224}"
  '\u27A1': "\\ding{225}"
  '\u27A2': "\\ding{226}"
  '\u27A3': "\\ding{227}"
  '\u27A4': "\\ding{228}"
  '\u27A5': "\\ding{229}"
  '\u27A6': "\\ding{230}"
  '\u27A7': "\\ding{231}"
  '\u27A8': "\\ding{232}"
  '\u27A9': "\\ding{233}"
  '\u27AA': "\\ding{234}"
  '\u27AB': "\\ding{235}"
  '\u27AC': "\\ding{236}"
  '\u27AD': "\\ding{237}"
  '\u27AE': "\\ding{238}"
  '\u27AF': "\\ding{239}"
  '\u27B1': "\\ding{241}"
  '\u27B2': "\\ding{242}"
  '\u27B3': "\\ding{243}"
  '\u27B4': "\\ding{244}"
  '\u27B5': "\\ding{245}"
  '\u27B6': "\\ding{246}"
  '\u27B7': "\\ding{247}"
  '\u27B8': "\\ding{248}"
  '\u27B9': "\\ding{249}"
  '\u27BA': "\\ding{250}"
  '\u27BB': "\\ding{251}"
  '\u27BC': "\\ding{252}"
  '\u27BD': "\\ding{253}"
  '\u27BE': "\\ding{254}"
  '\u27E8': "{\\langle}"
  '\u27E9': "{\\rangle}"
  '\uFB00': "ff"
  '\uFB01': "fi"
  '\uFB02': "fl"
  '\uFB03': "ffi"
  '\uFB04': "ffl"
  '\ud835\udeb9': "\\mathbf{\\vartheta}"
  '\ud835\udedd': "\\mathbf{\\vartheta}"
  '\ud835\udede': "\\mathbf{\\varkappa}"
  '\ud835\udedf': "\\mathbf{\\phi}"
  '\ud835\udee0': "\\mathbf{\\varrho}"
  '\ud835\udee1': "\\mathbf{\\varpi}"
  '\ud835\udef3': "\\mathsl{\\vartheta}"
  '\ud835\udf17': "\\mathsl{\\vartheta}"
  '\ud835\udf18': "\\mathsl{\\varkappa}"
  '\ud835\udf19': "\\mathsl{\\phi}"
  '\ud835\udf1a': "\\mathsl{\\varrho}"
  '\ud835\udf1b': "\\mathsl{\\varpi}"
  '\ud835\udf2d': "\\mathbit{O}"
  '\ud835\udf51': "\\mathbit{\\vartheta}"
  '\ud835\udf52': "\\mathbit{\\varkappa}"
  '\ud835\udf53': "\\mathbit{\\phi}"
  '\ud835\udf54': "\\mathbit{\\varrho}"
  '\ud835\udf55': "\\mathbit{\\varpi}"
  '\ud835\udf67': "\\mathsfbf{\\vartheta}"
  '\ud835\udf8b': "\\mathsfbf{\\vartheta}"
  '\ud835\udf8c': "\\mathsfbf{\\varkappa}"
  '\ud835\udf8d': "\\mathsfbf{\\phi}"
  '\ud835\udf8e': "\\mathsfbf{\\varrho}"
  '\ud835\udf8f': "\\mathsfbf{\\varpi}"
  '\ud835\udfa1': "\\mathsfbfsl{\\vartheta}"
  '\ud835\udfc5': "\\mathsfbfsl{\\vartheta}"
  '\ud835\udfc6': "\\mathsfbfsl{\\varkappa}"
  '\ud835\udfc7': "\\mathsfbfsl{\\phi}"
  '\ud835\udfc8': "\\mathsfbfsl{\\varrho}"
  '\ud835\udfc9': "\\mathsfbfsl{\\varpi}"
  '\uFFFD': "\\dbend"
  '[': "{[}"
LaTeX.toUnicode =
  "\\#": '#'
  "{\\textdollar}": '$'
  "\\textdollar ": '$'
  "\\%": '%'
  "\\&": '&'
  "\\backslash": '\\'
  "\\^{}": '^'
  "\\_": '_'
  "\\{": '{'
  "\\}": '}'
  "{\\textasciitilde}": '~'
  "\\textasciitilde ": '~'
  "{\\textexclamdown}": '\u00A1'
  "\\textexclamdown ": '\u00A1'
  "{\\textcent}": '\u00A2'
  "\\textcent ": '\u00A2'
  "{\\textsterling}": '\u00A3'
  "\\textsterling ": '\u00A3'
  "{\\textcurrency}": '\u00A4'
  "\\textcurrency ": '\u00A4'
  "{\\textyen}": '\u00A5'
  "\\textyen ": '\u00A5'
  "{\\textbrokenbar}": '\u00A6'
  "\\textbrokenbar ": '\u00A6'
  "{\\textsection}": '\u00A7'
  "\\textsection ": '\u00A7'
  "{\\textasciidieresis}": '\u00A8'
  "\\textasciidieresis ": '\u00A8'
  "{\\textcopyright}": '\u00A9'
  "\\textcopyright ": '\u00A9'
  "{\\textordfeminine}": '\u00AA'
  "\\textordfeminine ": '\u00AA'
  "{\\guillemotleft}": '\u00AB'
  "\\guillemotleft ": '\u00AB'
  "{\\lnot}": '\u00AC'
  "\\lnot ": '\u00AC'
  "\\-": '\u00AD'
  "{\\textregistered}": '\u00AE'
  "\\textregistered ": '\u00AE'
  "{\\textasciimacron}": '\u00AF'
  "\\textasciimacron ": '\u00AF'
  "{\\textdegree}": '\u00B0'
  "\\textdegree ": '\u00B0'
  "{\\pm}": '\u00B1'
  "\\pm ": '\u00B1'
  "{^2}": '\u00B2'
  "{^3}": '\u00B3'
  "{\\textasciiacute}": '\u00B4'
  "\\textasciiacute ": '\u00B4'
  "\\mathrm{\\mu}": '\u00B5'
  "{\\textparagraph}": '\u00B6'
  "\\textparagraph ": '\u00B6'
  "{\\cdot}": '\u00B7'
  "\\cdot ": '\u00B7'
  "\\c{}": '\u00B8'
  "{^1}": '\u00B9'
  "{\\textordmasculine}": '\u00BA'
  "\\textordmasculine ": '\u00BA'
  "{\\guillemotright}": '\u00BB'
  "\\guillemotright ": '\u00BB'
  "{\\textonequarter}": '\u00BC'
  "\\textonequarter ": '\u00BC'
  "{\\textonehalf}": '\u00BD'
  "\\textonehalf ": '\u00BD'
  "{\\textthreequarters}": '\u00BE'
  "\\textthreequarters ": '\u00BE'
  "{\\textquestiondown}": '\u00BF'
  "\\textquestiondown ": '\u00BF'
  "{\\`A}": '\u00C0'
  "{\\'A}": '\u00C1'
  "{\\^A}": '\u00C2'
  "{\\~A}": '\u00C3'
  "{\\\"A}": '\u00C4'
  "{\\AA}": '\u00C5'
  "\\AA ": '\u00C5'
  "{\\AE}": '\u00C6'
  "\\AE ": '\u00C6'
  "{\\c C}": '\u00C7'
  "{\\`E}": '\u00C8'
  "{\\'E}": '\u00C9'
  "{\\^E}": '\u00CA'
  "{\\\"E}": '\u00CB'
  "{\\`I}": '\u00CC'
  "{\\'I}": '\u00CD'
  "{\\^I}": '\u00CE'
  "{\\\"I}": '\u00CF'
  "{\\DH}": '\u00D0'
  "\\DH ": '\u00D0'
  "{\\~N}": '\u00D1'
  "{\\`O}": '\u00D2'
  "{\\'O}": '\u00D3'
  "{\\^O}": '\u00D4'
  "{\\~O}": '\u00D5'
  "{\\\"O}": '\u00D6'
  "{\\texttimes}": '\u00D7'
  "\\texttimes ": '\u00D7'
  "{\\O}": '\u00D8'
  "\\O ": '\u00D8'
  "{\\`U}": '\u00D9'
  "{\\'U}": '\u00DA'
  "{\\^U}": '\u00DB'
  "{\\\"U}": '\u00DC'
  "{\\'Y}": '\u00DD'
  "{\\TH}": '\u00DE'
  "\\TH ": '\u00DE'
  "{\\ss}": '\u00DF'
  "\\ss ": '\u00DF'
  "{\\`a}": '\u00E0'
  "{\\'a}": '\u00E1'
  "{\\^a}": '\u00E2'
  "{\\~a}": '\u00E3'
  "{\\\"a}": '\u00E4'
  "{\\aa}": '\u00E5'
  "\\aa ": '\u00E5'
  "{\\ae}": '\u00E6'
  "\\ae ": '\u00E6'
  "{\\c c}": '\u00E7'
  "{\\`e}": '\u00E8'
  "{\\'e}": '\u00E9'
  "{\\^e}": '\u00EA'
  "{\\\"e}": '\u00EB'
  "{\\`\\i}": '\u00EC'
  "{\\'\\i}": '\u00ED'
  "{\\^\\i}": '\u00EE'
  "{\\\"\\i}": '\u00EF'
  "{\\dh}": '\u00F0'
  "\\dh ": '\u00F0'
  "{\\~n}": '\u00F1'
  "{\\`o}": '\u00F2'
  "{\\'o}": '\u00F3'
  "{\\^o}": '\u00F4'
  "{\\~o}": '\u00F5'
  "{\\\"o}": '\u00F6'
  "{\\div}": '\u00F7'
  "\\div ": '\u00F7'
  "{\\o}": '\u00F8'
  "\\o ": '\u00F8'
  "{\\`u}": '\u00F9'
  "{\\'u}": '\u00FA'
  "{\\^u}": '\u00FB'
  "{\\\"u}": '\u00FC'
  "{\\'y}": '\u00FD'
  "{\\th}": '\u00FE'
  "\\th ": '\u00FE'
  "{\\\"y}": '\u00FF'
  "\\={A}": '\u0100'
  "\\=A": '\u0100'
  "\\={a}": '\u0101'
  "\\=a": '\u0101'
  "{\\u A}": '\u0102'
  "{\\u a}": '\u0103'
  "\\k{A}": '\u0104'
  "\\k{a}": '\u0105'
  "{\\'C}": '\u0106'
  "{\\'c}": '\u0107'
  "{\\^C}": '\u0108'
  "{\\^c}": '\u0109'
  "{\\.C}": '\u010A'
  "{\\.c}": '\u010B'
  "{\\v C}": '\u010C'
  "{\\v c}": '\u010D'
  "{\\v D}": '\u010E'
  "{\\v d}": '\u010F'
  "{\\DJ}": '\u0110'
  "\\DJ ": '\u0110'
  "{\\dj}": '\u0111'
  "\\dj ": '\u0111'
  "\\={E}": '\u0112'
  "\\=E": '\u0112'
  "\\={e}": '\u0113'
  "\\=e": '\u0113'
  "{\\u E}": '\u0114'
  "{\\u e}": '\u0115'
  "{\\.E}": '\u0116'
  "{\\.e}": '\u0117'
  "\\k{E}": '\u0118'
  "\\k{e}": '\u0119'
  "{\\v E}": '\u011A'
  "{\\v e}": '\u011B'
  "{\\^G}": '\u011C'
  "{\\^g}": '\u011D'
  "{\\u G}": '\u011E'
  "{\\u g}": '\u011F'
  "{\\.G}": '\u0120'
  "{\\.g}": '\u0121'
  "{\\c G}": '\u0122'
  "{\\c g}": '\u0123'
  "{\\^H}": '\u0124'
  "{\\^h}": '\u0125'
  "{\\fontencoding{LELA}\\selectfont\\char40}": '\u0126'
  "{\\Elzxh}": '\u0127'
  "\\Elzxh ": '\u0127'
  "{\\~I}": '\u0128'
  "{\\~\\i}": '\u0129'
  "\\={I}": '\u012A'
  "\\=I": '\u012A'
  "\\={\\i}": '\u012B'
  "{\\u I}": '\u012C'
  "{\\u \\i}": '\u012D'
  "\\k{I}": '\u012E'
  "\\k{i}": '\u012F'
  "{\\.I}": '\u0130'
  "{\\i}": '\u0131'
  "\\i ": '\u0131'
  "{\\^J}": '\u0134'
  "{\\^\\j}": '\u0135'
  "{\\c K}": '\u0136'
  "{\\c k}": '\u0137'
  "{\\fontencoding{LELA}\\selectfont\\char91}": '\u0138'
  "{\\'L}": '\u0139'
  "{\\'l}": '\u013A'
  "{\\c L}": '\u013B'
  "{\\c l}": '\u013C'
  "{\\v L}": '\u013D'
  "{\\v l}": '\u013E'
  "{\\fontencoding{LELA}\\selectfont\\char201}": '\u013F'
  "{\\fontencoding{LELA}\\selectfont\\char202}": '\u0140'
  "{\\L}": '\u0141'
  "\\L ": '\u0141'
  "{\\l}": '\u0142'
  "\\l ": '\u0142'
  "{\\'N}": '\u0143'
  "{\\'n}": '\u0144'
  "{\\c N}": '\u0145'
  "{\\c n}": '\u0146'
  "{\\v N}": '\u0147'
  "{\\v n}": '\u0148'
  "'n": '\u0149'
  "{\\NG}": '\u014A'
  "\\NG ": '\u014A'
  "{\\ng}": '\u014B'
  "\\ng ": '\u014B'
  "\\={O}": '\u014C'
  "\\=O": '\u014C'
  "\\={o}": '\u014D'
  "\\=o": '\u014D'
  "{\\u O}": '\u014E'
  "{\\u o}": '\u014F'
  "{\\H O}": '\u0150'
  "{\\H o}": '\u0151'
  "{\\OE}": '\u0152'
  "\\OE ": '\u0152'
  "{\\oe}": '\u0153'
  "\\oe ": '\u0153'
  "{\\'R}": '\u0154'
  "{\\'r}": '\u0155'
  "{\\c R}": '\u0156'
  "{\\c r}": '\u0157'
  "{\\v R}": '\u0158'
  "{\\v r}": '\u0159'
  "{\\'S}": '\u015A'
  "{\\'s}": '\u015B'
  "{\\^S}": '\u015C'
  "{\\^s}": '\u015D'
  "{\\c S}": '\u015E'
  "{\\c s}": '\u015F'
  "{\\v S}": '\u0160'
  "{\\v s}": '\u0161'
  "{\\c T}": '\u0162'
  "{\\c t}": '\u0163'
  "{\\v T}": '\u0164'
  "{\\v t}": '\u0165'
  "{\\fontencoding{LELA}\\selectfont\\char47}": '\u0166'
  "{\\fontencoding{LELA}\\selectfont\\char63}": '\u0167'
  "{\\~U}": '\u0168'
  "{\\~u}": '\u0169'
  "\\={U}": '\u016A'
  "\\=U": '\u016A'
  "\\={u}": '\u016B'
  "\\=u": '\u016B'
  "{\\u U}": '\u016C'
  "{\\u u}": '\u016D'
  "\\r{U}": '\u016E'
  "\\r{u}": '\u016F'
  "{\\H U}": '\u0170'
  "{\\H u}": '\u0171'
  "\\k{U}": '\u0172'
  "\\k{u}": '\u0173'
  "{\\^W}": '\u0174'
  "{\\^w}": '\u0175'
  "{\\^Y}": '\u0176'
  "{\\^y}": '\u0177'
  "{\\\"Y}": '\u0178'
  "{\\'Z}": '\u0179'
  "{\\'z}": '\u017A'
  "{\\.Z}": '\u017B'
  "{\\.z}": '\u017C'
  "{\\v Z}": '\u017D'
  "{\\v z}": '\u017E'
  "{\\texthvlig}": '\u0195'
  "\\texthvlig ": '\u0195'
  "{\\textnrleg}": '\u019E'
  "\\textnrleg ": '\u019E'
  "{\\eth}": '\u01AA'
  "\\eth ": '\u01AA'
  "{\\fontencoding{LELA}\\selectfont\\char195}": '\u01BA'
  "{\\textdoublepipe}": '\u01C2'
  "\\textdoublepipe ": '\u01C2'
  "{\\'g}": '\u01F5'
  "{\\Elztrna}": '\u0250'
  "\\Elztrna ": '\u0250'
  "{\\Elztrnsa}": '\u0252'
  "\\Elztrnsa ": '\u0252'
  "{\\Elzopeno}": '\u0254'
  "\\Elzopeno ": '\u0254'
  "{\\Elzrtld}": '\u0256'
  "\\Elzrtld ": '\u0256'
  "{\\fontencoding{LEIP}\\selectfont\\char61}": '\u0258'
  "{\\Elzschwa}": '\u0259'
  "\\Elzschwa ": '\u0259'
  "{\\varepsilon}": '\u025B'
  "\\varepsilon ": '\u025B'
  "{\\Elzpgamma}": '\u0263'
  "\\Elzpgamma ": '\u0263'
  "{\\Elzpbgam}": '\u0264'
  "\\Elzpbgam ": '\u0264'
  "{\\Elztrnh}": '\u0265'
  "\\Elztrnh ": '\u0265'
  "{\\Elzbtdl}": '\u026C'
  "\\Elzbtdl ": '\u026C'
  "{\\Elzrtll}": '\u026D'
  "\\Elzrtll ": '\u026D'
  "{\\Elztrnm}": '\u026F'
  "\\Elztrnm ": '\u026F'
  "{\\Elztrnmlr}": '\u0270'
  "\\Elztrnmlr ": '\u0270'
  "{\\Elzltlmr}": '\u0271'
  "\\Elzltlmr ": '\u0271'
  "{\\Elzltln}": '\u0272'
  "\\Elzltln ": '\u0272'
  "{\\Elzrtln}": '\u0273'
  "\\Elzrtln ": '\u0273'
  "{\\Elzclomeg}": '\u0277'
  "\\Elzclomeg ": '\u0277'
  "{\\textphi}": '\u0278'
  "\\textphi ": '\u0278'
  "{\\Elztrnr}": '\u0279'
  "\\Elztrnr ": '\u0279'
  "{\\Elztrnrl}": '\u027A'
  "\\Elztrnrl ": '\u027A'
  "{\\Elzrttrnr}": '\u027B'
  "\\Elzrttrnr ": '\u027B'
  "{\\Elzrl}": '\u027C'
  "\\Elzrl ": '\u027C'
  "{\\Elzrtlr}": '\u027D'
  "\\Elzrtlr ": '\u027D'
  "{\\Elzfhr}": '\u027E'
  "\\Elzfhr ": '\u027E'
  "{\\fontencoding{LEIP}\\selectfont\\char202}": '\u027F'
  "{\\Elzrtls}": '\u0282'
  "\\Elzrtls ": '\u0282'
  "{\\Elzesh}": '\u0283'
  "\\Elzesh ": '\u0283'
  "{\\Elztrnt}": '\u0287'
  "\\Elztrnt ": '\u0287'
  "{\\Elzrtlt}": '\u0288'
  "\\Elzrtlt ": '\u0288'
  "{\\Elzpupsil}": '\u028A'
  "\\Elzpupsil ": '\u028A'
  "{\\Elzpscrv}": '\u028B'
  "\\Elzpscrv ": '\u028B'
  "{\\Elzinvv}": '\u028C'
  "\\Elzinvv ": '\u028C'
  "{\\Elzinvw}": '\u028D'
  "\\Elzinvw ": '\u028D'
  "{\\Elztrny}": '\u028E'
  "\\Elztrny ": '\u028E'
  "{\\Elzrtlz}": '\u0290'
  "\\Elzrtlz ": '\u0290'
  "{\\Elzyogh}": '\u0292'
  "\\Elzyogh ": '\u0292'
  "{\\Elzglst}": '\u0294'
  "\\Elzglst ": '\u0294'
  "{\\Elzreglst}": '\u0295'
  "\\Elzreglst ": '\u0295'
  "{\\Elzinglst}": '\u0296'
  "\\Elzinglst ": '\u0296'
  "{\\textturnk}": '\u029E'
  "\\textturnk ": '\u029E'
  "{\\Elzdyogh}": '\u02A4'
  "\\Elzdyogh ": '\u02A4'
  "{\\Elztesh}": '\u02A7'
  "\\Elztesh ": '\u02A7'
  "'": '\u02BC'
  "{\\textasciicaron}": '\u02C7'
  "\\textasciicaron ": '\u02C7'
  "{\\Elzverts}": '\u02C8'
  "\\Elzverts ": '\u02C8'
  "{\\Elzverti}": '\u02CC'
  "\\Elzverti ": '\u02CC'
  "{\\Elzlmrk}": '\u02D0'
  "\\Elzlmrk ": '\u02D0'
  "{\\Elzhlmrk}": '\u02D1'
  "\\Elzhlmrk ": '\u02D1'
  "{\\Elzsbrhr}": '\u02D2'
  "\\Elzsbrhr ": '\u02D2'
  "{\\Elzsblhr}": '\u02D3'
  "\\Elzsblhr ": '\u02D3'
  "{\\Elzrais}": '\u02D4'
  "\\Elzrais ": '\u02D4'
  "{\\Elzlow}": '\u02D5'
  "\\Elzlow ": '\u02D5'
  "{\\textasciibreve}": '\u02D8'
  "\\textasciibreve ": '\u02D8'
  "{\\textperiodcentered}": '\u02D9'
  "\\textperiodcentered ": '\u02D9'
  "\\r{}": '\u02DA'
  "\\k{}": '\u02DB'
  "{\\texttildelow}": '\u02DC'
  "\\texttildelow ": '\u02DC'
  "\\H{}": '\u02DD'
  "\\tone{55}": '\u02E5'
  "\\tone{44}": '\u02E6'
  "\\tone{33}": '\u02E7'
  "\\tone{22}": '\u02E8'
  "\\tone{11}": '\u02E9'
  "\\`": '\u0300'
  "\\'": '\u0301'
  "\\^": '\u0302'
  "\\~": '\u0303'
  "\\=": '\u0304'
  "\\u": '\u0306'
  "\\.": '\u0307'
  "\\\"": '\u0308'
  "\\r": '\u030A'
  "\\H": '\u030B'
  "\\v": '\u030C'
  "\\cyrchar\\C": '\u030F'
  "{\\fontencoding{LECO}\\selectfont\\char177}": '\u0311'
  "{\\fontencoding{LECO}\\selectfont\\char184}": '\u0318'
  "{\\fontencoding{LECO}\\selectfont\\char185}": '\u0319'
  "{\\Elzpalh}": '\u0321'
  "\\Elzpalh ": '\u0321'
  "{\\Elzrh}": '\u0322'
  "\\Elzrh ": '\u0322'
  "\\c": '\u0327'
  "\\k": '\u0328'
  "{\\Elzsbbrg}": '\u032A'
  "\\Elzsbbrg ": '\u032A'
  "{\\fontencoding{LECO}\\selectfont\\char203}": '\u032B'
  "{\\fontencoding{LECO}\\selectfont\\char207}": '\u032F'
  "{\\Elzxl}": '\u0335'
  "\\Elzxl ": '\u0335'
  "{\\Elzbar}": '\u0336'
  "\\Elzbar ": '\u0336'
  "{\\fontencoding{LECO}\\selectfont\\char215}": '\u0337'
  "{\\fontencoding{LECO}\\selectfont\\char216}": '\u0338'
  "{\\fontencoding{LECO}\\selectfont\\char218}": '\u033A'
  "{\\fontencoding{LECO}\\selectfont\\char219}": '\u033B'
  "{\\fontencoding{LECO}\\selectfont\\char220}": '\u033C'
  "{\\fontencoding{LECO}\\selectfont\\char221}": '\u033D'
  "{\\fontencoding{LECO}\\selectfont\\char225}": '\u0361'
  "{\\'H}": '\u0389'
  "\\'{}{I}": '\u038A'
  "\\'{}O": '\u038C'
  "\\mathrm{'Y}": '\u038E'
  "\\mathrm{'\\Omega}": '\u038F'
  "\\acute{\\ddot{\\iota}}": '\u0390'
  "{\\Alpha}": '\u0391'
  "\\Alpha ": '\u0391'
  "{\\Beta}": '\u0392'
  "\\Beta ": '\u0392'
  "{\\Gamma}": '\u0393'
  "\\Gamma ": '\u0393'
  "{\\Delta}": '\u0394'
  "\\Delta ": '\u0394'
  "{\\Epsilon}": '\u0395'
  "\\Epsilon ": '\u0395'
  "{\\Zeta}": '\u0396'
  "\\Zeta ": '\u0396'
  "{\\Eta}": '\u0397'
  "\\Eta ": '\u0397'
  "{\\Theta}": '\u0398'
  "\\Theta ": '\u0398'
  "{\\Iota}": '\u0399'
  "\\Iota ": '\u0399'
  "{\\Kappa}": '\u039A'
  "\\Kappa ": '\u039A'
  "{\\Lambda}": '\u039B'
  "\\Lambda ": '\u039B'
  "{\\Xi}": '\u039E'
  "\\Xi ": '\u039E'
  "{\\Pi}": '\u03A0'
  "\\Pi ": '\u03A0'
  "{\\Rho}": '\u03A1'
  "\\Rho ": '\u03A1'
  "{\\Sigma}": '\u03A3'
  "\\Sigma ": '\u03A3'
  "{\\Tau}": '\u03A4'
  "\\Tau ": '\u03A4'
  "{\\Upsilon}": '\u03A5'
  "\\Upsilon ": '\u03A5'
  "{\\Phi}": '\u03A6'
  "\\Phi ": '\u03A6'
  "{\\Chi}": '\u03A7'
  "\\Chi ": '\u03A7'
  "{\\Psi}": '\u03A8'
  "\\Psi ": '\u03A8'
  "{\\Omega}": '\u03A9'
  "\\Omega ": '\u03A9'
  "\\mathrm{\\ddot{I}}": '\u03AA'
  "\\mathrm{\\ddot{Y}}": '\u03AB'
  "{\\'$\\alpha$}": '\u03AC'
  "\\acute{\\epsilon}": '\u03AD'
  "\\acute{\\eta}": '\u03AE'
  "\\acute{\\iota}": '\u03AF'
  "\\acute{\\ddot{\\upsilon}}": '\u03B0'
  "{\\alpha}": '\u03B1'
  "\\alpha ": '\u03B1'
  "{\\beta}": '\u03B2'
  "\\beta ": '\u03B2'
  "{\\gamma}": '\u03B3'
  "\\gamma ": '\u03B3'
  "{\\delta}": '\u03B4'
  "\\delta ": '\u03B4'
  "{\\epsilon}": '\u03B5'
  "\\epsilon ": '\u03B5'
  "{\\zeta}": '\u03B6'
  "\\zeta ": '\u03B6'
  "{\\eta}": '\u03B7'
  "\\eta ": '\u03B7'
  "{\\texttheta}": '\u03B8'
  "\\texttheta ": '\u03B8'
  "{\\iota}": '\u03B9'
  "\\iota ": '\u03B9'
  "{\\kappa}": '\u03BA'
  "\\kappa ": '\u03BA'
  "{\\lambda}": '\u03BB'
  "\\lambda ": '\u03BB'
  "{\\mu}": '\u03BC'
  "\\mu ": '\u03BC'
  "{\\nu}": '\u03BD'
  "\\nu ": '\u03BD'
  "{\\xi}": '\u03BE'
  "\\xi ": '\u03BE'
  "{\\pi}": '\u03C0'
  "\\pi ": '\u03C0'
  "{\\rho}": '\u03C1'
  "\\rho ": '\u03C1'
  "{\\varsigma}": '\u03C2'
  "\\varsigma ": '\u03C2'
  "{\\sigma}": '\u03C3'
  "\\sigma ": '\u03C3'
  "{\\tau}": '\u03C4'
  "\\tau ": '\u03C4'
  "{\\upsilon}": '\u03C5'
  "\\upsilon ": '\u03C5'
  "{\\varphi}": '\u03C6'
  "\\varphi ": '\u03C6'
  "{\\chi}": '\u03C7'
  "\\chi ": '\u03C7'
  "{\\psi}": '\u03C8'
  "\\psi ": '\u03C8'
  "{\\omega}": '\u03C9'
  "\\omega ": '\u03C9'
  "\\ddot{\\iota}": '\u03CA'
  "\\ddot{\\upsilon}": '\u03CB'
  "\\acute{\\upsilon}": '\u03CD'
  "\\acute{\\omega}": '\u03CE'
  "\\Pisymbol{ppi022}{87}": '\u03D0'
  "{\\textvartheta}": '\u03D1'
  "\\textvartheta ": '\u03D1'
  "{\\phi}": '\u03D5'
  "\\phi ": '\u03D5'
  "{\\varpi}": '\u03D6'
  "\\varpi ": '\u03D6'
  "{\\Stigma}": '\u03DA'
  "\\Stigma ": '\u03DA'
  "{\\Digamma}": '\u03DC'
  "\\Digamma ": '\u03DC'
  "{\\digamma}": '\u03DD'
  "\\digamma ": '\u03DD'
  "{\\Koppa}": '\u03DE'
  "\\Koppa ": '\u03DE'
  "{\\Sampi}": '\u03E0'
  "\\Sampi ": '\u03E0'
  "{\\varkappa}": '\u03F0'
  "\\varkappa ": '\u03F0'
  "{\\varrho}": '\u03F1'
  "\\varrho ": '\u03F1'
  "{\\textTheta}": '\u03F4'
  "\\textTheta ": '\u03F4'
  "{\\backepsilon}": '\u03F6'
  "\\backepsilon ": '\u03F6'
  "{\\cyrchar\\CYRYO}": '\u0401'
  "\\cyrchar\\CYRYO ": '\u0401'
  "{\\cyrchar\\CYRDJE}": '\u0402'
  "\\cyrchar\\CYRDJE ": '\u0402'
  "\\cyrchar{\\'\\CYRG}": '\u0403'
  "{\\cyrchar\\CYRIE}": '\u0404'
  "\\cyrchar\\CYRIE ": '\u0404'
  "{\\cyrchar\\CYRDZE}": '\u0405'
  "\\cyrchar\\CYRDZE ": '\u0405'
  "{\\cyrchar\\CYRII}": '\u0406'
  "\\cyrchar\\CYRII ": '\u0406'
  "{\\cyrchar\\CYRYI}": '\u0407'
  "\\cyrchar\\CYRYI ": '\u0407'
  "{\\cyrchar\\CYRJE}": '\u0408'
  "\\cyrchar\\CYRJE ": '\u0408'
  "{\\cyrchar\\CYRLJE}": '\u0409'
  "\\cyrchar\\CYRLJE ": '\u0409'
  "{\\cyrchar\\CYRNJE}": '\u040A'
  "\\cyrchar\\CYRNJE ": '\u040A'
  "{\\cyrchar\\CYRTSHE}": '\u040B'
  "\\cyrchar\\CYRTSHE ": '\u040B'
  "\\cyrchar{\\'\\CYRK}": '\u040C'
  "{\\cyrchar\\CYRUSHRT}": '\u040E'
  "\\cyrchar\\CYRUSHRT ": '\u040E'
  "{\\cyrchar\\CYRDZHE}": '\u040F'
  "\\cyrchar\\CYRDZHE ": '\u040F'
  "{\\cyrchar\\CYRA}": '\u0410'
  "\\cyrchar\\CYRA ": '\u0410'
  "{\\cyrchar\\CYRB}": '\u0411'
  "\\cyrchar\\CYRB ": '\u0411'
  "{\\cyrchar\\CYRV}": '\u0412'
  "\\cyrchar\\CYRV ": '\u0412'
  "{\\cyrchar\\CYRG}": '\u0413'
  "\\cyrchar\\CYRG ": '\u0413'
  "{\\cyrchar\\CYRD}": '\u0414'
  "\\cyrchar\\CYRD ": '\u0414'
  "{\\cyrchar\\CYRE}": '\u0415'
  "\\cyrchar\\CYRE ": '\u0415'
  "{\\cyrchar\\CYRZH}": '\u0416'
  "\\cyrchar\\CYRZH ": '\u0416'
  "{\\cyrchar\\CYRZ}": '\u0417'
  "\\cyrchar\\CYRZ ": '\u0417'
  "{\\cyrchar\\CYRI}": '\u0418'
  "\\cyrchar\\CYRI ": '\u0418'
  "{\\cyrchar\\CYRISHRT}": '\u0419'
  "\\cyrchar\\CYRISHRT ": '\u0419'
  "{\\cyrchar\\CYRK}": '\u041A'
  "\\cyrchar\\CYRK ": '\u041A'
  "{\\cyrchar\\CYRL}": '\u041B'
  "\\cyrchar\\CYRL ": '\u041B'
  "{\\cyrchar\\CYRM}": '\u041C'
  "\\cyrchar\\CYRM ": '\u041C'
  "{\\cyrchar\\CYRN}": '\u041D'
  "\\cyrchar\\CYRN ": '\u041D'
  "{\\cyrchar\\CYRO}": '\u041E'
  "\\cyrchar\\CYRO ": '\u041E'
  "{\\cyrchar\\CYRP}": '\u041F'
  "\\cyrchar\\CYRP ": '\u041F'
  "{\\cyrchar\\CYRR}": '\u0420'
  "\\cyrchar\\CYRR ": '\u0420'
  "{\\cyrchar\\CYRS}": '\u0421'
  "\\cyrchar\\CYRS ": '\u0421'
  "{\\cyrchar\\CYRT}": '\u0422'
  "\\cyrchar\\CYRT ": '\u0422'
  "{\\cyrchar\\CYRU}": '\u0423'
  "\\cyrchar\\CYRU ": '\u0423'
  "{\\cyrchar\\CYRF}": '\u0424'
  "\\cyrchar\\CYRF ": '\u0424'
  "{\\cyrchar\\CYRH}": '\u0425'
  "\\cyrchar\\CYRH ": '\u0425'
  "{\\cyrchar\\CYRC}": '\u0426'
  "\\cyrchar\\CYRC ": '\u0426'
  "{\\cyrchar\\CYRCH}": '\u0427'
  "\\cyrchar\\CYRCH ": '\u0427'
  "{\\cyrchar\\CYRSH}": '\u0428'
  "\\cyrchar\\CYRSH ": '\u0428'
  "{\\cyrchar\\CYRSHCH}": '\u0429'
  "\\cyrchar\\CYRSHCH ": '\u0429'
  "{\\cyrchar\\CYRHRDSN}": '\u042A'
  "\\cyrchar\\CYRHRDSN ": '\u042A'
  "{\\cyrchar\\CYRERY}": '\u042B'
  "\\cyrchar\\CYRERY ": '\u042B'
  "{\\cyrchar\\CYRSFTSN}": '\u042C'
  "\\cyrchar\\CYRSFTSN ": '\u042C'
  "{\\cyrchar\\CYREREV}": '\u042D'
  "\\cyrchar\\CYREREV ": '\u042D'
  "{\\cyrchar\\CYRYU}": '\u042E'
  "\\cyrchar\\CYRYU ": '\u042E'
  "{\\cyrchar\\CYRYA}": '\u042F'
  "\\cyrchar\\CYRYA ": '\u042F'
  "{\\cyrchar\\cyra}": '\u0430'
  "\\cyrchar\\cyra ": '\u0430'
  "{\\cyrchar\\cyrb}": '\u0431'
  "\\cyrchar\\cyrb ": '\u0431'
  "{\\cyrchar\\cyrv}": '\u0432'
  "\\cyrchar\\cyrv ": '\u0432'
  "{\\cyrchar\\cyrg}": '\u0433'
  "\\cyrchar\\cyrg ": '\u0433'
  "{\\cyrchar\\cyrd}": '\u0434'
  "\\cyrchar\\cyrd ": '\u0434'
  "{\\cyrchar\\cyre}": '\u0435'
  "\\cyrchar\\cyre ": '\u0435'
  "{\\cyrchar\\cyrzh}": '\u0436'
  "\\cyrchar\\cyrzh ": '\u0436'
  "{\\cyrchar\\cyrz}": '\u0437'
  "\\cyrchar\\cyrz ": '\u0437'
  "{\\cyrchar\\cyri}": '\u0438'
  "\\cyrchar\\cyri ": '\u0438'
  "{\\cyrchar\\cyrishrt}": '\u0439'
  "\\cyrchar\\cyrishrt ": '\u0439'
  "{\\cyrchar\\cyrk}": '\u043A'
  "\\cyrchar\\cyrk ": '\u043A'
  "{\\cyrchar\\cyrl}": '\u043B'
  "\\cyrchar\\cyrl ": '\u043B'
  "{\\cyrchar\\cyrm}": '\u043C'
  "\\cyrchar\\cyrm ": '\u043C'
  "{\\cyrchar\\cyrn}": '\u043D'
  "\\cyrchar\\cyrn ": '\u043D'
  "{\\cyrchar\\cyro}": '\u043E'
  "\\cyrchar\\cyro ": '\u043E'
  "{\\cyrchar\\cyrp}": '\u043F'
  "\\cyrchar\\cyrp ": '\u043F'
  "{\\cyrchar\\cyrr}": '\u0440'
  "\\cyrchar\\cyrr ": '\u0440'
  "{\\cyrchar\\cyrs}": '\u0441'
  "\\cyrchar\\cyrs ": '\u0441'
  "{\\cyrchar\\cyrt}": '\u0442'
  "\\cyrchar\\cyrt ": '\u0442'
  "{\\cyrchar\\cyru}": '\u0443'
  "\\cyrchar\\cyru ": '\u0443'
  "{\\cyrchar\\cyrf}": '\u0444'
  "\\cyrchar\\cyrf ": '\u0444'
  "{\\cyrchar\\cyrh}": '\u0445'
  "\\cyrchar\\cyrh ": '\u0445'
  "{\\cyrchar\\cyrc}": '\u0446'
  "\\cyrchar\\cyrc ": '\u0446'
  "{\\cyrchar\\cyrch}": '\u0447'
  "\\cyrchar\\cyrch ": '\u0447'
  "{\\cyrchar\\cyrsh}": '\u0448'
  "\\cyrchar\\cyrsh ": '\u0448'
  "{\\cyrchar\\cyrshch}": '\u0449'
  "\\cyrchar\\cyrshch ": '\u0449'
  "{\\cyrchar\\cyrhrdsn}": '\u044A'
  "\\cyrchar\\cyrhrdsn ": '\u044A'
  "{\\cyrchar\\cyrery}": '\u044B'
  "\\cyrchar\\cyrery ": '\u044B'
  "{\\cyrchar\\cyrsftsn}": '\u044C'
  "\\cyrchar\\cyrsftsn ": '\u044C'
  "{\\cyrchar\\cyrerev}": '\u044D'
  "\\cyrchar\\cyrerev ": '\u044D'
  "{\\cyrchar\\cyryu}": '\u044E'
  "\\cyrchar\\cyryu ": '\u044E'
  "{\\cyrchar\\cyrya}": '\u044F'
  "\\cyrchar\\cyrya ": '\u044F'
  "{\\cyrchar\\cyryo}": '\u0451'
  "\\cyrchar\\cyryo ": '\u0451'
  "{\\cyrchar\\cyrdje}": '\u0452'
  "\\cyrchar\\cyrdje ": '\u0452'
  "\\cyrchar{\\'\\cyrg}": '\u0453'
  "{\\cyrchar\\cyrie}": '\u0454'
  "\\cyrchar\\cyrie ": '\u0454'
  "{\\cyrchar\\cyrdze}": '\u0455'
  "\\cyrchar\\cyrdze ": '\u0455'
  "{\\cyrchar\\cyrii}": '\u0456'
  "\\cyrchar\\cyrii ": '\u0456'
  "{\\cyrchar\\cyryi}": '\u0457'
  "\\cyrchar\\cyryi ": '\u0457'
  "{\\cyrchar\\cyrje}": '\u0458'
  "\\cyrchar\\cyrje ": '\u0458'
  "{\\cyrchar\\cyrlje}": '\u0459'
  "\\cyrchar\\cyrlje ": '\u0459'
  "{\\cyrchar\\cyrnje}": '\u045A'
  "\\cyrchar\\cyrnje ": '\u045A'
  "{\\cyrchar\\cyrtshe}": '\u045B'
  "\\cyrchar\\cyrtshe ": '\u045B'
  "\\cyrchar{\\'\\cyrk}": '\u045C'
  "{\\cyrchar\\cyrushrt}": '\u045E'
  "\\cyrchar\\cyrushrt ": '\u045E'
  "{\\cyrchar\\cyrdzhe}": '\u045F'
  "\\cyrchar\\cyrdzhe ": '\u045F'
  "{\\cyrchar\\CYROMEGA}": '\u0460'
  "\\cyrchar\\CYROMEGA ": '\u0460'
  "{\\cyrchar\\cyromega}": '\u0461'
  "\\cyrchar\\cyromega ": '\u0461'
  "{\\cyrchar\\CYRYAT}": '\u0462'
  "\\cyrchar\\CYRYAT ": '\u0462'
  "{\\cyrchar\\CYRIOTE}": '\u0464'
  "\\cyrchar\\CYRIOTE ": '\u0464'
  "{\\cyrchar\\cyriote}": '\u0465'
  "\\cyrchar\\cyriote ": '\u0465'
  "{\\cyrchar\\CYRLYUS}": '\u0466'
  "\\cyrchar\\CYRLYUS ": '\u0466'
  "{\\cyrchar\\cyrlyus}": '\u0467'
  "\\cyrchar\\cyrlyus ": '\u0467'
  "{\\cyrchar\\CYRIOTLYUS}": '\u0468'
  "\\cyrchar\\CYRIOTLYUS ": '\u0468'
  "{\\cyrchar\\cyriotlyus}": '\u0469'
  "\\cyrchar\\cyriotlyus ": '\u0469'
  "{\\cyrchar\\CYRBYUS}": '\u046A'
  "\\cyrchar\\CYRBYUS ": '\u046A'
  "{\\cyrchar\\CYRIOTBYUS}": '\u046C'
  "\\cyrchar\\CYRIOTBYUS ": '\u046C'
  "{\\cyrchar\\cyriotbyus}": '\u046D'
  "\\cyrchar\\cyriotbyus ": '\u046D'
  "{\\cyrchar\\CYRKSI}": '\u046E'
  "\\cyrchar\\CYRKSI ": '\u046E'
  "{\\cyrchar\\cyrksi}": '\u046F'
  "\\cyrchar\\cyrksi ": '\u046F'
  "{\\cyrchar\\CYRPSI}": '\u0470'
  "\\cyrchar\\CYRPSI ": '\u0470'
  "{\\cyrchar\\cyrpsi}": '\u0471'
  "\\cyrchar\\cyrpsi ": '\u0471'
  "{\\cyrchar\\CYRFITA}": '\u0472'
  "\\cyrchar\\CYRFITA ": '\u0472'
  "{\\cyrchar\\CYRIZH}": '\u0474'
  "\\cyrchar\\CYRIZH ": '\u0474'
  "{\\cyrchar\\CYRUK}": '\u0478'
  "\\cyrchar\\CYRUK ": '\u0478'
  "{\\cyrchar\\cyruk}": '\u0479'
  "\\cyrchar\\cyruk ": '\u0479'
  "{\\cyrchar\\CYROMEGARND}": '\u047A'
  "\\cyrchar\\CYROMEGARND ": '\u047A'
  "{\\cyrchar\\cyromegarnd}": '\u047B'
  "\\cyrchar\\cyromegarnd ": '\u047B'
  "{\\cyrchar\\CYROMEGATITLO}": '\u047C'
  "\\cyrchar\\CYROMEGATITLO ": '\u047C'
  "{\\cyrchar\\cyromegatitlo}": '\u047D'
  "\\cyrchar\\cyromegatitlo ": '\u047D'
  "{\\cyrchar\\CYROT}": '\u047E'
  "\\cyrchar\\CYROT ": '\u047E'
  "{\\cyrchar\\cyrot}": '\u047F'
  "\\cyrchar\\cyrot ": '\u047F'
  "{\\cyrchar\\CYRKOPPA}": '\u0480'
  "\\cyrchar\\CYRKOPPA ": '\u0480'
  "{\\cyrchar\\cyrkoppa}": '\u0481'
  "\\cyrchar\\cyrkoppa ": '\u0481'
  "{\\cyrchar\\cyrthousands}": '\u0482'
  "\\cyrchar\\cyrthousands ": '\u0482'
  "{\\cyrchar\\cyrhundredthousands}": '\u0488'
  "\\cyrchar\\cyrhundredthousands ": '\u0488'
  "{\\cyrchar\\cyrmillions}": '\u0489'
  "\\cyrchar\\cyrmillions ": '\u0489'
  "{\\cyrchar\\CYRSEMISFTSN}": '\u048C'
  "\\cyrchar\\CYRSEMISFTSN ": '\u048C'
  "{\\cyrchar\\cyrsemisftsn}": '\u048D'
  "\\cyrchar\\cyrsemisftsn ": '\u048D'
  "{\\cyrchar\\CYRRTICK}": '\u048E'
  "\\cyrchar\\CYRRTICK ": '\u048E'
  "{\\cyrchar\\cyrrtick}": '\u048F'
  "\\cyrchar\\cyrrtick ": '\u048F'
  "{\\cyrchar\\CYRGUP}": '\u0490'
  "\\cyrchar\\CYRGUP ": '\u0490'
  "{\\cyrchar\\cyrgup}": '\u0491'
  "\\cyrchar\\cyrgup ": '\u0491'
  "{\\cyrchar\\CYRGHCRS}": '\u0492'
  "\\cyrchar\\CYRGHCRS ": '\u0492'
  "{\\cyrchar\\cyrghcrs}": '\u0493'
  "\\cyrchar\\cyrghcrs ": '\u0493'
  "{\\cyrchar\\CYRGHK}": '\u0494'
  "\\cyrchar\\CYRGHK ": '\u0494'
  "{\\cyrchar\\cyrghk}": '\u0495'
  "\\cyrchar\\cyrghk ": '\u0495'
  "{\\cyrchar\\CYRZHDSC}": '\u0496'
  "\\cyrchar\\CYRZHDSC ": '\u0496'
  "{\\cyrchar\\cyrzhdsc}": '\u0497'
  "\\cyrchar\\cyrzhdsc ": '\u0497'
  "{\\cyrchar\\CYRZDSC}": '\u0498'
  "\\cyrchar\\CYRZDSC ": '\u0498'
  "{\\cyrchar\\cyrzdsc}": '\u0499'
  "\\cyrchar\\cyrzdsc ": '\u0499'
  "{\\cyrchar\\CYRKDSC}": '\u049A'
  "\\cyrchar\\CYRKDSC ": '\u049A'
  "{\\cyrchar\\cyrkdsc}": '\u049B'
  "\\cyrchar\\cyrkdsc ": '\u049B'
  "{\\cyrchar\\CYRKVCRS}": '\u049C'
  "\\cyrchar\\CYRKVCRS ": '\u049C'
  "{\\cyrchar\\cyrkvcrs}": '\u049D'
  "\\cyrchar\\cyrkvcrs ": '\u049D'
  "{\\cyrchar\\CYRKHCRS}": '\u049E'
  "\\cyrchar\\CYRKHCRS ": '\u049E'
  "{\\cyrchar\\cyrkhcrs}": '\u049F'
  "\\cyrchar\\cyrkhcrs ": '\u049F'
  "{\\cyrchar\\CYRKBEAK}": '\u04A0'
  "\\cyrchar\\CYRKBEAK ": '\u04A0'
  "{\\cyrchar\\cyrkbeak}": '\u04A1'
  "\\cyrchar\\cyrkbeak ": '\u04A1'
  "{\\cyrchar\\CYRNDSC}": '\u04A2'
  "\\cyrchar\\CYRNDSC ": '\u04A2'
  "{\\cyrchar\\cyrndsc}": '\u04A3'
  "\\cyrchar\\cyrndsc ": '\u04A3'
  "{\\cyrchar\\CYRNG}": '\u04A4'
  "\\cyrchar\\CYRNG ": '\u04A4'
  "{\\cyrchar\\cyrng}": '\u04A5'
  "\\cyrchar\\cyrng ": '\u04A5'
  "{\\cyrchar\\CYRPHK}": '\u04A6'
  "\\cyrchar\\CYRPHK ": '\u04A6'
  "{\\cyrchar\\cyrphk}": '\u04A7'
  "\\cyrchar\\cyrphk ": '\u04A7'
  "{\\cyrchar\\CYRABHHA}": '\u04A8'
  "\\cyrchar\\CYRABHHA ": '\u04A8'
  "{\\cyrchar\\cyrabhha}": '\u04A9'
  "\\cyrchar\\cyrabhha ": '\u04A9'
  "{\\cyrchar\\CYRSDSC}": '\u04AA'
  "\\cyrchar\\CYRSDSC ": '\u04AA'
  "{\\cyrchar\\cyrsdsc}": '\u04AB'
  "\\cyrchar\\cyrsdsc ": '\u04AB'
  "{\\cyrchar\\CYRTDSC}": '\u04AC'
  "\\cyrchar\\CYRTDSC ": '\u04AC'
  "{\\cyrchar\\cyrtdsc}": '\u04AD'
  "\\cyrchar\\cyrtdsc ": '\u04AD'
  "{\\cyrchar\\CYRY}": '\u04AE'
  "\\cyrchar\\CYRY ": '\u04AE'
  "{\\cyrchar\\cyry}": '\u04AF'
  "\\cyrchar\\cyry ": '\u04AF'
  "{\\cyrchar\\CYRYHCRS}": '\u04B0'
  "\\cyrchar\\CYRYHCRS ": '\u04B0'
  "{\\cyrchar\\cyryhcrs}": '\u04B1'
  "\\cyrchar\\cyryhcrs ": '\u04B1'
  "{\\cyrchar\\CYRHDSC}": '\u04B2'
  "\\cyrchar\\CYRHDSC ": '\u04B2'
  "{\\cyrchar\\cyrhdsc}": '\u04B3'
  "\\cyrchar\\cyrhdsc ": '\u04B3'
  "{\\cyrchar\\CYRTETSE}": '\u04B4'
  "\\cyrchar\\CYRTETSE ": '\u04B4'
  "{\\cyrchar\\cyrtetse}": '\u04B5'
  "\\cyrchar\\cyrtetse ": '\u04B5'
  "{\\cyrchar\\CYRCHRDSC}": '\u04B6'
  "\\cyrchar\\CYRCHRDSC ": '\u04B6'
  "{\\cyrchar\\cyrchrdsc}": '\u04B7'
  "\\cyrchar\\cyrchrdsc ": '\u04B7'
  "{\\cyrchar\\CYRCHVCRS}": '\u04B8'
  "\\cyrchar\\CYRCHVCRS ": '\u04B8'
  "{\\cyrchar\\cyrchvcrs}": '\u04B9'
  "\\cyrchar\\cyrchvcrs ": '\u04B9'
  "{\\cyrchar\\CYRSHHA}": '\u04BA'
  "\\cyrchar\\CYRSHHA ": '\u04BA'
  "{\\cyrchar\\cyrshha}": '\u04BB'
  "\\cyrchar\\cyrshha ": '\u04BB'
  "{\\cyrchar\\CYRABHCH}": '\u04BC'
  "\\cyrchar\\CYRABHCH ": '\u04BC'
  "{\\cyrchar\\cyrabhch}": '\u04BD'
  "\\cyrchar\\cyrabhch ": '\u04BD'
  "{\\cyrchar\\CYRABHCHDSC}": '\u04BE'
  "\\cyrchar\\CYRABHCHDSC ": '\u04BE'
  "{\\cyrchar\\cyrabhchdsc}": '\u04BF'
  "\\cyrchar\\cyrabhchdsc ": '\u04BF'
  "{\\cyrchar\\CYRpalochka}": '\u04C0'
  "\\cyrchar\\CYRpalochka ": '\u04C0'
  "{\\cyrchar\\CYRKHK}": '\u04C3'
  "\\cyrchar\\CYRKHK ": '\u04C3'
  "{\\cyrchar\\cyrkhk}": '\u04C4'
  "\\cyrchar\\cyrkhk ": '\u04C4'
  "{\\cyrchar\\CYRNHK}": '\u04C7'
  "\\cyrchar\\CYRNHK ": '\u04C7'
  "{\\cyrchar\\cyrnhk}": '\u04C8'
  "\\cyrchar\\cyrnhk ": '\u04C8'
  "{\\cyrchar\\CYRCHLDSC}": '\u04CB'
  "\\cyrchar\\CYRCHLDSC ": '\u04CB'
  "{\\cyrchar\\cyrchldsc}": '\u04CC'
  "\\cyrchar\\cyrchldsc ": '\u04CC'
  "{\\cyrchar\\CYRAE}": '\u04D4'
  "\\cyrchar\\CYRAE ": '\u04D4'
  "{\\cyrchar\\cyrae}": '\u04D5'
  "\\cyrchar\\cyrae ": '\u04D5'
  "{\\cyrchar\\CYRSCHWA}": '\u04D8'
  "\\cyrchar\\CYRSCHWA ": '\u04D8'
  "{\\cyrchar\\cyrschwa}": '\u04D9'
  "\\cyrchar\\cyrschwa ": '\u04D9'
  "{\\cyrchar\\CYRABHDZE}": '\u04E0'
  "\\cyrchar\\CYRABHDZE ": '\u04E0'
  "{\\cyrchar\\cyrabhdze}": '\u04E1'
  "\\cyrchar\\cyrabhdze ": '\u04E1'
  "{\\cyrchar\\CYROTLD}": '\u04E8'
  "\\cyrchar\\CYROTLD ": '\u04E8'
  "{\\cyrchar\\cyrotld}": '\u04E9'
  "\\cyrchar\\cyrotld ": '\u04E9'
  "\\hspace{0.6em}": '\u2002'
  "\\hspace{1em}": '\u2003'
  "\\hspace{0.33em}": '\u2004'
  "\\hspace{0.25em}": '\u2005'
  "\\hspace{0.166em}": '\u2006'
  "\\hphantom{0}": '\u2007'
  "\\hphantom{,}": '\u2008'
  "\\hspace{0.167em}": '\u2009'
  "{\\mkern1mu}": '\u200A'
  "\\mkern1mu ": '\u200A'
  "-": '\u2010'
  "{\\textendash}": '\u2013'
  "\\textendash ": '\u2013'
  "{\\textemdash}": '\u2014'
  "\\textemdash ": '\u2014'
  "\\rule{1em}{1pt}": '\u2015'
  "{\\Vert}": '\u2016'
  "\\Vert ": '\u2016'
  "`": '\u2018'
  ",": '\u201A'
  "{\\Elzreapos}": '\u201B'
  "\\Elzreapos ": '\u201B'
  "{\\textquotedblleft}": '\u201C'
  "\\textquotedblleft ": '\u201C'
  "{\\textquotedblright}": '\u201D'
  "\\textquotedblright ": '\u201D'
  ",,": '\u201E'
  "{\\textdagger}": '\u2020'
  "\\textdagger ": '\u2020'
  "{\\textdaggerdbl}": '\u2021'
  "\\textdaggerdbl ": '\u2021'
  "{\\textbullet}": '\u2022'
  "\\textbullet ": '\u2022'
  ".": '\u2024'
  "..": '\u2025'
  "{\\ldots}": '\u2026'
  "\\ldots ": '\u2026'
  "{\\textperthousand}": '\u2030'
  "\\textperthousand ": '\u2030'
  "{\\textpertenthousand}": '\u2031'
  "\\textpertenthousand ": '\u2031'
  "{'}": '\u2032'
  "{''}": '\u2033'
  "{'''}": '\u2034'
  "{\\backprime}": '\u2035'
  "\\backprime ": '\u2035'
  "{\\guilsinglleft}": '\u2039'
  "\\guilsinglleft ": '\u2039'
  "{\\guilsinglright}": '\u203A'
  "\\guilsinglright ": '\u203A'
  "''''": '\u2057'
  "{\\mkern4mu}": '\u205F'
  "\\mkern4mu ": '\u205F'
  "{\\nolinebreak}": '\u2060'
  "\\nolinebreak ": '\u2060'
  "\\ensuremath{\\Elzpes}": '\u20A7'
  "{\\mbox{\\texteuro}}": '\u20AC'
  "\\mbox{\\texteuro} ": '\u20AC'
  "{\\dddot}": '\u20DB'
  "\\dddot ": '\u20DB'
  "{\\ddddot}": '\u20DC'
  "\\ddddot ": '\u20DC'
  "\\mathbb{C}": '\u2102'
  "\\mathscr{g}": '\u210A'
  "\\mathscr{H}": '\u210B'
  "\\mathfrak{H}": '\u210C'
  "\\mathbb{H}": '\u210D'
  "{\\hslash}": '\u210F'
  "\\hslash ": '\u210F'
  "\\mathscr{I}": '\u2110'
  "\\mathfrak{I}": '\u2111'
  "\\mathscr{L}": '\u2112'
  "\\mathscr{l}": '\u2113'
  "\\mathbb{N}": '\u2115'
  "{\\cyrchar\\textnumero}": '\u2116'
  "\\cyrchar\\textnumero ": '\u2116'
  "{\\wp}": '\u2118'
  "\\wp ": '\u2118'
  "\\mathbb{P}": '\u2119'
  "\\mathbb{Q}": '\u211A'
  "\\mathscr{R}": '\u211B'
  "\\mathfrak{R}": '\u211C'
  "\\mathbb{R}": '\u211D'
  "{\\Elzxrat}": '\u211E'
  "\\Elzxrat ": '\u211E'
  "{\\texttrademark}": '\u2122'
  "\\texttrademark ": '\u2122'
  "\\mathbb{Z}": '\u2124'
  "{\\mho}": '\u2127'
  "\\mho ": '\u2127'
  "\\mathfrak{Z}": '\u2128'
  "\\ElsevierGlyph{2129}": '\u2129'
  "\\mathscr{B}": '\u212C'
  "\\mathfrak{C}": '\u212D'
  "\\mathscr{e}": '\u212F'
  "\\mathscr{E}": '\u2130'
  "\\mathscr{F}": '\u2131'
  "\\mathscr{M}": '\u2133'
  "\\mathscr{o}": '\u2134'
  "{\\aleph}": '\u2135'
  "\\aleph ": '\u2135'
  "{\\beth}": '\u2136'
  "\\beth ": '\u2136'
  "{\\gimel}": '\u2137'
  "\\gimel ": '\u2137'
  "{\\daleth}": '\u2138'
  "\\daleth ": '\u2138'
  "\\textfrac{1}{3}": '\u2153'
  "\\textfrac{2}{3}": '\u2154'
  "\\textfrac{1}{5}": '\u2155'
  "\\textfrac{2}{5}": '\u2156'
  "\\textfrac{3}{5}": '\u2157'
  "\\textfrac{4}{5}": '\u2158'
  "\\textfrac{1}{6}": '\u2159'
  "\\textfrac{5}{6}": '\u215A'
  "\\textfrac{1}{8}": '\u215B'
  "\\textfrac{3}{8}": '\u215C'
  "\\textfrac{5}{8}": '\u215D'
  "\\textfrac{7}{8}": '\u215E'
  "{\\leftarrow}": '\u2190'
  "\\leftarrow ": '\u2190'
  "{\\uparrow}": '\u2191'
  "\\uparrow ": '\u2191'
  "{\\rightarrow}": '\u2192'
  "\\rightarrow ": '\u2192'
  "{\\downarrow}": '\u2193'
  "\\downarrow ": '\u2193'
  "{\\leftrightarrow}": '\u2194'
  "\\leftrightarrow ": '\u2194'
  "{\\updownarrow}": '\u2195'
  "\\updownarrow ": '\u2195'
  "{\\nwarrow}": '\u2196'
  "\\nwarrow ": '\u2196'
  "{\\nearrow}": '\u2197'
  "\\nearrow ": '\u2197'
  "{\\searrow}": '\u2198'
  "\\searrow ": '\u2198'
  "{\\swarrow}": '\u2199'
  "\\swarrow ": '\u2199'
  "{\\nleftarrow}": '\u219A'
  "\\nleftarrow ": '\u219A'
  "{\\nrightarrow}": '\u219B'
  "\\nrightarrow ": '\u219B'
  "{\\arrowwaveright}": '\u219C'
  "\\arrowwaveright ": '\u219C'
  "{\\twoheadleftarrow}": '\u219E'
  "\\twoheadleftarrow ": '\u219E'
  "{\\twoheadrightarrow}": '\u21A0'
  "\\twoheadrightarrow ": '\u21A0'
  "{\\leftarrowtail}": '\u21A2'
  "\\leftarrowtail ": '\u21A2'
  "{\\rightarrowtail}": '\u21A3'
  "\\rightarrowtail ": '\u21A3'
  "{\\mapsto}": '\u21A6'
  "\\mapsto ": '\u21A6'
  "{\\hookleftarrow}": '\u21A9'
  "\\hookleftarrow ": '\u21A9'
  "{\\hookrightarrow}": '\u21AA'
  "\\hookrightarrow ": '\u21AA'
  "{\\looparrowleft}": '\u21AB'
  "\\looparrowleft ": '\u21AB'
  "{\\looparrowright}": '\u21AC'
  "\\looparrowright ": '\u21AC'
  "{\\leftrightsquigarrow}": '\u21AD'
  "\\leftrightsquigarrow ": '\u21AD'
  "{\\nleftrightarrow}": '\u21AE'
  "\\nleftrightarrow ": '\u21AE'
  "{\\Lsh}": '\u21B0'
  "\\Lsh ": '\u21B0'
  "{\\Rsh}": '\u21B1'
  "\\Rsh ": '\u21B1'
  "\\ElsevierGlyph{21B3}": '\u21B3'
  "{\\curvearrowleft}": '\u21B6'
  "\\curvearrowleft ": '\u21B6'
  "{\\curvearrowright}": '\u21B7'
  "\\curvearrowright ": '\u21B7'
  "{\\circlearrowleft}": '\u21BA'
  "\\circlearrowleft ": '\u21BA'
  "{\\circlearrowright}": '\u21BB'
  "\\circlearrowright ": '\u21BB'
  "{\\leftharpoonup}": '\u21BC'
  "\\leftharpoonup ": '\u21BC'
  "{\\leftharpoondown}": '\u21BD'
  "\\leftharpoondown ": '\u21BD'
  "{\\upharpoonright}": '\u21BE'
  "\\upharpoonright ": '\u21BE'
  "{\\upharpoonleft}": '\u21BF'
  "\\upharpoonleft ": '\u21BF'
  "{\\rightharpoonup}": '\u21C0'
  "\\rightharpoonup ": '\u21C0'
  "{\\rightharpoondown}": '\u21C1'
  "\\rightharpoondown ": '\u21C1'
  "{\\downharpoonright}": '\u21C2'
  "\\downharpoonright ": '\u21C2'
  "{\\downharpoonleft}": '\u21C3'
  "\\downharpoonleft ": '\u21C3'
  "{\\rightleftarrows}": '\u21C4'
  "\\rightleftarrows ": '\u21C4'
  "{\\dblarrowupdown}": '\u21C5'
  "\\dblarrowupdown ": '\u21C5'
  "{\\leftrightarrows}": '\u21C6'
  "\\leftrightarrows ": '\u21C6'
  "{\\leftleftarrows}": '\u21C7'
  "\\leftleftarrows ": '\u21C7'
  "{\\upuparrows}": '\u21C8'
  "\\upuparrows ": '\u21C8'
  "{\\rightrightarrows}": '\u21C9'
  "\\rightrightarrows ": '\u21C9'
  "{\\downdownarrows}": '\u21CA'
  "\\downdownarrows ": '\u21CA'
  "{\\leftrightharpoons}": '\u21CB'
  "\\leftrightharpoons ": '\u21CB'
  "{\\rightleftharpoons}": '\u21CC'
  "\\rightleftharpoons ": '\u21CC'
  "{\\nLeftarrow}": '\u21CD'
  "\\nLeftarrow ": '\u21CD'
  "{\\nLeftrightarrow}": '\u21CE'
  "\\nLeftrightarrow ": '\u21CE'
  "{\\nRightarrow}": '\u21CF'
  "\\nRightarrow ": '\u21CF'
  "{\\Leftarrow}": '\u21D0'
  "\\Leftarrow ": '\u21D0'
  "{\\Uparrow}": '\u21D1'
  "\\Uparrow ": '\u21D1'
  "{\\Rightarrow}": '\u21D2'
  "\\Rightarrow ": '\u21D2'
  "{\\Downarrow}": '\u21D3'
  "\\Downarrow ": '\u21D3'
  "{\\Leftrightarrow}": '\u21D4'
  "\\Leftrightarrow ": '\u21D4'
  "{\\Updownarrow}": '\u21D5'
  "\\Updownarrow ": '\u21D5'
  "{\\Lleftarrow}": '\u21DA'
  "\\Lleftarrow ": '\u21DA'
  "{\\Rrightarrow}": '\u21DB'
  "\\Rrightarrow ": '\u21DB'
  "{\\rightsquigarrow}": '\u21DD'
  "\\rightsquigarrow ": '\u21DD'
  "{\\DownArrowUpArrow}": '\u21F5'
  "\\DownArrowUpArrow ": '\u21F5'
  "{\\forall}": '\u2200'
  "\\forall ": '\u2200'
  "{\\complement}": '\u2201'
  "\\complement ": '\u2201'
  "{\\partial}": '\u2202'
  "\\partial ": '\u2202'
  "{\\exists}": '\u2203'
  "\\exists ": '\u2203'
  "{\\nexists}": '\u2204'
  "\\nexists ": '\u2204'
  "{\\varnothing}": '\u2205'
  "\\varnothing ": '\u2205'
  "{\\nabla}": '\u2207'
  "\\nabla ": '\u2207'
  "{\\in}": '\u2208'
  "\\in ": '\u2208'
  "{\\not\\in}": '\u2209'
  "\\not\\in ": '\u2209'
  "{\\ni}": '\u220B'
  "\\ni ": '\u220B'
  "{\\not\\ni}": '\u220C'
  "\\not\\ni ": '\u220C'
  "{\\prod}": '\u220F'
  "\\prod ": '\u220F'
  "{\\coprod}": '\u2210'
  "\\coprod ": '\u2210'
  "{\\sum}": '\u2211'
  "\\sum ": '\u2211'
  "{\\mp}": '\u2213'
  "\\mp ": '\u2213'
  "{\\dotplus}": '\u2214'
  "\\dotplus ": '\u2214'
  "{\\setminus}": '\u2216'
  "\\setminus ": '\u2216'
  "{_\\ast}": '\u2217'
  "{\\circ}": '\u2218'
  "\\circ ": '\u2218'
  "{\\bullet}": '\u2219'
  "\\bullet ": '\u2219'
  "{\\surd}": '\u221A'
  "\\surd ": '\u221A'
  "{\\propto}": '\u221D'
  "\\propto ": '\u221D'
  "{\\infty}": '\u221E'
  "\\infty ": '\u221E'
  "{\\rightangle}": '\u221F'
  "\\rightangle ": '\u221F'
  "{\\angle}": '\u2220'
  "\\angle ": '\u2220'
  "{\\measuredangle}": '\u2221'
  "\\measuredangle ": '\u2221'
  "{\\sphericalangle}": '\u2222'
  "\\sphericalangle ": '\u2222'
  "{\\mid}": '\u2223'
  "\\mid ": '\u2223'
  "{\\nmid}": '\u2224'
  "\\nmid ": '\u2224'
  "{\\parallel}": '\u2225'
  "\\parallel ": '\u2225'
  "{\\nparallel}": '\u2226'
  "\\nparallel ": '\u2226'
  "{\\wedge}": '\u2227'
  "\\wedge ": '\u2227'
  "{\\vee}": '\u2228'
  "\\vee ": '\u2228'
  "{\\cap}": '\u2229'
  "\\cap ": '\u2229'
  "{\\cup}": '\u222A'
  "\\cup ": '\u222A'
  "{\\int}": '\u222B'
  "\\int ": '\u222B'
  "{\\int\\!\\int}": '\u222C'
  "\\int\\!\\int ": '\u222C'
  "{\\int\\!\\int\\!\\int}": '\u222D'
  "\\int\\!\\int\\!\\int ": '\u222D'
  "{\\oint}": '\u222E'
  "\\oint ": '\u222E'
  "{\\surfintegral}": '\u222F'
  "\\surfintegral ": '\u222F'
  "{\\volintegral}": '\u2230'
  "\\volintegral ": '\u2230'
  "{\\clwintegral}": '\u2231'
  "\\clwintegral ": '\u2231'
  "\\ElsevierGlyph{2232}": '\u2232'
  "\\ElsevierGlyph{2233}": '\u2233'
  "{\\therefore}": '\u2234'
  "\\therefore ": '\u2234'
  "{\\because}": '\u2235'
  "\\because ": '\u2235'
  "{\\Colon}": '\u2237'
  "\\Colon ": '\u2237'
  "\\ElsevierGlyph{2238}": '\u2238'
  "\\mathbin{{:}\\!\\!{-}\\!\\!{:}}": '\u223A'
  "{\\homothetic}": '\u223B'
  "\\homothetic ": '\u223B'
  "{\\sim}": '\u223C'
  "\\sim ": '\u223C'
  "{\\backsim}": '\u223D'
  "\\backsim ": '\u223D'
  "{\\lazysinv}": '\u223E'
  "\\lazysinv ": '\u223E'
  "{\\wr}": '\u2240'
  "\\wr ": '\u2240'
  "{\\not\\sim}": '\u2241'
  "\\not\\sim ": '\u2241'
  "\\ElsevierGlyph{2242}": '\u2242'
  "{\\simeq}": '\u2243'
  "\\simeq ": '\u2243'
  "{\\not\\simeq}": '\u2244'
  "\\not\\simeq ": '\u2244'
  "{\\cong}": '\u2245'
  "\\cong ": '\u2245'
  "{\\approxnotequal}": '\u2246'
  "\\approxnotequal ": '\u2246'
  "{\\not\\cong}": '\u2247'
  "\\not\\cong ": '\u2247'
  "{\\approx}": '\u2248'
  "\\approx ": '\u2248'
  "{\\not\\approx}": '\u2249'
  "\\not\\approx ": '\u2249'
  "{\\approxeq}": '\u224A'
  "\\approxeq ": '\u224A'
  "{\\tildetrpl}": '\u224B'
  "\\tildetrpl ": '\u224B'
  "{\\allequal}": '\u224C'
  "\\allequal ": '\u224C'
  "{\\asymp}": '\u224D'
  "\\asymp ": '\u224D'
  "{\\Bumpeq}": '\u224E'
  "\\Bumpeq ": '\u224E'
  "{\\bumpeq}": '\u224F'
  "\\bumpeq ": '\u224F'
  "{\\doteq}": '\u2250'
  "\\doteq ": '\u2250'
  "{\\doteqdot}": '\u2251'
  "\\doteqdot ": '\u2251'
  "{\\fallingdotseq}": '\u2252'
  "\\fallingdotseq ": '\u2252'
  "{\\risingdotseq}": '\u2253'
  "\\risingdotseq ": '\u2253'
  ":=": '\u2254'
  "=:": '\u2255'
  "{\\eqcirc}": '\u2256'
  "\\eqcirc ": '\u2256'
  "{\\circeq}": '\u2257'
  "\\circeq ": '\u2257'
  "{\\estimates}": '\u2259'
  "\\estimates ": '\u2259'
  "\\ElsevierGlyph{225A}": '\u225A'
  "{\\starequal}": '\u225B'
  "\\starequal ": '\u225B'
  "{\\triangleq}": '\u225C'
  "\\triangleq ": '\u225C'
  "\\ElsevierGlyph{225F}": '\u225F'
  "\\not =": '\u2260'
  "{\\equiv}": '\u2261'
  "\\equiv ": '\u2261'
  "{\\not\\equiv}": '\u2262'
  "\\not\\equiv ": '\u2262'
  "{\\leq}": '\u2264'
  "\\leq ": '\u2264'
  "{\\geq}": '\u2265'
  "\\geq ": '\u2265'
  "{\\leqq}": '\u2266'
  "\\leqq ": '\u2266'
  "{\\geqq}": '\u2267'
  "\\geqq ": '\u2267'
  "{\\lneqq}": '\u2268'
  "\\lneqq ": '\u2268'
  "{\\gneqq}": '\u2269'
  "\\gneqq ": '\u2269'
  "{\\ll}": '\u226A'
  "\\ll ": '\u226A'
  "{\\gg}": '\u226B'
  "\\gg ": '\u226B'
  "{\\between}": '\u226C'
  "\\between ": '\u226C'
  "{\\not\\kern-0.3em\\times}": '\u226D'
  "\\not\\kern-0.3em\\times ": '\u226D'
  "\\not<": '\u226E'
  "\\not>": '\u226F'
  "{\\not\\leq}": '\u2270'
  "\\not\\leq ": '\u2270'
  "{\\not\\geq}": '\u2271'
  "\\not\\geq ": '\u2271'
  "{\\lessequivlnt}": '\u2272'
  "\\lessequivlnt ": '\u2272'
  "{\\greaterequivlnt}": '\u2273'
  "\\greaterequivlnt ": '\u2273'
  "\\ElsevierGlyph{2274}": '\u2274'
  "\\ElsevierGlyph{2275}": '\u2275'
  "{\\lessgtr}": '\u2276'
  "\\lessgtr ": '\u2276'
  "{\\gtrless}": '\u2277'
  "\\gtrless ": '\u2277'
  "{\\notlessgreater}": '\u2278'
  "\\notlessgreater ": '\u2278'
  "{\\notgreaterless}": '\u2279'
  "\\notgreaterless ": '\u2279'
  "{\\prec}": '\u227A'
  "\\prec ": '\u227A'
  "{\\succ}": '\u227B'
  "\\succ ": '\u227B'
  "{\\preccurlyeq}": '\u227C'
  "\\preccurlyeq ": '\u227C'
  "{\\succcurlyeq}": '\u227D'
  "\\succcurlyeq ": '\u227D'
  "{\\precapprox}": '\u227E'
  "\\precapprox ": '\u227E'
  "{\\succapprox}": '\u227F'
  "\\succapprox ": '\u227F'
  "{\\not\\prec}": '\u2280'
  "\\not\\prec ": '\u2280'
  "{\\not\\succ}": '\u2281'
  "\\not\\succ ": '\u2281'
  "{\\subset}": '\u2282'
  "\\subset ": '\u2282'
  "{\\supset}": '\u2283'
  "\\supset ": '\u2283'
  "{\\not\\subset}": '\u2284'
  "\\not\\subset ": '\u2284'
  "{\\not\\supset}": '\u2285'
  "\\not\\supset ": '\u2285'
  "{\\subseteq}": '\u2286'
  "\\subseteq ": '\u2286'
  "{\\supseteq}": '\u2287'
  "\\supseteq ": '\u2287'
  "{\\not\\subseteq}": '\u2288'
  "\\not\\subseteq ": '\u2288'
  "{\\not\\supseteq}": '\u2289'
  "\\not\\supseteq ": '\u2289'
  "{\\subsetneq}": '\u228A'
  "\\subsetneq ": '\u228A'
  "{\\supsetneq}": '\u228B'
  "\\supsetneq ": '\u228B'
  "{\\uplus}": '\u228E'
  "\\uplus ": '\u228E'
  "{\\sqsubset}": '\u228F'
  "\\sqsubset ": '\u228F'
  "{\\sqsupset}": '\u2290'
  "\\sqsupset ": '\u2290'
  "{\\sqsubseteq}": '\u2291'
  "\\sqsubseteq ": '\u2291'
  "{\\sqsupseteq}": '\u2292'
  "\\sqsupseteq ": '\u2292'
  "{\\sqcap}": '\u2293'
  "\\sqcap ": '\u2293'
  "{\\sqcup}": '\u2294'
  "\\sqcup ": '\u2294'
  "{\\oplus}": '\u2295'
  "\\oplus ": '\u2295'
  "{\\ominus}": '\u2296'
  "\\ominus ": '\u2296'
  "{\\otimes}": '\u2297'
  "\\otimes ": '\u2297'
  "{\\oslash}": '\u2298'
  "\\oslash ": '\u2298'
  "{\\odot}": '\u2299'
  "\\odot ": '\u2299'
  "{\\circledcirc}": '\u229A'
  "\\circledcirc ": '\u229A'
  "{\\circledast}": '\u229B'
  "\\circledast ": '\u229B'
  "{\\circleddash}": '\u229D'
  "\\circleddash ": '\u229D'
  "{\\boxplus}": '\u229E'
  "\\boxplus ": '\u229E'
  "{\\boxminus}": '\u229F'
  "\\boxminus ": '\u229F'
  "{\\boxtimes}": '\u22A0'
  "\\boxtimes ": '\u22A0'
  "{\\boxdot}": '\u22A1'
  "\\boxdot ": '\u22A1'
  "{\\vdash}": '\u22A2'
  "\\vdash ": '\u22A2'
  "{\\dashv}": '\u22A3'
  "\\dashv ": '\u22A3'
  "{\\top}": '\u22A4'
  "\\top ": '\u22A4'
  "{\\perp}": '\u22A5'
  "\\perp ": '\u22A5'
  "{\\truestate}": '\u22A7'
  "\\truestate ": '\u22A7'
  "{\\forcesextra}": '\u22A8'
  "\\forcesextra ": '\u22A8'
  "{\\Vdash}": '\u22A9'
  "\\Vdash ": '\u22A9'
  "{\\Vvdash}": '\u22AA'
  "\\Vvdash ": '\u22AA'
  "{\\VDash}": '\u22AB'
  "\\VDash ": '\u22AB'
  "{\\nvdash}": '\u22AC'
  "\\nvdash ": '\u22AC'
  "{\\nvDash}": '\u22AD'
  "\\nvDash ": '\u22AD'
  "{\\nVdash}": '\u22AE'
  "\\nVdash ": '\u22AE'
  "{\\nVDash}": '\u22AF'
  "\\nVDash ": '\u22AF'
  "{\\vartriangleleft}": '\u22B2'
  "\\vartriangleleft ": '\u22B2'
  "{\\vartriangleright}": '\u22B3'
  "\\vartriangleright ": '\u22B3'
  "{\\trianglelefteq}": '\u22B4'
  "\\trianglelefteq ": '\u22B4'
  "{\\trianglerighteq}": '\u22B5'
  "\\trianglerighteq ": '\u22B5'
  "{\\original}": '\u22B6'
  "\\original ": '\u22B6'
  "{\\image}": '\u22B7'
  "\\image ": '\u22B7'
  "{\\multimap}": '\u22B8'
  "\\multimap ": '\u22B8'
  "{\\hermitconjmatrix}": '\u22B9'
  "\\hermitconjmatrix ": '\u22B9'
  "{\\intercal}": '\u22BA'
  "\\intercal ": '\u22BA'
  "{\\veebar}": '\u22BB'
  "\\veebar ": '\u22BB'
  "{\\rightanglearc}": '\u22BE'
  "\\rightanglearc ": '\u22BE'
  "\\ElsevierGlyph{22C0}": '\u22C0'
  "\\ElsevierGlyph{22C1}": '\u22C1'
  "{\\bigcap}": '\u22C2'
  "\\bigcap ": '\u22C2'
  "{\\bigcup}": '\u22C3'
  "\\bigcup ": '\u22C3'
  "{\\diamond}": '\u22C4'
  "\\diamond ": '\u22C4'
  "{\\star}": '\u22C6'
  "\\star ": '\u22C6'
  "{\\divideontimes}": '\u22C7'
  "\\divideontimes ": '\u22C7'
  "{\\bowtie}": '\u22C8'
  "\\bowtie ": '\u22C8'
  "{\\ltimes}": '\u22C9'
  "\\ltimes ": '\u22C9'
  "{\\rtimes}": '\u22CA'
  "\\rtimes ": '\u22CA'
  "{\\leftthreetimes}": '\u22CB'
  "\\leftthreetimes ": '\u22CB'
  "{\\rightthreetimes}": '\u22CC'
  "\\rightthreetimes ": '\u22CC'
  "{\\backsimeq}": '\u22CD'
  "\\backsimeq ": '\u22CD'
  "{\\curlyvee}": '\u22CE'
  "\\curlyvee ": '\u22CE'
  "{\\curlywedge}": '\u22CF'
  "\\curlywedge ": '\u22CF'
  "{\\Subset}": '\u22D0'
  "\\Subset ": '\u22D0'
  "{\\Supset}": '\u22D1'
  "\\Supset ": '\u22D1'
  "{\\Cap}": '\u22D2'
  "\\Cap ": '\u22D2'
  "{\\Cup}": '\u22D3'
  "\\Cup ": '\u22D3'
  "{\\pitchfork}": '\u22D4'
  "\\pitchfork ": '\u22D4'
  "{\\lessdot}": '\u22D6'
  "\\lessdot ": '\u22D6'
  "{\\gtrdot}": '\u22D7'
  "\\gtrdot ": '\u22D7'
  "{\\verymuchless}": '\u22D8'
  "\\verymuchless ": '\u22D8'
  "{\\verymuchgreater}": '\u22D9'
  "\\verymuchgreater ": '\u22D9'
  "{\\lesseqgtr}": '\u22DA'
  "\\lesseqgtr ": '\u22DA'
  "{\\gtreqless}": '\u22DB'
  "\\gtreqless ": '\u22DB'
  "{\\curlyeqprec}": '\u22DE'
  "\\curlyeqprec ": '\u22DE'
  "{\\curlyeqsucc}": '\u22DF'
  "\\curlyeqsucc ": '\u22DF'
  "{\\not\\sqsubseteq}": '\u22E2'
  "\\not\\sqsubseteq ": '\u22E2'
  "{\\not\\sqsupseteq}": '\u22E3'
  "\\not\\sqsupseteq ": '\u22E3'
  "{\\Elzsqspne}": '\u22E5'
  "\\Elzsqspne ": '\u22E5'
  "{\\lnsim}": '\u22E6'
  "\\lnsim ": '\u22E6'
  "{\\gnsim}": '\u22E7'
  "\\gnsim ": '\u22E7'
  "{\\precedesnotsimilar}": '\u22E8'
  "\\precedesnotsimilar ": '\u22E8'
  "{\\succnsim}": '\u22E9'
  "\\succnsim ": '\u22E9'
  "{\\ntriangleleft}": '\u22EA'
  "\\ntriangleleft ": '\u22EA'
  "{\\ntriangleright}": '\u22EB'
  "\\ntriangleright ": '\u22EB'
  "{\\ntrianglelefteq}": '\u22EC'
  "\\ntrianglelefteq ": '\u22EC'
  "{\\ntrianglerighteq}": '\u22ED'
  "\\ntrianglerighteq ": '\u22ED'
  "{\\vdots}": '\u22EE'
  "\\vdots ": '\u22EE'
  "{\\cdots}": '\u22EF'
  "\\cdots ": '\u22EF'
  "{\\upslopeellipsis}": '\u22F0'
  "\\upslopeellipsis ": '\u22F0'
  "{\\downslopeellipsis}": '\u22F1'
  "\\downslopeellipsis ": '\u22F1'
  "{\\barwedge}": '\u2305'
  "\\barwedge ": '\u2305'
  "{\\perspcorrespond}": '\u2306'
  "\\perspcorrespond ": '\u2306'
  "{\\lceil}": '\u2308'
  "\\lceil ": '\u2308'
  "{\\rceil}": '\u2309'
  "\\rceil ": '\u2309'
  "{\\lfloor}": '\u230A'
  "\\lfloor ": '\u230A'
  "{\\rfloor}": '\u230B'
  "\\rfloor ": '\u230B'
  "{\\recorder}": '\u2315'
  "\\recorder ": '\u2315'
  "\\mathchar\"2208": '\u2316'
  "{\\ulcorner}": '\u231C'
  "\\ulcorner ": '\u231C'
  "{\\urcorner}": '\u231D'
  "\\urcorner ": '\u231D'
  "{\\llcorner}": '\u231E'
  "\\llcorner ": '\u231E'
  "{\\lrcorner}": '\u231F'
  "\\lrcorner ": '\u231F'
  "{\\frown}": '\u2322'
  "\\frown ": '\u2322'
  "{\\smile}": '\u2323'
  "\\smile ": '\u2323'
  "\\ElsevierGlyph{E838}": '\u233D'
  "{\\Elzdlcorn}": '\u23A3'
  "\\Elzdlcorn ": '\u23A3'
  "{\\lmoustache}": '\u23B0'
  "\\lmoustache ": '\u23B0'
  "{\\rmoustache}": '\u23B1'
  "\\rmoustache ": '\u23B1'
  "{\\textvisiblespace}": '\u2423'
  "\\textvisiblespace ": '\u2423'
  "\\ding{172}": '\u2460'
  "\\ding{173}": '\u2461'
  "\\ding{174}": '\u2462'
  "\\ding{175}": '\u2463'
  "\\ding{176}": '\u2464'
  "\\ding{177}": '\u2465'
  "\\ding{178}": '\u2466'
  "\\ding{179}": '\u2467'
  "\\ding{180}": '\u2468'
  "\\ding{181}": '\u2469'
  "{\\circledS}": '\u24C8'
  "\\circledS ": '\u24C8'
  "{\\Elzdshfnc}": '\u2506'
  "\\Elzdshfnc ": '\u2506'
  "{\\Elzsqfnw}": '\u2519'
  "\\Elzsqfnw ": '\u2519'
  "{\\diagup}": '\u2571'
  "\\diagup ": '\u2571'
  "\\ding{110}": '\u25A0'
  "{\\square}": '\u25A1'
  "\\square ": '\u25A1'
  "{\\blacksquare}": '\u25AA'
  "\\blacksquare ": '\u25AA'
  "\\fbox{~~}": '\u25AD'
  "{\\Elzvrecto}": '\u25AF'
  "\\Elzvrecto ": '\u25AF'
  "\\ElsevierGlyph{E381}": '\u25B1'
  "\\ding{115}": '\u25B2'
  "{\\bigtriangleup}": '\u25B3'
  "\\bigtriangleup ": '\u25B3'
  "{\\blacktriangle}": '\u25B4'
  "\\blacktriangle ": '\u25B4'
  "{\\vartriangle}": '\u25B5'
  "\\vartriangle ": '\u25B5'
  "{\\blacktriangleright}": '\u25B8'
  "\\blacktriangleright ": '\u25B8'
  "{\\triangleright}": '\u25B9'
  "\\triangleright ": '\u25B9'
  "\\ding{116}": '\u25BC'
  "{\\bigtriangledown}": '\u25BD'
  "\\bigtriangledown ": '\u25BD'
  "{\\blacktriangledown}": '\u25BE'
  "\\blacktriangledown ": '\u25BE'
  "{\\triangledown}": '\u25BF'
  "\\triangledown ": '\u25BF'
  "{\\blacktriangleleft}": '\u25C2'
  "\\blacktriangleleft ": '\u25C2'
  "{\\triangleleft}": '\u25C3'
  "\\triangleleft ": '\u25C3'
  "\\ding{117}": '\u25C6'
  "{\\lozenge}": '\u25CA'
  "\\lozenge ": '\u25CA'
  "{\\bigcirc}": '\u25CB'
  "\\bigcirc ": '\u25CB'
  "\\ding{108}": '\u25CF'
  "{\\Elzcirfl}": '\u25D0'
  "\\Elzcirfl ": '\u25D0'
  "{\\Elzcirfr}": '\u25D1'
  "\\Elzcirfr ": '\u25D1'
  "{\\Elzcirfb}": '\u25D2'
  "\\Elzcirfb ": '\u25D2'
  "\\ding{119}": '\u25D7'
  "{\\Elzrvbull}": '\u25D8'
  "\\Elzrvbull ": '\u25D8'
  "{\\Elzsqfl}": '\u25E7'
  "\\Elzsqfl ": '\u25E7'
  "{\\Elzsqfr}": '\u25E8'
  "\\Elzsqfr ": '\u25E8'
  "{\\Elzsqfse}": '\u25EA'
  "\\Elzsqfse ": '\u25EA'
  "\\ding{72}": '\u2605'
  "\\ding{73}": '\u2606'
  "\\ding{37}": '\u260E'
  "\\ding{42}": '\u261B'
  "\\ding{43}": '\u261E'
  "{\\rightmoon}": '\u263E'
  "\\rightmoon ": '\u263E'
  "{\\mercury}": '\u263F'
  "\\mercury ": '\u263F'
  "{\\venus}": '\u2640'
  "\\venus ": '\u2640'
  "{\\male}": '\u2642'
  "\\male ": '\u2642'
  "{\\jupiter}": '\u2643'
  "\\jupiter ": '\u2643'
  "{\\saturn}": '\u2644'
  "\\saturn ": '\u2644'
  "{\\uranus}": '\u2645'
  "\\uranus ": '\u2645'
  "{\\neptune}": '\u2646'
  "\\neptune ": '\u2646'
  "{\\pluto}": '\u2647'
  "\\pluto ": '\u2647'
  "{\\aries}": '\u2648'
  "\\aries ": '\u2648'
  "{\\taurus}": '\u2649'
  "\\taurus ": '\u2649'
  "{\\gemini}": '\u264A'
  "\\gemini ": '\u264A'
  "{\\cancer}": '\u264B'
  "\\cancer ": '\u264B'
  "{\\leo}": '\u264C'
  "\\leo ": '\u264C'
  "{\\virgo}": '\u264D'
  "\\virgo ": '\u264D'
  "{\\libra}": '\u264E'
  "\\libra ": '\u264E'
  "{\\scorpio}": '\u264F'
  "\\scorpio ": '\u264F'
  "{\\sagittarius}": '\u2650'
  "\\sagittarius ": '\u2650'
  "{\\capricornus}": '\u2651'
  "\\capricornus ": '\u2651'
  "{\\aquarius}": '\u2652'
  "\\aquarius ": '\u2652'
  "{\\pisces}": '\u2653'
  "\\pisces ": '\u2653'
  "\\ding{171}": '\u2660'
  "\\ding{168}": '\u2663'
  "\\ding{170}": '\u2665'
  "\\ding{169}": '\u2666'
  "{\\quarternote}": '\u2669'
  "\\quarternote ": '\u2669'
  "{\\eighthnote}": '\u266A'
  "\\eighthnote ": '\u266A'
  "{\\flat}": '\u266D'
  "\\flat ": '\u266D'
  "{\\natural}": '\u266E'
  "\\natural ": '\u266E'
  "{\\sharp}": '\u266F'
  "\\sharp ": '\u266F'
  "\\ding{33}": '\u2701'
  "\\ding{34}": '\u2702'
  "\\ding{35}": '\u2703'
  "\\ding{36}": '\u2704'
  "\\ding{38}": '\u2706'
  "\\ding{39}": '\u2707'
  "\\ding{40}": '\u2708'
  "\\ding{41}": '\u2709'
  "\\ding{44}": '\u270C'
  "\\ding{45}": '\u270D'
  "\\ding{46}": '\u270E'
  "\\ding{47}": '\u270F'
  "\\ding{48}": '\u2710'
  "\\ding{49}": '\u2711'
  "\\ding{50}": '\u2712'
  "\\ding{51}": '\u2713'
  "\\ding{52}": '\u2714'
  "\\ding{53}": '\u2715'
  "\\ding{54}": '\u2716'
  "\\ding{55}": '\u2717'
  "\\ding{56}": '\u2718'
  "\\ding{57}": '\u2719'
  "\\ding{58}": '\u271A'
  "\\ding{59}": '\u271B'
  "\\ding{60}": '\u271C'
  "\\ding{61}": '\u271D'
  "\\ding{62}": '\u271E'
  "\\ding{63}": '\u271F'
  "\\ding{64}": '\u2720'
  "\\ding{65}": '\u2721'
  "\\ding{66}": '\u2722'
  "\\ding{67}": '\u2723'
  "\\ding{68}": '\u2724'
  "\\ding{69}": '\u2725'
  "\\ding{70}": '\u2726'
  "\\ding{71}": '\u2727'
  "\\ding{74}": '\u272A'
  "\\ding{75}": '\u272B'
  "\\ding{76}": '\u272C'
  "\\ding{77}": '\u272D'
  "\\ding{78}": '\u272E'
  "\\ding{79}": '\u272F'
  "\\ding{80}": '\u2730'
  "\\ding{81}": '\u2731'
  "\\ding{82}": '\u2732'
  "\\ding{83}": '\u2733'
  "\\ding{84}": '\u2734'
  "\\ding{85}": '\u2735'
  "\\ding{86}": '\u2736'
  "\\ding{87}": '\u2737'
  "\\ding{88}": '\u2738'
  "\\ding{89}": '\u2739'
  "\\ding{90}": '\u273A'
  "\\ding{91}": '\u273B'
  "\\ding{92}": '\u273C'
  "\\ding{93}": '\u273D'
  "\\ding{94}": '\u273E'
  "\\ding{95}": '\u273F'
  "\\ding{96}": '\u2740'
  "\\ding{97}": '\u2741'
  "\\ding{98}": '\u2742'
  "\\ding{99}": '\u2743'
  "\\ding{100}": '\u2744'
  "\\ding{101}": '\u2745'
  "\\ding{102}": '\u2746'
  "\\ding{103}": '\u2747'
  "\\ding{104}": '\u2748'
  "\\ding{105}": '\u2749'
  "\\ding{106}": '\u274A'
  "\\ding{107}": '\u274B'
  "\\ding{109}": '\u274D'
  "\\ding{111}": '\u274F'
  "\\ding{112}": '\u2750'
  "\\ding{113}": '\u2751'
  "\\ding{114}": '\u2752'
  "\\ding{118}": '\u2756'
  "\\ding{120}": '\u2758'
  "\\ding{121}": '\u2759'
  "\\ding{122}": '\u275A'
  "\\ding{123}": '\u275B'
  "\\ding{124}": '\u275C'
  "\\ding{125}": '\u275D'
  "\\ding{126}": '\u275E'
  "\\ding{161}": '\u2761'
  "\\ding{162}": '\u2762'
  "\\ding{163}": '\u2763'
  "\\ding{164}": '\u2764'
  "\\ding{165}": '\u2765'
  "\\ding{166}": '\u2766'
  "\\ding{167}": '\u2767'
  "\\ding{182}": '\u2776'
  "\\ding{183}": '\u2777'
  "\\ding{184}": '\u2778'
  "\\ding{185}": '\u2779'
  "\\ding{186}": '\u277A'
  "\\ding{187}": '\u277B'
  "\\ding{188}": '\u277C'
  "\\ding{189}": '\u277D'
  "\\ding{190}": '\u277E'
  "\\ding{191}": '\u277F'
  "\\ding{192}": '\u2780'
  "\\ding{193}": '\u2781'
  "\\ding{194}": '\u2782'
  "\\ding{195}": '\u2783'
  "\\ding{196}": '\u2784'
  "\\ding{197}": '\u2785'
  "\\ding{198}": '\u2786'
  "\\ding{199}": '\u2787'
  "\\ding{200}": '\u2788'
  "\\ding{201}": '\u2789'
  "\\ding{202}": '\u278A'
  "\\ding{203}": '\u278B'
  "\\ding{204}": '\u278C'
  "\\ding{205}": '\u278D'
  "\\ding{206}": '\u278E'
  "\\ding{207}": '\u278F'
  "\\ding{208}": '\u2790'
  "\\ding{209}": '\u2791'
  "\\ding{210}": '\u2792'
  "\\ding{211}": '\u2793'
  "\\ding{212}": '\u2794'
  "\\ding{216}": '\u2798'
  "\\ding{217}": '\u2799'
  "\\ding{218}": '\u279A'
  "\\ding{219}": '\u279B'
  "\\ding{220}": '\u279C'
  "\\ding{221}": '\u279D'
  "\\ding{222}": '\u279E'
  "\\ding{223}": '\u279F'
  "\\ding{224}": '\u27A0'
  "\\ding{225}": '\u27A1'
  "\\ding{226}": '\u27A2'
  "\\ding{227}": '\u27A3'
  "\\ding{228}": '\u27A4'
  "\\ding{229}": '\u27A5'
  "\\ding{230}": '\u27A6'
  "\\ding{231}": '\u27A7'
  "\\ding{232}": '\u27A8'
  "\\ding{233}": '\u27A9'
  "\\ding{234}": '\u27AA'
  "\\ding{235}": '\u27AB'
  "\\ding{236}": '\u27AC'
  "\\ding{237}": '\u27AD'
  "\\ding{238}": '\u27AE'
  "\\ding{239}": '\u27AF'
  "\\ding{241}": '\u27B1'
  "\\ding{242}": '\u27B2'
  "\\ding{243}": '\u27B3'
  "\\ding{244}": '\u27B4'
  "\\ding{245}": '\u27B5'
  "\\ding{246}": '\u27B6'
  "\\ding{247}": '\u27B7'
  "\\ding{248}": '\u27B8'
  "\\ding{249}": '\u27B9'
  "\\ding{250}": '\u27BA'
  "\\ding{251}": '\u27BB'
  "\\ding{252}": '\u27BC'
  "\\ding{253}": '\u27BD'
  "\\ding{254}": '\u27BE'
  "{\\langle}": '\u27E8'
  "\\langle ": '\u27E8'
  "{\\rangle}": '\u27E9'
  "\\rangle ": '\u27E9'
  "{\\longleftarrow}": '\u27F5'
  "\\longleftarrow ": '\u27F5'
  "{\\longrightarrow}": '\u27F6'
  "\\longrightarrow ": '\u27F6'
  "{\\longleftrightarrow}": '\u27F7'
  "\\longleftrightarrow ": '\u27F7'
  "{\\Longleftarrow}": '\u27F8'
  "\\Longleftarrow ": '\u27F8'
  "{\\Longrightarrow}": '\u27F9'
  "\\Longrightarrow ": '\u27F9'
  "{\\Longleftrightarrow}": '\u27FA'
  "\\Longleftrightarrow ": '\u27FA'
  "{\\longmapsto}": '\u27FC'
  "\\longmapsto ": '\u27FC'
  "\\sim\\joinrel\\leadsto": '\u27FF'
  "\\ElsevierGlyph{E212}": '\u2905'
  "{\\UpArrowBar}": '\u2912'
  "\\UpArrowBar ": '\u2912'
  "{\\DownArrowBar}": '\u2913'
  "\\DownArrowBar ": '\u2913'
  "\\ElsevierGlyph{E20C}": '\u2923'
  "\\ElsevierGlyph{E20D}": '\u2924'
  "\\ElsevierGlyph{E20B}": '\u2925'
  "\\ElsevierGlyph{E20A}": '\u2926'
  "\\ElsevierGlyph{E211}": '\u2927'
  "\\ElsevierGlyph{E20E}": '\u2928'
  "\\ElsevierGlyph{E20F}": '\u2929'
  "\\ElsevierGlyph{E210}": '\u292A'
  "\\ElsevierGlyph{E21C}": '\u2933'
  "\\ElsevierGlyph{E21A}": '\u2936'
  "\\ElsevierGlyph{E219}": '\u2937'
  "{\\Elolarr}": '\u2940'
  "\\Elolarr ": '\u2940'
  "{\\Elorarr}": '\u2941'
  "\\Elorarr ": '\u2941'
  "{\\ElzRlarr}": '\u2942'
  "\\ElzRlarr ": '\u2942'
  "{\\ElzrLarr}": '\u2944'
  "\\ElzrLarr ": '\u2944'
  "{\\Elzrarrx}": '\u2947'
  "\\Elzrarrx ": '\u2947'
  "{\\LeftRightVector}": '\u294E'
  "\\LeftRightVector ": '\u294E'
  "{\\RightUpDownVector}": '\u294F'
  "\\RightUpDownVector ": '\u294F'
  "{\\DownLeftRightVector}": '\u2950'
  "\\DownLeftRightVector ": '\u2950'
  "{\\LeftUpDownVector}": '\u2951'
  "\\LeftUpDownVector ": '\u2951'
  "{\\LeftVectorBar}": '\u2952'
  "\\LeftVectorBar ": '\u2952'
  "{\\RightVectorBar}": '\u2953'
  "\\RightVectorBar ": '\u2953'
  "{\\RightUpVectorBar}": '\u2954'
  "\\RightUpVectorBar ": '\u2954'
  "{\\RightDownVectorBar}": '\u2955'
  "\\RightDownVectorBar ": '\u2955'
  "{\\DownLeftVectorBar}": '\u2956'
  "\\DownLeftVectorBar ": '\u2956'
  "{\\DownRightVectorBar}": '\u2957'
  "\\DownRightVectorBar ": '\u2957'
  "{\\LeftUpVectorBar}": '\u2958'
  "\\LeftUpVectorBar ": '\u2958'
  "{\\LeftDownVectorBar}": '\u2959'
  "\\LeftDownVectorBar ": '\u2959'
  "{\\LeftTeeVector}": '\u295A'
  "\\LeftTeeVector ": '\u295A'
  "{\\RightTeeVector}": '\u295B'
  "\\RightTeeVector ": '\u295B'
  "{\\RightUpTeeVector}": '\u295C'
  "\\RightUpTeeVector ": '\u295C'
  "{\\RightDownTeeVector}": '\u295D'
  "\\RightDownTeeVector ": '\u295D'
  "{\\DownLeftTeeVector}": '\u295E'
  "\\DownLeftTeeVector ": '\u295E'
  "{\\DownRightTeeVector}": '\u295F'
  "\\DownRightTeeVector ": '\u295F'
  "{\\LeftUpTeeVector}": '\u2960'
  "\\LeftUpTeeVector ": '\u2960'
  "{\\LeftDownTeeVector}": '\u2961'
  "\\LeftDownTeeVector ": '\u2961'
  "{\\UpEquilibrium}": '\u296E'
  "\\UpEquilibrium ": '\u296E'
  "{\\ReverseUpEquilibrium}": '\u296F'
  "\\ReverseUpEquilibrium ": '\u296F'
  "{\\RoundImplies}": '\u2970'
  "\\RoundImplies ": '\u2970'
  "\\ElsevierGlyph{E214}": '\u297C'
  "\\ElsevierGlyph{E215}": '\u297D'
  "{\\Elztfnc}": '\u2980'
  "\\Elztfnc ": '\u2980'
  "\\ElsevierGlyph{3018}": '\u2985'
  "{\\Elroang}": '\u2986'
  "\\Elroang ": '\u2986'
  "<\\kern-0.58em(": '\u2993'
  "\\ElsevierGlyph{E291}": '\u2994'
  "{\\Elzddfnc}": '\u2999'
  "\\Elzddfnc ": '\u2999'
  "{\\Angle}": '\u299C'
  "\\Angle ": '\u299C'
  "{\\Elzlpargt}": '\u29A0'
  "\\Elzlpargt ": '\u29A0'
  "\\ElsevierGlyph{E260}": '\u29B5'
  "\\ElsevierGlyph{E61B}": '\u29B6'
  "{\\ElzLap}": '\u29CA'
  "\\ElzLap ": '\u29CA'
  "{\\Elzdefas}": '\u29CB'
  "\\Elzdefas ": '\u29CB'
  "{\\LeftTriangleBar}": '\u29CF'
  "\\LeftTriangleBar ": '\u29CF'
  "{\\RightTriangleBar}": '\u29D0'
  "\\RightTriangleBar ": '\u29D0'
  "\\ElsevierGlyph{E372}": '\u29DC'
  "{\\blacklozenge}": '\u29EB'
  "\\blacklozenge ": '\u29EB'
  "{\\RuleDelayed}": '\u29F4'
  "\\RuleDelayed ": '\u29F4'
  "{\\Elxuplus}": '\u2A04'
  "\\Elxuplus ": '\u2A04'
  "{\\ElzThr}": '\u2A05'
  "\\ElzThr ": '\u2A05'
  "{\\Elxsqcup}": '\u2A06'
  "\\Elxsqcup ": '\u2A06'
  "{\\ElzInf}": '\u2A07'
  "\\ElzInf ": '\u2A07'
  "{\\ElzSup}": '\u2A08'
  "\\ElzSup ": '\u2A08'
  "{\\ElzCint}": '\u2A0D'
  "\\ElzCint ": '\u2A0D'
  "{\\clockoint}": '\u2A0F'
  "\\clockoint ": '\u2A0F'
  "\\ElsevierGlyph{E395}": '\u2A10'
  "{\\sqrint}": '\u2A16'
  "\\sqrint ": '\u2A16'
  "\\ElsevierGlyph{E25A}": '\u2A25'
  "\\ElsevierGlyph{E25B}": '\u2A2A'
  "\\ElsevierGlyph{E25C}": '\u2A2D'
  "\\ElsevierGlyph{E25D}": '\u2A2E'
  "{\\ElzTimes}": '\u2A2F'
  "\\ElzTimes ": '\u2A2F'
  "\\ElsevierGlyph{E25E}": '\u2A34'
  "\\ElsevierGlyph{E259}": '\u2A3C'
  "{\\amalg}": '\u2A3F'
  "\\amalg ": '\u2A3F'
  "{\\ElzAnd}": '\u2A53'
  "\\ElzAnd ": '\u2A53'
  "{\\ElzOr}": '\u2A54'
  "\\ElzOr ": '\u2A54'
  "\\ElsevierGlyph{E36E}": '\u2A55'
  "{\\ElOr}": '\u2A56'
  "\\ElOr ": '\u2A56'
  "{\\Elzminhat}": '\u2A5F'
  "\\Elzminhat ": '\u2A5F'
  "\\stackrel{*}{=}": '\u2A6E'
  "{\\Equal}": '\u2A75'
  "\\Equal ": '\u2A75'
  "{\\leqslant}": '\u2A7D'
  "\\leqslant ": '\u2A7D'
  "{\\geqslant}": '\u2A7E'
  "\\geqslant ": '\u2A7E'
  "{\\lessapprox}": '\u2A85'
  "\\lessapprox ": '\u2A85'
  "{\\gtrapprox}": '\u2A86'
  "\\gtrapprox ": '\u2A86'
  "{\\lneq}": '\u2A87'
  "\\lneq ": '\u2A87'
  "{\\gneq}": '\u2A88'
  "\\gneq ": '\u2A88'
  "{\\lnapprox}": '\u2A89'
  "\\lnapprox ": '\u2A89'
  "{\\gnapprox}": '\u2A8A'
  "\\gnapprox ": '\u2A8A'
  "{\\lesseqqgtr}": '\u2A8B'
  "\\lesseqqgtr ": '\u2A8B'
  "{\\gtreqqless}": '\u2A8C'
  "\\gtreqqless ": '\u2A8C'
  "{\\eqslantless}": '\u2A95'
  "\\eqslantless ": '\u2A95'
  "{\\eqslantgtr}": '\u2A96'
  "\\eqslantgtr ": '\u2A96'
  "\\Pisymbol{ppi020}{117}": '\u2A9D'
  "\\Pisymbol{ppi020}{105}": '\u2A9E'
  "{\\NestedLessLess}": '\u2AA1'
  "\\NestedLessLess ": '\u2AA1'
  "{\\NestedGreaterGreater}": '\u2AA2'
  "\\NestedGreaterGreater ": '\u2AA2'
  "{\\preceq}": '\u2AAF'
  "\\preceq ": '\u2AAF'
  "{\\succeq}": '\u2AB0'
  "\\succeq ": '\u2AB0'
  "{\\precneqq}": '\u2AB5'
  "\\precneqq ": '\u2AB5'
  "{\\succneqq}": '\u2AB6'
  "\\succneqq ": '\u2AB6'
  "{\\precnapprox}": '\u2AB9'
  "\\precnapprox ": '\u2AB9'
  "{\\succnapprox}": '\u2ABA'
  "\\succnapprox ": '\u2ABA'
  "{\\subseteqq}": '\u2AC5'
  "\\subseteqq ": '\u2AC5'
  "{\\supseteqq}": '\u2AC6'
  "\\supseteqq ": '\u2AC6'
  "{\\subsetneqq}": '\u2ACB'
  "\\subsetneqq ": '\u2ACB'
  "{\\supsetneqq}": '\u2ACC'
  "\\supsetneqq ": '\u2ACC'
  "\\ElsevierGlyph{E30D}": '\u2AEB'
  "{\\Elztdcol}": '\u2AF6'
  "\\Elztdcol ": '\u2AF6'
  "{{/}\\!\\!{/}}": '\u2AFD'
  "\\ElsevierGlyph{300A}": '\u300A'
  "\\ElsevierGlyph{300B}": '\u300B'
  "\\ElsevierGlyph{3019}": '\u3019'
  "{\\openbracketleft}": '\u301A'
  "\\openbracketleft ": '\u301A'
  "{\\openbracketright}": '\u301B'
  "\\openbracketright ": '\u301B'
  "\\mathbf{A}": '\ud835\udc00'
  "\\mathbf{B}": '\ud835\udc01'
  "\\mathbf{C}": '\ud835\udc02'
  "\\mathbf{D}": '\ud835\udc03'
  "\\mathbf{E}": '\ud835\udc04'
  "\\mathbf{F}": '\ud835\udc05'
  "\\mathbf{G}": '\ud835\udc06'
  "\\mathbf{H}": '\ud835\udc07'
  "\\mathbf{I}": '\ud835\udc08'
  "\\mathbf{J}": '\ud835\udc09'
  "\\mathbf{K}": '\ud835\udc0a'
  "\\mathbf{L}": '\ud835\udc0b'
  "\\mathbf{M}": '\ud835\udc0c'
  "\\mathbf{N}": '\ud835\udc0d'
  "\\mathbf{O}": '\ud835\udc0e'
  "\\mathbf{P}": '\ud835\udc0f'
  "\\mathbf{Q}": '\ud835\udc10'
  "\\mathbf{R}": '\ud835\udc11'
  "\\mathbf{S}": '\ud835\udc12'
  "\\mathbf{T}": '\ud835\udc13'
  "\\mathbf{U}": '\ud835\udc14'
  "\\mathbf{V}": '\ud835\udc15'
  "\\mathbf{W}": '\ud835\udc16'
  "\\mathbf{X}": '\ud835\udc17'
  "\\mathbf{Y}": '\ud835\udc18'
  "\\mathbf{Z}": '\ud835\udc19'
  "\\mathbf{a}": '\ud835\udc1a'
  "\\mathbf{b}": '\ud835\udc1b'
  "\\mathbf{c}": '\ud835\udc1c'
  "\\mathbf{d}": '\ud835\udc1d'
  "\\mathbf{e}": '\ud835\udc1e'
  "\\mathbf{f}": '\ud835\udc1f'
  "\\mathbf{g}": '\ud835\udc20'
  "\\mathbf{h}": '\ud835\udc21'
  "\\mathbf{i}": '\ud835\udc22'
  "\\mathbf{j}": '\ud835\udc23'
  "\\mathbf{k}": '\ud835\udc24'
  "\\mathbf{l}": '\ud835\udc25'
  "\\mathbf{m}": '\ud835\udc26'
  "\\mathbf{n}": '\ud835\udc27'
  "\\mathbf{o}": '\ud835\udc28'
  "\\mathbf{p}": '\ud835\udc29'
  "\\mathbf{q}": '\ud835\udc2a'
  "\\mathbf{r}": '\ud835\udc2b'
  "\\mathbf{s}": '\ud835\udc2c'
  "\\mathbf{t}": '\ud835\udc2d'
  "\\mathbf{u}": '\ud835\udc2e'
  "\\mathbf{v}": '\ud835\udc2f'
  "\\mathbf{w}": '\ud835\udc30'
  "\\mathbf{x}": '\ud835\udc31'
  "\\mathbf{y}": '\ud835\udc32'
  "\\mathbf{z}": '\ud835\udc33'
  "\\mathsl{A}": '\ud835\udc34'
  "\\mathsl{B}": '\ud835\udc35'
  "\\mathsl{C}": '\ud835\udc36'
  "\\mathsl{D}": '\ud835\udc37'
  "\\mathsl{E}": '\ud835\udc38'
  "\\mathsl{F}": '\ud835\udc39'
  "\\mathsl{G}": '\ud835\udc3a'
  "\\mathsl{H}": '\ud835\udc3b'
  "\\mathsl{I}": '\ud835\udc3c'
  "\\mathsl{J}": '\ud835\udc3d'
  "\\mathsl{K}": '\ud835\udc3e'
  "\\mathsl{L}": '\ud835\udc3f'
  "\\mathsl{M}": '\ud835\udc40'
  "\\mathsl{N}": '\ud835\udc41'
  "\\mathsl{O}": '\ud835\udc42'
  "\\mathsl{P}": '\ud835\udc43'
  "\\mathsl{Q}": '\ud835\udc44'
  "\\mathsl{R}": '\ud835\udc45'
  "\\mathsl{S}": '\ud835\udc46'
  "\\mathsl{T}": '\ud835\udc47'
  "\\mathsl{U}": '\ud835\udc48'
  "\\mathsl{V}": '\ud835\udc49'
  "\\mathsl{W}": '\ud835\udc4a'
  "\\mathsl{X}": '\ud835\udc4b'
  "\\mathsl{Y}": '\ud835\udc4c'
  "\\mathsl{Z}": '\ud835\udc4d'
  "\\mathsl{a}": '\ud835\udc4e'
  "\\mathsl{b}": '\ud835\udc4f'
  "\\mathsl{c}": '\ud835\udc50'
  "\\mathsl{d}": '\ud835\udc51'
  "\\mathsl{e}": '\ud835\udc52'
  "\\mathsl{f}": '\ud835\udc53'
  "\\mathsl{g}": '\ud835\udc54'
  "\\mathsl{i}": '\ud835\udc56'
  "\\mathsl{j}": '\ud835\udc57'
  "\\mathsl{k}": '\ud835\udc58'
  "\\mathsl{l}": '\ud835\udc59'
  "\\mathsl{m}": '\ud835\udc5a'
  "\\mathsl{n}": '\ud835\udc5b'
  "\\mathsl{o}": '\ud835\udc5c'
  "\\mathsl{p}": '\ud835\udc5d'
  "\\mathsl{q}": '\ud835\udc5e'
  "\\mathsl{r}": '\ud835\udc5f'
  "\\mathsl{s}": '\ud835\udc60'
  "\\mathsl{t}": '\ud835\udc61'
  "\\mathsl{u}": '\ud835\udc62'
  "\\mathsl{v}": '\ud835\udc63'
  "\\mathsl{w}": '\ud835\udc64'
  "\\mathsl{x}": '\ud835\udc65'
  "\\mathsl{y}": '\ud835\udc66'
  "\\mathsl{z}": '\ud835\udc67'
  "\\mathbit{A}": '\ud835\udc68'
  "\\mathbit{B}": '\ud835\udc69'
  "\\mathbit{C}": '\ud835\udc6a'
  "\\mathbit{D}": '\ud835\udc6b'
  "\\mathbit{E}": '\ud835\udc6c'
  "\\mathbit{F}": '\ud835\udc6d'
  "\\mathbit{G}": '\ud835\udc6e'
  "\\mathbit{H}": '\ud835\udc6f'
  "\\mathbit{I}": '\ud835\udc70'
  "\\mathbit{J}": '\ud835\udc71'
  "\\mathbit{K}": '\ud835\udc72'
  "\\mathbit{L}": '\ud835\udc73'
  "\\mathbit{M}": '\ud835\udc74'
  "\\mathbit{N}": '\ud835\udc75'
  "\\mathbit{O}": '\ud835\udc76'
  "\\mathbit{P}": '\ud835\udc77'
  "\\mathbit{Q}": '\ud835\udc78'
  "\\mathbit{R}": '\ud835\udc79'
  "\\mathbit{S}": '\ud835\udc7a'
  "\\mathbit{T}": '\ud835\udc7b'
  "\\mathbit{U}": '\ud835\udc7c'
  "\\mathbit{V}": '\ud835\udc7d'
  "\\mathbit{W}": '\ud835\udc7e'
  "\\mathbit{X}": '\ud835\udc7f'
  "\\mathbit{Y}": '\ud835\udc80'
  "\\mathbit{Z}": '\ud835\udc81'
  "\\mathbit{a}": '\ud835\udc82'
  "\\mathbit{b}": '\ud835\udc83'
  "\\mathbit{c}": '\ud835\udc84'
  "\\mathbit{d}": '\ud835\udc85'
  "\\mathbit{e}": '\ud835\udc86'
  "\\mathbit{f}": '\ud835\udc87'
  "\\mathbit{g}": '\ud835\udc88'
  "\\mathbit{h}": '\ud835\udc89'
  "\\mathbit{i}": '\ud835\udc8a'
  "\\mathbit{j}": '\ud835\udc8b'
  "\\mathbit{k}": '\ud835\udc8c'
  "\\mathbit{l}": '\ud835\udc8d'
  "\\mathbit{m}": '\ud835\udc8e'
  "\\mathbit{n}": '\ud835\udc8f'
  "\\mathbit{o}": '\ud835\udc90'
  "\\mathbit{p}": '\ud835\udc91'
  "\\mathbit{q}": '\ud835\udc92'
  "\\mathbit{r}": '\ud835\udc93'
  "\\mathbit{s}": '\ud835\udc94'
  "\\mathbit{t}": '\ud835\udc95'
  "\\mathbit{u}": '\ud835\udc96'
  "\\mathbit{v}": '\ud835\udc97'
  "\\mathbit{w}": '\ud835\udc98'
  "\\mathbit{x}": '\ud835\udc99'
  "\\mathbit{y}": '\ud835\udc9a'
  "\\mathbit{z}": '\ud835\udc9b'
  "\\mathscr{A}": '\ud835\udc9c'
  "\\mathscr{C}": '\ud835\udc9e'
  "\\mathscr{D}": '\ud835\udc9f'
  "\\mathscr{G}": '\ud835\udca2'
  "\\mathscr{J}": '\ud835\udca5'
  "\\mathscr{K}": '\ud835\udca6'
  "\\mathscr{N}": '\ud835\udca9'
  "\\mathscr{O}": '\ud835\udcaa'
  "\\mathscr{P}": '\ud835\udcab'
  "\\mathscr{Q}": '\ud835\udcac'
  "\\mathscr{S}": '\ud835\udcae'
  "\\mathscr{T}": '\ud835\udcaf'
  "\\mathscr{U}": '\ud835\udcb0'
  "\\mathscr{V}": '\ud835\udcb1'
  "\\mathscr{W}": '\ud835\udcb2'
  "\\mathscr{X}": '\ud835\udcb3'
  "\\mathscr{Y}": '\ud835\udcb4'
  "\\mathscr{Z}": '\ud835\udcb5'
  "\\mathscr{a}": '\ud835\udcb6'
  "\\mathscr{b}": '\ud835\udcb7'
  "\\mathscr{c}": '\ud835\udcb8'
  "\\mathscr{d}": '\ud835\udcb9'
  "\\mathscr{f}": '\ud835\udcbb'
  "\\mathscr{h}": '\ud835\udcbd'
  "\\mathscr{i}": '\ud835\udcbe'
  "\\mathscr{j}": '\ud835\udcbf'
  "\\mathscr{k}": '\ud835\udcc0'
  "\\mathscr{m}": '\ud835\udcc2'
  "\\mathscr{n}": '\ud835\udcc3'
  "\\mathscr{p}": '\ud835\udcc5'
  "\\mathscr{q}": '\ud835\udcc6'
  "\\mathscr{r}": '\ud835\udcc7'
  "\\mathscr{s}": '\ud835\udcc8'
  "\\mathscr{t}": '\ud835\udcc9'
  "\\mathscr{u}": '\ud835\udcca'
  "\\mathscr{v}": '\ud835\udccb'
  "\\mathscr{w}": '\ud835\udccc'
  "\\mathscr{x}": '\ud835\udccd'
  "\\mathscr{y}": '\ud835\udcce'
  "\\mathscr{z}": '\ud835\udccf'
  "\\mathmit{A}": '\ud835\udcd0'
  "\\mathmit{B}": '\ud835\udcd1'
  "\\mathmit{C}": '\ud835\udcd2'
  "\\mathmit{D}": '\ud835\udcd3'
  "\\mathmit{E}": '\ud835\udcd4'
  "\\mathmit{F}": '\ud835\udcd5'
  "\\mathmit{G}": '\ud835\udcd6'
  "\\mathmit{H}": '\ud835\udcd7'
  "\\mathmit{I}": '\ud835\udcd8'
  "\\mathmit{J}": '\ud835\udcd9'
  "\\mathmit{K}": '\ud835\udcda'
  "\\mathmit{L}": '\ud835\udcdb'
  "\\mathmit{M}": '\ud835\udcdc'
  "\\mathmit{N}": '\ud835\udcdd'
  "\\mathmit{O}": '\ud835\udcde'
  "\\mathmit{P}": '\ud835\udcdf'
  "\\mathmit{Q}": '\ud835\udce0'
  "\\mathmit{R}": '\ud835\udce1'
  "\\mathmit{S}": '\ud835\udce2'
  "\\mathmit{T}": '\ud835\udce3'
  "\\mathmit{U}": '\ud835\udce4'
  "\\mathmit{V}": '\ud835\udce5'
  "\\mathmit{W}": '\ud835\udce6'
  "\\mathmit{X}": '\ud835\udce7'
  "\\mathmit{Y}": '\ud835\udce8'
  "\\mathmit{Z}": '\ud835\udce9'
  "\\mathmit{a}": '\ud835\udcea'
  "\\mathmit{b}": '\ud835\udceb'
  "\\mathmit{c}": '\ud835\udcec'
  "\\mathmit{d}": '\ud835\udced'
  "\\mathmit{e}": '\ud835\udcee'
  "\\mathmit{f}": '\ud835\udcef'
  "\\mathmit{g}": '\ud835\udcf0'
  "\\mathmit{h}": '\ud835\udcf1'
  "\\mathmit{i}": '\ud835\udcf2'
  "\\mathmit{j}": '\ud835\udcf3'
  "\\mathmit{k}": '\ud835\udcf4'
  "\\mathmit{l}": '\ud835\udcf5'
  "\\mathmit{m}": '\ud835\udcf6'
  "\\mathmit{n}": '\ud835\udcf7'
  "\\mathmit{o}": '\ud835\udcf8'
  "\\mathmit{p}": '\ud835\udcf9'
  "\\mathmit{q}": '\ud835\udcfa'
  "\\mathmit{r}": '\ud835\udcfb'
  "\\mathmit{s}": '\ud835\udcfc'
  "\\mathmit{t}": '\ud835\udcfd'
  "\\mathmit{u}": '\ud835\udcfe'
  "\\mathmit{v}": '\ud835\udcff'
  "\\mathmit{w}": '\ud835\udd00'
  "\\mathmit{x}": '\ud835\udd01'
  "\\mathmit{y}": '\ud835\udd02'
  "\\mathmit{z}": '\ud835\udd03'
  "\\mathfrak{A}": '\ud835\udd04'
  "\\mathfrak{B}": '\ud835\udd05'
  "\\mathfrak{D}": '\ud835\udd07'
  "\\mathfrak{E}": '\ud835\udd08'
  "\\mathfrak{F}": '\ud835\udd09'
  "\\mathfrak{G}": '\ud835\udd0a'
  "\\mathfrak{J}": '\ud835\udd0d'
  "\\mathfrak{K}": '\ud835\udd0e'
  "\\mathfrak{L}": '\ud835\udd0f'
  "\\mathfrak{M}": '\ud835\udd10'
  "\\mathfrak{N}": '\ud835\udd11'
  "\\mathfrak{O}": '\ud835\udd12'
  "\\mathfrak{P}": '\ud835\udd13'
  "\\mathfrak{Q}": '\ud835\udd14'
  "\\mathfrak{S}": '\ud835\udd16'
  "\\mathfrak{T}": '\ud835\udd17'
  "\\mathfrak{U}": '\ud835\udd18'
  "\\mathfrak{V}": '\ud835\udd19'
  "\\mathfrak{W}": '\ud835\udd1a'
  "\\mathfrak{X}": '\ud835\udd1b'
  "\\mathfrak{Y}": '\ud835\udd1c'
  "\\mathfrak{a}": '\ud835\udd1e'
  "\\mathfrak{b}": '\ud835\udd1f'
  "\\mathfrak{c}": '\ud835\udd20'
  "\\mathfrak{d}": '\ud835\udd21'
  "\\mathfrak{e}": '\ud835\udd22'
  "\\mathfrak{f}": '\ud835\udd23'
  "\\mathfrak{g}": '\ud835\udd24'
  "\\mathfrak{h}": '\ud835\udd25'
  "\\mathfrak{i}": '\ud835\udd26'
  "\\mathfrak{j}": '\ud835\udd27'
  "\\mathfrak{k}": '\ud835\udd28'
  "\\mathfrak{l}": '\ud835\udd29'
  "\\mathfrak{m}": '\ud835\udd2a'
  "\\mathfrak{n}": '\ud835\udd2b'
  "\\mathfrak{o}": '\ud835\udd2c'
  "\\mathfrak{p}": '\ud835\udd2d'
  "\\mathfrak{q}": '\ud835\udd2e'
  "\\mathfrak{r}": '\ud835\udd2f'
  "\\mathfrak{s}": '\ud835\udd30'
  "\\mathfrak{t}": '\ud835\udd31'
  "\\mathfrak{u}": '\ud835\udd32'
  "\\mathfrak{v}": '\ud835\udd33'
  "\\mathfrak{w}": '\ud835\udd34'
  "\\mathfrak{x}": '\ud835\udd35'
  "\\mathfrak{y}": '\ud835\udd36'
  "\\mathfrak{z}": '\ud835\udd37'
  "\\mathbb{A}": '\ud835\udd38'
  "\\mathbb{B}": '\ud835\udd39'
  "\\mathbb{D}": '\ud835\udd3b'
  "\\mathbb{E}": '\ud835\udd3c'
  "\\mathbb{F}": '\ud835\udd3d'
  "\\mathbb{G}": '\ud835\udd3e'
  "\\mathbb{I}": '\ud835\udd40'
  "\\mathbb{J}": '\ud835\udd41'
  "\\mathbb{K}": '\ud835\udd42'
  "\\mathbb{L}": '\ud835\udd43'
  "\\mathbb{M}": '\ud835\udd44'
  "\\mathbb{O}": '\ud835\udd46'
  "\\mathbb{S}": '\ud835\udd4a'
  "\\mathbb{T}": '\ud835\udd4b'
  "\\mathbb{U}": '\ud835\udd4c'
  "\\mathbb{V}": '\ud835\udd4d'
  "\\mathbb{W}": '\ud835\udd4e'
  "\\mathbb{X}": '\ud835\udd4f'
  "\\mathbb{Y}": '\ud835\udd50'
  "\\mathbb{a}": '\ud835\udd52'
  "\\mathbb{b}": '\ud835\udd53'
  "\\mathbb{c}": '\ud835\udd54'
  "\\mathbb{d}": '\ud835\udd55'
  "\\mathbb{e}": '\ud835\udd56'
  "\\mathbb{f}": '\ud835\udd57'
  "\\mathbb{g}": '\ud835\udd58'
  "\\mathbb{h}": '\ud835\udd59'
  "\\mathbb{i}": '\ud835\udd5a'
  "\\mathbb{j}": '\ud835\udd5b'
  "\\mathbb{k}": '\ud835\udd5c'
  "\\mathbb{l}": '\ud835\udd5d'
  "\\mathbb{m}": '\ud835\udd5e'
  "\\mathbb{n}": '\ud835\udd5f'
  "\\mathbb{o}": '\ud835\udd60'
  "\\mathbb{p}": '\ud835\udd61'
  "\\mathbb{q}": '\ud835\udd62'
  "\\mathbb{r}": '\ud835\udd63'
  "\\mathbb{s}": '\ud835\udd64'
  "\\mathbb{t}": '\ud835\udd65'
  "\\mathbb{u}": '\ud835\udd66'
  "\\mathbb{v}": '\ud835\udd67'
  "\\mathbb{w}": '\ud835\udd68'
  "\\mathbb{x}": '\ud835\udd69'
  "\\mathbb{y}": '\ud835\udd6a'
  "\\mathbb{z}": '\ud835\udd6b'
  "\\mathslbb{A}": '\ud835\udd6c'
  "\\mathslbb{B}": '\ud835\udd6d'
  "\\mathslbb{C}": '\ud835\udd6e'
  "\\mathslbb{D}": '\ud835\udd6f'
  "\\mathslbb{E}": '\ud835\udd70'
  "\\mathslbb{F}": '\ud835\udd71'
  "\\mathslbb{G}": '\ud835\udd72'
  "\\mathslbb{H}": '\ud835\udd73'
  "\\mathslbb{I}": '\ud835\udd74'
  "\\mathslbb{J}": '\ud835\udd75'
  "\\mathslbb{K}": '\ud835\udd76'
  "\\mathslbb{L}": '\ud835\udd77'
  "\\mathslbb{M}": '\ud835\udd78'
  "\\mathslbb{N}": '\ud835\udd79'
  "\\mathslbb{O}": '\ud835\udd7a'
  "\\mathslbb{P}": '\ud835\udd7b'
  "\\mathslbb{Q}": '\ud835\udd7c'
  "\\mathslbb{R}": '\ud835\udd7d'
  "\\mathslbb{S}": '\ud835\udd7e'
  "\\mathslbb{T}": '\ud835\udd7f'
  "\\mathslbb{U}": '\ud835\udd80'
  "\\mathslbb{V}": '\ud835\udd81'
  "\\mathslbb{W}": '\ud835\udd82'
  "\\mathslbb{X}": '\ud835\udd83'
  "\\mathslbb{Y}": '\ud835\udd84'
  "\\mathslbb{Z}": '\ud835\udd85'
  "\\mathslbb{a}": '\ud835\udd86'
  "\\mathslbb{b}": '\ud835\udd87'
  "\\mathslbb{c}": '\ud835\udd88'
  "\\mathslbb{d}": '\ud835\udd89'
  "\\mathslbb{e}": '\ud835\udd8a'
  "\\mathslbb{f}": '\ud835\udd8b'
  "\\mathslbb{g}": '\ud835\udd8c'
  "\\mathslbb{h}": '\ud835\udd8d'
  "\\mathslbb{i}": '\ud835\udd8e'
  "\\mathslbb{j}": '\ud835\udd8f'
  "\\mathslbb{k}": '\ud835\udd90'
  "\\mathslbb{l}": '\ud835\udd91'
  "\\mathslbb{m}": '\ud835\udd92'
  "\\mathslbb{n}": '\ud835\udd93'
  "\\mathslbb{o}": '\ud835\udd94'
  "\\mathslbb{p}": '\ud835\udd95'
  "\\mathslbb{q}": '\ud835\udd96'
  "\\mathslbb{r}": '\ud835\udd97'
  "\\mathslbb{s}": '\ud835\udd98'
  "\\mathslbb{t}": '\ud835\udd99'
  "\\mathslbb{u}": '\ud835\udd9a'
  "\\mathslbb{v}": '\ud835\udd9b'
  "\\mathslbb{w}": '\ud835\udd9c'
  "\\mathslbb{x}": '\ud835\udd9d'
  "\\mathslbb{y}": '\ud835\udd9e'
  "\\mathslbb{z}": '\ud835\udd9f'
  "\\mathsf{A}": '\ud835\udda0'
  "\\mathsf{B}": '\ud835\udda1'
  "\\mathsf{C}": '\ud835\udda2'
  "\\mathsf{D}": '\ud835\udda3'
  "\\mathsf{E}": '\ud835\udda4'
  "\\mathsf{F}": '\ud835\udda5'
  "\\mathsf{G}": '\ud835\udda6'
  "\\mathsf{H}": '\ud835\udda7'
  "\\mathsf{I}": '\ud835\udda8'
  "\\mathsf{J}": '\ud835\udda9'
  "\\mathsf{K}": '\ud835\uddaa'
  "\\mathsf{L}": '\ud835\uddab'
  "\\mathsf{M}": '\ud835\uddac'
  "\\mathsf{N}": '\ud835\uddad'
  "\\mathsf{O}": '\ud835\uddae'
  "\\mathsf{P}": '\ud835\uddaf'
  "\\mathsf{Q}": '\ud835\uddb0'
  "\\mathsf{R}": '\ud835\uddb1'
  "\\mathsf{S}": '\ud835\uddb2'
  "\\mathsf{T}": '\ud835\uddb3'
  "\\mathsf{U}": '\ud835\uddb4'
  "\\mathsf{V}": '\ud835\uddb5'
  "\\mathsf{W}": '\ud835\uddb6'
  "\\mathsf{X}": '\ud835\uddb7'
  "\\mathsf{Y}": '\ud835\uddb8'
  "\\mathsf{Z}": '\ud835\uddb9'
  "\\mathsf{a}": '\ud835\uddba'
  "\\mathsf{b}": '\ud835\uddbb'
  "\\mathsf{c}": '\ud835\uddbc'
  "\\mathsf{d}": '\ud835\uddbd'
  "\\mathsf{e}": '\ud835\uddbe'
  "\\mathsf{f}": '\ud835\uddbf'
  "\\mathsf{g}": '\ud835\uddc0'
  "\\mathsf{h}": '\ud835\uddc1'
  "\\mathsf{i}": '\ud835\uddc2'
  "\\mathsf{j}": '\ud835\uddc3'
  "\\mathsf{k}": '\ud835\uddc4'
  "\\mathsf{l}": '\ud835\uddc5'
  "\\mathsf{m}": '\ud835\uddc6'
  "\\mathsf{n}": '\ud835\uddc7'
  "\\mathsf{o}": '\ud835\uddc8'
  "\\mathsf{p}": '\ud835\uddc9'
  "\\mathsf{q}": '\ud835\uddca'
  "\\mathsf{r}": '\ud835\uddcb'
  "\\mathsf{s}": '\ud835\uddcc'
  "\\mathsf{t}": '\ud835\uddcd'
  "\\mathsf{u}": '\ud835\uddce'
  "\\mathsf{v}": '\ud835\uddcf'
  "\\mathsf{w}": '\ud835\uddd0'
  "\\mathsf{x}": '\ud835\uddd1'
  "\\mathsf{y}": '\ud835\uddd2'
  "\\mathsf{z}": '\ud835\uddd3'
  "\\mathsfbf{A}": '\ud835\uddd4'
  "\\mathsfbf{B}": '\ud835\uddd5'
  "\\mathsfbf{C}": '\ud835\uddd6'
  "\\mathsfbf{D}": '\ud835\uddd7'
  "\\mathsfbf{E}": '\ud835\uddd8'
  "\\mathsfbf{F}": '\ud835\uddd9'
  "\\mathsfbf{G}": '\ud835\uddda'
  "\\mathsfbf{H}": '\ud835\udddb'
  "\\mathsfbf{I}": '\ud835\udddc'
  "\\mathsfbf{J}": '\ud835\udddd'
  "\\mathsfbf{K}": '\ud835\uddde'
  "\\mathsfbf{L}": '\ud835\udddf'
  "\\mathsfbf{M}": '\ud835\udde0'
  "\\mathsfbf{N}": '\ud835\udde1'
  "\\mathsfbf{O}": '\ud835\udde2'
  "\\mathsfbf{P}": '\ud835\udde3'
  "\\mathsfbf{Q}": '\ud835\udde4'
  "\\mathsfbf{R}": '\ud835\udde5'
  "\\mathsfbf{S}": '\ud835\udde6'
  "\\mathsfbf{T}": '\ud835\udde7'
  "\\mathsfbf{U}": '\ud835\udde8'
  "\\mathsfbf{V}": '\ud835\udde9'
  "\\mathsfbf{W}": '\ud835\uddea'
  "\\mathsfbf{X}": '\ud835\uddeb'
  "\\mathsfbf{Y}": '\ud835\uddec'
  "\\mathsfbf{Z}": '\ud835\udded'
  "\\mathsfbf{a}": '\ud835\uddee'
  "\\mathsfbf{b}": '\ud835\uddef'
  "\\mathsfbf{c}": '\ud835\uddf0'
  "\\mathsfbf{d}": '\ud835\uddf1'
  "\\mathsfbf{e}": '\ud835\uddf2'
  "\\mathsfbf{f}": '\ud835\uddf3'
  "\\mathsfbf{g}": '\ud835\uddf4'
  "\\mathsfbf{h}": '\ud835\uddf5'
  "\\mathsfbf{i}": '\ud835\uddf6'
  "\\mathsfbf{j}": '\ud835\uddf7'
  "\\mathsfbf{k}": '\ud835\uddf8'
  "\\mathsfbf{l}": '\ud835\uddf9'
  "\\mathsfbf{m}": '\ud835\uddfa'
  "\\mathsfbf{n}": '\ud835\uddfb'
  "\\mathsfbf{o}": '\ud835\uddfc'
  "\\mathsfbf{p}": '\ud835\uddfd'
  "\\mathsfbf{q}": '\ud835\uddfe'
  "\\mathsfbf{r}": '\ud835\uddff'
  "\\mathsfbf{s}": '\ud835\ude00'
  "\\mathsfbf{t}": '\ud835\ude01'
  "\\mathsfbf{u}": '\ud835\ude02'
  "\\mathsfbf{v}": '\ud835\ude03'
  "\\mathsfbf{w}": '\ud835\ude04'
  "\\mathsfbf{x}": '\ud835\ude05'
  "\\mathsfbf{y}": '\ud835\ude06'
  "\\mathsfbf{z}": '\ud835\ude07'
  "\\mathsfsl{A}": '\ud835\ude08'
  "\\mathsfsl{B}": '\ud835\ude09'
  "\\mathsfsl{C}": '\ud835\ude0a'
  "\\mathsfsl{D}": '\ud835\ude0b'
  "\\mathsfsl{E}": '\ud835\ude0c'
  "\\mathsfsl{F}": '\ud835\ude0d'
  "\\mathsfsl{G}": '\ud835\ude0e'
  "\\mathsfsl{H}": '\ud835\ude0f'
  "\\mathsfsl{I}": '\ud835\ude10'
  "\\mathsfsl{J}": '\ud835\ude11'
  "\\mathsfsl{K}": '\ud835\ude12'
  "\\mathsfsl{L}": '\ud835\ude13'
  "\\mathsfsl{M}": '\ud835\ude14'
  "\\mathsfsl{N}": '\ud835\ude15'
  "\\mathsfsl{O}": '\ud835\ude16'
  "\\mathsfsl{P}": '\ud835\ude17'
  "\\mathsfsl{Q}": '\ud835\ude18'
  "\\mathsfsl{R}": '\ud835\ude19'
  "\\mathsfsl{S}": '\ud835\ude1a'
  "\\mathsfsl{T}": '\ud835\ude1b'
  "\\mathsfsl{U}": '\ud835\ude1c'
  "\\mathsfsl{V}": '\ud835\ude1d'
  "\\mathsfsl{W}": '\ud835\ude1e'
  "\\mathsfsl{X}": '\ud835\ude1f'
  "\\mathsfsl{Y}": '\ud835\ude20'
  "\\mathsfsl{Z}": '\ud835\ude21'
  "\\mathsfsl{a}": '\ud835\ude22'
  "\\mathsfsl{b}": '\ud835\ude23'
  "\\mathsfsl{c}": '\ud835\ude24'
  "\\mathsfsl{d}": '\ud835\ude25'
  "\\mathsfsl{e}": '\ud835\ude26'
  "\\mathsfsl{f}": '\ud835\ude27'
  "\\mathsfsl{g}": '\ud835\ude28'
  "\\mathsfsl{h}": '\ud835\ude29'
  "\\mathsfsl{i}": '\ud835\ude2a'
  "\\mathsfsl{j}": '\ud835\ude2b'
  "\\mathsfsl{k}": '\ud835\ude2c'
  "\\mathsfsl{l}": '\ud835\ude2d'
  "\\mathsfsl{m}": '\ud835\ude2e'
  "\\mathsfsl{n}": '\ud835\ude2f'
  "\\mathsfsl{o}": '\ud835\ude30'
  "\\mathsfsl{p}": '\ud835\ude31'
  "\\mathsfsl{q}": '\ud835\ude32'
  "\\mathsfsl{r}": '\ud835\ude33'
  "\\mathsfsl{s}": '\ud835\ude34'
  "\\mathsfsl{t}": '\ud835\ude35'
  "\\mathsfsl{u}": '\ud835\ude36'
  "\\mathsfsl{v}": '\ud835\ude37'
  "\\mathsfsl{w}": '\ud835\ude38'
  "\\mathsfsl{x}": '\ud835\ude39'
  "\\mathsfsl{y}": '\ud835\ude3a'
  "\\mathsfsl{z}": '\ud835\ude3b'
  "\\mathsfbfsl{A}": '\ud835\ude3c'
  "\\mathsfbfsl{B}": '\ud835\ude3d'
  "\\mathsfbfsl{C}": '\ud835\ude3e'
  "\\mathsfbfsl{D}": '\ud835\ude3f'
  "\\mathsfbfsl{E}": '\ud835\ude40'
  "\\mathsfbfsl{F}": '\ud835\ude41'
  "\\mathsfbfsl{G}": '\ud835\ude42'
  "\\mathsfbfsl{H}": '\ud835\ude43'
  "\\mathsfbfsl{I}": '\ud835\ude44'
  "\\mathsfbfsl{J}": '\ud835\ude45'
  "\\mathsfbfsl{K}": '\ud835\ude46'
  "\\mathsfbfsl{L}": '\ud835\ude47'
  "\\mathsfbfsl{M}": '\ud835\ude48'
  "\\mathsfbfsl{N}": '\ud835\ude49'
  "\\mathsfbfsl{O}": '\ud835\ude4a'
  "\\mathsfbfsl{P}": '\ud835\ude4b'
  "\\mathsfbfsl{Q}": '\ud835\ude4c'
  "\\mathsfbfsl{R}": '\ud835\ude4d'
  "\\mathsfbfsl{S}": '\ud835\ude4e'
  "\\mathsfbfsl{T}": '\ud835\ude4f'
  "\\mathsfbfsl{U}": '\ud835\ude50'
  "\\mathsfbfsl{V}": '\ud835\ude51'
  "\\mathsfbfsl{W}": '\ud835\ude52'
  "\\mathsfbfsl{X}": '\ud835\ude53'
  "\\mathsfbfsl{Y}": '\ud835\ude54'
  "\\mathsfbfsl{Z}": '\ud835\ude55'
  "\\mathsfbfsl{a}": '\ud835\ude56'
  "\\mathsfbfsl{b}": '\ud835\ude57'
  "\\mathsfbfsl{c}": '\ud835\ude58'
  "\\mathsfbfsl{d}": '\ud835\ude59'
  "\\mathsfbfsl{e}": '\ud835\ude5a'
  "\\mathsfbfsl{f}": '\ud835\ude5b'
  "\\mathsfbfsl{g}": '\ud835\ude5c'
  "\\mathsfbfsl{h}": '\ud835\ude5d'
  "\\mathsfbfsl{i}": '\ud835\ude5e'
  "\\mathsfbfsl{j}": '\ud835\ude5f'
  "\\mathsfbfsl{k}": '\ud835\ude60'
  "\\mathsfbfsl{l}": '\ud835\ude61'
  "\\mathsfbfsl{m}": '\ud835\ude62'
  "\\mathsfbfsl{n}": '\ud835\ude63'
  "\\mathsfbfsl{o}": '\ud835\ude64'
  "\\mathsfbfsl{p}": '\ud835\ude65'
  "\\mathsfbfsl{q}": '\ud835\ude66'
  "\\mathsfbfsl{r}": '\ud835\ude67'
  "\\mathsfbfsl{s}": '\ud835\ude68'
  "\\mathsfbfsl{t}": '\ud835\ude69'
  "\\mathsfbfsl{u}": '\ud835\ude6a'
  "\\mathsfbfsl{v}": '\ud835\ude6b'
  "\\mathsfbfsl{w}": '\ud835\ude6c'
  "\\mathsfbfsl{x}": '\ud835\ude6d'
  "\\mathsfbfsl{y}": '\ud835\ude6e'
  "\\mathsfbfsl{z}": '\ud835\ude6f'
  "\\mathtt{A}": '\ud835\ude70'
  "\\mathtt{B}": '\ud835\ude71'
  "\\mathtt{C}": '\ud835\ude72'
  "\\mathtt{D}": '\ud835\ude73'
  "\\mathtt{E}": '\ud835\ude74'
  "\\mathtt{F}": '\ud835\ude75'
  "\\mathtt{G}": '\ud835\ude76'
  "\\mathtt{H}": '\ud835\ude77'
  "\\mathtt{I}": '\ud835\ude78'
  "\\mathtt{J}": '\ud835\ude79'
  "\\mathtt{K}": '\ud835\ude7a'
  "\\mathtt{L}": '\ud835\ude7b'
  "\\mathtt{M}": '\ud835\ude7c'
  "\\mathtt{N}": '\ud835\ude7d'
  "\\mathtt{O}": '\ud835\ude7e'
  "\\mathtt{P}": '\ud835\ude7f'
  "\\mathtt{Q}": '\ud835\ude80'
  "\\mathtt{R}": '\ud835\ude81'
  "\\mathtt{S}": '\ud835\ude82'
  "\\mathtt{T}": '\ud835\ude83'
  "\\mathtt{U}": '\ud835\ude84'
  "\\mathtt{V}": '\ud835\ude85'
  "\\mathtt{W}": '\ud835\ude86'
  "\\mathtt{X}": '\ud835\ude87'
  "\\mathtt{Y}": '\ud835\ude88'
  "\\mathtt{Z}": '\ud835\ude89'
  "\\mathtt{a}": '\ud835\ude8a'
  "\\mathtt{b}": '\ud835\ude8b'
  "\\mathtt{c}": '\ud835\ude8c'
  "\\mathtt{d}": '\ud835\ude8d'
  "\\mathtt{e}": '\ud835\ude8e'
  "\\mathtt{f}": '\ud835\ude8f'
  "\\mathtt{g}": '\ud835\ude90'
  "\\mathtt{h}": '\ud835\ude91'
  "\\mathtt{i}": '\ud835\ude92'
  "\\mathtt{j}": '\ud835\ude93'
  "\\mathtt{k}": '\ud835\ude94'
  "\\mathtt{l}": '\ud835\ude95'
  "\\mathtt{m}": '\ud835\ude96'
  "\\mathtt{n}": '\ud835\ude97'
  "\\mathtt{o}": '\ud835\ude98'
  "\\mathtt{p}": '\ud835\ude99'
  "\\mathtt{q}": '\ud835\ude9a'
  "\\mathtt{r}": '\ud835\ude9b'
  "\\mathtt{s}": '\ud835\ude9c'
  "\\mathtt{t}": '\ud835\ude9d'
  "\\mathtt{u}": '\ud835\ude9e'
  "\\mathtt{v}": '\ud835\ude9f'
  "\\mathtt{w}": '\ud835\udea0'
  "\\mathtt{x}": '\ud835\udea1'
  "\\mathtt{y}": '\ud835\udea2'
  "\\mathtt{z}": '\ud835\udea3'
  "\\mathbf{\\Alpha}": '\ud835\udea8'
  "\\mathbf{\\Beta}": '\ud835\udea9'
  "\\mathbf{\\Gamma}": '\ud835\udeaa'
  "\\mathbf{\\Delta}": '\ud835\udeab'
  "\\mathbf{\\Epsilon}": '\ud835\udeac'
  "\\mathbf{\\Zeta}": '\ud835\udead'
  "\\mathbf{\\Eta}": '\ud835\udeae'
  "\\mathbf{\\Theta}": '\ud835\udeaf'
  "\\mathbf{\\Iota}": '\ud835\udeb0'
  "\\mathbf{\\Kappa}": '\ud835\udeb1'
  "\\mathbf{\\Lambda}": '\ud835\udeb2'
  "\\mathbf{\\Xi}": '\ud835\udeb5'
  "\\mathbf{\\Pi}": '\ud835\udeb7'
  "\\mathbf{\\Rho}": '\ud835\udeb8'
  "\\mathbf{\\vartheta}": '\ud835\udeb9'
  "\\mathbf{\\Sigma}": '\ud835\udeba'
  "\\mathbf{\\Tau}": '\ud835\udebb'
  "\\mathbf{\\Upsilon}": '\ud835\udebc'
  "\\mathbf{\\Phi}": '\ud835\udebd'
  "\\mathbf{\\Chi}": '\ud835\udebe'
  "\\mathbf{\\Psi}": '\ud835\udebf'
  "\\mathbf{\\Omega}": '\ud835\udec0'
  "\\mathbf{\\nabla}": '\ud835\udec1'
  "\\mathbf{\\theta}": '\ud835\udec9'
  "\\mathbf{\\varsigma}": '\ud835\uded3'
  "\\in": '\ud835\udedc'
  "\\mathbf{\\varkappa}": '\ud835\udede'
  "\\mathbf{\\phi}": '\ud835\udedf'
  "\\mathbf{\\varrho}": '\ud835\udee0'
  "\\mathbf{\\varpi}": '\ud835\udee1'
  "\\mathsl{\\Alpha}": '\ud835\udee2'
  "\\mathsl{\\Beta}": '\ud835\udee3'
  "\\mathsl{\\Gamma}": '\ud835\udee4'
  "\\mathsl{\\Delta}": '\ud835\udee5'
  "\\mathsl{\\Epsilon}": '\ud835\udee6'
  "\\mathsl{\\Zeta}": '\ud835\udee7'
  "\\mathsl{\\Eta}": '\ud835\udee8'
  "\\mathsl{\\Theta}": '\ud835\udee9'
  "\\mathsl{\\Iota}": '\ud835\udeea'
  "\\mathsl{\\Kappa}": '\ud835\udeeb'
  "\\mathsl{\\Lambda}": '\ud835\udeec'
  "\\mathsl{\\Xi}": '\ud835\udeef'
  "\\mathsl{\\Pi}": '\ud835\udef1'
  "\\mathsl{\\Rho}": '\ud835\udef2'
  "\\mathsl{\\vartheta}": '\ud835\udef3'
  "\\mathsl{\\Sigma}": '\ud835\udef4'
  "\\mathsl{\\Tau}": '\ud835\udef5'
  "\\mathsl{\\Upsilon}": '\ud835\udef6'
  "\\mathsl{\\Phi}": '\ud835\udef7'
  "\\mathsl{\\Chi}": '\ud835\udef8'
  "\\mathsl{\\Psi}": '\ud835\udef9'
  "\\mathsl{\\Omega}": '\ud835\udefa'
  "\\mathsl{\\nabla}": '\ud835\udefb'
  "\\mathsl{\\varsigma}": '\ud835\udf0d'
  "\\mathsl{\\varkappa}": '\ud835\udf18'
  "\\mathsl{\\phi}": '\ud835\udf19'
  "\\mathsl{\\varrho}": '\ud835\udf1a'
  "\\mathsl{\\varpi}": '\ud835\udf1b'
  "\\mathbit{\\Alpha}": '\ud835\udf1c'
  "\\mathbit{\\Beta}": '\ud835\udf1d'
  "\\mathbit{\\Gamma}": '\ud835\udf1e'
  "\\mathbit{\\Delta}": '\ud835\udf1f'
  "\\mathbit{\\Epsilon}": '\ud835\udf20'
  "\\mathbit{\\Zeta}": '\ud835\udf21'
  "\\mathbit{\\Eta}": '\ud835\udf22'
  "\\mathbit{\\Theta}": '\ud835\udf23'
  "\\mathbit{\\Iota}": '\ud835\udf24'
  "\\mathbit{\\Kappa}": '\ud835\udf25'
  "\\mathbit{\\Lambda}": '\ud835\udf26'
  "\\mathbit{\\Xi}": '\ud835\udf29'
  "\\mathbit{\\Pi}": '\ud835\udf2b'
  "\\mathbit{\\Rho}": '\ud835\udf2c'
  "\\mathbit{\\Sigma}": '\ud835\udf2e'
  "\\mathbit{\\Tau}": '\ud835\udf2f'
  "\\mathbit{\\Upsilon}": '\ud835\udf30'
  "\\mathbit{\\Phi}": '\ud835\udf31'
  "\\mathbit{\\Chi}": '\ud835\udf32'
  "\\mathbit{\\Psi}": '\ud835\udf33'
  "\\mathbit{\\Omega}": '\ud835\udf34'
  "\\mathbit{\\nabla}": '\ud835\udf35'
  "\\mathbit{\\varsigma}": '\ud835\udf47'
  "\\mathbit{\\vartheta}": '\ud835\udf51'
  "\\mathbit{\\varkappa}": '\ud835\udf52'
  "\\mathbit{\\phi}": '\ud835\udf53'
  "\\mathbit{\\varrho}": '\ud835\udf54'
  "\\mathbit{\\varpi}": '\ud835\udf55'
  "\\mathsfbf{\\Alpha}": '\ud835\udf56'
  "\\mathsfbf{\\Beta}": '\ud835\udf57'
  "\\mathsfbf{\\Gamma}": '\ud835\udf58'
  "\\mathsfbf{\\Delta}": '\ud835\udf59'
  "\\mathsfbf{\\Epsilon}": '\ud835\udf5a'
  "\\mathsfbf{\\Zeta}": '\ud835\udf5b'
  "\\mathsfbf{\\Eta}": '\ud835\udf5c'
  "\\mathsfbf{\\Theta}": '\ud835\udf5d'
  "\\mathsfbf{\\Iota}": '\ud835\udf5e'
  "\\mathsfbf{\\Kappa}": '\ud835\udf5f'
  "\\mathsfbf{\\Lambda}": '\ud835\udf60'
  "\\mathsfbf{\\Xi}": '\ud835\udf63'
  "\\mathsfbf{\\Pi}": '\ud835\udf65'
  "\\mathsfbf{\\Rho}": '\ud835\udf66'
  "\\mathsfbf{\\vartheta}": '\ud835\udf67'
  "\\mathsfbf{\\Sigma}": '\ud835\udf68'
  "\\mathsfbf{\\Tau}": '\ud835\udf69'
  "\\mathsfbf{\\Upsilon}": '\ud835\udf6a'
  "\\mathsfbf{\\Phi}": '\ud835\udf6b'
  "\\mathsfbf{\\Chi}": '\ud835\udf6c'
  "\\mathsfbf{\\Psi}": '\ud835\udf6d'
  "\\mathsfbf{\\Omega}": '\ud835\udf6e'
  "\\mathsfbf{\\nabla}": '\ud835\udf6f'
  "\\mathsfbf{\\varsigma}": '\ud835\udf81'
  "\\mathsfbf{\\varkappa}": '\ud835\udf8c'
  "\\mathsfbf{\\phi}": '\ud835\udf8d'
  "\\mathsfbf{\\varrho}": '\ud835\udf8e'
  "\\mathsfbf{\\varpi}": '\ud835\udf8f'
  "\\mathsfbfsl{\\Alpha}": '\ud835\udf90'
  "\\mathsfbfsl{\\Beta}": '\ud835\udf91'
  "\\mathsfbfsl{\\Gamma}": '\ud835\udf92'
  "\\mathsfbfsl{\\Delta}": '\ud835\udf93'
  "\\mathsfbfsl{\\Epsilon}": '\ud835\udf94'
  "\\mathsfbfsl{\\Zeta}": '\ud835\udf95'
  "\\mathsfbfsl{\\Eta}": '\ud835\udf96'
  "\\mathsfbfsl{\\vartheta}": '\ud835\udf97'
  "\\mathsfbfsl{\\Iota}": '\ud835\udf98'
  "\\mathsfbfsl{\\Kappa}": '\ud835\udf99'
  "\\mathsfbfsl{\\Lambda}": '\ud835\udf9a'
  "\\mathsfbfsl{\\Xi}": '\ud835\udf9d'
  "\\mathsfbfsl{\\Pi}": '\ud835\udf9f'
  "\\mathsfbfsl{\\Rho}": '\ud835\udfa0'
  "\\mathsfbfsl{\\Sigma}": '\ud835\udfa2'
  "\\mathsfbfsl{\\Tau}": '\ud835\udfa3'
  "\\mathsfbfsl{\\Upsilon}": '\ud835\udfa4'
  "\\mathsfbfsl{\\Phi}": '\ud835\udfa5'
  "\\mathsfbfsl{\\Chi}": '\ud835\udfa6'
  "\\mathsfbfsl{\\Psi}": '\ud835\udfa7'
  "\\mathsfbfsl{\\Omega}": '\ud835\udfa8'
  "\\mathsfbfsl{\\nabla}": '\ud835\udfa9'
  "\\mathsfbfsl{\\varsigma}": '\ud835\udfbb'
  "\\mathsfbfsl{\\varkappa}": '\ud835\udfc6'
  "\\mathsfbfsl{\\phi}": '\ud835\udfc7'
  "\\mathsfbfsl{\\varrho}": '\ud835\udfc8'
  "\\mathsfbfsl{\\varpi}": '\ud835\udfc9'
  "\\mathbf{0}": '\ud835\udfce'
  "\\mathbf{1}": '\ud835\udfcf'
  "\\mathbf{2}": '\ud835\udfd0'
  "\\mathbf{3}": '\ud835\udfd1'
  "\\mathbf{4}": '\ud835\udfd2'
  "\\mathbf{5}": '\ud835\udfd3'
  "\\mathbf{6}": '\ud835\udfd4'
  "\\mathbf{7}": '\ud835\udfd5'
  "\\mathbf{8}": '\ud835\udfd6'
  "\\mathbf{9}": '\ud835\udfd7'
  "\\mathbb{0}": '\ud835\udfd8'
  "\\mathbb{1}": '\ud835\udfd9'
  "\\mathbb{2}": '\ud835\udfda'
  "\\mathbb{3}": '\ud835\udfdb'
  "\\mathbb{4}": '\ud835\udfdc'
  "\\mathbb{5}": '\ud835\udfdd'
  "\\mathbb{6}": '\ud835\udfde'
  "\\mathbb{7}": '\ud835\udfdf'
  "\\mathbb{8}": '\ud835\udfe0'
  "\\mathbb{9}": '\ud835\udfe1'
  "\\mathsf{0}": '\ud835\udfe2'
  "\\mathsf{1}": '\ud835\udfe3'
  "\\mathsf{2}": '\ud835\udfe4'
  "\\mathsf{3}": '\ud835\udfe5'
  "\\mathsf{4}": '\ud835\udfe6'
  "\\mathsf{5}": '\ud835\udfe7'
  "\\mathsf{6}": '\ud835\udfe8'
  "\\mathsf{7}": '\ud835\udfe9'
  "\\mathsf{8}": '\ud835\udfea'
  "\\mathsf{9}": '\ud835\udfeb'
  "\\mathsfbf{0}": '\ud835\udfec'
  "\\mathsfbf{1}": '\ud835\udfed'
  "\\mathsfbf{2}": '\ud835\udfee'
  "\\mathsfbf{3}": '\ud835\udfef'
  "\\mathsfbf{4}": '\ud835\udff0'
  "\\mathsfbf{5}": '\ud835\udff1'
  "\\mathsfbf{6}": '\ud835\udff2'
  "\\mathsfbf{7}": '\ud835\udff3'
  "\\mathsfbf{8}": '\ud835\udff4'
  "\\mathsfbf{9}": '\ud835\udff5'
  "\\mathtt{0}": '\ud835\udff6'
  "\\mathtt{1}": '\ud835\udff7'
  "\\mathtt{2}": '\ud835\udff8'
  "\\mathtt{3}": '\ud835\udff9'
  "\\mathtt{4}": '\ud835\udffa'
  "\\mathtt{5}": '\ud835\udffb'
  "\\mathtt{6}": '\ud835\udffc'
  "\\mathtt{7}": '\ud835\udffd'
  "\\mathtt{8}": '\ud835\udffe'
  "\\mathtt{9}": '\ud835\udfff'
  "\\dbend": '\uFFFD'
  "{[}": '['
