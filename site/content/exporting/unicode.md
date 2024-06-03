---
title: Unicode
weight: 8
---
## LaTeX en unicode

If you're lucky and you live in the 21st century or later, you can just use unicode in BibLaTeX and you don't have to bother about anything that follows except if you're the curious kind.

Some of us though are bound to outlets that still demand BibTeX, and there's geezers like me who just prefer the aesthetic of TeX commands over fancy-schmancy unicode, or you find TeX commands easier to search for in your doc than having to memorize how to enter `Ψ`. BBT has an extensive map of unicode characters, but translating unicode to TeX comes with a massive downside -- support for non-ascii characters is scattered across a myriad of packages that you will have to `usepackage` into your document. The default set are supported by your latex distribution, and require nothing extra in your preamble, but to to that I've had to make some compromises. You can amend those choices by telling BBT you have extra packages available. BBT can export commands from the following packages:

<!-- generated tables below -->


### wasysym

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ♓ | \pisces | \pisces |  ☽ | \rightmoon |  |  ☾ | \leftmoon |  |  | |  |


### unicode-math

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  € |  | \euro |  ̀ |  | \grave |  ́ |  | \acute |  ̃ |  | \tilde |
|  ̆ |  | \breve |  ̇ |  | \dot |  ̈ |  | \ddot |  ̉ |  | \ovhook |
|  ̌ |  | \check |  ̐ |  | \candra |  ̒ |  | \oturnedcomma |  ̕ |  | \ocommatopright |
|  ̚ |  | \droang |  ͍ |  | \underleftrightarrow |  Α |  | \mupAlpha |  Β |  | \mupBeta |
|  Γ |  | \mupGamma |  Δ |  | \mupDelta |  Ε |  | \mupEpsilon |  Ζ |  | \mupZeta |
|  Η |  | \mupEta |  Θ |  | \mupTheta |  Ι |  | \mupIota |  Κ |  | \mupKappa |
|  Λ |  | \mupLambda |  Μ |  | \mupMu |  Ν |  | \mupNu |  Ο |  | \mupOmicron |
|  Ρ |  | \mupRho |  Τ |  | \mupTau |  Χ |  | \mupChi |  ο |  | \mupomicron |
|  ϐ |  | \varbeta |  ϰ |  | \varkappa |  ϶ |  | \upbackepsilon |  𝐀 |  | \mbfA |
|  𝐁 |  | \mbfB |  𝐂 |  | \mbfC |  𝐃 |  | \mbfD |  𝐄 |  | \mbfE |
|  𝐅 |  | \mbfF |  𝐆 |  | \mbfG |  𝐇 |  | \mbfH |  𝐈 |  | \mbfI |
|  𝐉 |  | \mbfJ |  𝐊 |  | \mbfK |  𝐋 |  | \mbfL |  𝐌 |  | \mbfM |
|  𝐍 |  | \mbfN |  𝐎 |  | \mbfO |  𝐏 |  | \mbfP |  𝐐 |  | \mbfQ |
|  𝐑 |  | \mbfR |  𝐒 |  | \mbfS |  𝐓 |  | \mbfT |  𝐔 |  | \mbfU |
|  𝐕 |  | \mbfV |  𝐖 |  | \mbfW |  𝐗 |  | \mbfX |  𝐘 |  | \mbfY |
|  𝐙 |  | \mbfZ |  𝐚 |  | \mbfa |  𝐛 |  | \mbfb |  𝐜 |  | \mbfc |
|  𝐝 |  | \mbfd |  𝐞 |  | \mbfe |  𝐟 |  | \mbff |  𝐠 |  | \mbfg |
|  𝐡 |  | \mbfh |  𝐢 |  | \mbfi |  𝐣 |  | \mbfj |  𝐤 |  | \mbfk |
|  𝐥 |  | \mbfl |  𝐦 |  | \mbfm |  𝐧 |  | \mbfn |  𝐨 |  | \mbfo |
|  𝐩 |  | \mbfp |  𝐪 |  | \mbfq |  𝐫 |  | \mbfr |  𝐬 |  | \mbfs |
|  𝐭 |  | \mbft |  𝐮 |  | \mbfu |  𝐯 |  | \mbfv |  𝐰 |  | \mbfw |
|  𝐱 |  | \mbfx |  𝐲 |  | \mbfy |  𝐳 |  | \mbfz |  𝐴 |  | \mitA |
|  𝐵 |  | \mitB |  𝐶 |  | \mitC |  𝐷 |  | \mitD |  𝐸 |  | \mitE |
|  𝐹 |  | \mitF |  𝐺 |  | \mitG |  𝐻 |  | \mitH |  𝐼 |  | \mitI |
|  𝐽 |  | \mitJ |  𝐾 |  | \mitK |  𝐿 |  | \mitL |  𝑀 |  | \mitM |
|  𝑁 |  | \mitN |  𝑂 |  | \mitO |  𝑃 |  | \mitP |  𝑄 |  | \mitQ |
|  𝑅 |  | \mitR |  𝑆 |  | \mitS |  𝑇 |  | \mitT |  𝑈 |  | \mitU |
|  𝑉 |  | \mitV |  𝑊 |  | \mitW |  𝑋 |  | \mitX |  𝑌 |  | \mitY |
|  𝑍 |  | \mitZ |  𝑎 |  | \mita |  𝑏 |  | \mitb |  𝑐 |  | \mitc |
|  𝑑 |  | \mitd |  𝑒 |  | \mite |  𝑓 |  | \mitf |  𝑔 |  | \mitg |
|  𝑖 |  | \miti |  𝑗 |  | \mitj |  𝑘 |  | \mitk |  𝑙 |  | \mitl |
|  𝑚 |  | \mitm |  𝑛 |  | \mitn |  𝑜 |  | \mito |  𝑝 |  | \mitp |
|  𝑞 |  | \mitq |  𝑟 |  | \mitr |  𝑠 |  | \mits |  𝑡 |  | \mitt |
|  𝑢 |  | \mitu |  𝑣 |  | \mitv |  𝑤 |  | \mitw |  𝑥 |  | \mitx |
|  𝑦 |  | \mity |  𝑧 |  | \mitz |  𝑨 |  | \mbfitA |  𝑩 |  | \mbfitB |
|  𝑪 |  | \mbfitC |  𝑫 |  | \mbfitD |  𝑬 |  | \mbfitE |  𝑭 |  | \mbfitF |
|  𝑮 |  | \mbfitG |  𝑯 |  | \mbfitH |  𝑰 |  | \mbfitI |  𝑱 |  | \mbfitJ |
|  𝑲 |  | \mbfitK |  𝑳 |  | \mbfitL |  𝑴 |  | \mbfitM |  𝑵 |  | \mbfitN |
|  𝑶 |  | \mbfitO |  𝑷 |  | \mbfitP |  𝑸 |  | \mbfitQ |  𝑹 |  | \mbfitR |
|  𝑺 |  | \mbfitS |  𝑻 |  | \mbfitT |  𝑼 |  | \mbfitU |  𝑽 |  | \mbfitV |
|  𝑾 |  | \mbfitW |  𝑿 |  | \mbfitX |  𝒀 |  | \mbfitY |  𝒁 |  | \mbfitZ |
|  𝒂 |  | \mbfita |  𝒃 |  | \mbfitb |  𝒄 |  | \mbfitc |  𝒅 |  | \mbfitd |
|  𝒆 |  | \mbfite |  𝒇 |  | \mbfitf |  𝒈 |  | \mbfitg |  𝒉 |  | \mbfith |
|  𝒊 |  | \mbfiti |  𝒋 |  | \mbfitj |  𝒌 |  | \mbfitk |  𝒍 |  | \mbfitl |
|  𝒎 |  | \mbfitm |  𝒏 |  | \mbfitn |  𝒐 |  | \mbfito |  𝒑 |  | \mbfitp |
|  𝒒 |  | \mbfitq |  𝒓 |  | \mbfitr |  𝒔 |  | \mbfits |  𝒕 |  | \mbfitt |
|  𝒖 |  | \mbfitu |  𝒗 |  | \mbfitv |  𝒘 |  | \mbfitw |  𝒙 |  | \mbfitx |
|  𝒚 |  | \mbfity |  𝒛 |  | \mbfitz |  𝒜 |  | \mscrA |  𝒞 |  | \mscrC |
|  𝒟 |  | \mscrD |  𝒢 |  | \mscrG |  𝒥 |  | \mscrJ |  𝒦 |  | \mscrK |
|  𝒩 |  | \mscrN |  𝒪 |  | \mscrO |  𝒫 |  | \mscrP |  𝒬 |  | \mscrQ |
|  𝒮 |  | \mscrS |  𝒯 |  | \mscrT |  𝒰 |  | \mscrU |  𝒱 |  | \mscrV |
|  𝒲 |  | \mscrW |  𝒳 |  | \mscrX |  𝒴 |  | \mscrY |  𝒵 |  | \mscrZ |
|  𝒶 |  | \mscra |  𝒷 |  | \mscrb |  𝒸 |  | \mscrc |  𝒹 |  | \mscrd |
|  𝒻 |  | \mscrf |  𝒽 |  | \mscrh |  𝒾 |  | \mscri |  𝒿 |  | \mscrj |
|  𝓀 |  | \mscrk |  𝓁 |  | \mscrl |  𝓂 |  | \mscrm |  𝓃 |  | \mscrn |
|  𝓅 |  | \mscrp |  𝓆 |  | \mscrq |  𝓇 |  | \mscrr |  𝓈 |  | \mscrs |
|  𝓉 |  | \mscrt |  𝓊 |  | \mscru |  𝓋 |  | \mscrv |  𝓌 |  | \mscrw |
|  𝓍 |  | \mscrx |  𝓎 |  | \mscry |  𝓏 |  | \mscrz |  𝓐 |  | \mbfscrA |
|  𝓑 |  | \mbfscrB |  𝓒 |  | \mbfscrC |  𝓓 |  | \mbfscrD |  𝓔 |  | \mbfscrE |
|  𝓕 |  | \mbfscrF |  𝓖 |  | \mbfscrG |  𝓗 |  | \mbfscrH |  𝓘 |  | \mbfscrI |
|  𝓙 |  | \mbfscrJ |  𝓚 |  | \mbfscrK |  𝓛 |  | \mbfscrL |  𝓜 |  | \mbfscrM |
|  𝓝 |  | \mbfscrN |  𝓞 |  | \mbfscrO |  𝓟 |  | \mbfscrP |  𝓠 |  | \mbfscrQ |
|  𝓡 |  | \mbfscrR |  𝓢 |  | \mbfscrS |  𝓣 |  | \mbfscrT |  𝓤 |  | \mbfscrU |
|  𝓥 |  | \mbfscrV |  𝓦 |  | \mbfscrW |  𝓧 |  | \mbfscrX |  𝓨 |  | \mbfscrY |
|  𝓩 |  | \mbfscrZ |  𝓪 |  | \mbfscra |  𝓫 |  | \mbfscrb |  𝓬 |  | \mbfscrc |
|  𝓭 |  | \mbfscrd |  𝓮 |  | \mbfscre |  𝓯 |  | \mbfscrf |  𝓰 |  | \mbfscrg |
|  𝓱 |  | \mbfscrh |  𝓲 |  | \mbfscri |  𝓳 |  | \mbfscrj |  𝓴 |  | \mbfscrk |
|  𝓵 |  | \mbfscrl |  𝓶 |  | \mbfscrm |  𝓷 |  | \mbfscrn |  𝓸 |  | \mbfscro |
|  𝓹 |  | \mbfscrp |  𝓺 |  | \mbfscrq |  𝓻 |  | \mbfscrr |  𝓼 |  | \mbfscrs |
|  𝓽 |  | \mbfscrt |  𝓾 |  | \mbfscru |  𝓿 |  | \mbfscrv |  𝔀 |  | \mbfscrw |
|  𝔁 |  | \mbfscrx |  𝔂 |  | \mbfscry |  𝔃 |  | \mbfscrz |  𝔄 |  | \mfrakA |
|  𝔅 |  | \mfrakB |  𝔇 |  | \mfrakD |  𝔈 |  | \mfrakE |  𝔉 |  | \mfrakF |
|  𝔊 |  | \mfrakG |  𝔍 |  | \mfrakJ |  𝔎 |  | \mfrakK |  𝔏 |  | \mfrakL |
|  𝔐 |  | \mfrakM |  𝔑 |  | \mfrakN |  𝔒 |  | \mfrakO |  𝔓 |  | \mfrakP |
|  𝔔 |  | \mfrakQ |  𝔖 |  | \mfrakS |  𝔗 |  | \mfrakT |  𝔘 |  | \mfrakU |
|  𝔙 |  | \mfrakV |  𝔚 |  | \mfrakW |  𝔛 |  | \mfrakX |  𝔜 |  | \mfrakY |
|  𝔞 |  | \mfraka |  𝔟 |  | \mfrakb |  𝔠 |  | \mfrakc |  𝔡 |  | \mfrakd |
|  𝔢 |  | \mfrake |  𝔣 |  | \mfrakf |  𝔤 |  | \mfrakg |  𝔥 |  | \mfrakh |
|  𝔦 |  | \mfraki |  𝔧 |  | \mfrakj |  𝔨 |  | \mfrakk |  𝔩 |  | \mfrakl |
|  𝔪 |  | \mfrakm |  𝔫 |  | \mfrakn |  𝔬 |  | \mfrako |  𝔭 |  | \mfrakp |
|  𝔮 |  | \mfrakq |  𝔯 |  | \mfrakr |  𝔰 |  | \mfraks |  𝔱 |  | \mfrakt |
|  𝔲 |  | \mfraku |  𝔳 |  | \mfrakv |  𝔴 |  | \mfrakw |  𝔵 |  | \mfrakx |
|  𝔶 |  | \mfraky |  𝔷 |  | \mfrakz |  𝔸 |  | \BbbA |  𝔹 |  | \BbbB |
|  𝔻 |  | \BbbD |  𝔼 |  | \BbbE |  𝔽 |  | \BbbF |  𝔾 |  | \BbbG |
|  𝕀 |  | \BbbI |  𝕁 |  | \BbbJ |  𝕂 |  | \BbbK |  𝕃 |  | \BbbL |
|  𝕄 |  | \BbbM |  𝕆 |  | \BbbO |  𝕊 |  | \BbbS |  𝕋 |  | \BbbT |
|  𝕌 |  | \BbbU |  𝕍 |  | \BbbV |  𝕎 |  | \BbbW |  𝕏 |  | \BbbX |
|  𝕐 |  | \BbbY |  𝕒 |  | \Bbba |  𝕓 |  | \Bbbb |  𝕔 |  | \Bbbc |
|  𝕕 |  | \Bbbd |  𝕖 |  | \Bbbe |  𝕗 |  | \Bbbf |  𝕘 |  | \Bbbg |
|  𝕙 |  | \Bbbh |  𝕚 |  | \Bbbi |  𝕛 |  | \Bbbj |  𝕜 |  | \Bbbk |
|  𝕝 |  | \Bbbl |  𝕞 |  | \Bbbm |  𝕟 |  | \Bbbn |  𝕠 |  | \Bbbo |
|  𝕡 |  | \Bbbp |  𝕢 |  | \Bbbq |  𝕣 |  | \Bbbr |  𝕤 |  | \Bbbs |
|  𝕥 |  | \Bbbt |  𝕦 |  | \Bbbu |  𝕧 |  | \Bbbv |  𝕨 |  | \Bbbw |
|  𝕩 |  | \Bbbx |  𝕪 |  | \Bbby |  𝕫 |  | \Bbbz |  𝕬 |  | \mbffrakA |
|  𝕭 |  | \mbffrakB |  𝕮 |  | \mbffrakC |  𝕯 |  | \mbffrakD |  𝕰 |  | \mbffrakE |
|  𝕱 |  | \mbffrakF |  𝕲 |  | \mbffrakG |  𝕳 |  | \mbffrakH |  𝕴 |  | \mbffrakI |
|  𝕵 |  | \mbffrakJ |  𝕶 |  | \mbffrakK |  𝕷 |  | \mbffrakL |  𝕸 |  | \mbffrakM |
|  𝕹 |  | \mbffrakN |  𝕺 |  | \mbffrakO |  𝕻 |  | \mbffrakP |  𝕼 |  | \mbffrakQ |
|  𝕽 |  | \mbffrakR |  𝕾 |  | \mbffrakS |  𝕿 |  | \mbffrakT |  𝖀 |  | \mbffrakU |
|  𝖁 |  | \mbffrakV |  𝖂 |  | \mbffrakW |  𝖃 |  | \mbffrakX |  𝖄 |  | \mbffrakY |
|  𝖅 |  | \mbffrakZ |  𝖆 |  | \mbffraka |  𝖇 |  | \mbffrakb |  𝖈 |  | \mbffrakc |
|  𝖉 |  | \mbffrakd |  𝖊 |  | \mbffrake |  𝖋 |  | \mbffrakf |  𝖌 |  | \mbffrakg |
|  𝖍 |  | \mbffrakh |  𝖎 |  | \mbffraki |  𝖏 |  | \mbffrakj |  𝖐 |  | \mbffrakk |
|  𝖑 |  | \mbffrakl |  𝖒 |  | \mbffrakm |  𝖓 |  | \mbffrakn |  𝖔 |  | \mbffrako |
|  𝖕 |  | \mbffrakp |  𝖖 |  | \mbffrakq |  𝖗 |  | \mbffrakr |  𝖘 |  | \mbffraks |
|  𝖙 |  | \mbffrakt |  𝖚 |  | \mbffraku |  𝖛 |  | \mbffrakv |  𝖜 |  | \mbffrakw |
|  𝖝 |  | \mbffrakx |  𝖞 |  | \mbffraky |  𝖟 |  | \mbffrakz |  𝖠 |  | \msansA |
|  𝖡 |  | \msansB |  𝖢 |  | \msansC |  𝖣 |  | \msansD |  𝖤 |  | \msansE |
|  𝖥 |  | \msansF |  𝖦 |  | \msansG |  𝖧 |  | \msansH |  𝖨 |  | \msansI |
|  𝖩 |  | \msansJ |  𝖪 |  | \msansK |  𝖫 |  | \msansL |  𝖬 |  | \msansM |
|  𝖭 |  | \msansN |  𝖮 |  | \msansO |  𝖯 |  | \msansP |  𝖰 |  | \msansQ |
|  𝖱 |  | \msansR |  𝖲 |  | \msansS |  𝖳 |  | \msansT |  𝖴 |  | \msansU |
|  𝖵 |  | \msansV |  𝖶 |  | \msansW |  𝖷 |  | \msansX |  𝖸 |  | \msansY |
|  𝖹 |  | \msansZ |  𝖺 |  | \msansa |  𝖻 |  | \msansb |  𝖼 |  | \msansc |
|  𝖽 |  | \msansd |  𝖾 |  | \msanse |  𝖿 |  | \msansf |  𝗀 |  | \msansg |
|  𝗁 |  | \msansh |  𝗂 |  | \msansi |  𝗃 |  | \msansj |  𝗄 |  | \msansk |
|  𝗅 |  | \msansl |  𝗆 |  | \msansm |  𝗇 |  | \msansn |  𝗈 |  | \msanso |
|  𝗉 |  | \msansp |  𝗊 |  | \msansq |  𝗋 |  | \msansr |  𝗌 |  | \msanss |
|  𝗍 |  | \msanst |  𝗎 |  | \msansu |  𝗏 |  | \msansv |  𝗐 |  | \msansw |
|  𝗑 |  | \msansx |  𝗒 |  | \msansy |  𝗓 |  | \msansz |  𝗔 |  | \mbfsansA |
|  𝗕 |  | \mbfsansB |  𝗖 |  | \mbfsansC |  𝗗 |  | \mbfsansD |  𝗘 |  | \mbfsansE |
|  𝗙 |  | \mbfsansF |  𝗚 |  | \mbfsansG |  𝗛 |  | \mbfsansH |  𝗜 |  | \mbfsansI |
|  𝗝 |  | \mbfsansJ |  𝗞 |  | \mbfsansK |  𝗟 |  | \mbfsansL |  𝗠 |  | \mbfsansM |
|  𝗡 |  | \mbfsansN |  𝗢 |  | \mbfsansO |  𝗣 |  | \mbfsansP |  𝗤 |  | \mbfsansQ |
|  𝗥 |  | \mbfsansR |  𝗦 |  | \mbfsansS |  𝗧 |  | \mbfsansT |  𝗨 |  | \mbfsansU |
|  𝗩 |  | \mbfsansV |  𝗪 |  | \mbfsansW |  𝗫 |  | \mbfsansX |  𝗬 |  | \mbfsansY |
|  𝗭 |  | \mbfsansZ |  𝗮 |  | \mbfsansa |  𝗯 |  | \mbfsansb |  𝗰 |  | \mbfsansc |
|  𝗱 |  | \mbfsansd |  𝗲 |  | \mbfsanse |  𝗳 |  | \mbfsansf |  𝗴 |  | \mbfsansg |
|  𝗵 |  | \mbfsansh |  𝗶 |  | \mbfsansi |  𝗷 |  | \mbfsansj |  𝗸 |  | \mbfsansk |
|  𝗹 |  | \mbfsansl |  𝗺 |  | \mbfsansm |  𝗻 |  | \mbfsansn |  𝗼 |  | \mbfsanso |
|  𝗽 |  | \mbfsansp |  𝗾 |  | \mbfsansq |  𝗿 |  | \mbfsansr |  𝘀 |  | \mbfsanss |
|  𝘁 |  | \mbfsanst |  𝘂 |  | \mbfsansu |  𝘃 |  | \mbfsansv |  𝘄 |  | \mbfsansw |
|  𝘅 |  | \mbfsansx |  𝘆 |  | \mbfsansy |  𝘇 |  | \mbfsansz |  𝘈 |  | \mitsansA |
|  𝘉 |  | \mitsansB |  𝘊 |  | \mitsansC |  𝘋 |  | \mitsansD |  𝘌 |  | \mitsansE |
|  𝘍 |  | \mitsansF |  𝘎 |  | \mitsansG |  𝘏 |  | \mitsansH |  𝘐 |  | \mitsansI |
|  𝘑 |  | \mitsansJ |  𝘒 |  | \mitsansK |  𝘓 |  | \mitsansL |  𝘔 |  | \mitsansM |
|  𝘕 |  | \mitsansN |  𝘖 |  | \mitsansO |  𝘗 |  | \mitsansP |  𝘘 |  | \mitsansQ |
|  𝘙 |  | \mitsansR |  𝘚 |  | \mitsansS |  𝘛 |  | \mitsansT |  𝘜 |  | \mitsansU |
|  𝘝 |  | \mitsansV |  𝘞 |  | \mitsansW |  𝘟 |  | \mitsansX |  𝘠 |  | \mitsansY |
|  𝘡 |  | \mitsansZ |  𝘢 |  | \mitsansa |  𝘣 |  | \mitsansb |  𝘤 |  | \mitsansc |
|  𝘥 |  | \mitsansd |  𝘦 |  | \mitsanse |  𝘧 |  | \mitsansf |  𝘨 |  | \mitsansg |
|  𝘩 |  | \mitsansh |  𝘪 |  | \mitsansi |  𝘫 |  | \mitsansj |  𝘬 |  | \mitsansk |
|  𝘭 |  | \mitsansl |  𝘮 |  | \mitsansm |  𝘯 |  | \mitsansn |  𝘰 |  | \mitsanso |
|  𝘱 |  | \mitsansp |  𝘲 |  | \mitsansq |  𝘳 |  | \mitsansr |  𝘴 |  | \mitsanss |
|  𝘵 |  | \mitsanst |  𝘶 |  | \mitsansu |  𝘷 |  | \mitsansv |  𝘸 |  | \mitsansw |
|  𝘹 |  | \mitsansx |  𝘺 |  | \mitsansy |  𝘻 |  | \mitsansz |  𝘼 |  | \mbfitsansA |
|  𝘽 |  | \mbfitsansB |  𝘾 |  | \mbfitsansC |  𝘿 |  | \mbfitsansD |  𝙀 |  | \mbfitsansE |
|  𝙁 |  | \mbfitsansF |  𝙂 |  | \mbfitsansG |  𝙃 |  | \mbfitsansH |  𝙄 |  | \mbfitsansI |
|  𝙅 |  | \mbfitsansJ |  𝙆 |  | \mbfitsansK |  𝙇 |  | \mbfitsansL |  𝙈 |  | \mbfitsansM |
|  𝙉 |  | \mbfitsansN |  𝙊 |  | \mbfitsansO |  𝙋 |  | \mbfitsansP |  𝙌 |  | \mbfitsansQ |
|  𝙍 |  | \mbfitsansR |  𝙎 |  | \mbfitsansS |  𝙏 |  | \mbfitsansT |  𝙐 |  | \mbfitsansU |
|  𝙑 |  | \mbfitsansV |  𝙒 |  | \mbfitsansW |  𝙓 |  | \mbfitsansX |  𝙔 |  | \mbfitsansY |
|  𝙕 |  | \mbfitsansZ |  𝙖 |  | \mbfitsansa |  𝙗 |  | \mbfitsansb |  𝙘 |  | \mbfitsansc |
|  𝙙 |  | \mbfitsansd |  𝙚 |  | \mbfitsanse |  𝙛 |  | \mbfitsansf |  𝙜 |  | \mbfitsansg |
|  𝙝 |  | \mbfitsansh |  𝙞 |  | \mbfitsansi |  𝙟 |  | \mbfitsansj |  𝙠 |  | \mbfitsansk |
|  𝙡 |  | \mbfitsansl |  𝙢 |  | \mbfitsansm |  𝙣 |  | \mbfitsansn |  𝙤 |  | \mbfitsanso |
|  𝙥 |  | \mbfitsansp |  𝙦 |  | \mbfitsansq |  𝙧 |  | \mbfitsansr |  𝙨 |  | \mbfitsanss |
|  𝙩 |  | \mbfitsanst |  𝙪 |  | \mbfitsansu |  𝙫 |  | \mbfitsansv |  𝙬 |  | \mbfitsansw |
|  𝙭 |  | \mbfitsansx |  𝙮 |  | \mbfitsansy |  𝙯 |  | \mbfitsansz |  𝙰 |  | \mttA |
|  𝙱 |  | \mttB |  𝙲 |  | \mttC |  𝙳 |  | \mttD |  𝙴 |  | \mttE |
|  𝙵 |  | \mttF |  𝙶 |  | \mttG |  𝙷 |  | \mttH |  𝙸 |  | \mttI |
|  𝙹 |  | \mttJ |  𝙺 |  | \mttK |  𝙻 |  | \mttL |  𝙼 |  | \mttM |
|  𝙽 |  | \mttN |  𝙾 |  | \mttO |  𝙿 |  | \mttP |  𝚀 |  | \mttQ |
|  𝚁 |  | \mttR |  𝚂 |  | \mttS |  𝚃 |  | \mttT |  𝚄 |  | \mttU |
|  𝚅 |  | \mttV |  𝚆 |  | \mttW |  𝚇 |  | \mttX |  𝚈 |  | \mttY |
|  𝚉 |  | \mttZ |  𝚊 |  | \mtta |  𝚋 |  | \mttb |  𝚌 |  | \mttc |
|  𝚍 |  | \mttd |  𝚎 |  | \mtte |  𝚏 |  | \mttf |  𝚐 |  | \mttg |
|  𝚑 |  | \mtth |  𝚒 |  | \mtti |  𝚓 |  | \mttj |  𝚔 |  | \mttk |
|  𝚕 |  | \mttl |  𝚖 |  | \mttm |  𝚗 |  | \mttn |  𝚘 |  | \mtto |
|  𝚙 |  | \mttp |  𝚚 |  | \mttq |  𝚛 |  | \mttr |  𝚜 |  | \mtts |
|  𝚝 |  | \mttt |  𝚞 |  | \mttu |  𝚟 |  | \mttv |  𝚠 |  | \mttw |
|  𝚡 |  | \mttx |  𝚢 |  | \mtty |  𝚣 |  | \mttz |  𝚤 |  | \imath |
|  𝚥 |  | \jmath |  𝚨 |  | \mbfAlpha |  𝚩 |  | \mbfBeta |  𝚪 |  | \mbfGamma |
|  𝚫 |  | \mbfDelta |  𝚬 |  | \mbfEpsilon |  𝚭 |  | \mbfZeta |  𝚮 |  | \mbfEta |
|  𝚯 |  | \mbfTheta |  𝚰 |  | \mbfIota |  𝚱 |  | \mbfKappa |  𝚲 |  | \mbfLambda |
|  𝚳 |  | \mbfMu |  𝚴 |  | \mbfNu |  𝚵 |  | \mbfXi |  𝚶 |  | \mbfOmicron |
|  𝚷 |  | \mbfPi |  𝚸 |  | \mbfRho |  𝚹 |  | \mbfvarTheta |  𝚺 |  | \mbfSigma |
|  𝚻 |  | \mbfTau |  𝚼 |  | \mbfUpsilon |  𝚽 |  | \mbfPhi |  𝚾 |  | \mbfChi |
|  𝚿 |  | \mbfPsi |  𝛀 |  | \mbfOmega |  𝛁 |  | \mbfnabla |  𝛂 |  | \mbfalpha |
|  𝛃 |  | \mbfbeta |  𝛄 |  | \mbfgamma |  𝛅 |  | \mbfdelta |  𝛆 |  | \mbfvarepsilon |
|  𝛇 |  | \mbfzeta |  𝛈 |  | \mbfeta |  𝛉 |  | \mbftheta |  𝛊 |  | \mbfiota |
|  𝛋 |  | \mbfkappa |  𝛌 |  | \mbflambda |  𝛍 |  | \mbfmu |  𝛎 |  | \mbfnu |
|  𝛏 |  | \mbfxi |  𝛐 |  | \mbfomicron |  𝛑 |  | \mbfpi |  𝛒 |  | \mbfrho |
|  𝛓 |  | \mbfvarsigma |  𝛔 |  | \mbfsigma |  𝛕 |  | \mbftau |  𝛖 |  | \mbfupsilon |
|  𝛗 |  | \mbfvarphi |  𝛘 |  | \mbfchi |  𝛙 |  | \mbfpsi |  𝛚 |  | \mbfomega |
|  𝛛 |  | \mbfpartial |  𝛜 |  | \mbfepsilon |  𝛝 |  | \mbfvartheta |  𝛞 |  | \mbfvarkappa |
|  𝛟 |  | \mbfphi |  𝛠 |  | \mbfvarrho |  𝛡 |  | \mbfvarpi |  𝛢 |  | \mitAlpha |
|  𝛣 |  | \mitBeta |  𝛤 |  | \mitGamma |  𝛥 |  | \mitDelta |  𝛦 |  | \mitEpsilon |
|  𝛧 |  | \mitZeta |  𝛨 |  | \mitEta |  𝛩 |  | \mitTheta |  𝛪 |  | \mitIota |
|  𝛫 |  | \mitKappa |  𝛬 |  | \mitLambda |  𝛭 |  | \mitMu |  𝛮 |  | \mitNu |
|  𝛯 |  | \mitXi |  𝛰 |  | \mitOmicron |  𝛱 |  | \mitPi |  𝛲 |  | \mitRho |
|  𝛳 |  | \mitvarTheta |  𝛴 |  | \mitSigma |  𝛵 |  | \mitTau |  𝛶 |  | \mitUpsilon |
|  𝛷 |  | \mitPhi |  𝛸 |  | \mitChi |  𝛹 |  | \mitPsi |  𝛺 |  | \mitOmega |
|  𝛻 |  | \mitnabla |  𝛼 |  | \mitalpha |  𝛽 |  | \mitbeta |  𝛾 |  | \mitgamma |
|  𝛿 |  | \mitdelta |  𝜀 |  | \mitvarepsilon |  𝜁 |  | \mitzeta |  𝜂 |  | \miteta |
|  𝜃 |  | \mittheta |  𝜄 |  | \mitiota |  𝜅 |  | \mitkappa |  𝜆 |  | \mitlambda |
|  𝜇 |  | \mitmu |  𝜈 |  | \mitnu |  𝜉 |  | \mitxi |  𝜊 |  | \mitomicron |
|  𝜋 |  | \mitpi |  𝜌 |  | \mitrho |  𝜍 |  | \mitvarsigma |  𝜎 |  | \mitsigma |
|  𝜏 |  | \mittau |  𝜐 |  | \mitupsilon |  𝜑 |  | \mitvarphi |  𝜒 |  | \mitchi |
|  𝜓 |  | \mitpsi |  𝜔 |  | \mitomega |  𝜕 |  | \mitpartial |  𝜖 |  | \mitepsilon |
|  𝜗 |  | \mitvartheta |  𝜘 |  | \mitvarkappa |  𝜙 |  | \mitphi |  𝜚 |  | \mitvarrho |
|  𝜛 |  | \mitvarpi |  𝜜 |  | \mbfitAlpha |  𝜝 |  | \mbfitBeta |  𝜞 |  | \mbfitGamma |
|  𝜟 |  | \mbfitDelta |  𝜠 |  | \mbfitEpsilon |  𝜡 |  | \mbfitZeta |  𝜢 |  | \mbfitEta |
|  𝜣 |  | \mbfitTheta |  𝜤 |  | \mbfitIota |  𝜥 |  | \mbfitKappa |  𝜦 |  | \mbfitLambda |
|  𝜧 |  | \mbfitMu |  𝜨 |  | \mbfitNu |  𝜩 |  | \mbfitXi |  𝜪 |  | \mbfitOmicron |
|  𝜫 |  | \mbfitPi |  𝜬 |  | \mbfitRho |  𝜭 |  | \mbfitvarTheta |  𝜮 |  | \mbfitSigma |
|  𝜯 |  | \mbfitTau |  𝜰 |  | \mbfitUpsilon |  𝜱 |  | \mbfitPhi |  𝜲 |  | \mbfitChi |
|  𝜳 |  | \mbfitPsi |  𝜴 |  | \mbfitOmega |  𝜵 |  | \mbfitnabla |  𝜶 |  | \mbfitalpha |
|  𝜷 |  | \mbfitbeta |  𝜸 |  | \mbfitgamma |  𝜹 |  | \mbfitdelta |  𝜺 |  | \mbfitvarepsilon |
|  𝜻 |  | \mbfitzeta |  𝜼 |  | \mbfiteta |  𝜽 |  | \mbfittheta |  𝜾 |  | \mbfitiota |
|  𝜿 |  | \mbfitkappa |  𝝀 |  | \mbfitlambda |  𝝁 |  | \mbfitmu |  𝝂 |  | \mbfitnu |
|  𝝃 |  | \mbfitxi |  𝝄 |  | \mbfitomicron |  𝝅 |  | \mbfitpi |  𝝆 |  | \mbfitrho |
|  𝝇 |  | \mbfitvarsigma |  𝝈 |  | \mbfitsigma |  𝝉 |  | \mbfittau |  𝝊 |  | \mbfitupsilon |
|  𝝋 |  | \mbfitvarphi |  𝝌 |  | \mbfitchi |  𝝍 |  | \mbfitpsi |  𝝎 |  | \mbfitomega |
|  𝝏 |  | \mbfitpartial |  𝝐 |  | \mbfitepsilon |  𝝑 |  | \mbfitvartheta |  𝝒 |  | \mbfitvarkappa |
|  𝝓 |  | \mbfitphi |  𝝔 |  | \mbfitvarrho |  𝝕 |  | \mbfitvarpi |  𝝖 |  | \mbfsansAlpha |
|  𝝗 |  | \mbfsansBeta |  𝝘 |  | \mbfsansGamma |  𝝙 |  | \mbfsansDelta |  𝝚 |  | \mbfsansEpsilon |
|  𝝛 |  | \mbfsansZeta |  𝝜 |  | \mbfsansEta |  𝝝 |  | \mbfsansTheta |  𝝞 |  | \mbfsansIota |
|  𝝟 |  | \mbfsansKappa |  𝝠 |  | \mbfsansLambda |  𝝡 |  | \mbfsansMu |  𝝢 |  | \mbfsansNu |
|  𝝣 |  | \mbfsansXi |  𝝤 |  | \mbfsansOmicron |  𝝥 |  | \mbfsansPi |  𝝦 |  | \mbfsansRho |
|  𝝧 |  | \mbfsansvarTheta |  𝝨 |  | \mbfsansSigma |  𝝩 |  | \mbfsansTau |  𝝪 |  | \mbfsansUpsilon |
|  𝝫 |  | \mbfsansPhi |  𝝬 |  | \mbfsansChi |  𝝭 |  | \mbfsansPsi |  𝝮 |  | \mbfsansOmega |
|  𝝯 |  | \mbfsansnabla |  𝝰 |  | \mbfsansalpha |  𝝱 |  | \mbfsansbeta |  𝝲 |  | \mbfsansgamma |
|  𝝳 |  | \mbfsansdelta |  𝝴 |  | \mbfsansvarepsilon |  𝝵 |  | \mbfsanszeta |  𝝶 |  | \mbfsanseta |
|  𝝷 |  | \mbfsanstheta |  𝝸 |  | \mbfsansiota |  𝝹 |  | \mbfsanskappa |  𝝺 |  | \mbfsanslambda |
|  𝝻 |  | \mbfsansmu |  𝝼 |  | \mbfsansnu |  𝝽 |  | \mbfsansxi |  𝝾 |  | \mbfsansomicron |
|  𝝿 |  | \mbfsanspi |  𝞀 |  | \mbfsansrho |  𝞁 |  | \mbfsansvarsigma |  𝞂 |  | \mbfsanssigma |
|  𝞃 |  | \mbfsanstau |  𝞄 |  | \mbfsansupsilon |  𝞅 |  | \mbfsansvarphi |  𝞆 |  | \mbfsanschi |
|  𝞇 |  | \mbfsanspsi |  𝞈 |  | \mbfsansomega |  𝞉 |  | \mbfsanspartial |  𝞊 |  | \mbfsansepsilon |
|  𝞋 |  | \mbfsansvartheta |  𝞌 |  | \mbfsansvarkappa |  𝞍 |  | \mbfsansphi |  𝞎 |  | \mbfsansvarrho |
|  𝞏 |  | \mbfsansvarpi |  𝞐 |  | \mbfitsansAlpha |  𝞑 |  | \mbfitsansBeta |  𝞒 |  | \mbfitsansGamma |
|  𝞓 |  | \mbfitsansDelta |  𝞔 |  | \mbfitsansEpsilon |  𝞕 |  | \mbfitsansZeta |  𝞖 |  | \mbfitsansEta |
|  𝞗 |  | \mbfitsansTheta |  𝞘 |  | \mbfitsansIota |  𝞙 |  | \mbfitsansKappa |  𝞚 |  | \mbfitsansLambda |
|  𝞛 |  | \mbfitsansMu |  𝞜 |  | \mbfitsansNu |  𝞝 |  | \mbfitsansXi |  𝞞 |  | \mbfitsansOmicron |
|  𝞟 |  | \mbfitsansPi |  𝞠 |  | \mbfitsansRho |  𝞡 |  | \mbfitsansvarTheta |  𝞢 |  | \mbfitsansSigma |
|  𝞣 |  | \mbfitsansTau |  𝞤 |  | \mbfitsansUpsilon |  𝞥 |  | \mbfitsansPhi |  𝞦 |  | \mbfitsansChi |
|  𝞧 |  | \mbfitsansPsi |  𝞨 |  | \mbfitsansOmega |  𝞩 |  | \mbfitsansnabla |  𝞪 |  | \mbfitsansalpha |
|  𝞫 |  | \mbfitsansbeta |  𝞬 |  | \mbfitsansgamma |  𝞭 |  | \mbfitsansdelta |  𝞮 |  | \mbfitsansvarepsilon |
|  𝞯 |  | \mbfitsanszeta |  𝞰 |  | \mbfitsanseta |  𝞱 |  | \mbfitsanstheta |  𝞲 |  | \mbfitsansiota |
|  𝞳 |  | \mbfitsanskappa |  𝞴 |  | \mbfitsanslambda |  𝞵 |  | \mbfitsansmu |  𝞶 |  | \mbfitsansnu |
|  𝞷 |  | \mbfitsansxi |  𝞸 |  | \mbfitsansomicron |  𝞹 |  | \mbfitsanspi |  𝞺 |  | \mbfitsansrho |
|  𝞻 |  | \mbfitsansvarsigma |  𝞼 |  | \mbfitsanssigma |  𝞽 |  | \mbfitsanstau |  𝞾 |  | \mbfitsansupsilon |
|  𝞿 |  | \mbfitsansvarphi |  𝟀 |  | \mbfitsanschi |  𝟁 |  | \mbfitsanspsi |  𝟂 |  | \mbfitsansomega |
|  𝟃 |  | \mbfitsanspartial |  𝟄 |  | \mbfitsansepsilon |  𝟅 |  | \mbfitsansvartheta |  𝟆 |  | \mbfitsansvarkappa |
|  𝟇 |  | \mbfitsansphi |  𝟈 |  | \mbfitsansvarrho |  𝟉 |  | \mbfitsansvarpi |  𝟊 |  | \mbfDigamma |
|  𝟋 |  | \mbfdigamma |  𝟎 |  | \mbfzero |  𝟏 |  | \mbfone |  𝟐 |  | \mbftwo |
|  𝟑 |  | \mbfthree |  𝟒 |  | \mbffour |  𝟓 |  | \mbffive |  𝟔 |  | \mbfsix |
|  𝟕 |  | \mbfseven |  𝟖 |  | \mbfeight |  𝟗 |  | \mbfnine |  𝟘 |  | \Bbbzero |
|  𝟙 |  | \Bbbone |  𝟚 |  | \Bbbtwo |  𝟛 |  | \Bbbthree |  𝟜 |  | \Bbbfour |
|  𝟝 |  | \Bbbfive |  𝟞 |  | \Bbbsix |  𝟟 |  | \Bbbseven |  𝟠 |  | \Bbbeight |
|  𝟡 |  | \Bbbnine |  𝟢 |  | \msanszero |  𝟣 |  | \msansone |  𝟤 |  | \msanstwo |
|  𝟥 |  | \msansthree |  𝟦 |  | \msansfour |  𝟧 |  | \msansfive |  𝟨 |  | \msanssix |
|  𝟩 |  | \msansseven |  𝟪 |  | \msanseight |  𝟫 |  | \msansnine |  𝟬 |  | \mbfsanszero |
|  𝟭 |  | \mbfsansone |  𝟮 |  | \mbfsanstwo |  𝟯 |  | \mbfsansthree |  𝟰 |  | \mbfsansfour |
|  𝟱 |  | \mbfsansfive |  𝟲 |  | \mbfsanssix |  𝟳 |  | \mbfsansseven |  𝟴 |  | \mbfsanseight |
|  𝟵 |  | \mbfsansnine |  𝟶 |  | \mttzero |  𝟷 |  | \mttone |  𝟸 |  | \mtttwo |
|  𝟹 |  | \mttthree |  𝟺 |  | \mttfour |  𝟻 |  | \mttfive |  𝟼 |  | \mttsix |
|  𝟽 |  | \mttseven |  𝟾 |  | \mtteight |  𝟿 |  | \mttnine |  ữ0 |  | \arabicmaj |
|  ữ1 |  | \arabichad |  ‐ |  | \mathhyphen |  ― |  | \horizbar |  ‗ |  | \twolowline |
|  ‥ |  | \enleadertwodots |  ″ |  | \dprime |  ‴ |  | \trprime |  ‵ |  | \backprime |
|  ‶ |  | \backdprime |  ‷ |  | \backtrprime |  ‸ |  | \caretinsert |  ‼ |  | \Exclam |
|  ⁀ |  | \tieconcat |  ⁃ |  | \hyphenbullet |  ⁄ |  | \fracslash |  ⁇ |  | \Question |
|  ⁐ |  | \closure |  ⁗ |  | \qprime |  ⃒ |  | \vertoverlay |  ⃗ |  | \vec |
|  ⃛ |  | \dddot |  ⃜ |  | \ddddot |  ⃝ |  | \enclosecircle |  ⃞ |  | \enclosesquare |
|  ⃟ |  | \enclosediamond |  ⃡ |  | \overleftrightarrow |  ⃤ |  | \enclosetriangle |  ⃧ |  | \annuity |
|  ⃨ |  | \threeunderdot |  ⃩ |  | \widebridgeabove |  ⃬ |  | \underrightharpoondown |  ⃭ |  | \underleftharpoondown |
|  ⃮ |  | \underleftarrow |  ⃯ |  | \underrightarrow |  ⃰ |  | \asteraccent |  ℎ |  | \Planckconst |
|  ℏ |  | \hslash |  ℒ |  | \mscrL |  ℛ |  | \mscrR |  ℧ |  | \mho |
|  ℩ |  | \turnediota |  Ⅎ |  | \Finv |  ℶ |  | \beth |  ℷ |  | \gimel |
|  ℸ |  | \daleth |  ⅁ |  | \Game |  ⅂ |  | \sansLturned |  ⅃ |  | \sansLmirrored |
|  ⅄ |  | \Yup |  ⅅ |  | \CapitalDifferentialD |  ⅊ |  | \PropertyLine |  ↚ |  | \nleftarrow |
|  ↛ |  | \nrightarrow |  ↞ |  | \twoheadleftarrow |  ↟ |  | \twoheaduparrow |  ↠ |  | \twoheadrightarrow |
|  ↡ |  | \twoheaddownarrow |  ↢ |  | \leftarrowtail |  ↣ |  | \rightarrowtail |  ↤ |  | \mapsfrom |
|  ↥ |  | \mapsup |  ↧ |  | \mapsdown |  ↨ |  | \updownarrowbar |  ↫ |  | \looparrowleft |
|  ↬ |  | \looparrowright |  ↭ |  | \leftrightsquigarrow |  ↮ |  | \nleftrightarrow |  ↰ |  | \Lsh |
|  ↱ |  | \Rsh |  ↳ | \reflectbox{\carriagereturn} | \Rdsh |  ↴ |  | \linefeed |  ↵ |  | \carriagereturn |
|  ↶ |  | \curvearrowleft |  ↷ |  | \curvearrowright |  ↸ |  | \barovernorthwestarrow |  ↹ |  | \barleftarrowrightarrowbar |
|  ↺ |  | \circlearrowleft |  ↾ |  | \upharpoonright |  ↿ |  | \upharpoonleft |  ⇁ |  | \rightharpoondown |
|  ⇂ |  | \downharpoonright |  ⇃ |  | \downharpoonleft |  ⇄ |  | \rightleftarrows |  ⇆ |  | \leftrightarrows |
|  ⇇ |  | \leftleftarrows |  ⇈ |  | \upuparrows |  ⇉ |  | \rightrightarrows |  ⇊ |  | \downdownarrows |
|  ⇋ |  | \leftrightharpoons |  ⇍ |  | \nLeftarrow |  ⇎ |  | \nLeftrightarrow |  ⇏ |  | \nRightarrow |
|  ⇖ |  | \Nwarrow |  ⇗ |  | \Nearrow |  ⇘ |  | \Searrow |  ⇙ |  | \Swarrow |
|  ⇚ |  | \Lleftarrow |  ⇛ |  | \Rrightarrow |  ⇜ |  | \leftsquigarrow |  ⇝ |  | \rightsquigarrow |
|  ⇞ |  | \nHuparrow |  ⇟ |  | \nHdownarrow |  ⇡ |  | \updasharrow |  ⇣ |  | \downdasharrow |
|  ⇦ |  | \leftwhitearrow |  ⇧ |  | \upwhitearrow |  ⇨ |  | \rightwhitearrow |  ⇩ |  | \downwhitearrow |
|  ⇪ |  | \whitearrowupfrombar |  ⇴ |  | \circleonrightarrow |  ⇶ |  | \rightthreearrows |  ⇷ |  | \nvleftarrow |
|  ⇹ |  | \nvleftrightarrow |  ⇺ |  | \nVleftarrow |  ⇼ |  | \nVleftrightarrow |  ⇽ |  | \leftarrowtriangle |
|  ⇾ |  | \rightarrowtriangle |  ⇿ |  | \leftrightarrowtriangle |  ∁ |  | \complement |  ∄ |  | \nexists |
|  ∅ |  | \varnothing |  ∆ |  | \increment |  ∇ |  | \nabla |  ∊ |  | \smallin |
|  ∍ |  | \smallni |  ∎ |  | \QED |  ∔ |  | \dotplus |  ∕ |  | \divslash |
|  √ |  | \sqrt |  ∟ |  | \rightangle |  ∡ |  | \measuredangle |  ∢ |  | \sphericalangle |
|  ∤ |  | \nmid |  ∦ |  | \nparallel |  ∲ |  | \lcirclerightint |  ∴ |  | \therefore |
|  ∵ |  | \because |  ∷ |  | \Colon |  ∹ |  | \eqcolon |  ∽ |  | \backsim |
|  ≊ |  | \approxeq |  ≎ |  | \Bumpeq |  ≏ |  | \bumpeq |  ≒ |  | \fallingdotseq |
|  ≓ |  | \risingdotseq |  ≔ |  | \coloneq |  ≖ |  | \eqcirc |  ≗ |  | \circeq |
|  ≘ |  | \arceq |  ≚ |  | \veeeq |  ≜ |  | \triangleq |  ≝ |  | \eqdef |
|  ≞ |  | \measeq |  ≟ |  | \questeq |  ≣ |  | \Equiv |  ≨ |  | \lneqq |
|  ≩ |  | \gneqq |  ≬ |  | \between |  ≭ |  | \nasymp |  ≴ |  | \nlesssim |
|  ≵ |  | \ngtrsim |  ≶ |  | \lessgtr |  ≷ |  | \gtrless |  ≼ |  | \preccurlyeq |
|  ≽ |  | \succcurlyeq |  ⊊ |  | \subsetneq |  ⊋ |  | \supsetneq |  ⊌ |  | \cupleftarrow |
|  ⊍ |  | \cupdot |  ⊏ |  | \sqsubset |  ⊐ |  | \sqsupset |  ⊚ |  | \circledcirc |
|  ⊛ |  | \circledast |  ⊜ |  | \circledequal |  ⊝ |  | \circleddash |  ⊞ |  | \boxplus |
|  ⊟ |  | \boxminus |  ⊠ |  | \boxtimes |  ⊡ |  | \boxdot |  ⊦ |  | \assert |
|  ⊩ |  | \Vdash |  ⊪ |  | \Vvdash |  ⊫ |  | \VDash |  ⊬ |  | \nvdash |
|  ⊭ |  | \nvDash |  ⊮ |  | \nVdash |  ⊯ |  | \nVDash |  ⊰ |  | \prurel |
|  ⊱ |  | \scurel |  ⊲ |  | \vartriangleleft |  ⊳ |  | \vartriangleright |  ⊴ |  | \trianglelefteq |
|  ⊵ |  | \trianglerighteq |  ⊸ |  | \multimap |  ⊺ |  | \intercal |  ⊻ |  | \veebar |
|  ⊼ |  | \barwedge |  ⊽ |  | \barvee |  ⊿ |  | \varlrtriangle |  ⋇ |  | \divideontimes |
|  ⋉ |  | \ltimes |  ⋊ |  | \rtimes |  ⋋ |  | \leftthreetimes |  ⋌ |  | \rightthreetimes |
|  ⋍ |  | \backsimeq |  ⋎ |  | \curlyvee |  ⋏ |  | \curlywedge |  ⋐ |  | \Subset |
|  ⋑ |  | \Supset |  ⋒ |  | \Cap |  ⋓ |  | \Cup |  ⋔ |  | \pitchfork |
|  ⋕ |  | \hash |  ⋖ |  | \lessdot |  ⋗ |  | \gtrdot |  ⋚ |  | \lesseqgtr |
|  ⋛ |  | \gtreqless |  ⋜ |  | \eqless |  ⋝ |  | \eqgtr |  ⋞ |  | \curlyeqprec |
|  ⋟ |  | \curlyeqsucc |  ⋠ |  | \npreceq |  ⋡ |  | \nsucceq |  ⋤ |  | \sqsubsetneq |
|  ⋥ |  | \sqsupsetneq |  ⋦ |  | \lnsim |  ⋧ |  | \gnsim |  ⋨ |  | \precedesnotsimilar |
|  ⋩ |  | \succnsim |  ⋬ |  | \ntrianglelefteq |  ⋭ |  | \ntrianglerighteq |  ⋲ |  | \disin |
|  ⋳ |  | \varisins |  ⋴ |  | \isins |  ⋵ |  | \isindot |  ⋷ |  | \isinobar |
|  ⋸ |  | \isinvb |  ⋹ |  | \isinE |  ⋺ |  | \nisd |  ⋻ |  | \varnis |
|  ⋼ |  | \nis |  ⋽ |  | \varniobar |  ⋾ |  | \niobar |  ⋿ |  | \bagmember |
|  ⌀ |  | \diameter |  ⌂ |  | \house |  ⌅ | \barwedge | \varbarwedge |  ⌐ |  | \invneg |
|  ⌒ |  | \profline |  ⌓ |  | \profsurf |  ⌗ |  | \viewdata |  ⌙ |  | \turnednot |
|  ⌜ |  | \ulcorner |  ⌝ |  | \urcorner |  ⌞ |  | \llcorner |  ⌟ |  | \lrcorner |
|  ⌠ |  | \inttop |  ⌡ |  | \intbottom |  ⌬ |  | \varhexagonlrbonds |  ⌲ |  | \conictaper |
|  ⌶ |  | \topbot |  ⌽ |  | \obar |  ⍓ |  | \APLboxupcaret |  ⍰ |  | \APLboxquestion |
|  ⍼ |  | \rangledownzigzagarrow |  ⎔ |  | \hexagon |  ⎛ |  | \lparenuend |  ⎜ |  | \lparenextender |
|  ⎝ |  | \lparenlend |  ⎞ |  | \rparenuend |  ⎟ |  | \rparenextender |  ⎠ |  | \rparenlend |
|  ⎡ |  | \lbrackuend |  ⎢ |  | \lbrackextender |  ⎣ |  | \lbracklend |  ⎤ |  | \rbrackuend |
|  ⎥ |  | \rbrackextender |  ⎦ |  | \rbracklend |  ⎧ |  | \lbraceuend |  ⎨ |  | \lbracemid |
|  ⎩ |  | \lbracelend |  ⎪ |  | \vbraceextender |  ⎫ |  | \rbraceuend |  ⎬ |  | \rbracemid |
|  ⎭ |  | \rbracelend |  ⎮ |  | \intextender |  ⎯ |  | \harrowextender |  ⎲ |  | \sumtop |
|  ⎳ |  | \sumbottom |  ⎴ |  | \overbracket |  ⎵ |  | \underbracket |  ⎶ |  | \bbrktbrk |
|  ⎷ |  | \sqrtbottom |  ⎸ |  | \lvboxline |  ⎹ |  | \rvboxline |  ⏎ |  | \varcarriagereturn |
|  ⏜ |  | \overparen |  ⏝ |  | \underparen |  ⏞ |  | \overbrace |  ⏟ |  | \underbrace |
|  ⏠ |  | \obrbrak |  ⏡ |  | \ubrbrak |  ⏢ |  | \trapezium |  ⏣ |  | \benzenr |
|  ⏤ |  | \strns |  ⏥ |  | \fltns |  ⏦ |  | \accurrent |  ⏧ |  | \elinters |
|  ␢ |  | \blanksymbol |  ␣ |  | \mathvisiblespace |  ┆ |  | \bdtriplevdash |  ▀ |  | \blockuphalf |
|  ▄ |  | \blocklowhalf |  █ |  | \blockfull |  ▌ |  | \blocklefthalf |  ▐ |  | \blockrighthalf |
|  ░ |  | \blockqtrshaded |  ▒ |  | \blockhalfshaded |  ▓ |  | \blockthreeqtrshaded |  ■ |  | \mdlgblksquare |
|  ▢ |  | \squoval |  ▣ |  | \blackinwhitesquare |  ▤ |  | \squarehfill |  ▥ |  | \squarevfill |
|  ▦ |  | \squarehvfill |  ▧ |  | \squarenwsefill |  ▨ |  | \squareneswfill |  ▩ |  | \squarecrossfill |
|  ▪ |  | \smblksquare |  ▫ |  | \smwhtsquare |  ▬ |  | \hrectangleblack |  ▭ |  | \hrectangle |
|  ▮ |  | \vrectangleblack |  ▯ |  | \vrectangle |  ▰ |  | \parallelogramblack |  ▱ |  | \parallelogram |
|  ▲ |  | \bigblacktriangleup |  △ |  | \bigtriangleup |  ▴ |  | \blacktriangle |  ▵ |  | \vartriangle |
|  ▸ |  | \smallblacktriangleright |  ▹ |  | \smalltriangleright |  ► |  | \blackpointerright |  ▻ |  | \whitepointerright |
|  ▼ |  | \bigblacktriangledown |  ▾ |  | \blacktriangledown |  ▿ |  | \triangledown |  ◂ |  | \smallblacktriangleleft |
|  ◃ |  | \smalltriangleleft |  ◄ |  | \blackpointerleft |  ◅ |  | \whitepointerleft |  ◈ |  | \blackinwhitediamond |
|  ◉ |  | \fisheye |  ◊ |  | \lozenge |  ◌ |  | \dottedcircle |  ◍ |  | \circlevertfill |
|  ◎ |  | \bullseye |  ◐ |  | \circlelefthalfblack |  ◑ |  | \circlerighthalfblack |  ◒ |  | \circlebottomhalfblack |
|  ◓ |  | \circletophalfblack |  ◔ |  | \circleurquadblack |  ◕ |  | \blackcircleulquadwhite |  ◖ |  | \blacklefthalfcircle |
|  ◗ |  | \blackrighthalfcircle |  ◘ |  | \inversebullet |  ◙ |  | \inversewhitecircle |  ◚ |  | \invwhiteupperhalfcircle |
|  ◛ |  | \invwhitelowerhalfcircle |  ◜ |  | \ularc |  ◝ |  | \urarc |  ◞ |  | \lrarc |
|  ◟ |  | \llarc |  ◠ |  | \topsemicircle |  ◡ |  | \botsemicircle |  ◢ |  | \lrblacktriangle |
|  ◣ |  | \llblacktriangle |  ◤ |  | \ulblacktriangle |  ◥ |  | \urblacktriangle |  ◦ |  | \smwhtcircle |
|  ◧ |  | \squareleftblack |  ◨ |  | \squarerightblack |  ◩ |  | \squareulblack |  ◪ |  | \squarelrblack |
|  ◫ |  | \boxbar |  ◬ |  | \trianglecdot |  ◭ |  | \triangleleftblack |  ◮ |  | \trianglerightblack |
|  ◰ |  | \squareulquad |  ◱ |  | \squarellquad |  ◲ |  | \squarelrquad |  ◳ |  | \squareurquad |
|  ◴ |  | \circleulquad |  ◵ |  | \circlellquad |  ◶ |  | \circlelrquad |  ◷ |  | \circleurquad |
|  ◸ |  | \ultriangle |  ◹ |  | \urtriangle |  ◺ |  | \lltriangle |  ◻ |  | \mdwhtsquare |
|  ◼ |  | \mdblksquare |  ◽ |  | \mdsmwhtsquare |  ◾ |  | \mdsmblksquare |  ◿ |  | \lrtriangle |
|  ★ |  | \bigstar |  ☆ |  | \bigwhitestar |  ☡ |  | \danger |  ☻ |  | \blacksmiley |
|  ☼ |  | \sun |  ☽ |  | \rightmoon |  ☾ |  | \leftmoon |  ♀ |  | \female |
|  ♂ |  | \male |  ♤ |  | \varspadesuit |  ♥ |  | \varheartsuit |  ♦ |  | \vardiamondsuit |
|  ♧ |  | \varclubsuit |  ♩ |  | \quarternote |  ♪ |  | \eighthnote |  ♫ |  | \twonotes |
|  ♬ |  | \sixteenthnote |  ♾ |  | \acidfree |  ⚀ |  | \dicei |  ⚁ |  | \diceii |
|  ⚂ |  | \diceiii |  ⚃ |  | \diceiv |  ⚄ |  | \dicev |  ⚅ |  | \dicevi |
|  ⚆ |  | \circledrightdot |  ⚇ |  | \circledtwodots |  ⚈ |  | \blackcircledrightdot |  ⚉ |  | \blackcircledtwodots |
|  ⚥ |  | \Hermaphrodite |  ⚬ |  | \mdsmwhtcircle |  ⚲ |  | \neuter |  ✓ |  | \checkmark |
|  ✠ |  | \maltese |  ✪ |  | \circledstar |  ✶ |  | \varstar |  ✽ |  | \dingasterisk |
|  ❲ |  | \lbrbrak |  ❳ |  | \rbrbrak |  ➛ |  | \draftingarrow |  ⟀ |  | \threedangle |
|  ⟁ |  | \whiteinwhitetriangle |  ⟃ |  | \subsetcirc |  ⟄ |  | \supsetcirc |  ⟇ |  | \veedot |
|  ⟈ |  | \bsolhsub |  ⟉ |  | \suphsol |  ⟋ |  | \diagup |  ⟌ |  | \longdivision |
|  ⟍ |  | \diagdown |  ⟑ |  | \wedgedot |  ⟒ |  | \upin |  ⟓ |  | \pullback |
|  ⟔ |  | \pushout |  ⟕ |  | \leftouterjoin |  ⟖ |  | \rightouterjoin |  ⟗ |  | \fullouterjoin |
|  ⟘ |  | \bigbot |  ⟙ |  | \bigtop |  ⟚ |  | \DashVDash |  ⟛ |  | \dashVdash |
|  ⟜ |  | \multimapinv |  ⟝ |  | \vlongdash |  ⟞ |  | \longdashv |  ⟟ |  | \cirbot |
|  ⟠ |  | \lozengeminus |  ⟡ |  | \concavediamond |  ⟢ |  | \concavediamondtickleft |  ⟣ |  | \concavediamondtickright |
|  ⟤ |  | \whitesquaretickleft |  ⟥ |  | \whitesquaretickright |  ⟫ |  | \rang |  ⟬ |  | \Lbrbrak |
|  ⟭ |  | \Rbrbrak |  ⟰ |  | \UUparrow |  ⟱ |  | \DDownarrow |  ⟲ |  | \acwgapcirclearrow |
|  ⟳ |  | \cwgapcirclearrow |  ⟴ |  | \rightarrowonoplus |  ⟻ |  | \longmapsfrom |  ⟽ |  | \Longmapsfrom |
|  ⟾ |  | \Longmapsto |  ⟿ |  | \longrightsquigarrow |  ⤁ |  | \nVtwoheadrightarrow |  ⤂ |  | \nvLeftarrow |
|  ⤃ |  | \nvRightarrow |  ⤄ |  | \nvLeftrightarrow |  ⤅ |  | \twoheadmapsto |  ⤆ |  | \Mapsfrom |
|  ⤇ |  | \Mapsto |  ⤈ |  | \downarrowbarred |  ⤉ |  | \uparrowbarred |  ⤊ |  | \Uuparrow |
|  ⤋ |  | \Ddownarrow |  ⤌ |  | \leftbkarrow |  ⤍ |  | \rightbkarrow |  ⤎ |  | \leftdbkarrow |
|  ⤏ |  | \dbkarrow |  ⤐ |  | \drbkarrow |  ⤑ |  | \rightdotarrow |  ⤗ |  | \nvtwoheadrightarrowtail |
|  ⤘ |  | \nVtwoheadrightarrowtail |  ⤙ |  | \lefttail |  ⤚ |  | \righttail |  ⤛ |  | \leftdbltail |
|  ⤜ |  | \rightdbltail |  ⤝ |  | \diamondleftarrow |  ⤞ |  | \rightarrowdiamond |  ⤟ |  | \diamondleftarrowbar |
|  ⤠ |  | \barrightarrowdiamond |  ⤡ |  | \nwsearrow |  ⤢ |  | \neswarrow |  ⤣ |  | \hknwarrow |
|  ⤤ |  | \hknearrow |  ⤥ |  | \hksearrow |  ⤦ |  | \hkswarrow |  ⤧ |  | \tona |
|  ⤨ |  | \toea |  ⤩ |  | \tosa |  ⤪ |  | \towa |  ⤫ |  | \rdiagovfdiag |
|  ⤬ |  | \fdiagovrdiag |  ⤭ |  | \seovnearrow |  ⤮ |  | \neovsearrow |  ⤯ |  | \fdiagovnearrow |
|  ⤰ |  | \rdiagovsearrow |  ⤱ |  | \neovnwarrow |  ⤲ |  | \nwovnearrow |  ⤳ |  | \rightcurvedarrow |
|  ⤴ |  | \uprightcurvearrow |  ⤵ |  | \downrightcurvedarrow |  ⤶ |  | \leftdowncurvedarrow |  ⤷ |  | \rightdowncurvedarrow |
|  ⤸ |  | \cwrightarcarrow |  ⤹ |  | \acwleftarcarrow |  ⤺ |  | \acwoverarcarrow |  ⤻ |  | \acwunderarcarrow |
|  ⤼ |  | \curvearrowrightminus |  ⤽ |  | \curvearrowleftplus |  ⤾ |  | \cwundercurvearrow |  ⤿ |  | \ccwundercurvearrow |
|  ⥂ |  | \rightarrowshortleftarrow |  ⥃ |  | \leftarrowshortrightarrow |  ⥄ |  | \shortrightarrowleftarrow |  ⥅ |  | \rightarrowplus |
|  ⥆ |  | \leftarrowplus |  ⥇ |  | \rightarrowx |  ⥈ |  | \leftrightarrowcircle |  ⥉ |  | \twoheaduparrowcircle |
|  ⥌ |  | \updownharpoonrightleft |  ⥍ |  | \updownharpoonleftright |  ⥎ |  | \leftrightharpoonupup |  ⥐ |  | \DownLeftRightVector |
|  ⥦ |  | \leftrightharpoonsup |  ⥧ |  | \leftrightharpoonsdown |  ⥨ |  | \rightleftharpoonsup |  ⥩ |  | \rightleftharpoonsdown |
|  ⥱ |  | \equalrightarrow |  ⥲ |  | \similarrightarrow |  ⥳ |  | \leftarrowsimilar |  ⥴ |  | \rightarrowsimilar |
|  ⥵ |  | \rightarrowapprox |  ⥶ |  | \ltlarr |  ⥷ |  | \leftarrowless |  ⥸ |  | \gtrarr |
|  ⥹ |  | \subrarr |  ⥺ |  | \leftarrowsubset |  ⥻ |  | \suplarr |  ⥼ |  | \leftfishtail |
|  ⥽ |  | \rightfishtail |  ⥾ |  | \upfishtail |  ⥿ |  | \downfishtail |  ⦀ |  | \Vvert |
|  ⦁ |  | \spot |  ⦂ |  | \typecolon |  ⦃ |  | \lBrace |  ⦄ |  | \rBrace |
|  ⦅ |  | \lParen |  ⦆ |  | \Elroang |  ⦇ |  | \limg |  ⦋ |  | \lbrackubar |
|  ⦌ |  | \rbrackubar |  ⦍ |  | \lbrackultick |  ⦎ |  | \rbracklrtick |  ⦏ |  | \lbracklltick |
|  ⦐ |  | \rbrackurtick |  ⦑ |  | \langledot |  ⦒ |  | \rangledot |  ⦓ |  | \lparenless |
|  ⦔ |  | \rparengtr |  ⦕ |  | \Lparengtr |  ⦖ |  | \Rparenless |  ⦗ |  | \lblkbrbrak |
|  ⦘ |  | \rblkbrbrak |  ⦙ |  | \fourvdots |  ⦚ |  | \vzigzag |  ⦛ |  | \measuredangleleft |
|  ⦝ |  | \rightanglemdot |  ⦞ |  | \angles |  ⦟ |  | \angdnr |  ⦠ |  | \gtlpar |
|  ⦡ |  | \sphericalangleup |  ⦢ |  | \turnangle |  ⦣ |  | \revangle |  ⦤ |  | \angleubar |
|  ⦥ |  | \revangleubar |  ⦦ |  | \wideangledown |  ⦧ |  | \wideangleup |  ⦨ |  | \measanglerutone |
|  ⦩ |  | \measanglelutonw |  ⦪ |  | \measanglerdtose |  ⦫ |  | \measangleldtosw |  ⦬ |  | \measangleurtone |
|  ⦭ |  | \measangleultonw |  ⦮ |  | \measangledrtose |  ⦯ |  | \measangledltosw |  ⦰ |  | \revemptyset |
|  ⦱ |  | \emptysetobar |  ⦲ |  | \emptysetocirc |  ⦳ |  | \emptysetoarr |  ⦴ |  | \emptysetoarrl |
|  ⦵ |  | \circlehbar |  ⦶ |  | \circledvert |  ⦷ |  | \circledparallel |  ⦸ |  | \circledbslash |
|  ⦹ |  | \operp |  ⦺ |  | \obot |  ⦻ |  | \olcross |  ⦼ |  | \odotslashdot |
|  ⦽ |  | \uparrowoncircle |  ⦾ |  | \circledwhitebullet |  ⦿ |  | \circledbullet |  ⧀ |  | \circledless |
|  ⧁ |  | \circledgtr |  ⧂ |  | \cirscir |  ⧃ |  | \cirE |  ⧅ |  | \boxbslash |
|  ⧆ |  | \boxast |  ⧇ |  | \boxcircle |  ⧈ |  | \boxbox |  ⧉ |  | \boxonbox |
|  ⧊ |  | \triangleodot |  ⧋ |  | \triangleubar |  ⧌ |  | \triangles |  ⧍ |  | \triangleserifs |
|  ⧎ |  | \rtriltri |  ⧑ |  | \lfbowtie |  ⧒ |  | \rfbowtie |  ⧓ |  | \fbowtie |
|  ⧔ |  | \lftimes |  ⧕ |  | \rftimes |  ⧖ |  | \hourglass |  ⧗ |  | \blackhourglass |
|  ⧘ |  | \lvzigzag |  ⧙ |  | \rvzigzag |  ⧚ |  | \Lvzigzag |  ⧛ |  | \Rvzigzag |
|  ⧜ |  | \iinfin |  ⧝ |  | \tieinfty |  ⧞ |  | \nvinfty |  ⧠ |  | \laplac |
|  ⧡ |  | \lrtriangleeq |  ⧢ |  | \shuffle |  ⧣ |  | \eparsl |  ⧤ |  | \smeparsl |
|  ⧥ |  | \eqvparsl |  ⧦ |  | \gleichstark |  ⧧ |  | \thermod |  ⧨ |  | \downtriangleleftblack |
|  ⧩ |  | \downtrianglerightblack |  ⧪ |  | \blackdiamonddownarrow |  ⧫ |  | \blacklozenge |  ⧬ |  | \circledownarrow |
|  ⧭ |  | \blackcircledownarrow |  ⧮ |  | \errbarsquare |  ⧯ |  | \errbarblacksquare |  ⧰ |  | \errbardiamond |
|  ⧱ |  | \errbarblackdiamond |  ⧲ |  | \errbarcircle |  ⧳ |  | \errbarblackcircle |  ⧴ |  | \RuleDelayed |
|  ⧶ |  | \dsol |  ⧷ |  | \rsolbar |  ⧸ |  | \xsol |  ⧺ |  | \doubleplus |
|  ⧻ |  | \tripleplus |  ⧼ |  | \lcurvyangle |  ⧽ |  | \rcurvyangle |  ⧾ |  | \tplus |
|  ⧿ |  | \tminus |  ⨃ |  | \bigcupdot |  ⨄ |  | \Elxuplus |  ⨅ |  | \bigsqcap |
|  ⨇ |  | \conjquant |  ⨈ |  | \disjquant |  ⨊ |  | \modtwosum |  ⨋ |  | \sumint |
|  ⨌ |  | \iiiint |  ⨍ |  | \intbar |  ⨎ |  | \intBar |  ⨐ |  | \cirfnint |
|  ⨑ |  | \awint |  ⨒ |  | \rppolint |  ⨓ |  | \scpolint |  ⨔ |  | \npolint |
|  ⨕ |  | \pointint |  ⨗ |  | \intlarhk |  ⨘ |  | \intx |  ⨙ |  | \intcap |
|  ⨚ |  | \intcup |  ⨛ |  | \upint |  ⨜ |  | \lowint |  ⨝ |  | \Join |
|  ⨞ |  | \bigtriangleleft |  ⨟ |  | \zcmp |  ⨠ |  | \zpipe |  ⨡ |  | \zproject |
|  ⨢ |  | \ringplus |  ⨣ |  | \plushat |  ⨤ |  | \simplus |  ⨥ |  | \plusdot |
|  ⨦ |  | \plussim |  ⨧ |  | \plussubtwo |  ⨨ |  | \plustrif |  ⨩ |  | \commaminus |
|  ⨪ |  | \minusdot |  ⨫ |  | \minusfdots |  ⨬ |  | \minusrdots |  ⨭ |  | \opluslhrim |
|  ⨮ |  | \oplusrhrim |  ⨯ |  | \vectimes |  ⨰ |  | \dottimes |  ⨱ |  | \timesbar |
|  ⨲ |  | \btimes |  ⨳ |  | \smashtimes |  ⨴ |  | \otimeslhrim |  ⨵ |  | \otimesrhrim |
|  ⨶ |  | \otimeshat |  ⨷ |  | \Otimes |  ⨸ |  | \odiv |  ⨹ |  | \triangleplus |
|  ⨺ |  | \triangleminus |  ⨻ |  | \triangletimes |  ⨼ |  | \intprod |  ⨽ |  | \intprodr |
|  ⨾ |  | \fcmp |  ⩀ |  | \capdot |  ⩁ |  | \uminus |  ⩂ |  | \barcup |
|  ⩃ |  | \barcap |  ⩄ |  | \capwedge |  ⩅ |  | \cupvee |  ⩆ |  | \cupovercap |
|  ⩇ |  | \capovercup |  ⩈ |  | \cupbarcap |  ⩉ |  | \capbarcup |  ⩊ |  | \twocups |
|  ⩋ |  | \twocaps |  ⩌ |  | \closedvarcup |  ⩍ |  | \closedvarcap |  ⩎ |  | \Sqcap |
|  ⩏ |  | \Sqcup |  ⩐ |  | \closedvarcupsmashprod |  ⩑ |  | \wedgeodot |  ⩒ |  | \veeodot |
|  ⩓ |  | \Wedge |  ⩔ |  | \Vee |  ⩕ |  | \wedgeonwedge |  ⩗ |  | \bigslopedvee |
|  ⩘ |  | \bigslopedwedge |  ⩙ |  | \veeonwedge |  ⩚ |  | \wedgemidvert |  ⩛ |  | \veemidvert |
|  ⩜ |  | \midbarwedge |  ⩝ |  | \midbarvee |  ⩟ |  | \wedgebar |  ⩠ |  | \wedgedoublebar |
|  ⩡ |  | \varveebar |  ⩢ |  | \doublebarvee |  ⩣ |  | \veedoublebar |  ⩤ |  | \dsub |
|  ⩥ |  | \rsub |  ⩦ |  | \eqdot |  ⩧ |  | \dotequiv |  ⩨ |  | \equivVert |
|  ⩩ |  | \equivVvert |  ⩪ |  | \dotsim |  ⩫ |  | \simrdots |  ⩬ |  | \simminussim |
|  ⩭ |  | \congdot |  ⩯ |  | \hatapprox |  ⩰ |  | \approxeqq |  ⩱ |  | \eqqplus |
|  ⩲ |  | \pluseqq |  ⩳ |  | \eqqsim |  ⩴ |  | \Coloneqq |  ⩷ |  | \ddotseq |
|  ⩸ |  | \equivDD |  ⩹ |  | \ltcir |  ⩺ |  | \gtcir |  ⩻ |  | \ltquest |
|  ⩼ |  | \gtquest |  ⩽ |  | \leqslant |  ⩾ |  | \geqslant |  ⩿ |  | \lesdot |
|  ⪀ |  | \gesdot |  ⪁ |  | \lesdoto |  ⪂ |  | \gesdoto |  ⪃ |  | \lesdotor |
|  ⪄ |  | \gesdotol |  ⪅ |  | \lessapprox |  ⪆ |  | \gtrapprox |  ⪇ |  | \lneq |
|  ⪈ |  | \gneq |  ⪉ |  | \lnapprox |  ⪊ |  | \gnapprox |  ⪋ |  | \lesseqqgtr |
|  ⪌ |  | \gtreqqless |  ⪍ |  | \lsime |  ⪎ |  | \gsime |  ⪏ |  | \lsimg |
|  ⪐ |  | \gsiml |  ⪑ |  | \lgE |  ⪒ |  | \glE |  ⪓ |  | \lesges |
|  ⪔ |  | \gesles |  ⪕ |  | \eqslantless |  ⪖ |  | \eqslantgtr |  ⪗ |  | \elsdot |
|  ⪘ |  | \egsdot |  ⪙ |  | \eqqless |  ⪚ |  | \eqqgtr |  ⪛ |  | \eqqslantless |
|  ⪜ |  | \eqqslantgtr |  ⪝ |  | \simless |  ⪞ |  | \simgtr |  ⪟ |  | \simlE |
|  ⪠ |  | \simgE |  ⪣ |  | \partialmeetcontraction |  ⪤ |  | \glj |  ⪥ |  | \gla |
|  ⪨ |  | \lescc |  ⪩ |  | \gescc |  ⪪ |  | \smt |  ⪫ |  | \lat |
|  ⪬ |  | \smte |  ⪭ |  | \late |  ⪮ |  | \bumpeqq |  ⪱ |  | \precneq |
|  ⪲ |  | \succneq |  ⪳ |  | \preceqq |  ⪴ |  | \succeqq |  ⪵ |  | \precneqq |
|  ⪶ |  | \succneqq |  ⪷ |  | \precapprox |  ⪸ |  | \succapprox |  ⪹ |  | \precnapprox |
|  ⪺ |  | \succnapprox |  ⪽ |  | \subsetdot |  ⪾ |  | \supsetdot |  ⪿ |  | \subsetplus |
|  ⫀ |  | \supsetplus |  ⫁ |  | \submult |  ⫂ |  | \supmult |  ⫃ |  | \subedot |
|  ⫄ |  | \supedot |  ⫅ |  | \subseteqq |  ⫆ |  | \supseteqq |  ⫇ |  | \subsim |
|  ⫈ |  | \supsim |  ⫉ |  | \subsetapprox |  ⫊ |  | \supsetapprox |  ⫋ |  | \subsetneqq |
|  ⫌ |  | \supsetneqq |  ⫍ |  | \lsqhook |  ⫎ |  | \rsqhook |  ⫏ |  | \csub |
|  ⫐ |  | \csup |  ⫑ |  | \csube |  ⫒ |  | \csupe |  ⫓ |  | \subsup |
|  ⫔ |  | \supsub |  ⫕ |  | \subsub |  ⫖ |  | \supsup |  ⫗ |  | \suphsub |
|  ⫘ |  | \supdsub |  ⫙ |  | \forkv |  ⫚ |  | \topfork |  ⫛ |  | \mlcp |
|  ⫝̸ |  | \forks |  ⫝ |  | \forksnot |  ⫞ |  | \shortlefttack |  ⫟ |  | \shortdowntack |
|  ⫠ |  | \shortuptack |  ⫡ |  | \perps |  ⫢ |  | \vDdash |  ⫣ |  | \dashV |
|  ⫤ |  | \Dashv |  ⫥ |  | \DashV |  ⫦ |  | \varVdash |  ⫧ |  | \Barv |
|  ⫨ |  | \vBar |  ⫩ |  | \vBarv |  ⫫ |  | \Vbar |  ⫬ |  | \Not |
|  ⫭ |  | \bNot |  ⫮ |  | \revnmid |  ⫯ |  | \cirmid |  ⫰ |  | \midcir |
|  ⫱ |  | \topcir |  ⫲ |  | \nhpar |  ⫳ |  | \parsim |  ⫴ |  | \interleave |
|  ⫵ |  | \nhVvert |  ⫶ |  | \threedotcolon |  ⫷ |  | \lllnest |  ⫸ |  | \gggnest |
|  ⫹ |  | \leqqslant |  ⫺ |  | \geqqslant |  ⫻ |  | \trslash |  ⫼ |  | \biginterleave |
|  ⫾ |  | \talloblong |  ⫿ |  | \bigtalloblong |  ⬒ |  | \squaretopblack |  ⬓ |  | \squarebotblack |
|  ⬔ |  | \squareurblack |  ⬕ |  | \squarellblack |  ⬖ |  | \diamondleftblack |  ⬗ |  | \diamondrightblack |
|  ⬘ |  | \diamondtopblack |  ⬙ |  | \diamondbotblack |  ⬚ |  | \dottedsquare |  ⬛ |  | \lgblksquare |
|  ⬜ |  | \lgwhtsquare |  ⬝ |  | \vysmblksquare |  ⬞ |  | \vysmwhtsquare |  ⬟ |  | \pentagonblack |
|  ⬠ |  | \pentagon |  ⬡ |  | \varhexagon |  ⬢ |  | \varhexagonblack |  ⬣ |  | \hexagonblack |
|  ⬤ |  | \lgblkcircle |  ⬥ |  | \mdblkdiamond |  ⬦ |  | \mdwhtdiamond |  ⬧ |  | \mdblklozenge |
|  ⬨ |  | \mdwhtlozenge |  ⬩ |  | \smblkdiamond |  ⬪ |  | \smblklozenge |  ⬫ |  | \smwhtlozenge |
|  ⬬ |  | \blkhorzoval |  ⬭ |  | \whthorzoval |  ⬮ |  | \blkvertoval |  ⬯ |  | \whtvertoval |
|  ⬰ |  | \circleonleftarrow |  ⬱ |  | \leftthreearrows |  ⬲ |  | \leftarrowonoplus |  ⬳ |  | \longleftsquigarrow |
|  ⬴ |  | \nvtwoheadleftarrow |  ⬵ |  | \nVtwoheadleftarrow |  ⬶ |  | \twoheadmapsfrom |  ⬷ |  | \twoheadleftdbkarrow |
|  ⬸ |  | \leftdotarrow |  ⬹ |  | \nvleftarrowtail |  ⬺ |  | \nVleftarrowtail |  ⬻ |  | \twoheadleftarrowtail |
|  ⬼ |  | \nvtwoheadleftarrowtail |  ⬽ |  | \nVtwoheadleftarrowtail |  ⬾ |  | \leftarrowx |  ⬿ |  | \leftcurvedarrow |
|  ⭀ |  | \equalleftarrow |  ⭁ |  | \bsimilarleftarrow |  ⭂ |  | \leftarrowbackapprox |  ⭃ |  | \rightarrowgtr |
|  ⭄ |  | \rightarrowsupset |  ⭅ |  | \LLeftarrow |  ⭆ |  | \RRightarrow |  ⭇ |  | \bsimilarrightarrow |
|  ⭈ |  | \rightarrowbackapprox |  ⭉ |  | \similarleftarrow |  ⭊ |  | \leftarrowapprox |  ⭋ |  | \leftarrowbsimilar |
|  ⭌ |  | \rightarrowbsimilar |  ⭐ |  | \medwhitestar |  ⭑ |  | \medblackstar |  ⭒ |  | \smwhitestar |
|  ⭓ |  | \rightpentagonblack |  ⭔ |  | \rightpentagon |  〒 |  | \postalmark |  〰 |  | \hzigzag |


### amssymb

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ð |  | \eth |  ⩽ |  | \leqslant |  ⩽̸ |  | \nleqslant |  ⩾ |  | \geqslant |
|  ⩾̸ |  | \ngeqslant |  | |  |  | |  |  | |  |


### arevmath

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ð |  | \eth |  | |  |  | |  |  | |  |


### MinionPro

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ϐ |  | \varbeta |  ϰ |  | \varkappa |  | |  |  | |  |


### mathrsfs

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ℊ |  | \mathscr{g} |  ℋ |  | \mathscr{H} |  ℐ |  | \mathscr{I} |  ℒ |  | \mathscr{L} |
|  ℛ |  | \mathscr{R} |  ℬ |  | \mathscr{B} |  ℯ |  | \mathscr{e} |  ℰ |  | \mathscr{E} |
|  ℱ |  | \mathscr{F} |  ℳ |  | \mathscr{M} |  ℴ |  | \mathscr{o} |  𝒜 |  | \mathscr{A} |
|  𝒞 |  | \mathscr{C} |  𝒟 |  | \mathscr{D} |  𝒢 |  | \mathscr{G} |  𝒥 |  | \mathscr{J} |
|  𝒦 |  | \mathscr{K} |  𝒩 |  | \mathscr{N} |  𝒪 |  | \mathscr{O} |  𝒫 |  | \mathscr{P} |
|  𝒬 |  | \mathscr{Q} |  𝒮 |  | \mathscr{S} |  𝒯 |  | \mathscr{T} |  𝒰 |  | \mathscr{U} |
|  𝒱 |  | \mathscr{V} |  𝒲 |  | \mathscr{W} |  𝒳 |  | \mathscr{X} |  𝒴 |  | \mathscr{Y} |
|  𝒵 |  | \mathscr{Z} |  𝒶 |  | \mathscr{a} |  𝒷 |  | \mathscr{b} |  𝒸 |  | \mathscr{c} |
|  𝒹 |  | \mathscr{d} |  𝒻 |  | \mathscr{f} |  𝒽 |  | \mathscr{h} |  𝒾 |  | \mathscr{i} |
|  𝒿 |  | \mathscr{j} |  𝓀 |  | \mathscr{k} |  𝓁 |  | \mathscr{l} |  𝓂 |  | \mathscr{m} |
|  𝓃 |  | \mathscr{n} |  𝓅 |  | \mathscr{p} |  𝓆 |  | \mathscr{q} |  𝓇 |  | \mathscr{r} |
|  𝓈 |  | \mathscr{s} |  𝓉 |  | \mathscr{t} |  𝓊 |  | \mathscr{u} |  𝓋 |  | \mathscr{v} |
|  𝓌 |  | \mathscr{w} |  𝓍 |  | \mathscr{x} |  𝓎 |  | \mathscr{y} |  𝓏 |  | \mathscr{z} |


### MnSymbol

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ∲ |  | \lcirclerightint |  ∳ |  | \rcirclerightint |  | |  |  | |  |


### mathabx

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ∸ |  | \dotdiv |  | |  |  | |  |  | |  |


### xecjk

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ≂ |  | \texteqsim |  א | \hebalef |  |  ע | \hebayin |  |  ב | \hebbet |  |
|  ד | \hebdalet |  |  ך | \hebfinalkaf |  |  ם | \hebfinalmem |  |  ן | \hebfinalnun |  |
|  ף | \hebfinalpe |  |  ץ | \hebfinaltsadi |  |  ג | \hebgimel |  |  ה | \hebhe |  |
|  ח | \hebhet |  |  כ | \hebkaf |  |  ל | \heblamed |  |  מ | \hebmem |  |
|  נ | \hebnun |  |  פ | \hebpe |  |  ק | \hebqof |  |  ר | \hebresh |  |
|  ס | \hebsamekh |  |  ש | \hebshin |  |  ת | \hebtav |  |  ט | \hebtet |  |
|  צ | \hebtsadi |  |  ו | \hebvav |  |  י | \hebyod |  |  ז | \hebzayin |  |
|  ĸ | \textkra |  |  | |  |  | |  |  | |  |


### textcomp

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ¢ | \textcent |  |  ¤ | \textcurrency |  |  ¥ | \textyen |  |  ฿ | \textbaht |  |
|  ₡ | \textcolonmonetary |  |  ₤ | \textlira |  |  ₦ | \textnaira |  |  ₧ | \textpeseta |  |
|  ₩ | \textwon |  |  ₫ | \textdong |  |  ₱ | \textpeso |  |  ¦ | \textbrokenbar |  |
|  © | \textcopyright |  |  ª | \textordfeminine |  |  ° | \textdegree |  |  ¶ | \textparagraph |  |
|  º | \textordmasculine |  |  ð | \textdh |  |  ˙ | \textperiodcentered |  |  • | \textbullet |  |
|  ‰ | \textperthousand |  |  ‱ | \textpertenthousand |  |  ℞ | \textrecipe |  |  ™ | \texttrademark |  |
|  ↑ | \textuparrow |  |  → | \textrightarrow |  |  | |  |  | |  |


### inputenx

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  Ħ | \textmalteseH |  |  ɸ | \textphi |  |  ≈ | \textapproxequal |  |  | |  |


### tipa

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ħ | \textcrh |  |  ƕ | \texthvlig |  |  ƞ | \textipa{\textnrleg} |  |  ǂ | \textdoublebarpipe |  |
|  ɐ | \textipa{\textturna} |  |  ɒ | textipa{\textopeno} |  |  ɔ | \textipa{O} |  |  ɖ | \textrtaild |  |
|  ə | \textschwa |  |  ɣ | \textipa{G} |  |  ɤ | \textrevscripta |  |  ɸ | \textphi |  |
|  ʞ | \textturnk |  |  ˥ | \tone{55} |  |  ˦ | \tone{44} |  |  ˧ | \tone{33} |  |
|  ˨ | \tone{22} |  |  ˩ | \tone{11} |  |  ̀̄ | \textgravemacron |  |  ̀̇ | \textgravedot |  |
|  ́̄ | \textacutemacron |  |  ́̌ | \textacutewedge |  |  ̂̇ | \textcircumdot |  |  ̃̇ | \texttildedot |  |
|  ̄̀ | \textgravemacron |  |  ̆̄ | \textbrevemacron |  |  ̇́ | \textdotacute |  |  ̇̆ | \textdotbreve |  |
|  ̊̄ | \textringmacron |  |  ̍ | \textvbaraccent |  |  ̎ | \textdoublevbaraccent |  |  ̐ | \textdotbreve |  |
|  ̘ | \textadvancing |  |  ̙ | \textretracting |  |  ̚ | \textcorner |  |  ̜ | \textsublhalfring |  |
|  ̝ | \textraising |  |  ̞ | \textlowering |  |  ̟ | \textsubplus |  |  ̤ | \textsubumlaut |  |
|  ̥ | \textsubring |  |  ̩ | \textsyllabic |  |  ̪ | \textsubbridge |  |  ̬ | \textsubwedge |  |
|  ̯ | \textsubarch |  |  ̰ | \textsubtilde |  |  ̱ | \textsubbar |  |  ̴ | \textsuperimposetilde |  |
|  ̹ | \textsubrhalfring |  |  ̺ | \textinvsubbridge |  |  ̻ | \textsubsquare |  |  ̼ | \textseagull |  |
|  ̽ | \textovercross |  |  ₔ | \textsubscript{\textschwa} |  |  | |  |  | |  |


### ipa

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ɯ | \textturnm |  |  | |  |  | |  |  | |  |


### mathscinet

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ʿ | \lasp |  |  | |  |  | |  |  | |  |


### textalpha

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  α | \textalpha |  |  | |  |  | |  |  | |  |


### graphics

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ↳ | \reflectbox{\carriagereturn} |  |  | |  |  | |  |  | |  |


### pmboxdraw

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ─ | \textSFx |  |  ━ | \pmboxdrawuni{2501} |  |  │ | \textSFxi |  |  ┃ | \pmboxdrawuni{2503} |  |
|  ┌ | \textSFi |  |  ┍ | \pmboxdrawuni{250D} |  |  ┎ | \pmboxdrawuni{250E} |  |  ┏ | \pmboxdrawuni{250F} |  |
|  ┐ | \textSFiii |  |  ┑ | \pmboxdrawuni{2511} |  |  ┒ | \pmboxdrawuni{2512} |  |  ┓ | \pmboxdrawuni{2513} |  |
|  └ | \textSFii |  |  ┕ | \pmboxdrawuni{2515} |  |  ┖ | \pmboxdrawuni{2516} |  |  ┗ | \pmboxdrawuni{2517} |  |
|  ┘ | \textSFiv |  |  ┙ | \pmboxdrawuni{2519} |  |  ┚ | \pmboxdrawuni{251A} |  |  ┛ | \pmboxdrawuni{251B} |  |
|  ├ | \textSFviii |  |  ┝ | \pmboxdrawuni{251D} |  |  ┞ | \pmboxdrawuni{251E} |  |  ┟ | \pmboxdrawuni{251F} |  |
|  ┠ | \pmboxdrawuni{2520} |  |  ┡ | \pmboxdrawuni{2521} |  |  ┢ | \pmboxdrawuni{2522} |  |  ┣ | \pmboxdrawuni{2523} |  |
|  ┤ | \textSFix |  |  ┥ | \pmboxdrawuni{2525} |  |  ┦ | \pmboxdrawuni{2526} |  |  ┧ | \pmboxdrawuni{2527} |  |
|  ┨ | \pmboxdrawuni{2528} |  |  ┩ | \pmboxdrawuni{2529} |  |  ┪ | \pmboxdrawuni{252A} |  |  ┫ | \pmboxdrawuni{252B} |  |
|  ┬ | \textSFvi |  |  ┭ | \pmboxdrawuni{252D} |  |  ┮ | \pmboxdrawuni{252E} |  |  ┯ | \pmboxdrawuni{252F} |  |
|  ┰ | \pmboxdrawuni{2530} |  |  ┱ | \pmboxdrawuni{2531} |  |  ┲ | \pmboxdrawuni{2532} |  |  ┳ | \pmboxdrawuni{2533} |  |
|  ┴ | \textSFvii |  |  ┵ | \pmboxdrawuni{2535} |  |  ┶ | \pmboxdrawuni{2536} |  |  ┷ | \pmboxdrawuni{2537} |  |
|  ┸ | \pmboxdrawuni{2538} |  |  ┹ | \pmboxdrawuni{2539} |  |  ┺ | \pmboxdrawuni{253A} |  |  ┻ | \pmboxdrawuni{253B} |  |
|  ┼ | \textSFv |  |  ┽ | \pmboxdrawuni{253D} |  |  ┾ | \pmboxdrawuni{253E} |  |  ┿ | \pmboxdrawuni{253F} |  |
|  ╀ | \pmboxdrawuni{2540} |  |  ╁ | \pmboxdrawuni{2541} |  |  ╂ | \pmboxdrawuni{2542} |  |  ╃ | \pmboxdrawuni{2543} |  |
|  ╄ | \pmboxdrawuni{2544} |  |  ╅ | \pmboxdrawuni{2545} |  |  ╆ | \pmboxdrawuni{2546} |  |  ╇ | \pmboxdrawuni{2547} |  |
|  ╈ | \pmboxdrawuni{2548} |  |  ╉ | \pmboxdrawuni{2549} |  |  ╊ | \pmboxdrawuni{254A} |  |  ╋ | \pmboxdrawuni{254B} |  |
|  ═ | \textSFxliii |  |  ║ | \textSFxxiv |  |  ╒ | \textSFli |  |  ╓ | \textSFlii |  |
|  ╔ | \textSFxxxix |  |  ╕ | \textSFxxii |  |  ╖ | \textSFxxi |  |  ╗ | \textSFxxv |  |
|  ╘ | \textSFl |  |  ╙ | \textSFxlix |  |  ╚ | \textSFxxxviii |  |  ╛ | \textSFxxviii |  |
|  ╜ | \textSFxxvii |  |  ╝ | \textSFxxvi |  |  ╞ | \textSFxxxvi |  |  ╟ | \textSFxxxvii |  |
|  ╠ | \textSFxlii |  |  ╡ | \textSFxix |  |  ╢ | \textSFxx |  |  ╣ | \textSFxxiii |  |
|  ╤ | \textSFxlvii |  |  ╥ | \textSFxlviii |  |  ╦ | \textSFxli |  |  ╧ | \textSFxlv |  |
|  ╨ | \textSFxlvi |  |  ╩ | \textSFxl |  |  ╪ | \textSFliv |  |  ╫ | \textSFliii |  |
|  ╬ | \textSFxliv |  |  ╴ | \pmboxdrawuni{2574} |  |  ╵ | \pmboxdrawuni{2575} |  |  ╶ | \pmboxdrawuni{2576} |  |
|  ╷ | \pmboxdrawuni{2577} |  |  ╸ | \pmboxdrawuni{2578} |  |  ╹ | \pmboxdrawuni{2579} |  |  ╺ | \pmboxdrawuni{257A} |  |
|  ╻ | \pmboxdrawuni{257B} |  |  ╼ | \pmboxdrawuni{257C} |  |  ╽ | \pmboxdrawuni{257D} |  |  ╾ | \pmboxdrawuni{257E} |  |
|  ╿ | \pmboxdrawuni{257F} |  |  ▀ | \textupblock |  |  ▁ | \pmboxdrawuni{2581} |  |  ▂ | \pmboxdrawuni{2582} |  |
|  ▃ | \pmboxdrawuni{2583} |  |  ▄ | \textdnblock |  |  ▅ | \pmboxdrawuni{2585} |  |  ▆ | \pmboxdrawuni{2586} |  |
|  ▇ | \pmboxdrawuni{2587} |  |  █ | \textblock |  |  ▉ | \pmboxdrawuni{2589} |  |  ▊ | \pmboxdrawuni{258A} |  |
|  ▋ | \pmboxdrawuni{258B} |  |  ▌ | \textlfblock |  |  ▍ | \pmboxdrawuni{258D} |  |  ▎ | \pmboxdrawuni{258E} |  |
|  ▏ | \pmboxdrawuni{258F} |  |  ▐ | \textrtblock |  |  ░ | \textltshade |  |  ▒ | \textshade |  |
|  ▓ | \textdkshade |  |  ▔ | \pmboxdrawuni{2594} |  |  ▕ | \pmboxdrawuni{2595} |  |  ▖ | \pmboxdrawuni{2596} |  |
|  ▗ | \pmboxdrawuni{2597} |  |  ▘ | \pmboxdrawuni{2598} |  |  ▙ | \pmboxdrawuni{2599} |  |  ▚ | \pmboxdrawuni{259A} |  |
|  ▛ | \pmboxdrawuni{259B} |  |  ▜ | \pmboxdrawuni{259C} |  |  ▝ | \pmboxdrawuni{259D} |  |  ▞ | \pmboxdrawuni{259E} |  |
|  ▟ | \pmboxdrawuni{259F} |  |  | |  |  | |  |  | |  |

