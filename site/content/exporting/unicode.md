---
title: Unicode
weight: 8
---
## LaTeX en unicode

If you're lucky and you live in the 21st century or later, you can just use unicode in BibLaTeX and you don't have to bother about anything that follows except if you're the curious kind.

Some of us though are bound to outlets that still demand BibTeX, and there's geezers like me who just prefer the aesthetic of TeX commands over fancy-schmancy unicode, or you find TeX commands easier to search for in your doc than having to memorize how to enter `Ψ`. BBT has an extensive map of unicode characters, but translating unicode to TeX comes with a massive downside -- support for non-ascii characters is scattered across a myriad of packages that you will have to `usepackage` into your document. The default set are supported by your latex distribution, and require nothing extra in your preamble, but to to that I've had to make some compromises. You can amend those choices by telling BBT you have extra packages available. BBT can export commands from the following packages:

<!-- generated tables below -->


### mathrsfs

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  𝓏 |  | \mathscr{z} |  𝓎 |  | \mathscr{y} |  𝓍 |  | \mathscr{x} |  𝓌 |  | \mathscr{w} |
|  𝓋 |  | \mathscr{v} |  𝓊 |  | \mathscr{u} |  𝓉 |  | \mathscr{t} |  𝓈 |  | \mathscr{s} |
|  𝓇 |  | \mathscr{r} |  𝓆 |  | \mathscr{q} |  𝓅 |  | \mathscr{p} |  𝓃 |  | \mathscr{n} |
|  𝓂 |  | \mathscr{m} |  𝓁 |  | \mathscr{l} |  𝓀 |  | \mathscr{k} |  𝒿 |  | \mathscr{j} |
|  𝒾 |  | \mathscr{i} |  𝒽 |  | \mathscr{h} |  𝒻 |  | \mathscr{f} |  𝒹 |  | \mathscr{d} |
|  𝒸 |  | \mathscr{c} |  𝒷 |  | \mathscr{b} |  𝒶 |  | \mathscr{a} |  𝒵 |  | \mathscr{Z} |
|  𝒴 |  | \mathscr{Y} |  𝒳 |  | \mathscr{X} |  𝒲 |  | \mathscr{W} |  𝒱 |  | \mathscr{V} |
|  𝒰 |  | \mathscr{U} |  𝒯 |  | \mathscr{T} |  𝒮 |  | \mathscr{S} |  𝒬 |  | \mathscr{Q} |
|  𝒫 |  | \mathscr{P} |  𝒪 |  | \mathscr{O} |  𝒩 |  | \mathscr{N} |  𝒦 |  | \mathscr{K} |
|  𝒥 |  | \mathscr{J} |  𝒢 |  | \mathscr{G} |  𝒟 |  | \mathscr{D} |  𝒞 |  | \mathscr{C} |
|  𝒜 |  | \mathscr{A} |  ℴ |  | \mathscr{o} |  ℳ |  | \mathscr{M} |  ℱ |  | \mathscr{F} |
|  ℰ |  | \mathscr{E} |  ℯ |  | \mathscr{e} |  ℬ |  | \mathscr{B} |  ℛ |  | \mathscr{R} |
|  ℒ |  | \mathscr{L} |  ℐ |  | \mathscr{I} |  ℋ |  | \mathscr{H} |  ℊ |  | \mathscr{g} |


### unicode-math

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  〰 |  | \hzigzag |  〒 |  | \postalmark |  ⭔ |  | \rightpentagon |  ⭓ |  | \rightpentagonblack |
|  ⭒ |  | \smwhitestar |  ⭑ |  | \medblackstar |  ⭐ |  | \medwhitestar |  ⭌ |  | \rightarrowbsimilar |
|  ⭋ |  | \leftarrowbsimilar |  ⭊ |  | \leftarrowapprox |  ⭉ |  | \similarleftarrow |  ⭈ |  | \rightarrowbackapprox |
|  ⭇ |  | \bsimilarrightarrow |  ⭆ |  | \RRightarrow |  ⭅ |  | \LLeftarrow |  ⭄ |  | \rightarrowsupset |
|  ⭃ |  | \rightarrowgtr |  ⭂ |  | \leftarrowbackapprox |  ⭁ |  | \bsimilarleftarrow |  ⭀ |  | \equalleftarrow |
|  ⬿ |  | \leftcurvedarrow |  ⬾ |  | \leftarrowx |  ⬽ |  | \nVtwoheadleftarrowtail |  ⬼ |  | \nvtwoheadleftarrowtail |
|  ⬻ |  | \twoheadleftarrowtail |  ⬺ |  | \nVleftarrowtail |  ⬹ |  | \nvleftarrowtail |  ⬸ |  | \leftdotarrow |
|  ⬷ |  | \twoheadleftdbkarrow |  ⬶ |  | \twoheadmapsfrom |  ⬵ |  | \nVtwoheadleftarrow |  ⬴ |  | \nvtwoheadleftarrow |
|  ⬳ |  | \longleftsquigarrow |  ⬲ |  | \leftarrowonoplus |  ⬱ |  | \leftthreearrows |  ⬰ |  | \circleonleftarrow |
|  ⬯ |  | \whtvertoval |  ⬮ |  | \blkvertoval |  ⬭ |  | \whthorzoval |  ⬬ |  | \blkhorzoval |
|  ⬫ |  | \smwhtlozenge |  ⬪ |  | \smblklozenge |  ⬩ |  | \smblkdiamond |  ⬨ |  | \mdwhtlozenge |
|  ⬧ |  | \mdblklozenge |  ⬦ |  | \mdwhtdiamond |  ⬥ |  | \mdblkdiamond |  ⬤ |  | \lgblkcircle |
|  ⬣ |  | \hexagonblack |  ⬢ |  | \varhexagonblack |  ⬡ |  | \varhexagon |  ⬠ |  | \pentagon |
|  ⬟ |  | \pentagonblack |  ⬞ |  | \vysmwhtsquare |  ⬝ |  | \vysmblksquare |  ⬜ |  | \lgwhtsquare |
|  ⬛ |  | \lgblksquare |  ⬚ |  | \dottedsquare |  ⬙ |  | \diamondbotblack |  ⬘ |  | \diamondtopblack |
|  ⬗ |  | \diamondrightblack |  ⬖ |  | \diamondleftblack |  ⬕ |  | \squarellblack |  ⬔ |  | \squareurblack |
|  ⬓ |  | \squarebotblack |  ⬒ |  | \squaretopblack |  ⫿ |  | \bigtalloblong |  ⫾ |  | \talloblong |
|  ⫼ |  | \biginterleave |  ⫻ |  | \trslash |  ⫺ |  | \geqqslant |  ⫹ |  | \leqqslant |
|  ⫸ |  | \gggnest |  ⫷ |  | \lllnest |  ⫶ |  | \threedotcolon |  ⫵ |  | \nhVvert |
|  ⫴ |  | \interleave |  ⫳ |  | \parsim |  ⫲ |  | \nhpar |  ⫱ |  | \topcir |
|  ⫰ |  | \midcir |  ⫯ |  | \cirmid |  ⫮ |  | \revnmid |  ⫭ |  | \bNot |
|  ⫬ |  | \Not |  ⫫ |  | \Vbar |  ⫩ |  | \vBarv |  ⫨ |  | \vBar |
|  ⫧ |  | \Barv |  ⫦ |  | \varVdash |  ⫥ |  | \DashV |  ⫤ |  | \Dashv |
|  ⫣ |  | \dashV |  ⫢ |  | \vDdash |  ⫡ |  | \perps |  ⫠ |  | \shortuptack |
|  ⫟ |  | \shortdowntack |  ⫞ |  | \shortlefttack |  ⫝ |  | \forksnot |  ⫝̸ |  | \forks |
|  ⫛ |  | \mlcp |  ⫚ |  | \topfork |  ⫙ |  | \forkv |  ⫘ |  | \supdsub |
|  ⫗ |  | \suphsub |  ⫖ |  | \supsup |  ⫕ |  | \subsub |  ⫔ |  | \supsub |
|  ⫓ |  | \subsup |  ⫒ |  | \csupe |  ⫑ |  | \csube |  ⫐ |  | \csup |
|  ⫏ |  | \csub |  ⫎ |  | \rsqhook |  ⫍ |  | \lsqhook |  ⫌ |  | \supsetneqq |
|  ⫋ |  | \subsetneqq |  ⫊ |  | \supsetapprox |  ⫉ |  | \subsetapprox |  ⫈ |  | \supsim |
|  ⫇ |  | \subsim |  ⫆ |  | \supseteqq |  ⫅ |  | \subseteqq |  ⫄ |  | \supedot |
|  ⫃ |  | \subedot |  ⫂ |  | \supmult |  ⫁ |  | \submult |  ⫀ |  | \supsetplus |
|  ⪿ |  | \subsetplus |  ⪾ |  | \supsetdot |  ⪽ |  | \subsetdot |  ⪺ |  | \succnapprox |
|  ⪹ |  | \precnapprox |  ⪸ |  | \succapprox |  ⪷ |  | \precapprox |  ⪶ |  | \succneqq |
|  ⪵ |  | \precneqq |  ⪴ |  | \succeqq |  ⪳ |  | \preceqq |  ⪲ |  | \succneq |
|  ⪱ |  | \precneq |  ⪮ |  | \bumpeqq |  ⪭ |  | \late |  ⪬ |  | \smte |
|  ⪫ |  | \lat |  ⪪ |  | \smt |  ⪩ |  | \gescc |  ⪨ |  | \lescc |
|  ⪥ |  | \gla |  ⪤ |  | \glj |  ⪣ |  | \partialmeetcontraction |  ⪠ |  | \simgE |
|  ⪟ |  | \simlE |  ⪞ |  | \simgtr |  ⪝ |  | \simless |  ⪜ |  | \eqqslantgtr |
|  ⪛ |  | \eqqslantless |  ⪚ |  | \eqqgtr |  ⪙ |  | \eqqless |  ⪘ |  | \egsdot |
|  ⪗ |  | \elsdot |  ⪖ |  | \eqslantgtr |  ⪕ |  | \eqslantless |  ⪔ |  | \gesles |
|  ⪓ |  | \lesges |  ⪒ |  | \glE |  ⪑ |  | \lgE |  ⪐ |  | \gsiml |
|  ⪏ |  | \lsimg |  ⪎ |  | \gsime |  ⪍ |  | \lsime |  ⪌ |  | \gtreqqless |
|  ⪋ |  | \lesseqqgtr |  ⪊ |  | \gnapprox |  ⪉ |  | \lnapprox |  ⪈ |  | \gneq |
|  ⪇ |  | \lneq |  ⪆ |  | \gtrapprox |  ⪅ |  | \lessapprox |  ⪄ |  | \gesdotol |
|  ⪃ |  | \lesdotor |  ⪂ |  | \gesdoto |  ⪁ |  | \lesdoto |  ⪀ |  | \gesdot |
|  ⩿ |  | \lesdot |  ⩾ |  | \geqslant |  ⩽ |  | \leqslant |  ⩼ |  | \gtquest |
|  ⩻ |  | \ltquest |  ⩺ |  | \gtcir |  ⩹ |  | \ltcir |  ⩸ |  | \equivDD |
|  ⩷ |  | \ddotseq |  ⩴ |  | \Coloneqq |  ⩳ |  | \eqqsim |  ⩲ |  | \pluseqq |
|  ⩱ |  | \eqqplus |  ⩰ |  | \approxeqq |  ⩯ |  | \hatapprox |  ⩭ |  | \congdot |
|  ⩬ |  | \simminussim |  ⩫ |  | \simrdots |  ⩪ |  | \dotsim |  ⩩ |  | \equivVvert |
|  ⩨ |  | \equivVert |  ⩧ |  | \dotequiv |  ⩦ |  | \eqdot |  ⩥ |  | \rsub |
|  ⩤ |  | \dsub |  ⩣ |  | \veedoublebar |  ⩢ |  | \doublebarvee |  ⩡ |  | \varveebar |
|  ⩠ |  | \wedgedoublebar |  ⩟ |  | \wedgebar |  ⩝ |  | \midbarvee |  ⩜ |  | \midbarwedge |
|  ⩛ |  | \veemidvert |  ⩚ |  | \wedgemidvert |  ⩙ |  | \veeonwedge |  ⩘ |  | \bigslopedwedge |
|  ⩗ |  | \bigslopedvee |  ⩕ |  | \wedgeonwedge |  ⩔ |  | \Vee |  ⩓ |  | \Wedge |
|  ⩒ |  | \veeodot |  ⩑ |  | \wedgeodot |  ⩐ |  | \closedvarcupsmashprod |  ⩏ |  | \Sqcup |
|  ⩎ |  | \Sqcap |  ⩍ |  | \closedvarcap |  ⩌ |  | \closedvarcup |  ⩋ |  | \twocaps |
|  ⩊ |  | \twocups |  ⩉ |  | \capbarcup |  ⩈ |  | \cupbarcap |  ⩇ |  | \capovercup |
|  ⩆ |  | \cupovercap |  ⩅ |  | \cupvee |  ⩄ |  | \capwedge |  ⩃ |  | \barcap |
|  ⩂ |  | \barcup |  ⩁ |  | \uminus |  ⩀ |  | \capdot |  ⨾ |  | \fcmp |
|  ⨽ |  | \intprodr |  ⨼ |  | \intprod |  ⨻ |  | \triangletimes |  ⨺ |  | \triangleminus |
|  ⨹ |  | \triangleplus |  ⨸ |  | \odiv |  ⨷ |  | \Otimes |  ⨶ |  | \otimeshat |
|  ⨵ |  | \otimesrhrim |  ⨴ |  | \otimeslhrim |  ⨳ |  | \smashtimes |  ⨲ |  | \btimes |
|  ⨱ |  | \timesbar |  ⨰ |  | \dottimes |  ⨯ |  | \vectimes |  ⨮ |  | \oplusrhrim |
|  ⨭ |  | \opluslhrim |  ⨬ |  | \minusrdots |  ⨫ |  | \minusfdots |  ⨪ |  | \minusdot |
|  ⨩ |  | \commaminus |  ⨨ |  | \plustrif |  ⨧ |  | \plussubtwo |  ⨦ |  | \plussim |
|  ⨥ |  | \plusdot |  ⨤ |  | \simplus |  ⨣ |  | \plushat |  ⨢ |  | \ringplus |
|  ⨡ |  | \zproject |  ⨠ |  | \zpipe |  ⨟ |  | \zcmp |  ⨞ |  | \bigtriangleleft |
|  ⨝ |  | \Join |  ⨜ |  | \lowint |  ⨛ |  | \upint |  ⨚ |  | \intcup |
|  ⨙ |  | \intcap |  ⨘ |  | \intx |  ⨗ |  | \intlarhk |  ⨕ |  | \pointint |
|  ⨔ |  | \npolint |  ⨓ |  | \scpolint |  ⨒ |  | \rppolint |  ⨑ |  | \awint |
|  ⨐ |  | \cirfnint |  ⨎ |  | \intBar |  ⨍ |  | \intbar |  ⨌ |  | \iiiint |
|  ⨋ |  | \sumint |  ⨊ |  | \modtwosum |  ⨈ |  | \disjquant |  ⨇ |  | \conjquant |
|  ⨅ |  | \bigsqcap |  ⨄ |  | \Elxuplus |  ⨃ |  | \bigcupdot |  ⧿ |  | \tminus |
|  ⧾ |  | \tplus |  ⧽ |  | \rcurvyangle |  ⧼ |  | \lcurvyangle |  ⧻ |  | \tripleplus |
|  ⧺ |  | \doubleplus |  ⧸ |  | \xsol |  ⧷ |  | \rsolbar |  ⧶ |  | \dsol |
|  ⧴ |  | \RuleDelayed |  ⧳ |  | \errbarblackcircle |  ⧲ |  | \errbarcircle |  ⧱ |  | \errbarblackdiamond |
|  ⧰ |  | \errbardiamond |  ⧯ |  | \errbarblacksquare |  ⧮ |  | \errbarsquare |  ⧭ |  | \blackcircledownarrow |
|  ⧬ |  | \circledownarrow |  ⧫ |  | \blacklozenge |  ⧪ |  | \blackdiamonddownarrow |  ⧩ |  | \downtrianglerightblack |
|  ⧨ |  | \downtriangleleftblack |  ⧧ |  | \thermod |  ⧦ |  | \gleichstark |  ⧥ |  | \eqvparsl |
|  ⧤ |  | \smeparsl |  ⧣ |  | \eparsl |  ⧢ |  | \shuffle |  ⧡ |  | \lrtriangleeq |
|  ⧠ |  | \laplac |  ⧞ |  | \nvinfty |  ⧝ |  | \tieinfty |  ⧜ |  | \iinfin |
|  ⧛ |  | \Rvzigzag |  ⧚ |  | \Lvzigzag |  ⧙ |  | \rvzigzag |  ⧘ |  | \lvzigzag |
|  ⧗ |  | \blackhourglass |  ⧖ |  | \hourglass |  ⧕ |  | \rftimes |  ⧔ |  | \lftimes |
|  ⧓ |  | \fbowtie |  ⧒ |  | \rfbowtie |  ⧑ |  | \lfbowtie |  ⧎ |  | \rtriltri |
|  ⧍ |  | \triangleserifs |  ⧌ |  | \triangles |  ⧋ |  | \triangleubar |  ⧊ |  | \triangleodot |
|  ⧉ |  | \boxonbox |  ⧈ |  | \boxbox |  ⧇ |  | \boxcircle |  ⧆ |  | \boxast |
|  ⧅ |  | \boxbslash |  ⧃ |  | \cirE |  ⧂ |  | \cirscir |  ⧁ |  | \circledgtr |
|  ⧀ |  | \circledless |  ⦿ |  | \circledbullet |  ⦾ |  | \circledwhitebullet |  ⦽ |  | \uparrowoncircle |
|  ⦼ |  | \odotslashdot |  ⦻ |  | \olcross |  ⦺ |  | \obot |  ⦹ |  | \operp |
|  ⦸ |  | \circledbslash |  ⦷ |  | \circledparallel |  ⦶ |  | \circledvert |  ⦵ |  | \circlehbar |
|  ⦴ |  | \emptysetoarrl |  ⦳ |  | \emptysetoarr |  ⦲ |  | \emptysetocirc |  ⦱ |  | \emptysetobar |
|  ⦰ |  | \revemptyset |  ⦯ |  | \measangledltosw |  ⦮ |  | \measangledrtose |  ⦭ |  | \measangleultonw |
|  ⦬ |  | \measangleurtone |  ⦫ |  | \measangleldtosw |  ⦪ |  | \measanglerdtose |  ⦩ |  | \measanglelutonw |
|  ⦨ |  | \measanglerutone |  ⦧ |  | \wideangleup |  ⦦ |  | \wideangledown |  ⦥ |  | \revangleubar |
|  ⦤ |  | \angleubar |  ⦣ |  | \revangle |  ⦢ |  | \turnangle |  ⦡ |  | \sphericalangleup |
|  ⦠ |  | \gtlpar |  ⦟ |  | \angdnr |  ⦞ |  | \angles |  ⦝ |  | \rightanglemdot |
|  ⦛ |  | \measuredangleleft |  ⦚ |  | \vzigzag |  ⦙ |  | \fourvdots |  ⦘ |  | \rblkbrbrak |
|  ⦗ |  | \lblkbrbrak |  ⦖ |  | \Rparenless |  ⦕ |  | \Lparengtr |  ⦔ |  | \rparengtr |
|  ⦓ |  | \lparenless |  ⦒ |  | \rangledot |  ⦑ |  | \langledot |  ⦐ |  | \rbrackurtick |
|  ⦏ |  | \lbracklltick |  ⦎ |  | \rbracklrtick |  ⦍ |  | \lbrackultick |  ⦌ |  | \rbrackubar |
|  ⦋ |  | \lbrackubar |  ⦇ |  | \limg |  ⦆ |  | \Elroang |  ⦅ |  | \lParen |
|  ⦄ |  | \rBrace |  ⦃ |  | \lBrace |  ⦂ |  | \typecolon |  ⦁ |  | \spot |
|  ⦀ |  | \Vvert |  ⥿ |  | \downfishtail |  ⥾ |  | \upfishtail |  ⥽ |  | \rightfishtail |
|  ⥼ |  | \leftfishtail |  ⥻ |  | \suplarr |  ⥺ |  | \leftarrowsubset |  ⥹ |  | \subrarr |
|  ⥸ |  | \gtrarr |  ⥷ |  | \leftarrowless |  ⥶ |  | \ltlarr |  ⥵ |  | \rightarrowapprox |
|  ⥴ |  | \rightarrowsimilar |  ⥳ |  | \leftarrowsimilar |  ⥲ |  | \similarrightarrow |  ⥱ |  | \equalrightarrow |
|  ⥩ |  | \rightleftharpoonsdown |  ⥨ |  | \rightleftharpoonsup |  ⥧ |  | \leftrightharpoonsdown |  ⥦ |  | \leftrightharpoonsup |
|  ⥐ |  | \DownLeftRightVector |  ⥎ |  | \leftrightharpoonupup |  ⥍ |  | \updownharpoonleftright |  ⥌ |  | \updownharpoonrightleft |
|  ⥉ |  | \twoheaduparrowcircle |  ⥈ |  | \leftrightarrowcircle |  ⥇ |  | \rightarrowx |  ⥆ |  | \leftarrowplus |
|  ⥅ |  | \rightarrowplus |  ⥄ |  | \shortrightarrowleftarrow |  ⥃ |  | \leftarrowshortrightarrow |  ⥂ |  | \rightarrowshortleftarrow |
|  ⤿ |  | \ccwundercurvearrow |  ⤾ |  | \cwundercurvearrow |  ⤽ |  | \curvearrowleftplus |  ⤼ |  | \curvearrowrightminus |
|  ⤻ |  | \acwunderarcarrow |  ⤺ |  | \acwoverarcarrow |  ⤹ |  | \acwleftarcarrow |  ⤸ |  | \cwrightarcarrow |
|  ⤷ |  | \rightdowncurvedarrow |  ⤶ |  | \leftdowncurvedarrow |  ⤵ |  | \downrightcurvedarrow |  ⤴ |  | \uprightcurvearrow |
|  ⤳ |  | \rightcurvedarrow |  ⤲ |  | \nwovnearrow |  ⤱ |  | \neovnwarrow |  ⤰ |  | \rdiagovsearrow |
|  ⤯ |  | \fdiagovnearrow |  ⤮ |  | \neovsearrow |  ⤭ |  | \seovnearrow |  ⤬ |  | \fdiagovrdiag |
|  ⤫ |  | \rdiagovfdiag |  ⤪ |  | \towa |  ⤩ |  | \tosa |  ⤨ |  | \toea |
|  ⤧ |  | \tona |  ⤦ |  | \hkswarrow |  ⤥ |  | \hksearrow |  ⤤ |  | \hknearrow |
|  ⤣ |  | \hknwarrow |  ⤢ |  | \neswarrow |  ⤡ |  | \nwsearrow |  ⤠ |  | \barrightarrowdiamond |
|  ⤟ |  | \diamondleftarrowbar |  ⤞ |  | \rightarrowdiamond |  ⤝ |  | \diamondleftarrow |  ⤜ |  | \rightdbltail |
|  ⤛ |  | \leftdbltail |  ⤚ |  | \righttail |  ⤙ |  | \lefttail |  ⤘ |  | \nVtwoheadrightarrowtail |
|  ⤗ |  | \nvtwoheadrightarrowtail |  ⤑ |  | \rightdotarrow |  ⤐ |  | \drbkarrow |  ⤏ |  | \dbkarrow |
|  ⤎ |  | \leftdbkarrow |  ⤍ |  | \rightbkarrow |  ⤌ |  | \leftbkarrow |  ⤋ |  | \Ddownarrow |
|  ⤊ |  | \Uuparrow |  ⤉ |  | \uparrowbarred |  ⤈ |  | \downarrowbarred |  ⤇ |  | \Mapsto |
|  ⤆ |  | \Mapsfrom |  ⤅ |  | \twoheadmapsto |  ⤄ |  | \nvLeftrightarrow |  ⤃ |  | \nvRightarrow |
|  ⤂ |  | \nvLeftarrow |  ⤁ |  | \nVtwoheadrightarrow |  ⟿ |  | \longrightsquigarrow |  ⟾ |  | \Longmapsto |
|  ⟽ |  | \Longmapsfrom |  ⟻ |  | \longmapsfrom |  ⟴ |  | \rightarrowonoplus |  ⟳ |  | \cwgapcirclearrow |
|  ⟲ |  | \acwgapcirclearrow |  ⟱ |  | \DDownarrow |  ⟰ |  | \UUparrow |  ⟭ |  | \Rbrbrak |
|  ⟬ |  | \Lbrbrak |  ⟫ |  | \rang |  ⟥ |  | \whitesquaretickright |  ⟤ |  | \whitesquaretickleft |
|  ⟣ |  | \concavediamondtickright |  ⟢ |  | \concavediamondtickleft |  ⟡ |  | \concavediamond |  ⟠ |  | \lozengeminus |
|  ⟟ |  | \cirbot |  ⟞ |  | \longdashv |  ⟝ |  | \vlongdash |  ⟜ |  | \multimapinv |
|  ⟛ |  | \dashVdash |  ⟚ |  | \DashVDash |  ⟙ |  | \bigtop |  ⟘ |  | \bigbot |
|  ⟗ |  | \fullouterjoin |  ⟖ |  | \rightouterjoin |  ⟕ |  | \leftouterjoin |  ⟔ |  | \pushout |
|  ⟓ |  | \pullback |  ⟒ |  | \upin |  ⟑ |  | \wedgedot |  ⟍ |  | \diagdown |
|  ⟌ |  | \longdivision |  ⟋ |  | \diagup |  ⟉ |  | \suphsol |  ⟈ |  | \bsolhsub |
|  ⟇ |  | \veedot |  ⟄ |  | \supsetcirc |  ⟃ |  | \subsetcirc |  ⟁ |  | \whiteinwhitetriangle |
|  ⟀ |  | \threedangle |  ➛ |  | \draftingarrow |  ❳ |  | \rbrbrak |  ❲ |  | \lbrbrak |
|  ✽ |  | \dingasterisk |  ✶ |  | \varstar |  ✪ |  | \circledstar |  ✠ |  | \maltese |
|  ✓ |  | \checkmark |  ⚲ |  | \neuter |  ⚬ |  | \mdsmwhtcircle |  ⚥ |  | \Hermaphrodite |
|  ⚉ |  | \blackcircledtwodots |  ⚈ |  | \blackcircledrightdot |  ⚇ |  | \circledtwodots |  ⚆ |  | \circledrightdot |
|  ⚅ |  | \dicevi |  ⚄ |  | \dicev |  ⚃ |  | \diceiv |  ⚂ |  | \diceiii |
|  ⚁ |  | \diceii |  ⚀ |  | \dicei |  ♾ |  | \acidfree |  ♬ |  | \sixteenthnote |
|  ♫ |  | \twonotes |  ♪ |  | \eighthnote |  ♩ |  | \quarternote |  ♧ |  | \varclubsuit |
|  ♦ |  | \vardiamondsuit |  ♥ |  | \varheartsuit |  ♤ |  | \varspadesuit |  ♂ |  | \male |
|  ♀ |  | \female |  ☾ |  | \leftmoon |  ☽ |  | \rightmoon |  ☼ |  | \sun |
|  ☻ |  | \blacksmiley |  ☡ |  | \danger |  ☆ |  | \bigwhitestar |  ★ |  | \bigstar |
|  ◿ |  | \lrtriangle |  ◾ |  | \mdsmblksquare |  ◽ |  | \mdsmwhtsquare |  ◼ |  | \mdblksquare |
|  ◻ |  | \mdwhtsquare |  ◺ |  | \lltriangle |  ◹ |  | \urtriangle |  ◸ |  | \ultriangle |
|  ◷ |  | \circleurquad |  ◶ |  | \circlelrquad |  ◵ |  | \circlellquad |  ◴ |  | \circleulquad |
|  ◳ |  | \squareurquad |  ◲ |  | \squarelrquad |  ◱ |  | \squarellquad |  ◰ |  | \squareulquad |
|  ◮ |  | \trianglerightblack |  ◭ |  | \triangleleftblack |  ◬ |  | \trianglecdot |  ◫ |  | \boxbar |
|  ◪ |  | \squarelrblack |  ◩ |  | \squareulblack |  ◨ |  | \squarerightblack |  ◧ |  | \squareleftblack |
|  ◦ |  | \smwhtcircle |  ◥ |  | \urblacktriangle |  ◤ |  | \ulblacktriangle |  ◣ |  | \llblacktriangle |
|  ◢ |  | \lrblacktriangle |  ◡ |  | \botsemicircle |  ◠ |  | \topsemicircle |  ◟ |  | \llarc |
|  ◞ |  | \lrarc |  ◝ |  | \urarc |  ◜ |  | \ularc |  ◛ |  | \invwhitelowerhalfcircle |
|  ◚ |  | \invwhiteupperhalfcircle |  ◙ |  | \inversewhitecircle |  ◘ |  | \inversebullet |  ◗ |  | \blackrighthalfcircle |
|  ◖ |  | \blacklefthalfcircle |  ◕ |  | \blackcircleulquadwhite |  ◔ |  | \circleurquadblack |  ◓ |  | \circletophalfblack |
|  ◒ |  | \circlebottomhalfblack |  ◑ |  | \circlerighthalfblack |  ◐ |  | \circlelefthalfblack |  ◎ |  | \bullseye |
|  ◍ |  | \circlevertfill |  ◌ |  | \dottedcircle |  ◊ |  | \lozenge |  ◉ |  | \fisheye |
|  ◈ |  | \blackinwhitediamond |  ◅ |  | \whitepointerleft |  ◄ |  | \blackpointerleft |  ◃ |  | \smalltriangleleft |
|  ◂ |  | \smallblacktriangleleft |  ▿ |  | \triangledown |  ▾ |  | \blacktriangledown |  ▼ |  | \bigblacktriangledown |
|  ▻ |  | \whitepointerright |  ► |  | \blackpointerright |  ▹ |  | \smalltriangleright |  ▸ |  | \smallblacktriangleright |
|  ▵ |  | \vartriangle |  ▴ |  | \blacktriangle |  △ |  | \bigtriangleup |  ▲ |  | \bigblacktriangleup |
|  ▱ |  | \parallelogram |  ▰ |  | \parallelogramblack |  ▯ |  | \vrectangle |  ▮ |  | \vrectangleblack |
|  ▭ |  | \hrectangle |  ▬ |  | \hrectangleblack |  ▫ |  | \smwhtsquare |  ▪ |  | \smblksquare |
|  ▩ |  | \squarecrossfill |  ▨ |  | \squareneswfill |  ▧ |  | \squarenwsefill |  ▦ |  | \squarehvfill |
|  ▥ |  | \squarevfill |  ▤ |  | \squarehfill |  ▣ |  | \blackinwhitesquare |  ▢ |  | \squoval |
|  ■ |  | \mdlgblksquare |  ▓ |  | \blockthreeqtrshaded |  ▒ |  | \blockhalfshaded |  ░ |  | \blockqtrshaded |
|  ▐ |  | \blockrighthalf |  ▌ |  | \blocklefthalf |  █ |  | \blockfull |  ▄ |  | \blocklowhalf |
|  ▀ |  | \blockuphalf |  ┆ |  | \bdtriplevdash |  ␣ |  | \mathvisiblespace |  ␢ |  | \blanksymbol |
|  ⏧ |  | \elinters |  ⏦ |  | \accurrent |  ⏥ |  | \fltns |  ⏤ |  | \strns |
|  ⏣ |  | \benzenr |  ⏢ |  | \trapezium |  ⏡ |  | \ubrbrak |  ⏠ |  | \obrbrak |
|  ⏟ |  | \underbrace |  ⏞ |  | \overbrace |  ⏝ |  | \underparen |  ⏜ |  | \overparen |
|  ⏎ |  | \varcarriagereturn |  ⎹ |  | \rvboxline |  ⎸ |  | \lvboxline |  ⎷ |  | \sqrtbottom |
|  ⎶ |  | \bbrktbrk |  ⎵ |  | \underbracket |  ⎴ |  | \overbracket |  ⎳ |  | \sumbottom |
|  ⎲ |  | \sumtop |  ⎯ |  | \harrowextender |  ⎮ |  | \intextender |  ⎭ |  | \rbracelend |
|  ⎬ |  | \rbracemid |  ⎫ |  | \rbraceuend |  ⎪ |  | \vbraceextender |  ⎩ |  | \lbracelend |
|  ⎨ |  | \lbracemid |  ⎧ |  | \lbraceuend |  ⎦ |  | \rbracklend |  ⎥ |  | \rbrackextender |
|  ⎤ |  | \rbrackuend |  ⎣ |  | \lbracklend |  ⎢ |  | \lbrackextender |  ⎡ |  | \lbrackuend |
|  ⎠ |  | \rparenlend |  ⎟ |  | \rparenextender |  ⎞ |  | \rparenuend |  ⎝ |  | \lparenlend |
|  ⎜ |  | \lparenextender |  ⎛ |  | \lparenuend |  ⎔ |  | \hexagon |  ⍼ |  | \rangledownzigzagarrow |
|  ⍰ |  | \APLboxquestion |  ⍓ |  | \APLboxupcaret |  ⌽ |  | \obar |  ⌶ |  | \topbot |
|  ⌲ |  | \conictaper |  ⌬ |  | \varhexagonlrbonds |  ⌡ |  | \intbottom |  ⌠ |  | \inttop |
|  ⌟ |  | \lrcorner |  ⌞ |  | \llcorner |  ⌝ |  | \urcorner |  ⌜ |  | \ulcorner |
|  ⌙ |  | \turnednot |  ⌗ |  | \viewdata |  ⌓ |  | \profsurf |  ⌒ |  | \profline |
|  ⌐ |  | \invneg |  ⌅ | \barwedge | \varbarwedge |  ⌂ |  | \house |  ⌀ |  | \diameter |
|  ⋿ |  | \bagmember |  ⋾ |  | \niobar |  ⋽ |  | \varniobar |  ⋼ |  | \nis |
|  ⋻ |  | \varnis |  ⋺ |  | \nisd |  ⋹ |  | \isinE |  ⋸ |  | \isinvb |
|  ⋷ |  | \isinobar |  ⋵ |  | \isindot |  ⋴ |  | \isins |  ⋳ |  | \varisins |
|  ⋲ |  | \disin |  ⋭ |  | \ntrianglerighteq |  ⋬ |  | \ntrianglelefteq |  ⋩ |  | \succnsim |
|  ⋨ |  | \precedesnotsimilar |  ⋧ |  | \gnsim |  ⋦ |  | \lnsim |  ⋥ |  | \sqsupsetneq |
|  ⋤ |  | \sqsubsetneq |  ⋡ |  | \nsucceq |  ⋠ |  | \npreceq |  ⋟ |  | \curlyeqsucc |
|  ⋞ |  | \curlyeqprec |  ⋝ |  | \eqgtr |  ⋜ |  | \eqless |  ⋛ |  | \gtreqless |
|  ⋚ |  | \lesseqgtr |  ⋗ |  | \gtrdot |  ⋖ |  | \lessdot |  ⋕ |  | \hash |
|  ⋔ |  | \pitchfork |  ⋓ |  | \Cup |  ⋒ |  | \Cap |  ⋑ |  | \Supset |
|  ⋐ |  | \Subset |  ⋏ |  | \curlywedge |  ⋎ |  | \curlyvee |  ⋍ |  | \backsimeq |
|  ⋌ |  | \rightthreetimes |  ⋋ |  | \leftthreetimes |  ⋊ |  | \rtimes |  ⋉ |  | \ltimes |
|  ⋇ |  | \divideontimes |  ⊿ |  | \varlrtriangle |  ⊽ |  | \barvee |  ⊼ |  | \barwedge |
|  ⊻ |  | \veebar |  ⊺ |  | \intercal |  ⊸ |  | \multimap |  ⊵ |  | \trianglerighteq |
|  ⊴ |  | \trianglelefteq |  ⊳ |  | \vartriangleright |  ⊲ |  | \vartriangleleft |  ⊱ |  | \scurel |
|  ⊰ |  | \prurel |  ⊯ |  | \nVDash |  ⊮ |  | \nVdash |  ⊭ |  | \nvDash |
|  ⊬ |  | \nvdash |  ⊫ |  | \VDash |  ⊪ |  | \Vvdash |  ⊩ |  | \Vdash |
|  ⊦ |  | \assert |  ⊡ |  | \boxdot |  ⊠ |  | \boxtimes |  ⊟ |  | \boxminus |
|  ⊞ |  | \boxplus |  ⊝ |  | \circleddash |  ⊜ |  | \circledequal |  ⊛ |  | \circledast |
|  ⊚ |  | \circledcirc |  ⊐ |  | \sqsupset |  ⊏ |  | \sqsubset |  ⊍ |  | \cupdot |
|  ⊌ |  | \cupleftarrow |  ⊋ |  | \supsetneq |  ⊊ |  | \subsetneq |  ≽ |  | \succcurlyeq |
|  ≼ |  | \preccurlyeq |  ≷ |  | \gtrless |  ≶ |  | \lessgtr |  ≵ |  | \ngtrsim |
|  ≴ |  | \nlesssim |  ≭ |  | \nasymp |  ≬ |  | \between |  ≩ |  | \gneqq |
|  ≨ |  | \lneqq |  ≣ |  | \Equiv |  ≟ |  | \questeq |  ≞ |  | \measeq |
|  ≝ |  | \eqdef |  ≜ |  | \triangleq |  ≚ |  | \veeeq |  ≘ |  | \arceq |
|  ≗ |  | \circeq |  ≖ |  | \eqcirc |  ≔ |  | \coloneq |  ≓ |  | \risingdotseq |
|  ≒ |  | \fallingdotseq |  ≏ |  | \bumpeq |  ≎ |  | \Bumpeq |  ≊ |  | \approxeq |
|  ∽ |  | \backsim |  ∹ |  | \eqcolon |  ∷ |  | \Colon |  ∵ |  | \because |
|  ∴ |  | \therefore |  ∲ |  | \lcirclerightint |  ∦ |  | \nparallel |  ∤ |  | \nmid |
|  ∢ |  | \sphericalangle |  ∡ |  | \measuredangle |  ∟ |  | \rightangle |  √ |  | \sqrt |
|  ∕ |  | \divslash |  ∔ |  | \dotplus |  ∎ |  | \QED |  ∍ |  | \smallni |
|  ∊ |  | \smallin |  ∇ |  | \nabla |  ∆ |  | \increment |  ∅ |  | \varnothing |
|  ∄ |  | \nexists |  ∁ |  | \complement |  ⇿ |  | \leftrightarrowtriangle |  ⇾ |  | \rightarrowtriangle |
|  ⇽ |  | \leftarrowtriangle |  ⇼ |  | \nVleftrightarrow |  ⇺ |  | \nVleftarrow |  ⇹ |  | \nvleftrightarrow |
|  ⇷ |  | \nvleftarrow |  ⇶ |  | \rightthreearrows |  ⇴ |  | \circleonrightarrow |  ⇪ |  | \whitearrowupfrombar |
|  ⇩ |  | \downwhitearrow |  ⇨ |  | \rightwhitearrow |  ⇧ |  | \upwhitearrow |  ⇦ |  | \leftwhitearrow |
|  ⇣ |  | \downdasharrow |  ⇡ |  | \updasharrow |  ⇟ |  | \nHdownarrow |  ⇞ |  | \nHuparrow |
|  ⇝ |  | \rightsquigarrow |  ⇜ |  | \leftsquigarrow |  ⇛ |  | \Rrightarrow |  ⇚ |  | \Lleftarrow |
|  ⇙ |  | \Swarrow |  ⇘ |  | \Searrow |  ⇗ |  | \Nearrow |  ⇖ |  | \Nwarrow |
|  ⇏ |  | \nRightarrow |  ⇎ |  | \nLeftrightarrow |  ⇍ |  | \nLeftarrow |  ⇋ |  | \leftrightharpoons |
|  ⇊ |  | \downdownarrows |  ⇉ |  | \rightrightarrows |  ⇈ |  | \upuparrows |  ⇇ |  | \leftleftarrows |
|  ⇆ |  | \leftrightarrows |  ⇄ |  | \rightleftarrows |  ⇃ |  | \downharpoonleft |  ⇂ |  | \downharpoonright |
|  ⇁ |  | \rightharpoondown |  ↿ |  | \upharpoonleft |  ↾ |  | \upharpoonright |  ↺ |  | \circlearrowleft |
|  ↹ |  | \barleftarrowrightarrowbar |  ↸ |  | \barovernorthwestarrow |  ↷ |  | \curvearrowright |  ↶ |  | \curvearrowleft |
|  ↵ |  | \carriagereturn |  ↴ |  | \linefeed |  ↳ | \reflectbox{\carriagereturn} | \Rdsh |  ↱ |  | \Rsh |
|  ↰ |  | \Lsh |  ↮ |  | \nleftrightarrow |  ↭ |  | \leftrightsquigarrow |  ↬ |  | \looparrowright |
|  ↫ |  | \looparrowleft |  ↨ |  | \updownarrowbar |  ↧ |  | \mapsdown |  ↥ |  | \mapsup |
|  ↤ |  | \mapsfrom |  ↣ |  | \rightarrowtail |  ↢ |  | \leftarrowtail |  ↡ |  | \twoheaddownarrow |
|  ↠ |  | \twoheadrightarrow |  ↟ |  | \twoheaduparrow |  ↞ |  | \twoheadleftarrow |  ↛ |  | \nrightarrow |
|  ↚ |  | \nleftarrow |  ⅊ |  | \PropertyLine |  ⅅ |  | \CapitalDifferentialD |  ⅄ |  | \Yup |
|  ⅃ |  | \sansLmirrored |  ⅂ |  | \sansLturned |  ⅁ |  | \Game |  ℸ |  | \daleth |
|  ℷ |  | \gimel |  ℶ |  | \beth |  Ⅎ |  | \Finv |  ℩ |  | \turnediota |
|  ℧ |  | \mho |  ℛ |  | \mscrR |  ℒ |  | \mscrL |  ℏ |  | \hslash |
|  ℎ |  | \Planckconst |  ⃰ |  | \asteraccent |  ⃯ |  | \underrightarrow |  ⃮ |  | \underleftarrow |
|  ⃭ |  | \underleftharpoondown |  ⃬ |  | \underrightharpoondown |  ⃩ |  | \widebridgeabove |  ⃨ |  | \threeunderdot |
|  ⃧ |  | \annuity |  ⃤ |  | \enclosetriangle |  ⃡ |  | \overleftrightarrow |  ⃟ |  | \enclosediamond |
|  ⃞ |  | \enclosesquare |  ⃝ |  | \enclosecircle |  ⃜ |  | \ddddot |  ⃛ |  | \dddot |
|  ⃗ |  | \vec |  ⃒ |  | \vertoverlay |  ⁗ |  | \qprime |  ⁐ |  | \closure |
|  ⁇ |  | \Question |  ⁄ |  | \fracslash |  ⁃ |  | \hyphenbullet |  ⁀ |  | \tieconcat |
|  ‼ |  | \Exclam |  ‸ |  | \caretinsert |  ‷ |  | \backtrprime |  ‶ |  | \backdprime |
|  ‵ |  | \backprime |  ‴ |  | \trprime |  ″ |  | \dprime |  ‥ |  | \enleadertwodots |
|  ‗ |  | \twolowline |  ― |  | \horizbar |  ‐ |  | \mathhyphen |  ữ1 |  | \arabichad |
|  ữ0 |  | \arabicmaj |  𝟿 |  | \mttnine |  𝟾 |  | \mtteight |  𝟽 |  | \mttseven |
|  𝟼 |  | \mttsix |  𝟻 |  | \mttfive |  𝟺 |  | \mttfour |  𝟹 |  | \mttthree |
|  𝟸 |  | \mtttwo |  𝟷 |  | \mttone |  𝟶 |  | \mttzero |  𝟵 |  | \mbfsansnine |
|  𝟴 |  | \mbfsanseight |  𝟳 |  | \mbfsansseven |  𝟲 |  | \mbfsanssix |  𝟱 |  | \mbfsansfive |
|  𝟰 |  | \mbfsansfour |  𝟯 |  | \mbfsansthree |  𝟮 |  | \mbfsanstwo |  𝟭 |  | \mbfsansone |
|  𝟬 |  | \mbfsanszero |  𝟫 |  | \msansnine |  𝟪 |  | \msanseight |  𝟩 |  | \msansseven |
|  𝟨 |  | \msanssix |  𝟧 |  | \msansfive |  𝟦 |  | \msansfour |  𝟥 |  | \msansthree |
|  𝟤 |  | \msanstwo |  𝟣 |  | \msansone |  𝟢 |  | \msanszero |  𝟡 |  | \Bbbnine |
|  𝟠 |  | \Bbbeight |  𝟟 |  | \Bbbseven |  𝟞 |  | \Bbbsix |  𝟝 |  | \Bbbfive |
|  𝟜 |  | \Bbbfour |  𝟛 |  | \Bbbthree |  𝟚 |  | \Bbbtwo |  𝟙 |  | \Bbbone |
|  𝟘 |  | \Bbbzero |  𝟗 |  | \mbfnine |  𝟖 |  | \mbfeight |  𝟕 |  | \mbfseven |
|  𝟔 |  | \mbfsix |  𝟓 |  | \mbffive |  𝟒 |  | \mbffour |  𝟑 |  | \mbfthree |
|  𝟐 |  | \mbftwo |  𝟏 |  | \mbfone |  𝟎 |  | \mbfzero |  𝟋 |  | \mbfdigamma |
|  𝟊 |  | \mbfDigamma |  𝟉 |  | \mbfitsansvarpi |  𝟈 |  | \mbfitsansvarrho |  𝟇 |  | \mbfitsansphi |
|  𝟆 |  | \mbfitsansvarkappa |  𝟅 |  | \mbfitsansvartheta |  𝟄 |  | \mbfitsansepsilon |  𝟃 |  | \mbfitsanspartial |
|  𝟂 |  | \mbfitsansomega |  𝟁 |  | \mbfitsanspsi |  𝟀 |  | \mbfitsanschi |  𝞿 |  | \mbfitsansvarphi |
|  𝞾 |  | \mbfitsansupsilon |  𝞽 |  | \mbfitsanstau |  𝞼 |  | \mbfitsanssigma |  𝞻 |  | \mbfitsansvarsigma |
|  𝞺 |  | \mbfitsansrho |  𝞹 |  | \mbfitsanspi |  𝞸 |  | \mbfitsansomicron |  𝞷 |  | \mbfitsansxi |
|  𝞶 |  | \mbfitsansnu |  𝞵 |  | \mbfitsansmu |  𝞴 |  | \mbfitsanslambda |  𝞳 |  | \mbfitsanskappa |
|  𝞲 |  | \mbfitsansiota |  𝞱 |  | \mbfitsanstheta |  𝞰 |  | \mbfitsanseta |  𝞯 |  | \mbfitsanszeta |
|  𝞮 |  | \mbfitsansvarepsilon |  𝞭 |  | \mbfitsansdelta |  𝞬 |  | \mbfitsansgamma |  𝞫 |  | \mbfitsansbeta |
|  𝞪 |  | \mbfitsansalpha |  𝞩 |  | \mbfitsansnabla |  𝞨 |  | \mbfitsansOmega |  𝞧 |  | \mbfitsansPsi |
|  𝞦 |  | \mbfitsansChi |  𝞥 |  | \mbfitsansPhi |  𝞤 |  | \mbfitsansUpsilon |  𝞣 |  | \mbfitsansTau |
|  𝞢 |  | \mbfitsansSigma |  𝞡 |  | \mbfitsansvarTheta |  𝞠 |  | \mbfitsansRho |  𝞟 |  | \mbfitsansPi |
|  𝞞 |  | \mbfitsansOmicron |  𝞝 |  | \mbfitsansXi |  𝞜 |  | \mbfitsansNu |  𝞛 |  | \mbfitsansMu |
|  𝞚 |  | \mbfitsansLambda |  𝞙 |  | \mbfitsansKappa |  𝞘 |  | \mbfitsansIota |  𝞗 |  | \mbfitsansTheta |
|  𝞖 |  | \mbfitsansEta |  𝞕 |  | \mbfitsansZeta |  𝞔 |  | \mbfitsansEpsilon |  𝞓 |  | \mbfitsansDelta |
|  𝞒 |  | \mbfitsansGamma |  𝞑 |  | \mbfitsansBeta |  𝞐 |  | \mbfitsansAlpha |  𝞏 |  | \mbfsansvarpi |
|  𝞎 |  | \mbfsansvarrho |  𝞍 |  | \mbfsansphi |  𝞌 |  | \mbfsansvarkappa |  𝞋 |  | \mbfsansvartheta |
|  𝞊 |  | \mbfsansepsilon |  𝞉 |  | \mbfsanspartial |  𝞈 |  | \mbfsansomega |  𝞇 |  | \mbfsanspsi |
|  𝞆 |  | \mbfsanschi |  𝞅 |  | \mbfsansvarphi |  𝞄 |  | \mbfsansupsilon |  𝞃 |  | \mbfsanstau |
|  𝞂 |  | \mbfsanssigma |  𝞁 |  | \mbfsansvarsigma |  𝞀 |  | \mbfsansrho |  𝝿 |  | \mbfsanspi |
|  𝝾 |  | \mbfsansomicron |  𝝽 |  | \mbfsansxi |  𝝼 |  | \mbfsansnu |  𝝻 |  | \mbfsansmu |
|  𝝺 |  | \mbfsanslambda |  𝝹 |  | \mbfsanskappa |  𝝸 |  | \mbfsansiota |  𝝷 |  | \mbfsanstheta |
|  𝝶 |  | \mbfsanseta |  𝝵 |  | \mbfsanszeta |  𝝴 |  | \mbfsansvarepsilon |  𝝳 |  | \mbfsansdelta |
|  𝝲 |  | \mbfsansgamma |  𝝱 |  | \mbfsansbeta |  𝝰 |  | \mbfsansalpha |  𝝯 |  | \mbfsansnabla |
|  𝝮 |  | \mbfsansOmega |  𝝭 |  | \mbfsansPsi |  𝝬 |  | \mbfsansChi |  𝝫 |  | \mbfsansPhi |
|  𝝪 |  | \mbfsansUpsilon |  𝝩 |  | \mbfsansTau |  𝝨 |  | \mbfsansSigma |  𝝧 |  | \mbfsansvarTheta |
|  𝝦 |  | \mbfsansRho |  𝝥 |  | \mbfsansPi |  𝝤 |  | \mbfsansOmicron |  𝝣 |  | \mbfsansXi |
|  𝝢 |  | \mbfsansNu |  𝝡 |  | \mbfsansMu |  𝝠 |  | \mbfsansLambda |  𝝟 |  | \mbfsansKappa |
|  𝝞 |  | \mbfsansIota |  𝝝 |  | \mbfsansTheta |  𝝜 |  | \mbfsansEta |  𝝛 |  | \mbfsansZeta |
|  𝝚 |  | \mbfsansEpsilon |  𝝙 |  | \mbfsansDelta |  𝝘 |  | \mbfsansGamma |  𝝗 |  | \mbfsansBeta |
|  𝝖 |  | \mbfsansAlpha |  𝝕 |  | \mbfitvarpi |  𝝔 |  | \mbfitvarrho |  𝝓 |  | \mbfitphi |
|  𝝒 |  | \mbfitvarkappa |  𝝑 |  | \mbfitvartheta |  𝝐 |  | \mbfitepsilon |  𝝏 |  | \mbfitpartial |
|  𝝎 |  | \mbfitomega |  𝝍 |  | \mbfitpsi |  𝝌 |  | \mbfitchi |  𝝋 |  | \mbfitvarphi |
|  𝝊 |  | \mbfitupsilon |  𝝉 |  | \mbfittau |  𝝈 |  | \mbfitsigma |  𝝇 |  | \mbfitvarsigma |
|  𝝆 |  | \mbfitrho |  𝝅 |  | \mbfitpi |  𝝄 |  | \mbfitomicron |  𝝃 |  | \mbfitxi |
|  𝝂 |  | \mbfitnu |  𝝁 |  | \mbfitmu |  𝝀 |  | \mbfitlambda |  𝜿 |  | \mbfitkappa |
|  𝜾 |  | \mbfitiota |  𝜽 |  | \mbfittheta |  𝜼 |  | \mbfiteta |  𝜻 |  | \mbfitzeta |
|  𝜺 |  | \mbfitvarepsilon |  𝜹 |  | \mbfitdelta |  𝜸 |  | \mbfitgamma |  𝜷 |  | \mbfitbeta |
|  𝜶 |  | \mbfitalpha |  𝜵 |  | \mbfitnabla |  𝜴 |  | \mbfitOmega |  𝜳 |  | \mbfitPsi |
|  𝜲 |  | \mbfitChi |  𝜱 |  | \mbfitPhi |  𝜰 |  | \mbfitUpsilon |  𝜯 |  | \mbfitTau |
|  𝜮 |  | \mbfitSigma |  𝜭 |  | \mbfitvarTheta |  𝜬 |  | \mbfitRho |  𝜫 |  | \mbfitPi |
|  𝜪 |  | \mbfitOmicron |  𝜩 |  | \mbfitXi |  𝜨 |  | \mbfitNu |  𝜧 |  | \mbfitMu |
|  𝜦 |  | \mbfitLambda |  𝜥 |  | \mbfitKappa |  𝜤 |  | \mbfitIota |  𝜣 |  | \mbfitTheta |
|  𝜢 |  | \mbfitEta |  𝜡 |  | \mbfitZeta |  𝜠 |  | \mbfitEpsilon |  𝜟 |  | \mbfitDelta |
|  𝜞 |  | \mbfitGamma |  𝜝 |  | \mbfitBeta |  𝜜 |  | \mbfitAlpha |  𝜛 |  | \mitvarpi |
|  𝜚 |  | \mitvarrho |  𝜙 |  | \mitphi |  𝜘 |  | \mitvarkappa |  𝜗 |  | \mitvartheta |
|  𝜖 |  | \mitepsilon |  𝜕 |  | \mitpartial |  𝜔 |  | \mitomega |  𝜓 |  | \mitpsi |
|  𝜒 |  | \mitchi |  𝜑 |  | \mitvarphi |  𝜐 |  | \mitupsilon |  𝜏 |  | \mittau |
|  𝜎 |  | \mitsigma |  𝜍 |  | \mitvarsigma |  𝜌 |  | \mitrho |  𝜋 |  | \mitpi |
|  𝜊 |  | \mitomicron |  𝜉 |  | \mitxi |  𝜈 |  | \mitnu |  𝜇 |  | \mitmu |
|  𝜆 |  | \mitlambda |  𝜅 |  | \mitkappa |  𝜄 |  | \mitiota |  𝜃 |  | \mittheta |
|  𝜂 |  | \miteta |  𝜁 |  | \mitzeta |  𝜀 |  | \mitvarepsilon |  𝛿 |  | \mitdelta |
|  𝛾 |  | \mitgamma |  𝛽 |  | \mitbeta |  𝛼 |  | \mitalpha |  𝛻 |  | \mitnabla |
|  𝛺 |  | \mitOmega |  𝛹 |  | \mitPsi |  𝛸 |  | \mitChi |  𝛷 |  | \mitPhi |
|  𝛶 |  | \mitUpsilon |  𝛵 |  | \mitTau |  𝛴 |  | \mitSigma |  𝛳 |  | \mitvarTheta |
|  𝛲 |  | \mitRho |  𝛱 |  | \mitPi |  𝛰 |  | \mitOmicron |  𝛯 |  | \mitXi |
|  𝛮 |  | \mitNu |  𝛭 |  | \mitMu |  𝛬 |  | \mitLambda |  𝛫 |  | \mitKappa |
|  𝛪 |  | \mitIota |  𝛩 |  | \mitTheta |  𝛨 |  | \mitEta |  𝛧 |  | \mitZeta |
|  𝛦 |  | \mitEpsilon |  𝛥 |  | \mitDelta |  𝛤 |  | \mitGamma |  𝛣 |  | \mitBeta |
|  𝛢 |  | \mitAlpha |  𝛡 |  | \mbfvarpi |  𝛠 |  | \mbfvarrho |  𝛟 |  | \mbfphi |
|  𝛞 |  | \mbfvarkappa |  𝛝 |  | \mbfvartheta |  𝛜 |  | \mbfepsilon |  𝛛 |  | \mbfpartial |
|  𝛚 |  | \mbfomega |  𝛙 |  | \mbfpsi |  𝛘 |  | \mbfchi |  𝛗 |  | \mbfvarphi |
|  𝛖 |  | \mbfupsilon |  𝛕 |  | \mbftau |  𝛔 |  | \mbfsigma |  𝛓 |  | \mbfvarsigma |
|  𝛒 |  | \mbfrho |  𝛑 |  | \mbfpi |  𝛐 |  | \mbfomicron |  𝛏 |  | \mbfxi |
|  𝛎 |  | \mbfnu |  𝛍 |  | \mbfmu |  𝛌 |  | \mbflambda |  𝛋 |  | \mbfkappa |
|  𝛊 |  | \mbfiota |  𝛉 |  | \mbftheta |  𝛈 |  | \mbfeta |  𝛇 |  | \mbfzeta |
|  𝛆 |  | \mbfvarepsilon |  𝛅 |  | \mbfdelta |  𝛄 |  | \mbfgamma |  𝛃 |  | \mbfbeta |
|  𝛂 |  | \mbfalpha |  𝛁 |  | \mbfnabla |  𝛀 |  | \mbfOmega |  𝚿 |  | \mbfPsi |
|  𝚾 |  | \mbfChi |  𝚽 |  | \mbfPhi |  𝚼 |  | \mbfUpsilon |  𝚻 |  | \mbfTau |
|  𝚺 |  | \mbfSigma |  𝚹 |  | \mbfvarTheta |  𝚸 |  | \mbfRho |  𝚷 |  | \mbfPi |
|  𝚶 |  | \mbfOmicron |  𝚵 |  | \mbfXi |  𝚴 |  | \mbfNu |  𝚳 |  | \mbfMu |
|  𝚲 |  | \mbfLambda |  𝚱 |  | \mbfKappa |  𝚰 |  | \mbfIota |  𝚯 |  | \mbfTheta |
|  𝚮 |  | \mbfEta |  𝚭 |  | \mbfZeta |  𝚬 |  | \mbfEpsilon |  𝚫 |  | \mbfDelta |
|  𝚪 |  | \mbfGamma |  𝚩 |  | \mbfBeta |  𝚨 |  | \mbfAlpha |  𝚥 |  | \jmath |
|  𝚤 |  | \imath |  𝚣 |  | \mttz |  𝚢 |  | \mtty |  𝚡 |  | \mttx |
|  𝚠 |  | \mttw |  𝚟 |  | \mttv |  𝚞 |  | \mttu |  𝚝 |  | \mttt |
|  𝚜 |  | \mtts |  𝚛 |  | \mttr |  𝚚 |  | \mttq |  𝚙 |  | \mttp |
|  𝚘 |  | \mtto |  𝚗 |  | \mttn |  𝚖 |  | \mttm |  𝚕 |  | \mttl |
|  𝚔 |  | \mttk |  𝚓 |  | \mttj |  𝚒 |  | \mtti |  𝚑 |  | \mtth |
|  𝚐 |  | \mttg |  𝚏 |  | \mttf |  𝚎 |  | \mtte |  𝚍 |  | \mttd |
|  𝚌 |  | \mttc |  𝚋 |  | \mttb |  𝚊 |  | \mtta |  𝚉 |  | \mttZ |
|  𝚈 |  | \mttY |  𝚇 |  | \mttX |  𝚆 |  | \mttW |  𝚅 |  | \mttV |
|  𝚄 |  | \mttU |  𝚃 |  | \mttT |  𝚂 |  | \mttS |  𝚁 |  | \mttR |
|  𝚀 |  | \mttQ |  𝙿 |  | \mttP |  𝙾 |  | \mttO |  𝙽 |  | \mttN |
|  𝙼 |  | \mttM |  𝙻 |  | \mttL |  𝙺 |  | \mttK |  𝙹 |  | \mttJ |
|  𝙸 |  | \mttI |  𝙷 |  | \mttH |  𝙶 |  | \mttG |  𝙵 |  | \mttF |
|  𝙴 |  | \mttE |  𝙳 |  | \mttD |  𝙲 |  | \mttC |  𝙱 |  | \mttB |
|  𝙰 |  | \mttA |  𝙯 |  | \mbfitsansz |  𝙮 |  | \mbfitsansy |  𝙭 |  | \mbfitsansx |
|  𝙬 |  | \mbfitsansw |  𝙫 |  | \mbfitsansv |  𝙪 |  | \mbfitsansu |  𝙩 |  | \mbfitsanst |
|  𝙨 |  | \mbfitsanss |  𝙧 |  | \mbfitsansr |  𝙦 |  | \mbfitsansq |  𝙥 |  | \mbfitsansp |
|  𝙤 |  | \mbfitsanso |  𝙣 |  | \mbfitsansn |  𝙢 |  | \mbfitsansm |  𝙡 |  | \mbfitsansl |
|  𝙠 |  | \mbfitsansk |  𝙟 |  | \mbfitsansj |  𝙞 |  | \mbfitsansi |  𝙝 |  | \mbfitsansh |
|  𝙜 |  | \mbfitsansg |  𝙛 |  | \mbfitsansf |  𝙚 |  | \mbfitsanse |  𝙙 |  | \mbfitsansd |
|  𝙘 |  | \mbfitsansc |  𝙗 |  | \mbfitsansb |  𝙖 |  | \mbfitsansa |  𝙕 |  | \mbfitsansZ |
|  𝙔 |  | \mbfitsansY |  𝙓 |  | \mbfitsansX |  𝙒 |  | \mbfitsansW |  𝙑 |  | \mbfitsansV |
|  𝙐 |  | \mbfitsansU |  𝙏 |  | \mbfitsansT |  𝙎 |  | \mbfitsansS |  𝙍 |  | \mbfitsansR |
|  𝙌 |  | \mbfitsansQ |  𝙋 |  | \mbfitsansP |  𝙊 |  | \mbfitsansO |  𝙉 |  | \mbfitsansN |
|  𝙈 |  | \mbfitsansM |  𝙇 |  | \mbfitsansL |  𝙆 |  | \mbfitsansK |  𝙅 |  | \mbfitsansJ |
|  𝙄 |  | \mbfitsansI |  𝙃 |  | \mbfitsansH |  𝙂 |  | \mbfitsansG |  𝙁 |  | \mbfitsansF |
|  𝙀 |  | \mbfitsansE |  𝘿 |  | \mbfitsansD |  𝘾 |  | \mbfitsansC |  𝘽 |  | \mbfitsansB |
|  𝘼 |  | \mbfitsansA |  𝘻 |  | \mitsansz |  𝘺 |  | \mitsansy |  𝘹 |  | \mitsansx |
|  𝘸 |  | \mitsansw |  𝘷 |  | \mitsansv |  𝘶 |  | \mitsansu |  𝘵 |  | \mitsanst |
|  𝘴 |  | \mitsanss |  𝘳 |  | \mitsansr |  𝘲 |  | \mitsansq |  𝘱 |  | \mitsansp |
|  𝘰 |  | \mitsanso |  𝘯 |  | \mitsansn |  𝘮 |  | \mitsansm |  𝘭 |  | \mitsansl |
|  𝘬 |  | \mitsansk |  𝘫 |  | \mitsansj |  𝘪 |  | \mitsansi |  𝘩 |  | \mitsansh |
|  𝘨 |  | \mitsansg |  𝘧 |  | \mitsansf |  𝘦 |  | \mitsanse |  𝘥 |  | \mitsansd |
|  𝘤 |  | \mitsansc |  𝘣 |  | \mitsansb |  𝘢 |  | \mitsansa |  𝘡 |  | \mitsansZ |
|  𝘠 |  | \mitsansY |  𝘟 |  | \mitsansX |  𝘞 |  | \mitsansW |  𝘝 |  | \mitsansV |
|  𝘜 |  | \mitsansU |  𝘛 |  | \mitsansT |  𝘚 |  | \mitsansS |  𝘙 |  | \mitsansR |
|  𝘘 |  | \mitsansQ |  𝘗 |  | \mitsansP |  𝘖 |  | \mitsansO |  𝘕 |  | \mitsansN |
|  𝘔 |  | \mitsansM |  𝘓 |  | \mitsansL |  𝘒 |  | \mitsansK |  𝘑 |  | \mitsansJ |
|  𝘐 |  | \mitsansI |  𝘏 |  | \mitsansH |  𝘎 |  | \mitsansG |  𝘍 |  | \mitsansF |
|  𝘌 |  | \mitsansE |  𝘋 |  | \mitsansD |  𝘊 |  | \mitsansC |  𝘉 |  | \mitsansB |
|  𝘈 |  | \mitsansA |  𝘇 |  | \mbfsansz |  𝘆 |  | \mbfsansy |  𝘅 |  | \mbfsansx |
|  𝘄 |  | \mbfsansw |  𝘃 |  | \mbfsansv |  𝘂 |  | \mbfsansu |  𝘁 |  | \mbfsanst |
|  𝘀 |  | \mbfsanss |  𝗿 |  | \mbfsansr |  𝗾 |  | \mbfsansq |  𝗽 |  | \mbfsansp |
|  𝗼 |  | \mbfsanso |  𝗻 |  | \mbfsansn |  𝗺 |  | \mbfsansm |  𝗹 |  | \mbfsansl |
|  𝗸 |  | \mbfsansk |  𝗷 |  | \mbfsansj |  𝗶 |  | \mbfsansi |  𝗵 |  | \mbfsansh |
|  𝗴 |  | \mbfsansg |  𝗳 |  | \mbfsansf |  𝗲 |  | \mbfsanse |  𝗱 |  | \mbfsansd |
|  𝗰 |  | \mbfsansc |  𝗯 |  | \mbfsansb |  𝗮 |  | \mbfsansa |  𝗭 |  | \mbfsansZ |
|  𝗬 |  | \mbfsansY |  𝗫 |  | \mbfsansX |  𝗪 |  | \mbfsansW |  𝗩 |  | \mbfsansV |
|  𝗨 |  | \mbfsansU |  𝗧 |  | \mbfsansT |  𝗦 |  | \mbfsansS |  𝗥 |  | \mbfsansR |
|  𝗤 |  | \mbfsansQ |  𝗣 |  | \mbfsansP |  𝗢 |  | \mbfsansO |  𝗡 |  | \mbfsansN |
|  𝗠 |  | \mbfsansM |  𝗟 |  | \mbfsansL |  𝗞 |  | \mbfsansK |  𝗝 |  | \mbfsansJ |
|  𝗜 |  | \mbfsansI |  𝗛 |  | \mbfsansH |  𝗚 |  | \mbfsansG |  𝗙 |  | \mbfsansF |
|  𝗘 |  | \mbfsansE |  𝗗 |  | \mbfsansD |  𝗖 |  | \mbfsansC |  𝗕 |  | \mbfsansB |
|  𝗔 |  | \mbfsansA |  𝗓 |  | \msansz |  𝗒 |  | \msansy |  𝗑 |  | \msansx |
|  𝗐 |  | \msansw |  𝗏 |  | \msansv |  𝗎 |  | \msansu |  𝗍 |  | \msanst |
|  𝗌 |  | \msanss |  𝗋 |  | \msansr |  𝗊 |  | \msansq |  𝗉 |  | \msansp |
|  𝗈 |  | \msanso |  𝗇 |  | \msansn |  𝗆 |  | \msansm |  𝗅 |  | \msansl |
|  𝗄 |  | \msansk |  𝗃 |  | \msansj |  𝗂 |  | \msansi |  𝗁 |  | \msansh |
|  𝗀 |  | \msansg |  𝖿 |  | \msansf |  𝖾 |  | \msanse |  𝖽 |  | \msansd |
|  𝖼 |  | \msansc |  𝖻 |  | \msansb |  𝖺 |  | \msansa |  𝖹 |  | \msansZ |
|  𝖸 |  | \msansY |  𝖷 |  | \msansX |  𝖶 |  | \msansW |  𝖵 |  | \msansV |
|  𝖴 |  | \msansU |  𝖳 |  | \msansT |  𝖲 |  | \msansS |  𝖱 |  | \msansR |
|  𝖰 |  | \msansQ |  𝖯 |  | \msansP |  𝖮 |  | \msansO |  𝖭 |  | \msansN |
|  𝖬 |  | \msansM |  𝖫 |  | \msansL |  𝖪 |  | \msansK |  𝖩 |  | \msansJ |
|  𝖨 |  | \msansI |  𝖧 |  | \msansH |  𝖦 |  | \msansG |  𝖥 |  | \msansF |
|  𝖤 |  | \msansE |  𝖣 |  | \msansD |  𝖢 |  | \msansC |  𝖡 |  | \msansB |
|  𝖠 |  | \msansA |  𝖟 |  | \mbffrakz |  𝖞 |  | \mbffraky |  𝖝 |  | \mbffrakx |
|  𝖜 |  | \mbffrakw |  𝖛 |  | \mbffrakv |  𝖚 |  | \mbffraku |  𝖙 |  | \mbffrakt |
|  𝖘 |  | \mbffraks |  𝖗 |  | \mbffrakr |  𝖖 |  | \mbffrakq |  𝖕 |  | \mbffrakp |
|  𝖔 |  | \mbffrako |  𝖓 |  | \mbffrakn |  𝖒 |  | \mbffrakm |  𝖑 |  | \mbffrakl |
|  𝖐 |  | \mbffrakk |  𝖏 |  | \mbffrakj |  𝖎 |  | \mbffraki |  𝖍 |  | \mbffrakh |
|  𝖌 |  | \mbffrakg |  𝖋 |  | \mbffrakf |  𝖊 |  | \mbffrake |  𝖉 |  | \mbffrakd |
|  𝖈 |  | \mbffrakc |  𝖇 |  | \mbffrakb |  𝖆 |  | \mbffraka |  𝖅 |  | \mbffrakZ |
|  𝖄 |  | \mbffrakY |  𝖃 |  | \mbffrakX |  𝖂 |  | \mbffrakW |  𝖁 |  | \mbffrakV |
|  𝖀 |  | \mbffrakU |  𝕿 |  | \mbffrakT |  𝕾 |  | \mbffrakS |  𝕽 |  | \mbffrakR |
|  𝕼 |  | \mbffrakQ |  𝕻 |  | \mbffrakP |  𝕺 |  | \mbffrakO |  𝕹 |  | \mbffrakN |
|  𝕸 |  | \mbffrakM |  𝕷 |  | \mbffrakL |  𝕶 |  | \mbffrakK |  𝕵 |  | \mbffrakJ |
|  𝕴 |  | \mbffrakI |  𝕳 |  | \mbffrakH |  𝕲 |  | \mbffrakG |  𝕱 |  | \mbffrakF |
|  𝕰 |  | \mbffrakE |  𝕯 |  | \mbffrakD |  𝕮 |  | \mbffrakC |  𝕭 |  | \mbffrakB |
|  𝕬 |  | \mbffrakA |  𝕫 |  | \Bbbz |  𝕪 |  | \Bbby |  𝕩 |  | \Bbbx |
|  𝕨 |  | \Bbbw |  𝕧 |  | \Bbbv |  𝕦 |  | \Bbbu |  𝕥 |  | \Bbbt |
|  𝕤 |  | \Bbbs |  𝕣 |  | \Bbbr |  𝕢 |  | \Bbbq |  𝕡 |  | \Bbbp |
|  𝕠 |  | \Bbbo |  𝕟 |  | \Bbbn |  𝕞 |  | \Bbbm |  𝕝 |  | \Bbbl |
|  𝕜 |  | \Bbbk |  𝕛 |  | \Bbbj |  𝕚 |  | \Bbbi |  𝕙 |  | \Bbbh |
|  𝕘 |  | \Bbbg |  𝕗 |  | \Bbbf |  𝕖 |  | \Bbbe |  𝕕 |  | \Bbbd |
|  𝕔 |  | \Bbbc |  𝕓 |  | \Bbbb |  𝕒 |  | \Bbba |  𝕐 |  | \BbbY |
|  𝕏 |  | \BbbX |  𝕎 |  | \BbbW |  𝕍 |  | \BbbV |  𝕌 |  | \BbbU |
|  𝕋 |  | \BbbT |  𝕊 |  | \BbbS |  𝕆 |  | \BbbO |  𝕄 |  | \BbbM |
|  𝕃 |  | \BbbL |  𝕂 |  | \BbbK |  𝕁 |  | \BbbJ |  𝕀 |  | \BbbI |
|  𝔾 |  | \BbbG |  𝔽 |  | \BbbF |  𝔼 |  | \BbbE |  𝔻 |  | \BbbD |
|  𝔹 |  | \BbbB |  𝔸 |  | \BbbA |  𝔷 |  | \mfrakz |  𝔶 |  | \mfraky |
|  𝔵 |  | \mfrakx |  𝔴 |  | \mfrakw |  𝔳 |  | \mfrakv |  𝔲 |  | \mfraku |
|  𝔱 |  | \mfrakt |  𝔰 |  | \mfraks |  𝔯 |  | \mfrakr |  𝔮 |  | \mfrakq |
|  𝔭 |  | \mfrakp |  𝔬 |  | \mfrako |  𝔫 |  | \mfrakn |  𝔪 |  | \mfrakm |
|  𝔩 |  | \mfrakl |  𝔨 |  | \mfrakk |  𝔧 |  | \mfrakj |  𝔦 |  | \mfraki |
|  𝔥 |  | \mfrakh |  𝔤 |  | \mfrakg |  𝔣 |  | \mfrakf |  𝔢 |  | \mfrake |
|  𝔡 |  | \mfrakd |  𝔠 |  | \mfrakc |  𝔟 |  | \mfrakb |  𝔞 |  | \mfraka |
|  𝔜 |  | \mfrakY |  𝔛 |  | \mfrakX |  𝔚 |  | \mfrakW |  𝔙 |  | \mfrakV |
|  𝔘 |  | \mfrakU |  𝔗 |  | \mfrakT |  𝔖 |  | \mfrakS |  𝔔 |  | \mfrakQ |
|  𝔓 |  | \mfrakP |  𝔒 |  | \mfrakO |  𝔑 |  | \mfrakN |  𝔐 |  | \mfrakM |
|  𝔏 |  | \mfrakL |  𝔎 |  | \mfrakK |  𝔍 |  | \mfrakJ |  𝔊 |  | \mfrakG |
|  𝔉 |  | \mfrakF |  𝔈 |  | \mfrakE |  𝔇 |  | \mfrakD |  𝔅 |  | \mfrakB |
|  𝔄 |  | \mfrakA |  𝔃 |  | \mbfscrz |  𝔂 |  | \mbfscry |  𝔁 |  | \mbfscrx |
|  𝔀 |  | \mbfscrw |  𝓿 |  | \mbfscrv |  𝓾 |  | \mbfscru |  𝓽 |  | \mbfscrt |
|  𝓼 |  | \mbfscrs |  𝓻 |  | \mbfscrr |  𝓺 |  | \mbfscrq |  𝓹 |  | \mbfscrp |
|  𝓸 |  | \mbfscro |  𝓷 |  | \mbfscrn |  𝓶 |  | \mbfscrm |  𝓵 |  | \mbfscrl |
|  𝓴 |  | \mbfscrk |  𝓳 |  | \mbfscrj |  𝓲 |  | \mbfscri |  𝓱 |  | \mbfscrh |
|  𝓰 |  | \mbfscrg |  𝓯 |  | \mbfscrf |  𝓮 |  | \mbfscre |  𝓭 |  | \mbfscrd |
|  𝓬 |  | \mbfscrc |  𝓫 |  | \mbfscrb |  𝓪 |  | \mbfscra |  𝓩 |  | \mbfscrZ |
|  𝓨 |  | \mbfscrY |  𝓧 |  | \mbfscrX |  𝓦 |  | \mbfscrW |  𝓥 |  | \mbfscrV |
|  𝓤 |  | \mbfscrU |  𝓣 |  | \mbfscrT |  𝓢 |  | \mbfscrS |  𝓡 |  | \mbfscrR |
|  𝓠 |  | \mbfscrQ |  𝓟 |  | \mbfscrP |  𝓞 |  | \mbfscrO |  𝓝 |  | \mbfscrN |
|  𝓜 |  | \mbfscrM |  𝓛 |  | \mbfscrL |  𝓚 |  | \mbfscrK |  𝓙 |  | \mbfscrJ |
|  𝓘 |  | \mbfscrI |  𝓗 |  | \mbfscrH |  𝓖 |  | \mbfscrG |  𝓕 |  | \mbfscrF |
|  𝓔 |  | \mbfscrE |  𝓓 |  | \mbfscrD |  𝓒 |  | \mbfscrC |  𝓑 |  | \mbfscrB |
|  𝓐 |  | \mbfscrA |  𝓏 |  | \mscrz |  𝓎 |  | \mscry |  𝓍 |  | \mscrx |
|  𝓌 |  | \mscrw |  𝓋 |  | \mscrv |  𝓊 |  | \mscru |  𝓉 |  | \mscrt |
|  𝓈 |  | \mscrs |  𝓇 |  | \mscrr |  𝓆 |  | \mscrq |  𝓅 |  | \mscrp |
|  𝓃 |  | \mscrn |  𝓂 |  | \mscrm |  𝓁 |  | \mscrl |  𝓀 |  | \mscrk |
|  𝒿 |  | \mscrj |  𝒾 |  | \mscri |  𝒽 |  | \mscrh |  𝒻 |  | \mscrf |
|  𝒹 |  | \mscrd |  𝒸 |  | \mscrc |  𝒷 |  | \mscrb |  𝒶 |  | \mscra |
|  𝒵 |  | \mscrZ |  𝒴 |  | \mscrY |  𝒳 |  | \mscrX |  𝒲 |  | \mscrW |
|  𝒱 |  | \mscrV |  𝒰 |  | \mscrU |  𝒯 |  | \mscrT |  𝒮 |  | \mscrS |
|  𝒬 |  | \mscrQ |  𝒫 |  | \mscrP |  𝒪 |  | \mscrO |  𝒩 |  | \mscrN |
|  𝒦 |  | \mscrK |  𝒥 |  | \mscrJ |  𝒢 |  | \mscrG |  𝒟 |  | \mscrD |
|  𝒞 |  | \mscrC |  𝒜 |  | \mscrA |  𝒛 |  | \mbfitz |  𝒚 |  | \mbfity |
|  𝒙 |  | \mbfitx |  𝒘 |  | \mbfitw |  𝒗 |  | \mbfitv |  𝒖 |  | \mbfitu |
|  𝒕 |  | \mbfitt |  𝒔 |  | \mbfits |  𝒓 |  | \mbfitr |  𝒒 |  | \mbfitq |
|  𝒑 |  | \mbfitp |  𝒐 |  | \mbfito |  𝒏 |  | \mbfitn |  𝒎 |  | \mbfitm |
|  𝒍 |  | \mbfitl |  𝒌 |  | \mbfitk |  𝒋 |  | \mbfitj |  𝒊 |  | \mbfiti |
|  𝒉 |  | \mbfith |  𝒈 |  | \mbfitg |  𝒇 |  | \mbfitf |  𝒆 |  | \mbfite |
|  𝒅 |  | \mbfitd |  𝒄 |  | \mbfitc |  𝒃 |  | \mbfitb |  𝒂 |  | \mbfita |
|  𝒁 |  | \mbfitZ |  𝒀 |  | \mbfitY |  𝑿 |  | \mbfitX |  𝑾 |  | \mbfitW |
|  𝑽 |  | \mbfitV |  𝑼 |  | \mbfitU |  𝑻 |  | \mbfitT |  𝑺 |  | \mbfitS |
|  𝑹 |  | \mbfitR |  𝑸 |  | \mbfitQ |  𝑷 |  | \mbfitP |  𝑶 |  | \mbfitO |
|  𝑵 |  | \mbfitN |  𝑴 |  | \mbfitM |  𝑳 |  | \mbfitL |  𝑲 |  | \mbfitK |
|  𝑱 |  | \mbfitJ |  𝑰 |  | \mbfitI |  𝑯 |  | \mbfitH |  𝑮 |  | \mbfitG |
|  𝑭 |  | \mbfitF |  𝑬 |  | \mbfitE |  𝑫 |  | \mbfitD |  𝑪 |  | \mbfitC |
|  𝑩 |  | \mbfitB |  𝑨 |  | \mbfitA |  𝑧 |  | \mitz |  𝑦 |  | \mity |
|  𝑥 |  | \mitx |  𝑤 |  | \mitw |  𝑣 |  | \mitv |  𝑢 |  | \mitu |
|  𝑡 |  | \mitt |  𝑠 |  | \mits |  𝑟 |  | \mitr |  𝑞 |  | \mitq |
|  𝑝 |  | \mitp |  𝑜 |  | \mito |  𝑛 |  | \mitn |  𝑚 |  | \mitm |
|  𝑙 |  | \mitl |  𝑘 |  | \mitk |  𝑗 |  | \mitj |  𝑖 |  | \miti |
|  𝑔 |  | \mitg |  𝑓 |  | \mitf |  𝑒 |  | \mite |  𝑑 |  | \mitd |
|  𝑐 |  | \mitc |  𝑏 |  | \mitb |  𝑎 |  | \mita |  𝑍 |  | \mitZ |
|  𝑌 |  | \mitY |  𝑋 |  | \mitX |  𝑊 |  | \mitW |  𝑉 |  | \mitV |
|  𝑈 |  | \mitU |  𝑇 |  | \mitT |  𝑆 |  | \mitS |  𝑅 |  | \mitR |
|  𝑄 |  | \mitQ |  𝑃 |  | \mitP |  𝑂 |  | \mitO |  𝑁 |  | \mitN |
|  𝑀 |  | \mitM |  𝐿 |  | \mitL |  𝐾 |  | \mitK |  𝐽 |  | \mitJ |
|  𝐼 |  | \mitI |  𝐻 |  | \mitH |  𝐺 |  | \mitG |  𝐹 |  | \mitF |
|  𝐸 |  | \mitE |  𝐷 |  | \mitD |  𝐶 |  | \mitC |  𝐵 |  | \mitB |
|  𝐴 |  | \mitA |  𝐳 |  | \mbfz |  𝐲 |  | \mbfy |  𝐱 |  | \mbfx |
|  𝐰 |  | \mbfw |  𝐯 |  | \mbfv |  𝐮 |  | \mbfu |  𝐭 |  | \mbft |
|  𝐬 |  | \mbfs |  𝐫 |  | \mbfr |  𝐪 |  | \mbfq |  𝐩 |  | \mbfp |
|  𝐨 |  | \mbfo |  𝐧 |  | \mbfn |  𝐦 |  | \mbfm |  𝐥 |  | \mbfl |
|  𝐤 |  | \mbfk |  𝐣 |  | \mbfj |  𝐢 |  | \mbfi |  𝐡 |  | \mbfh |
|  𝐠 |  | \mbfg |  𝐟 |  | \mbff |  𝐞 |  | \mbfe |  𝐝 |  | \mbfd |
|  𝐜 |  | \mbfc |  𝐛 |  | \mbfb |  𝐚 |  | \mbfa |  𝐙 |  | \mbfZ |
|  𝐘 |  | \mbfY |  𝐗 |  | \mbfX |  𝐖 |  | \mbfW |  𝐕 |  | \mbfV |
|  𝐔 |  | \mbfU |  𝐓 |  | \mbfT |  𝐒 |  | \mbfS |  𝐑 |  | \mbfR |
|  𝐐 |  | \mbfQ |  𝐏 |  | \mbfP |  𝐎 |  | \mbfO |  𝐍 |  | \mbfN |
|  𝐌 |  | \mbfM |  𝐋 |  | \mbfL |  𝐊 |  | \mbfK |  𝐉 |  | \mbfJ |
|  𝐈 |  | \mbfI |  𝐇 |  | \mbfH |  𝐆 |  | \mbfG |  𝐅 |  | \mbfF |
|  𝐄 |  | \mbfE |  𝐃 |  | \mbfD |  𝐂 |  | \mbfC |  𝐁 |  | \mbfB |
|  𝐀 |  | \mbfA |  ϶ |  | \upbackepsilon |  ϰ |  | \varkappa |  ϐ |  | \varbeta |
|  ο |  | \mupomicron |  Χ |  | \mupChi |  Τ |  | \mupTau |  Ρ |  | \mupRho |
|  Ο |  | \mupOmicron |  Ν |  | \mupNu |  Μ |  | \mupMu |  Λ |  | \mupLambda |
|  Κ |  | \mupKappa |  Ι |  | \mupIota |  Θ |  | \mupTheta |  Η |  | \mupEta |
|  Ζ |  | \mupZeta |  Ε |  | \mupEpsilon |  Δ |  | \mupDelta |  Γ |  | \mupGamma |
|  Β |  | \mupBeta |  Α |  | \mupAlpha |  ͍ |  | \underleftrightarrow |  ̚ |  | \droang |
|  ̕ |  | \ocommatopright |  ̒ |  | \oturnedcomma |  ̐ |  | \candra |  ̌ |  | \check |
|  ̉ |  | \ovhook |  ̈ |  | \ddot |  ̇ |  | \dot |  ̆ |  | \breve |
|  ̄ |  | \bar |  ̃ |  | \tilde |  ́ |  | \acute |  ̀ |  | \grave |
|  € |  | \euro |  | |  |  | |  |  | |  |


### amssymb

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ⩾̸ |  | \ngeqslant |  ⩾ |  | \geqslant |  ⩽̸ |  | \nleqslant |  ⩽ |  | \leqslant |
|  ð |  | \eth |  | |  |  | |  |  | |  |


### wasysym

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ☾ | \leftmoon |  |  ☽ | \rightmoon |  |  | |  |  | |  |


### pmboxdraw

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ▟ | \pmboxdrawuni{259F} |  |  ▞ | \pmboxdrawuni{259E} |  |  ▝ | \pmboxdrawuni{259D} |  |  ▜ | \pmboxdrawuni{259C} |  |
|  ▛ | \pmboxdrawuni{259B} |  |  ▚ | \pmboxdrawuni{259A} |  |  ▙ | \pmboxdrawuni{2599} |  |  ▘ | \pmboxdrawuni{2598} |  |
|  ▗ | \pmboxdrawuni{2597} |  |  ▖ | \pmboxdrawuni{2596} |  |  ▕ | \pmboxdrawuni{2595} |  |  ▔ | \pmboxdrawuni{2594} |  |
|  ▓ | \textdkshade |  |  ▒ | \textshade |  |  ░ | \textltshade |  |  ▐ | \textrtblock |  |
|  ▏ | \pmboxdrawuni{258F} |  |  ▎ | \pmboxdrawuni{258E} |  |  ▍ | \pmboxdrawuni{258D} |  |  ▌ | \textlfblock |  |
|  ▋ | \pmboxdrawuni{258B} |  |  ▊ | \pmboxdrawuni{258A} |  |  ▉ | \pmboxdrawuni{2589} |  |  █ | \textblock |  |
|  ▇ | \pmboxdrawuni{2587} |  |  ▆ | \pmboxdrawuni{2586} |  |  ▅ | \pmboxdrawuni{2585} |  |  ▄ | \textdnblock |  |
|  ▃ | \pmboxdrawuni{2583} |  |  ▂ | \pmboxdrawuni{2582} |  |  ▁ | \pmboxdrawuni{2581} |  |  ▀ | \textupblock |  |
|  ╿ | \pmboxdrawuni{257F} |  |  ╾ | \pmboxdrawuni{257E} |  |  ╽ | \pmboxdrawuni{257D} |  |  ╼ | \pmboxdrawuni{257C} |  |
|  ╻ | \pmboxdrawuni{257B} |  |  ╺ | \pmboxdrawuni{257A} |  |  ╹ | \pmboxdrawuni{2579} |  |  ╸ | \pmboxdrawuni{2578} |  |
|  ╷ | \pmboxdrawuni{2577} |  |  ╶ | \pmboxdrawuni{2576} |  |  ╵ | \pmboxdrawuni{2575} |  |  ╴ | \pmboxdrawuni{2574} |  |
|  ╬ | \textSFxliv |  |  ╫ | \textSFliii |  |  ╪ | \textSFliv |  |  ╩ | \textSFxl |  |
|  ╨ | \textSFxlvi |  |  ╧ | \textSFxlv |  |  ╦ | \textSFxli |  |  ╥ | \textSFxlviii |  |
|  ╤ | \textSFxlvii |  |  ╣ | \textSFxxiii |  |  ╢ | \textSFxx |  |  ╡ | \textSFxix |  |
|  ╠ | \textSFxlii |  |  ╟ | \textSFxxxvii |  |  ╞ | \textSFxxxvi |  |  ╝ | \textSFxxvi |  |
|  ╜ | \textSFxxvii |  |  ╛ | \textSFxxviii |  |  ╚ | \textSFxxxviii |  |  ╙ | \textSFxlix |  |
|  ╘ | \textSFl |  |  ╗ | \textSFxxv |  |  ╖ | \textSFxxi |  |  ╕ | \textSFxxii |  |
|  ╔ | \textSFxxxix |  |  ╓ | \textSFlii |  |  ╒ | \textSFli |  |  ║ | \textSFxxiv |  |
|  ═ | \textSFxliii |  |  ╋ | \pmboxdrawuni{254B} |  |  ╊ | \pmboxdrawuni{254A} |  |  ╉ | \pmboxdrawuni{2549} |  |
|  ╈ | \pmboxdrawuni{2548} |  |  ╇ | \pmboxdrawuni{2547} |  |  ╆ | \pmboxdrawuni{2546} |  |  ╅ | \pmboxdrawuni{2545} |  |
|  ╄ | \pmboxdrawuni{2544} |  |  ╃ | \pmboxdrawuni{2543} |  |  ╂ | \pmboxdrawuni{2542} |  |  ╁ | \pmboxdrawuni{2541} |  |
|  ╀ | \pmboxdrawuni{2540} |  |  ┿ | \pmboxdrawuni{253F} |  |  ┾ | \pmboxdrawuni{253E} |  |  ┽ | \pmboxdrawuni{253D} |  |
|  ┼ | \textSFv |  |  ┻ | \pmboxdrawuni{253B} |  |  ┺ | \pmboxdrawuni{253A} |  |  ┹ | \pmboxdrawuni{2539} |  |
|  ┸ | \pmboxdrawuni{2538} |  |  ┷ | \pmboxdrawuni{2537} |  |  ┶ | \pmboxdrawuni{2536} |  |  ┵ | \pmboxdrawuni{2535} |  |
|  ┴ | \textSFvii |  |  ┳ | \pmboxdrawuni{2533} |  |  ┲ | \pmboxdrawuni{2532} |  |  ┱ | \pmboxdrawuni{2531} |  |
|  ┰ | \pmboxdrawuni{2530} |  |  ┯ | \pmboxdrawuni{252F} |  |  ┮ | \pmboxdrawuni{252E} |  |  ┭ | \pmboxdrawuni{252D} |  |
|  ┬ | \textSFvi |  |  ┫ | \pmboxdrawuni{252B} |  |  ┪ | \pmboxdrawuni{252A} |  |  ┩ | \pmboxdrawuni{2529} |  |
|  ┨ | \pmboxdrawuni{2528} |  |  ┧ | \pmboxdrawuni{2527} |  |  ┦ | \pmboxdrawuni{2526} |  |  ┥ | \pmboxdrawuni{2525} |  |
|  ┤ | \textSFix |  |  ┣ | \pmboxdrawuni{2523} |  |  ┢ | \pmboxdrawuni{2522} |  |  ┡ | \pmboxdrawuni{2521} |  |
|  ┠ | \pmboxdrawuni{2520} |  |  ┟ | \pmboxdrawuni{251F} |  |  ┞ | \pmboxdrawuni{251E} |  |  ┝ | \pmboxdrawuni{251D} |  |
|  ├ | \textSFviii |  |  ┛ | \pmboxdrawuni{251B} |  |  ┚ | \pmboxdrawuni{251A} |  |  ┙ | \pmboxdrawuni{2519} |  |
|  ┘ | \textSFiv |  |  ┗ | \pmboxdrawuni{2517} |  |  ┖ | \pmboxdrawuni{2516} |  |  ┕ | \pmboxdrawuni{2515} |  |
|  └ | \textSFii |  |  ┓ | \pmboxdrawuni{2513} |  |  ┒ | \pmboxdrawuni{2512} |  |  ┑ | \pmboxdrawuni{2511} |  |
|  ┐ | \textSFiii |  |  ┏ | \pmboxdrawuni{250F} |  |  ┎ | \pmboxdrawuni{250E} |  |  ┍ | \pmboxdrawuni{250D} |  |
|  ┌ | \textSFi |  |  ┃ | \pmboxdrawuni{2503} |  |  │ | \textSFxi |  |  ━ | \pmboxdrawuni{2501} |  |
|  ─ | \textSFx |  |  | |  |  | |  |  | |  |


### inputenx

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ≈ | \textapproxequal |  |  ɸ | \textphi |  |  Ħ | \textmalteseH |  |  | |  |


### xecjk

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ≂ |  | \texteqsim |  ĸ | \textkra |  |  ז | \hebzayin |  |  י | \hebyod |  |
|  ו | \hebvav |  |  צ | \hebtsadi |  |  ט | \hebtet |  |  ת | \hebtav |  |
|  ש | \hebshin |  |  ס | \hebsamekh |  |  ר | \hebresh |  |  ק | \hebqof |  |
|  פ | \hebpe |  |  נ | \hebnun |  |  מ | \hebmem |  |  ל | \heblamed |  |
|  כ | \hebkaf |  |  ח | \hebhet |  |  ה | \hebhe |  |  ג | \hebgimel |  |
|  ץ | \hebfinaltsadi |  |  ף | \hebfinalpe |  |  ן | \hebfinalnun |  |  ם | \hebfinalmem |  |
|  ך | \hebfinalkaf |  |  ד | \hebdalet |  |  ב | \hebbet |  |  ע | \hebayin |  |
|  א | \hebalef |  |  | |  |  | |  |  | |  |


### mathabx

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ∸ |  | \dotdiv |  | |  |  | |  |  | |  |


### MnSymbol

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ∳ |  | \rcirclerightint |  ∲ |  | \lcirclerightint |  | |  |  | |  |


### graphics

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ↳ | \reflectbox{\carriagereturn} |  |  | |  |  | |  |  | |  |


### textcomp

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  → | \textrightarrow |  |  ↑ | \textuparrow |  |  ™ | \texttrademark |  |  ℞ | \textrecipe |  |
|  ‱ | \textpertenthousand |  |  ‰ | \textperthousand |  |  • | \textbullet |  |  ˙ | \textperiodcentered |  |
|  ð | \textdh |  |  º | \textordmasculine |  |  ¶ | \textparagraph |  |  ° | \textdegree |  |
|  ª | \textordfeminine |  |  © | \textcopyright |  |  ¦ | \textbrokenbar |  |  ₱ | \textpeso |  |
|  ₫ | \textdong |  |  ₩ | \textwon |  |  ₧ | \textpeseta |  |  ₦ | \textnaira |  |
|  ₤ | \textlira |  |  ₡ | \textcolonmonetary |  |  ฿ | \textbaht |  |  ¥ | \textyen |  |
|  ¤ | \textcurrency |  |  ¢ | \textcent |  |  | |  |  | |  |


### tipa

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ₔ | \textsubscript{\textschwa} |  |  ̽ | \textovercross |  |  ̼ | \textseagull |  |  ̻ | \textsubsquare |  |
|  ̺ | \textinvsubbridge |  |  ̹ | \textsubrhalfring |  |  ̴ | \textsuperimposetilde |  |  ̱ | \textsubbar |  |
|  ̰ | \textsubtilde |  |  ̯ | \textsubarch |  |  ̬ | \textsubwedge |  |  ̪ | \textsubbridge |  |
|  ̩ | \textsyllabic |  |  ̥ | \textsubring |  |  ̤ | \textsubumlaut |  |  ̟ | \textsubplus |  |
|  ̞ | \textlowering |  |  ̝ | \textraising |  |  ̜ | \textsublhalfring |  |  ̚ | \textcorner |  |
|  ̙ | \textretracting |  |  ̘ | \textadvancing |  |  ̐ | \textdotbreve |  |  ̎ | \textdoublevbaraccent |  |
|  ̍ | \textvbaraccent |  |  ̊̄ | \textringmacron |  |  ̇̆ | \textdotbreve |  |  ̇́ | \textdotacute |  |
|  ̆̄ | \textbrevemacron |  |  ̄̀ | \textgravemacron |  |  ̃̇ | \texttildedot |  |  ̂̇ | \textcircumdot |  |
|  ́̌ | \textacutewedge |  |  ́̄ | \textacutemacron |  |  ̀̇ | \textgravedot |  |  ̀̄ | \textgravemacron |  |
|  ˩ | \tone{11} |  |  ˨ | \tone{22} |  |  ˧ | \tone{33} |  |  ˦ | \tone{44} |  |
|  ˥ | \tone{55} |  |  ʞ | \textturnk |  |  ɸ | \textphi |  |  ɤ | \textrevscripta |  |
|  ɣ | \textipa{G} |  |  ə | \textschwa |  |  ɖ | \textrtaild |  |  ɔ | \textipa{O} |  |
|  ɒ | textipa{\textopeno} |  |  ɐ | \textipa{\textturna} |  |  ƞ | \textipa{\textnrleg} |  |  ƕ | \texthvlig |  |
|  ħ | \textcrh |  |  | |  |  | |  |  | |  |


### MinionPro

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ϰ |  | \varkappa |  ϐ |  | \varbeta |  | |  |  | |  |


### textalpha

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  α | \textalpha |  |  | |  |  | |  |  | |  |


### mathscinet

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ʿ | \lasp |  |  | |  |  | |  |  | |  |


### ipa

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ɯ | \textturnm |  |  | |  |  | |  |  | |  |


### arevmath

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ð |  | \eth |  | |  |  | |  |  | |  |

