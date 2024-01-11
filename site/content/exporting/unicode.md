---
title: Unicode
weight: 8
---
## LaTeX en unicode

If you're lucky and you live in the 21st century or later, you can just use unicode in BibLaTeX and you don't have to bother about anything that follows except if you're the curious kind.

Some of us though are bound to outlets that still demand BibTeX, and there's geezers like me who just prefer the aesthetic of TeX commands over fancy-schmancy unicode, or you find TeX commands easier to search for in your doc than having to memorize how to enter `Ψ`. BBT has an extensive map of unicode characters, but translating unicode to TeX comes with a massive downside -- support for non-ascii characters is scattered across a myriad of packages that you will have to `usepackage` into your document. The default set are supported by your latex distribution, and require nothing extra in your preamble, but to to that I've had to make some compromises. You can amend those choices by telling BBT you have extra packages available. BBT can export commands from the following packages:

<!-- generated tables below -->


### amssymb

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ð |  | \eth |  ⩽ |  | \leqslant |  ⩽̸ |  | \nleqslant |  ⩾ |  | \geqslant |
|  ⩾̸ |  | \ngeqslant |  | |  |  | |  |  | |  |


### arevmath

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ð |  | \eth |  | |  |  | |  |  | |  |


### unicode-math

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ̀ |  | \grave |  ́ |  | \acute |  ̂ |  | \hat |  ̃ |  | \tilde |
|  ̄ |  | \bar |  ̆ |  | \breve |  ̇ |  | \dot |  ̈ |  | \ddot |
|  ̉ |  | \ovhook |  ̌ |  | \check |  ̐ |  | \candra |  ̒ |  | \oturnedcomma |
|  ̕ |  | \ocommatopright |  ̚ |  | \droang |  ͍ |  | \underleftrightarrow |  Α |  | \mupAlpha |
|  Β |  | \mupBeta |  Γ |  | \mupGamma |  Δ |  | \mupDelta |  Ε |  | \mupEpsilon |
|  Ζ |  | \mupZeta |  Η |  | \mupEta |  Θ |  | \mupTheta |  Ι |  | \mupIota |
|  Κ |  | \mupKappa |  Λ |  | \mupLambda |  Μ |  | \mupMu |  Ν |  | \mupNu |
|  Ο |  | \mupOmicron |  Ρ |  | \mupRho |  Τ |  | \mupTau |  Χ |  | \mupChi |
|  ο |  | \mupomicron |  ϐ |  | \varbeta |  ϰ |  | \varkappa |  ϶ |  | \upbackepsilon |
|  ᵀ0 |  | \mbfA |  ᵀ1 |  | \mbfB |  ᵀ2 |  | \mbfC |  ᵀ3 |  | \mbfD |
|  ᵀ4 |  | \mbfE |  ᵀ5 |  | \mbfF |  ᵀ6 |  | \mbfG |  ᵀ7 |  | \mbfH |
|  ᵀ8 |  | \mbfI |  ᵀ9 |  | \mbfJ |  ᵀA |  | \mbfK |  ᵀB |  | \mbfL |
|  ᵀC |  | \mbfM |  ᵀD |  | \mbfN |  ᵀE |  | \mbfO |  ᵀF |  | \mbfP |
|  ᵁ0 |  | \mbfQ |  ᵁ1 |  | \mbfR |  ᵁ2 |  | \mbfS |  ᵁ3 |  | \mbfT |
|  ᵁ4 |  | \mbfU |  ᵁ5 |  | \mbfV |  ᵁ6 |  | \mbfW |  ᵁ7 |  | \mbfX |
|  ᵁ8 |  | \mbfY |  ᵁ9 |  | \mbfZ |  ᵁA |  | \mbfa |  ᵁB |  | \mbfb |
|  ᵁC |  | \mbfc |  ᵁD |  | \mbfd |  ᵁE |  | \mbfe |  ᵁF |  | \mbff |
|  ᵂ0 |  | \mbfg |  ᵂ1 |  | \mbfh |  ᵂ2 |  | \mbfi |  ᵂ3 |  | \mbfj |
|  ᵂ4 |  | \mbfk |  ᵂ5 |  | \mbfl |  ᵂ6 |  | \mbfm |  ᵂ7 |  | \mbfn |
|  ᵂ8 |  | \mbfo |  ᵂ9 |  | \mbfp |  ᵂA |  | \mbfq |  ᵂB |  | \mbfr |
|  ᵂC |  | \mbfs |  ᵂD |  | \mbft |  ᵂE |  | \mbfu |  ᵂF |  | \mbfv |
|  ᵃ0 |  | \mbfw |  ᵃ1 |  | \mbfx |  ᵃ2 |  | \mbfy |  ᵃ3 |  | \mbfz |
|  ᵃ4 |  | \mitA |  ᵃ5 |  | \mitB |  ᵃ6 |  | \mitC |  ᵃ7 |  | \mitD |
|  ᵃ8 |  | \mitE |  ᵃ9 |  | \mitF |  ᵃA |  | \mitG |  ᵃB |  | \mitH |
|  ᵃC |  | \mitI |  ᵃD |  | \mitJ |  ᵃE |  | \mitK |  ᵃF |  | \mitL |
|  ᵄ0 |  | \mitM |  ᵄ1 |  | \mitN |  ᵄ2 |  | \mitO |  ᵄ3 |  | \mitP |
|  ᵄ4 |  | \mitQ |  ᵄ5 |  | \mitR |  ᵄ6 |  | \mitS |  ᵄ7 |  | \mitT |
|  ᵄ8 |  | \mitU |  ᵄ9 |  | \mitV |  ᵄA |  | \mitW |  ᵄB |  | \mitX |
|  ᵄC |  | \mitY |  ᵄD |  | \mitZ |  ᵄE |  | \mita |  ᵄF |  | \mitb |
|  ᵅ0 |  | \mitc |  ᵅ1 |  | \mitd |  ᵅ2 |  | \mite |  ᵅ3 |  | \mitf |
|  ᵅ4 |  | \mitg |  ᵅ6 |  | \miti |  ᵅ7 |  | \mitj |  ᵅ8 |  | \mitk |
|  ᵅ9 |  | \mitl |  ᵅA |  | \mitm |  ᵅB |  | \mitn |  ᵅC |  | \mito |
|  ᵅD |  | \mitp |  ᵅE |  | \mitq |  ᵅF |  | \mitr |  ᵆ0 |  | \mits |
|  ᵆ1 |  | \mitt |  ᵆ2 |  | \mitu |  ᵆ3 |  | \mitv |  ᵆ4 |  | \mitw |
|  ᵆ5 |  | \mitx |  ᵆ6 |  | \mity |  ᵆ7 |  | \mitz |  ᵆ8 |  | \mbfitA |
|  ᵆ9 |  | \mbfitB |  ᵆA |  | \mbfitC |  ᵆB |  | \mbfitD |  ᵆC |  | \mbfitE |
|  ᵆD |  | \mbfitF |  ᵆE |  | \mbfitG |  ᵆF |  | \mbfitH |  ᵇ0 |  | \mbfitI |
|  ᵇ1 |  | \mbfitJ |  ᵇ2 |  | \mbfitK |  ᵇ3 |  | \mbfitL |  ᵇ4 |  | \mbfitM |
|  ᵇ5 |  | \mbfitN |  ᵇ6 |  | \mbfitO |  ᵇ7 |  | \mbfitP |  ᵇ8 |  | \mbfitQ |
|  ᵇ9 |  | \mbfitR |  ᵇA |  | \mbfitS |  ᵇB |  | \mbfitT |  ᵇC |  | \mbfitU |
|  ᵇD |  | \mbfitV |  ᵇE |  | \mbfitW |  ᵇF |  | \mbfitX |  ᵈ0 |  | \mbfitY |
|  ᵈ1 |  | \mbfitZ |  ᵈ2 |  | \mbfita |  ᵈ3 |  | \mbfitb |  ᵈ4 |  | \mbfitc |
|  ᵈ5 |  | \mbfitd |  ᵈ6 |  | \mbfite |  ᵈ7 |  | \mbfitf |  ᵈ8 |  | \mbfitg |
|  ᵈ9 |  | \mbfith |  ᵈA |  | \mbfiti |  ᵈB |  | \mbfitj |  ᵈC |  | \mbfitk |
|  ᵈD |  | \mbfitl |  ᵈE |  | \mbfitm |  ᵈF |  | \mbfitn |  ᵉ0 |  | \mbfito |
|  ᵉ1 |  | \mbfitp |  ᵉ2 |  | \mbfitq |  ᵉ3 |  | \mbfitr |  ᵉ4 |  | \mbfits |
|  ᵉ5 |  | \mbfitt |  ᵉ6 |  | \mbfitu |  ᵉ7 |  | \mbfitv |  ᵉ8 |  | \mbfitw |
|  ᵉ9 |  | \mbfitx |  ᵉA |  | \mbfity |  ᵉB |  | \mbfitz |  ᵉC |  | \mscrA |
|  ᵉE |  | \mscrC |  ᵉF |  | \mscrD |  ᵊ2 |  | \mscrG |  ᵊ5 |  | \mscrJ |
|  ᵊ6 |  | \mscrK |  ᵊ9 |  | \mscrN |  ᵊA |  | \mscrO |  ᵊB |  | \mscrP |
|  ᵊC |  | \mscrQ |  ᵊE |  | \mscrS |  ᵊF |  | \mscrT |  ᵋ0 |  | \mscrU |
|  ᵋ1 |  | \mscrV |  ᵋ2 |  | \mscrW |  ᵋ3 |  | \mscrX |  ᵋ4 |  | \mscrY |
|  ᵋ5 |  | \mscrZ |  ᵋ6 |  | \mscra |  ᵋ7 |  | \mscrb |  ᵋ8 |  | \mscrc |
|  ᵋ9 |  | \mscrd |  ᵋB |  | \mscrf |  ᵋD |  | \mscrh |  ᵋE |  | \mscri |
|  ᵋF |  | \mscrj |  ᵌ0 |  | \mscrk |  ᵌ1 |  | \mscrl |  ᵌ2 |  | \mscrm |
|  ᵌ3 |  | \mscrn |  ᵌ5 |  | \mscrp |  ᵌ6 |  | \mscrq |  ᵌ7 |  | \mscrr |
|  ᵌ8 |  | \mscrs |  ᵌ9 |  | \mscrt |  ᵌA |  | \mscru |  ᵌB |  | \mscrv |
|  ᵌC |  | \mscrw |  ᵌD |  | \mscrx |  ᵌE |  | \mscry |  ᵌF |  | \mscrz |
|  ᵍ0 |  | \mbfscrA |  ᵍ1 |  | \mbfscrB |  ᵍ2 |  | \mbfscrC |  ᵍ3 |  | \mbfscrD |
|  ᵍ4 |  | \mbfscrE |  ᵍ5 |  | \mbfscrF |  ᵍ6 |  | \mbfscrG |  ᵍ7 |  | \mbfscrH |
|  ᵍ8 |  | \mbfscrI |  ᵍ9 |  | \mbfscrJ |  ᵍA |  | \mbfscrK |  ᵍB |  | \mbfscrL |
|  ᵍC |  | \mbfscrM |  ᵍD |  | \mbfscrN |  ᵍE |  | \mbfscrO |  ᵍF |  | \mbfscrP |
|  ᵎ0 |  | \mbfscrQ |  ᵎ1 |  | \mbfscrR |  ᵎ2 |  | \mbfscrS |  ᵎ3 |  | \mbfscrT |
|  ᵎ4 |  | \mbfscrU |  ᵎ5 |  | \mbfscrV |  ᵎ6 |  | \mbfscrW |  ᵎ7 |  | \mbfscrX |
|  ᵎ8 |  | \mbfscrY |  ᵎ9 |  | \mbfscrZ |  ᵎA |  | \mbfscra |  ᵎB |  | \mbfscrb |
|  ᵎC |  | \mbfscrc |  ᵎD |  | \mbfscrd |  ᵎE |  | \mbfscre |  ᵎF |  | \mbfscrf |
|  ᵏ0 |  | \mbfscrg |  ᵏ1 |  | \mbfscrh |  ᵏ2 |  | \mbfscri |  ᵏ3 |  | \mbfscrj |
|  ᵏ4 |  | \mbfscrk |  ᵏ5 |  | \mbfscrl |  ᵏ6 |  | \mbfscrm |  ᵏ7 |  | \mbfscrn |
|  ᵏ8 |  | \mbfscro |  ᵏ9 |  | \mbfscrp |  ᵏA |  | \mbfscrq |  ᵏB |  | \mbfscrr |
|  ᵏC |  | \mbfscrs |  ᵏD |  | \mbfscrt |  ᵏE |  | \mbfscru |  ᵏF |  | \mbfscrv |
|  ᵐ0 |  | \mbfscrw |  ᵐ1 |  | \mbfscrx |  ᵐ2 |  | \mbfscry |  ᵐ3 |  | \mbfscrz |
|  ᵐ4 |  | \mfrakA |  ᵐ5 |  | \mfrakB |  ᵐ7 |  | \mfrakD |  ᵐ8 |  | \mfrakE |
|  ᵐ9 |  | \mfrakF |  ᵐA |  | \mfrakG |  ᵐD |  | \mfrakJ |  ᵐE |  | \mfrakK |
|  ᵐF |  | \mfrakL |  ᵑ0 |  | \mfrakM |  ᵑ1 |  | \mfrakN |  ᵑ2 |  | \mfrakO |
|  ᵑ3 |  | \mfrakP |  ᵑ4 |  | \mfrakQ |  ᵑ6 |  | \mfrakS |  ᵑ7 |  | \mfrakT |
|  ᵑ8 |  | \mfrakU |  ᵑ9 |  | \mfrakV |  ᵑA |  | \mfrakW |  ᵑB |  | \mfrakX |
|  ᵑC |  | \mfrakY |  ᵑE |  | \mfraka |  ᵑF |  | \mfrakb |  ᵒ0 |  | \mfrakc |
|  ᵒ1 |  | \mfrakd |  ᵒ2 |  | \mfrake |  ᵒ3 |  | \mfrakf |  ᵒ4 |  | \mfrakg |
|  ᵒ5 |  | \mfrakh |  ᵒ6 |  | \mfraki |  ᵒ7 |  | \mfrakj |  ᵒ8 |  | \mfrakk |
|  ᵒ9 |  | \mfrakl |  ᵒA |  | \mfrakm |  ᵒB |  | \mfrakn |  ᵒC |  | \mfrako |
|  ᵒD |  | \mfrakp |  ᵒE |  | \mfrakq |  ᵒF |  | \mfrakr |  ᵓ0 |  | \mfraks |
|  ᵓ1 |  | \mfrakt |  ᵓ2 |  | \mfraku |  ᵓ3 |  | \mfrakv |  ᵓ4 |  | \mfrakw |
|  ᵓ5 |  | \mfrakx |  ᵓ6 |  | \mfraky |  ᵓ7 |  | \mfrakz |  ᵓ8 |  | \BbbA |
|  ᵓ9 |  | \BbbB |  ᵓB |  | \BbbD |  ᵓC |  | \BbbE |  ᵓD |  | \BbbF |
|  ᵓE |  | \BbbG |  ᵔ0 |  | \BbbI |  ᵔ1 |  | \BbbJ |  ᵔ2 |  | \BbbK |
|  ᵔ3 |  | \BbbL |  ᵔ4 |  | \BbbM |  ᵔ6 |  | \BbbO |  ᵔA |  | \BbbS |
|  ᵔB |  | \BbbT |  ᵔC |  | \BbbU |  ᵔD |  | \BbbV |  ᵔE |  | \BbbW |
|  ᵔF |  | \BbbX |  ᵕ0 |  | \BbbY |  ᵕ2 |  | \Bbba |  ᵕ3 |  | \Bbbb |
|  ᵕ4 |  | \Bbbc |  ᵕ5 |  | \Bbbd |  ᵕ6 |  | \Bbbe |  ᵕ7 |  | \Bbbf |
|  ᵕ8 |  | \Bbbg |  ᵕ9 |  | \Bbbh |  ᵕA |  | \Bbbi |  ᵕB |  | \Bbbj |
|  ᵕC |  | \Bbbk |  ᵕD |  | \Bbbl |  ᵕE |  | \Bbbm |  ᵕF |  | \Bbbn |
|  ᵖ0 |  | \Bbbo |  ᵖ1 |  | \Bbbp |  ᵖ2 |  | \Bbbq |  ᵖ3 |  | \Bbbr |
|  ᵖ4 |  | \Bbbs |  ᵖ5 |  | \Bbbt |  ᵖ6 |  | \Bbbu |  ᵖ7 |  | \Bbbv |
|  ᵖ8 |  | \Bbbw |  ᵖ9 |  | \Bbbx |  ᵖA |  | \Bbby |  ᵖB |  | \Bbbz |
|  ᵖC |  | \mbffrakA |  ᵖD |  | \mbffrakB |  ᵖE |  | \mbffrakC |  ᵖF |  | \mbffrakD |
|  ᵗ0 |  | \mbffrakE |  ᵗ1 |  | \mbffrakF |  ᵗ2 |  | \mbffrakG |  ᵗ3 |  | \mbffrakH |
|  ᵗ4 |  | \mbffrakI |  ᵗ5 |  | \mbffrakJ |  ᵗ6 |  | \mbffrakK |  ᵗ7 |  | \mbffrakL |
|  ᵗ8 |  | \mbffrakM |  ᵗ9 |  | \mbffrakN |  ᵗA |  | \mbffrakO |  ᵗB |  | \mbffrakP |
|  ᵗC |  | \mbffrakQ |  ᵗD |  | \mbffrakR |  ᵗE |  | \mbffrakS |  ᵗF |  | \mbffrakT |
|  ᵘ0 |  | \mbffrakU |  ᵘ1 |  | \mbffrakV |  ᵘ2 |  | \mbffrakW |  ᵘ3 |  | \mbffrakX |
|  ᵘ4 |  | \mbffrakY |  ᵘ5 |  | \mbffrakZ |  ᵘ6 |  | \mbffraka |  ᵘ7 |  | \mbffrakb |
|  ᵘ8 |  | \mbffrakc |  ᵘ9 |  | \mbffrakd |  ᵘA |  | \mbffrake |  ᵘB |  | \mbffrakf |
|  ᵘC |  | \mbffrakg |  ᵘD |  | \mbffrakh |  ᵘE |  | \mbffraki |  ᵘF |  | \mbffrakj |
|  ᵙ0 |  | \mbffrakk |  ᵙ1 |  | \mbffrakl |  ᵙ2 |  | \mbffrakm |  ᵙ3 |  | \mbffrakn |
|  ᵙ4 |  | \mbffrako |  ᵙ5 |  | \mbffrakp |  ᵙ6 |  | \mbffrakq |  ᵙ7 |  | \mbffrakr |
|  ᵙ8 |  | \mbffraks |  ᵙ9 |  | \mbffrakt |  ᵙA |  | \mbffraku |  ᵙB |  | \mbffrakv |
|  ᵙC |  | \mbffrakw |  ᵙD |  | \mbffrakx |  ᵙE |  | \mbffraky |  ᵙF |  | \mbffrakz |
|  ᵚ0 |  | \msansA |  ᵚ1 |  | \msansB |  ᵚ2 |  | \msansC |  ᵚ3 |  | \msansD |
|  ᵚ4 |  | \msansE |  ᵚ5 |  | \msansF |  ᵚ6 |  | \msansG |  ᵚ7 |  | \msansH |
|  ᵚ8 |  | \msansI |  ᵚ9 |  | \msansJ |  ᵚA |  | \msansK |  ᵚB |  | \msansL |
|  ᵚC |  | \msansM |  ᵚD |  | \msansN |  ᵚE |  | \msansO |  ᵚF |  | \msansP |
|  ᵛ0 |  | \msansQ |  ᵛ1 |  | \msansR |  ᵛ2 |  | \msansS |  ᵛ3 |  | \msansT |
|  ᵛ4 |  | \msansU |  ᵛ5 |  | \msansV |  ᵛ6 |  | \msansW |  ᵛ7 |  | \msansX |
|  ᵛ8 |  | \msansY |  ᵛ9 |  | \msansZ |  ᵛA |  | \msansa |  ᵛB |  | \msansb |
|  ᵛC |  | \msansc |  ᵛD |  | \msansd |  ᵛE |  | \msanse |  ᵛF |  | \msansf |
|  ᵜ0 |  | \msansg |  ᵜ1 |  | \msansh |  ᵜ2 |  | \msansi |  ᵜ3 |  | \msansj |
|  ᵜ4 |  | \msansk |  ᵜ5 |  | \msansl |  ᵜ6 |  | \msansm |  ᵜ7 |  | \msansn |
|  ᵜ8 |  | \msanso |  ᵜ9 |  | \msansp |  ᵜA |  | \msansq |  ᵜB |  | \msansr |
|  ᵜC |  | \msanss |  ᵜD |  | \msanst |  ᵜE |  | \msansu |  ᵜF |  | \msansv |
|  ᵝ0 |  | \msansw |  ᵝ1 |  | \msansx |  ᵝ2 |  | \msansy |  ᵝ3 |  | \msansz |
|  ᵝ4 |  | \mbfsansA |  ᵝ5 |  | \mbfsansB |  ᵝ6 |  | \mbfsansC |  ᵝ7 |  | \mbfsansD |
|  ᵝ8 |  | \mbfsansE |  ᵝ9 |  | \mbfsansF |  ᵝA |  | \mbfsansG |  ᵝB |  | \mbfsansH |
|  ᵝC |  | \mbfsansI |  ᵝD |  | \mbfsansJ |  ᵝE |  | \mbfsansK |  ᵝF |  | \mbfsansL |
|  ᵞ0 |  | \mbfsansM |  ᵞ1 |  | \mbfsansN |  ᵞ2 |  | \mbfsansO |  ᵞ3 |  | \mbfsansP |
|  ᵞ4 |  | \mbfsansQ |  ᵞ5 |  | \mbfsansR |  ᵞ6 |  | \mbfsansS |  ᵞ7 |  | \mbfsansT |
|  ᵞ8 |  | \mbfsansU |  ᵞ9 |  | \mbfsansV |  ᵞA |  | \mbfsansW |  ᵞB |  | \mbfsansX |
|  ᵞC |  | \mbfsansY |  ᵞD |  | \mbfsansZ |  ᵞE |  | \mbfsansa |  ᵞF |  | \mbfsansb |
|  ᵟ0 |  | \mbfsansc |  ᵟ1 |  | \mbfsansd |  ᵟ2 |  | \mbfsanse |  ᵟ3 |  | \mbfsansf |
|  ᵟ4 |  | \mbfsansg |  ᵟ5 |  | \mbfsansh |  ᵟ6 |  | \mbfsansi |  ᵟ7 |  | \mbfsansj |
|  ᵟ8 |  | \mbfsansk |  ᵟ9 |  | \mbfsansl |  ᵟA |  | \mbfsansm |  ᵟB |  | \mbfsansn |
|  ᵟC |  | \mbfsanso |  ᵟD |  | \mbfsansp |  ᵟE |  | \mbfsansq |  ᵟF |  | \mbfsansr |
|  ᵠ0 |  | \mbfsanss |  ᵠ1 |  | \mbfsanst |  ᵠ2 |  | \mbfsansu |  ᵠ3 |  | \mbfsansv |
|  ᵠ4 |  | \mbfsansw |  ᵠ5 |  | \mbfsansx |  ᵠ6 |  | \mbfsansy |  ᵠ7 |  | \mbfsansz |
|  ᵠ8 |  | \mitsansA |  ᵠ9 |  | \mitsansB |  ᵠA |  | \mitsansC |  ᵠB |  | \mitsansD |
|  ᵠC |  | \mitsansE |  ᵠD |  | \mitsansF |  ᵠE |  | \mitsansG |  ᵠF |  | \mitsansH |
|  ᵡ0 |  | \mitsansI |  ᵡ1 |  | \mitsansJ |  ᵡ2 |  | \mitsansK |  ᵡ3 |  | \mitsansL |
|  ᵡ4 |  | \mitsansM |  ᵡ5 |  | \mitsansN |  ᵡ6 |  | \mitsansO |  ᵡ7 |  | \mitsansP |
|  ᵡ8 |  | \mitsansQ |  ᵡ9 |  | \mitsansR |  ᵡA |  | \mitsansS |  ᵡB |  | \mitsansT |
|  ᵡC |  | \mitsansU |  ᵡD |  | \mitsansV |  ᵡE |  | \mitsansW |  ᵡF |  | \mitsansX |
|  ᵢ0 |  | \mitsansY |  ᵢ1 |  | \mitsansZ |  ᵢ2 |  | \mitsansa |  ᵢ3 |  | \mitsansb |
|  ᵢ4 |  | \mitsansc |  ᵢ5 |  | \mitsansd |  ᵢ6 |  | \mitsanse |  ᵢ7 |  | \mitsansf |
|  ᵢ8 |  | \mitsansg |  ᵢ9 |  | \mitsansh |  ᵢA |  | \mitsansi |  ᵢB |  | \mitsansj |
|  ᵢC |  | \mitsansk |  ᵢD |  | \mitsansl |  ᵢE |  | \mitsansm |  ᵢF |  | \mitsansn |
|  ᵣ0 |  | \mitsanso |  ᵣ1 |  | \mitsansp |  ᵣ2 |  | \mitsansq |  ᵣ3 |  | \mitsansr |
|  ᵣ4 |  | \mitsanss |  ᵣ5 |  | \mitsanst |  ᵣ6 |  | \mitsansu |  ᵣ7 |  | \mitsansv |
|  ᵣ8 |  | \mitsansw |  ᵣ9 |  | \mitsansx |  ᵣA |  | \mitsansy |  ᵣB |  | \mitsansz |
|  ᵣC |  | \mbfitsansA |  ᵣD |  | \mbfitsansB |  ᵣE |  | \mbfitsansC |  ᵣF |  | \mbfitsansD |
|  ᵤ0 |  | \mbfitsansE |  ᵤ1 |  | \mbfitsansF |  ᵤ2 |  | \mbfitsansG |  ᵤ3 |  | \mbfitsansH |
|  ᵤ4 |  | \mbfitsansI |  ᵤ5 |  | \mbfitsansJ |  ᵤ6 |  | \mbfitsansK |  ᵤ7 |  | \mbfitsansL |
|  ᵤ8 |  | \mbfitsansM |  ᵤ9 |  | \mbfitsansN |  ᵤA |  | \mbfitsansO |  ᵤB |  | \mbfitsansP |
|  ᵤC |  | \mbfitsansQ |  ᵤD |  | \mbfitsansR |  ᵤE |  | \mbfitsansS |  ᵤF |  | \mbfitsansT |
|  ᵥ0 |  | \mbfitsansU |  ᵥ1 |  | \mbfitsansV |  ᵥ2 |  | \mbfitsansW |  ᵥ3 |  | \mbfitsansX |
|  ᵥ4 |  | \mbfitsansY |  ᵥ5 |  | \mbfitsansZ |  ᵥ6 |  | \mbfitsansa |  ᵥ7 |  | \mbfitsansb |
|  ᵥ8 |  | \mbfitsansc |  ᵥ9 |  | \mbfitsansd |  ᵥA |  | \mbfitsanse |  ᵥB |  | \mbfitsansf |
|  ᵥC |  | \mbfitsansg |  ᵥD |  | \mbfitsansh |  ᵥE |  | \mbfitsansi |  ᵥF |  | \mbfitsansj |
|  ᵦ0 |  | \mbfitsansk |  ᵦ1 |  | \mbfitsansl |  ᵦ2 |  | \mbfitsansm |  ᵦ3 |  | \mbfitsansn |
|  ᵦ4 |  | \mbfitsanso |  ᵦ5 |  | \mbfitsansp |  ᵦ6 |  | \mbfitsansq |  ᵦ7 |  | \mbfitsansr |
|  ᵦ8 |  | \mbfitsanss |  ᵦ9 |  | \mbfitsanst |  ᵦA |  | \mbfitsansu |  ᵦB |  | \mbfitsansv |
|  ᵦC |  | \mbfitsansw |  ᵦD |  | \mbfitsansx |  ᵦE |  | \mbfitsansy |  ᵦF |  | \mbfitsansz |
|  ᵧ0 |  | \mttA |  ᵧ1 |  | \mttB |  ᵧ2 |  | \mttC |  ᵧ3 |  | \mttD |
|  ᵧ4 |  | \mttE |  ᵧ5 |  | \mttF |  ᵧ6 |  | \mttG |  ᵧ7 |  | \mttH |
|  ᵧ8 |  | \mttI |  ᵧ9 |  | \mttJ |  ᵧA |  | \mttK |  ᵧB |  | \mttL |
|  ᵧC |  | \mttM |  ᵧD |  | \mttN |  ᵧE |  | \mttO |  ᵧF |  | \mttP |
|  ᵨ0 |  | \mttQ |  ᵨ1 |  | \mttR |  ᵨ2 |  | \mttS |  ᵨ3 |  | \mttT |
|  ᵨ4 |  | \mttU |  ᵨ5 |  | \mttV |  ᵨ6 |  | \mttW |  ᵨ7 |  | \mttX |
|  ᵨ8 |  | \mttY |  ᵨ9 |  | \mttZ |  ᵨA |  | \mtta |  ᵨB |  | \mttb |
|  ᵨC |  | \mttc |  ᵨD |  | \mttd |  ᵨE |  | \mtte |  ᵨF |  | \mttf |
|  ᵩ0 |  | \mttg |  ᵩ1 |  | \mtth |  ᵩ2 |  | \mtti |  ᵩ3 |  | \mttj |
|  ᵩ4 |  | \mttk |  ᵩ5 |  | \mttl |  ᵩ6 |  | \mttm |  ᵩ7 |  | \mttn |
|  ᵩ8 |  | \mtto |  ᵩ9 |  | \mttp |  ᵩA |  | \mttq |  ᵩB |  | \mttr |
|  ᵩC |  | \mtts |  ᵩD |  | \mttt |  ᵩE |  | \mttu |  ᵩF |  | \mttv |
|  ᵪ0 |  | \mttw |  ᵪ1 |  | \mttx |  ᵪ2 |  | \mtty |  ᵪ3 |  | \mttz |
|  ᵪ4 |  | \imath |  ᵪ5 |  | \jmath |  ᵪ8 |  | \mbfAlpha |  ᵪ9 |  | \mbfBeta |
|  ᵪA |  | \mbfGamma |  ᵪB |  | \mbfDelta |  ᵪC |  | \mbfEpsilon |  ᵪD |  | \mbfZeta |
|  ᵪE |  | \mbfEta |  ᵪF |  | \mbfTheta |  ᵫ0 |  | \mbfIota |  ᵫ1 |  | \mbfKappa |
|  ᵫ2 |  | \mbfLambda |  ᵫ3 |  | \mbfMu |  ᵫ4 |  | \mbfNu |  ᵫ5 |  | \mbfXi |
|  ᵫ6 |  | \mbfOmicron |  ᵫ7 |  | \mbfPi |  ᵫ8 |  | \mbfRho |  ᵫ9 |  | \mbfvarTheta |
|  ᵫA |  | \mbfSigma |  ᵫB |  | \mbfTau |  ᵫC |  | \mbfUpsilon |  ᵫD |  | \mbfPhi |
|  ᵫE |  | \mbfChi |  ᵫF |  | \mbfPsi |  ᵬ0 |  | \mbfOmega |  ᵬ1 |  | \mbfnabla |
|  ᵬ2 |  | \mbfalpha |  ᵬ3 |  | \mbfbeta |  ᵬ4 |  | \mbfgamma |  ᵬ5 |  | \mbfdelta |
|  ᵬ6 |  | \mbfvarepsilon |  ᵬ7 |  | \mbfzeta |  ᵬ8 |  | \mbfeta |  ᵬ9 |  | \mbftheta |
|  ᵬA |  | \mbfiota |  ᵬB |  | \mbfkappa |  ᵬC |  | \mbflambda |  ᵬD |  | \mbfmu |
|  ᵬE |  | \mbfnu |  ᵬF |  | \mbfxi |  ᵭ0 |  | \mbfomicron |  ᵭ1 |  | \mbfpi |
|  ᵭ2 |  | \mbfrho |  ᵭ3 |  | \mbfvarsigma |  ᵭ4 |  | \mbfsigma |  ᵭ5 |  | \mbftau |
|  ᵭ6 |  | \mbfupsilon |  ᵭ7 |  | \mbfvarphi |  ᵭ8 |  | \mbfchi |  ᵭ9 |  | \mbfpsi |
|  ᵭA |  | \mbfomega |  ᵭB |  | \mbfpartial |  ᵭC |  | \mbfepsilon |  ᵭD |  | \mbfvartheta |
|  ᵭE |  | \mbfvarkappa |  ᵭF |  | \mbfphi |  ᵮ0 |  | \mbfvarrho |  ᵮ1 |  | \mbfvarpi |
|  ᵮ2 |  | \mitAlpha |  ᵮ3 |  | \mitBeta |  ᵮ4 |  | \mitGamma |  ᵮ5 |  | \mitDelta |
|  ᵮ6 |  | \mitEpsilon |  ᵮ7 |  | \mitZeta |  ᵮ8 |  | \mitEta |  ᵮ9 |  | \mitTheta |
|  ᵮA |  | \mitIota |  ᵮB |  | \mitKappa |  ᵮC |  | \mitLambda |  ᵮD |  | \mitMu |
|  ᵮE |  | \mitNu |  ᵮF |  | \mitXi |  ᵯ0 |  | \mitOmicron |  ᵯ1 |  | \mitPi |
|  ᵯ2 |  | \mitRho |  ᵯ3 |  | \mitvarTheta |  ᵯ4 |  | \mitSigma |  ᵯ5 |  | \mitTau |
|  ᵯ6 |  | \mitUpsilon |  ᵯ7 |  | \mitPhi |  ᵯ8 |  | \mitChi |  ᵯ9 |  | \mitPsi |
|  ᵯA |  | \mitOmega |  ᵯB |  | \mitnabla |  ᵯC |  | \mitalpha |  ᵯD |  | \mitbeta |
|  ᵯE |  | \mitgamma |  ᵯF |  | \mitdelta |  ᵰ0 |  | \mitvarepsilon |  ᵰ1 |  | \mitzeta |
|  ᵰ2 |  | \miteta |  ᵰ3 |  | \mittheta |  ᵰ4 |  | \mitiota |  ᵰ5 |  | \mitkappa |
|  ᵰ6 |  | \mitlambda |  ᵰ7 |  | \mitmu |  ᵰ8 |  | \mitnu |  ᵰ9 |  | \mitxi |
|  ᵰA |  | \mitomicron |  ᵰB |  | \mitpi |  ᵰC |  | \mitrho |  ᵰD |  | \mitvarsigma |
|  ᵰE |  | \mitsigma |  ᵰF |  | \mittau |  ᵱ0 |  | \mitupsilon |  ᵱ1 |  | \mitvarphi |
|  ᵱ2 |  | \mitchi |  ᵱ3 |  | \mitpsi |  ᵱ4 |  | \mitomega |  ᵱ5 |  | \mitpartial |
|  ᵱ6 |  | \mitepsilon |  ᵱ7 |  | \mitvartheta |  ᵱ8 |  | \mitvarkappa |  ᵱ9 |  | \mitphi |
|  ᵱA |  | \mitvarrho |  ᵱB |  | \mitvarpi |  ᵱC |  | \mbfitAlpha |  ᵱD |  | \mbfitBeta |
|  ᵱE |  | \mbfitGamma |  ᵱF |  | \mbfitDelta |  ᵲ0 |  | \mbfitEpsilon |  ᵲ1 |  | \mbfitZeta |
|  ᵲ2 |  | \mbfitEta |  ᵲ3 |  | \mbfitTheta |  ᵲ4 |  | \mbfitIota |  ᵲ5 |  | \mbfitKappa |
|  ᵲ6 |  | \mbfitLambda |  ᵲ7 |  | \mbfitMu |  ᵲ8 |  | \mbfitNu |  ᵲ9 |  | \mbfitXi |
|  ᵲA |  | \mbfitOmicron |  ᵲB |  | \mbfitPi |  ᵲC |  | \mbfitRho |  ᵲD |  | \mbfitvarTheta |
|  ᵲE |  | \mbfitSigma |  ᵲF |  | \mbfitTau |  ᵳ0 |  | \mbfitUpsilon |  ᵳ1 |  | \mbfitPhi |
|  ᵳ2 |  | \mbfitChi |  ᵳ3 |  | \mbfitPsi |  ᵳ4 |  | \mbfitOmega |  ᵳ5 |  | \mbfitnabla |
|  ᵳ6 |  | \mbfitalpha |  ᵳ7 |  | \mbfitbeta |  ᵳ8 |  | \mbfitgamma |  ᵳ9 |  | \mbfitdelta |
|  ᵳA |  | \mbfitvarepsilon |  ᵳB |  | \mbfitzeta |  ᵳC |  | \mbfiteta |  ᵳD |  | \mbfittheta |
|  ᵳE |  | \mbfitiota |  ᵳF |  | \mbfitkappa |  ᵴ0 |  | \mbfitlambda |  ᵴ1 |  | \mbfitmu |
|  ᵴ2 |  | \mbfitnu |  ᵴ3 |  | \mbfitxi |  ᵴ4 |  | \mbfitomicron |  ᵴ5 |  | \mbfitpi |
|  ᵴ6 |  | \mbfitrho |  ᵴ7 |  | \mbfitvarsigma |  ᵴ8 |  | \mbfitsigma |  ᵴ9 |  | \mbfittau |
|  ᵴA |  | \mbfitupsilon |  ᵴB |  | \mbfitvarphi |  ᵴC |  | \mbfitchi |  ᵴD |  | \mbfitpsi |
|  ᵴE |  | \mbfitomega |  ᵴF |  | \mbfitpartial |  ᵵ0 |  | \mbfitepsilon |  ᵵ1 |  | \mbfitvartheta |
|  ᵵ2 |  | \mbfitvarkappa |  ᵵ3 |  | \mbfitphi |  ᵵ4 |  | \mbfitvarrho |  ᵵ5 |  | \mbfitvarpi |
|  ᵵ6 |  | \mbfsansAlpha |  ᵵ7 |  | \mbfsansBeta |  ᵵ8 |  | \mbfsansGamma |  ᵵ9 |  | \mbfsansDelta |
|  ᵵA |  | \mbfsansEpsilon |  ᵵB |  | \mbfsansZeta |  ᵵC |  | \mbfsansEta |  ᵵD |  | \mbfsansTheta |
|  ᵵE |  | \mbfsansIota |  ᵵF |  | \mbfsansKappa |  ᵶ0 |  | \mbfsansLambda |  ᵶ1 |  | \mbfsansMu |
|  ᵶ2 |  | \mbfsansNu |  ᵶ3 |  | \mbfsansXi |  ᵶ4 |  | \mbfsansOmicron |  ᵶ5 |  | \mbfsansPi |
|  ᵶ6 |  | \mbfsansRho |  ᵶ7 |  | \mbfsansvarTheta |  ᵶ8 |  | \mbfsansSigma |  ᵶ9 |  | \mbfsansTau |
|  ᵶA |  | \mbfsansUpsilon |  ᵶB |  | \mbfsansPhi |  ᵶC |  | \mbfsansChi |  ᵶD |  | \mbfsansPsi |
|  ᵶE |  | \mbfsansOmega |  ᵶF |  | \mbfsansnabla |  ᵷ0 |  | \mbfsansalpha |  ᵷ1 |  | \mbfsansbeta |
|  ᵷ2 |  | \mbfsansgamma |  ᵷ3 |  | \mbfsansdelta |  ᵷ4 |  | \mbfsansvarepsilon |  ᵷ5 |  | \mbfsanszeta |
|  ᵷ6 |  | \mbfsanseta |  ᵷ7 |  | \mbfsanstheta |  ᵷ8 |  | \mbfsansiota |  ᵷ9 |  | \mbfsanskappa |
|  ᵷA |  | \mbfsanslambda |  ᵷB |  | \mbfsansmu |  ᵷC |  | \mbfsansnu |  ᵷD |  | \mbfsansxi |
|  ᵷE |  | \mbfsansomicron |  ᵷF |  | \mbfsanspi |  ᵸ0 |  | \mbfsansrho |  ᵸ1 |  | \mbfsansvarsigma |
|  ᵸ2 |  | \mbfsanssigma |  ᵸ3 |  | \mbfsanstau |  ᵸ4 |  | \mbfsansupsilon |  ᵸ5 |  | \mbfsansvarphi |
|  ᵸ6 |  | \mbfsanschi |  ᵸ7 |  | \mbfsanspsi |  ᵸ8 |  | \mbfsansomega |  ᵸ9 |  | \mbfsanspartial |
|  ᵸA |  | \mbfsansepsilon |  ᵸB |  | \mbfsansvartheta |  ᵸC |  | \mbfsansvarkappa |  ᵸD |  | \mbfsansphi |
|  ᵸE |  | \mbfsansvarrho |  ᵸF |  | \mbfsansvarpi |  ᵹ0 |  | \mbfitsansAlpha |  ᵹ1 |  | \mbfitsansBeta |
|  ᵹ2 |  | \mbfitsansGamma |  ᵹ3 |  | \mbfitsansDelta |  ᵹ4 |  | \mbfitsansEpsilon |  ᵹ5 |  | \mbfitsansZeta |
|  ᵹ6 |  | \mbfitsansEta |  ᵹ7 |  | \mbfitsansTheta |  ᵹ8 |  | \mbfitsansIota |  ᵹ9 |  | \mbfitsansKappa |
|  ᵹA |  | \mbfitsansLambda |  ᵹB |  | \mbfitsansMu |  ᵹC |  | \mbfitsansNu |  ᵹD |  | \mbfitsansXi |
|  ᵹE |  | \mbfitsansOmicron |  ᵹF |  | \mbfitsansPi |  ᵺ0 |  | \mbfitsansRho |  ᵺ1 |  | \mbfitsansvarTheta |
|  ᵺ2 |  | \mbfitsansSigma |  ᵺ3 |  | \mbfitsansTau |  ᵺ4 |  | \mbfitsansUpsilon |  ᵺ5 |  | \mbfitsansPhi |
|  ᵺ6 |  | \mbfitsansChi |  ᵺ7 |  | \mbfitsansPsi |  ᵺ8 |  | \mbfitsansOmega |  ᵺ9 |  | \mbfitsansnabla |
|  ᵺA |  | \mbfitsansalpha |  ᵺB |  | \mbfitsansbeta |  ᵺC |  | \mbfitsansgamma |  ᵺD |  | \mbfitsansdelta |
|  ᵺE |  | \mbfitsansvarepsilon |  ᵺF |  | \mbfitsanszeta |  ᵻ0 |  | \mbfitsanseta |  ᵻ1 |  | \mbfitsanstheta |
|  ᵻ2 |  | \mbfitsansiota |  ᵻ3 |  | \mbfitsanskappa |  ᵻ4 |  | \mbfitsanslambda |  ᵻ5 |  | \mbfitsansmu |
|  ᵻ6 |  | \mbfitsansnu |  ᵻ7 |  | \mbfitsansxi |  ᵻ8 |  | \mbfitsansomicron |  ᵻ9 |  | \mbfitsanspi |
|  ᵻA |  | \mbfitsansrho |  ᵻB |  | \mbfitsansvarsigma |  ᵻC |  | \mbfitsanssigma |  ᵻD |  | \mbfitsanstau |
|  ᵻE |  | \mbfitsansupsilon |  ᵻF |  | \mbfitsansvarphi |  ᵼ0 |  | \mbfitsanschi |  ᵼ1 |  | \mbfitsanspsi |
|  ᵼ2 |  | \mbfitsansomega |  ᵼ3 |  | \mbfitsanspartial |  ᵼ4 |  | \mbfitsansepsilon |  ᵼ5 |  | \mbfitsansvartheta |
|  ᵼ6 |  | \mbfitsansvarkappa |  ᵼ7 |  | \mbfitsansphi |  ᵼ8 |  | \mbfitsansvarrho |  ᵼ9 |  | \mbfitsansvarpi |
|  ᵼA |  | \mbfDigamma |  ᵼB |  | \mbfdigamma |  ᵼE |  | \mbfzero |  ᵼF |  | \mbfone |
|  ᵽ0 |  | \mbftwo |  ᵽ1 |  | \mbfthree |  ᵽ2 |  | \mbffour |  ᵽ3 |  | \mbffive |
|  ᵽ4 |  | \mbfsix |  ᵽ5 |  | \mbfseven |  ᵽ6 |  | \mbfeight |  ᵽ7 |  | \mbfnine |
|  ᵽ8 |  | \Bbbzero |  ᵽ9 |  | \Bbbone |  ᵽA |  | \Bbbtwo |  ᵽB |  | \Bbbthree |
|  ᵽC |  | \Bbbfour |  ᵽD |  | \Bbbfive |  ᵽE |  | \Bbbsix |  ᵽF |  | \Bbbseven |
|  ᵾ0 |  | \Bbbeight |  ᵾ1 |  | \Bbbnine |  ᵾ2 |  | \msanszero |  ᵾ3 |  | \msansone |
|  ᵾ4 |  | \msanstwo |  ᵾ5 |  | \msansthree |  ᵾ6 |  | \msansfour |  ᵾ7 |  | \msansfive |
|  ᵾ8 |  | \msanssix |  ᵾ9 |  | \msansseven |  ᵾA |  | \msanseight |  ᵾB |  | \msansnine |
|  ᵾC |  | \mbfsanszero |  ᵾD |  | \mbfsansone |  ᵾE |  | \mbfsanstwo |  ᵾF |  | \mbfsansthree |
|  ᵿ0 |  | \mbfsansfour |  ᵿ1 |  | \mbfsansfive |  ᵿ2 |  | \mbfsanssix |  ᵿ3 |  | \mbfsansseven |
|  ᵿ4 |  | \mbfsanseight |  ᵿ5 |  | \mbfsansnine |  ᵿ6 |  | \mttzero |  ᵿ7 |  | \mttone |
|  ᵿ8 |  | \mtttwo |  ᵿ9 |  | \mttthree |  ᵿA |  | \mttfour |  ᵿB |  | \mttfive |
|  ᵿC |  | \mttsix |  ᵿD |  | \mttseven |  ᵿE |  | \mtteight |  ᵿF |  | \mttnine |
|  ữ0 |  | \arabicmaj |  ữ1 |  | \arabichad |  ‐ |  | \mathhyphen |  ― |  | \horizbar |
|  ‗ |  | \twolowline |  ‥ |  | \enleadertwodots |  ″ |  | \dprime |  ‴ |  | \trprime |
|  ‵ |  | \backprime |  ‶ |  | \backdprime |  ‷ |  | \backtrprime |  ‸ |  | \caretinsert |
|  ‼ |  | \Exclam |  ⁀ |  | \tieconcat |  ⁃ |  | \hyphenbullet |  ⁄ |  | \fracslash |
|  ⁇ |  | \Question |  ⁐ |  | \closure |  ⁗ |  | \qprime |  € |  | \euro |
|  ⃒ |  | \vertoverlay |  ⃗ |  | \vec |  ⃛ |  | \dddot |  ⃜ |  | \ddddot |
|  ⃝ |  | \enclosecircle |  ⃞ |  | \enclosesquare |  ⃟ |  | \enclosediamond |  ⃡ |  | \overleftrightarrow |
|  ⃤ |  | \enclosetriangle |  ⃧ |  | \annuity |  ⃨ |  | \threeunderdot |  ⃩ |  | \widebridgeabove |
|  ⃬ |  | \underrightharpoondown |  ⃭ |  | \underleftharpoondown |  ⃮ |  | \underleftarrow |  ⃯ |  | \underrightarrow |
|  ⃰ |  | \asteraccent |  ℎ |  | \Planckconst |  ℏ |  | \hslash |  ℒ |  | \mscrL |
|  ℛ |  | \mscrR |  ℧ |  | \mho |  ℩ |  | \turnediota |  Ⅎ |  | \Finv |
|  ℶ |  | \beth |  ℷ |  | \gimel |  ℸ |  | \daleth |  ⅁ |  | \Game |
|  ⅂ |  | \sansLturned |  ⅃ |  | \sansLmirrored |  ⅄ |  | \Yup |  ⅅ |  | \CapitalDifferentialD |
|  ⅊ |  | \PropertyLine |  ↚ |  | \nleftarrow |  ↛ |  | \nrightarrow |  ↞ |  | \twoheadleftarrow |
|  ↟ |  | \twoheaduparrow |  ↠ |  | \twoheadrightarrow |  ↡ |  | \twoheaddownarrow |  ↢ |  | \leftarrowtail |
|  ↣ |  | \rightarrowtail |  ↤ |  | \mapsfrom |  ↥ |  | \mapsup |  ↧ |  | \mapsdown |
|  ↨ |  | \updownarrowbar |  ↫ |  | \looparrowleft |  ↬ |  | \looparrowright |  ↭ |  | \leftrightsquigarrow |
|  ↮ |  | \nleftrightarrow |  ↰ |  | \Lsh |  ↱ |  | \Rsh |  ↳ | \reflectbox{\carriagereturn} | \Rdsh |
|  ↴ |  | \linefeed |  ↵ |  | \carriagereturn |  ↶ |  | \curvearrowleft |  ↷ |  | \curvearrowright |
|  ↸ |  | \barovernorthwestarrow |  ↹ |  | \barleftarrowrightarrowbar |  ↺ |  | \circlearrowleft |  ↾ |  | \upharpoonright |
|  ↿ |  | \upharpoonleft |  ⇁ |  | \rightharpoondown |  ⇂ |  | \downharpoonright |  ⇃ |  | \downharpoonleft |
|  ⇄ |  | \rightleftarrows |  ⇆ |  | \leftrightarrows |  ⇇ |  | \leftleftarrows |  ⇈ |  | \upuparrows |
|  ⇉ |  | \rightrightarrows |  ⇊ |  | \downdownarrows |  ⇋ |  | \leftrightharpoons |  ⇍ |  | \nLeftarrow |
|  ⇎ |  | \nLeftrightarrow |  ⇏ |  | \nRightarrow |  ⇖ |  | \Nwarrow |  ⇗ |  | \Nearrow |
|  ⇘ |  | \Searrow |  ⇙ |  | \Swarrow |  ⇚ |  | \Lleftarrow |  ⇛ |  | \Rrightarrow |
|  ⇜ |  | \leftsquigarrow |  ⇝ |  | \rightsquigarrow |  ⇞ |  | \nHuparrow |  ⇟ |  | \nHdownarrow |
|  ⇡ |  | \updasharrow |  ⇣ |  | \downdasharrow |  ⇦ |  | \leftwhitearrow |  ⇧ |  | \upwhitearrow |
|  ⇨ |  | \rightwhitearrow |  ⇩ |  | \downwhitearrow |  ⇪ |  | \whitearrowupfrombar |  ⇴ |  | \circleonrightarrow |
|  ⇶ |  | \rightthreearrows |  ⇷ |  | \nvleftarrow |  ⇹ |  | \nvleftrightarrow |  ⇺ |  | \nVleftarrow |
|  ⇼ |  | \nVleftrightarrow |  ⇽ |  | \leftarrowtriangle |  ⇾ |  | \rightarrowtriangle |  ⇿ |  | \leftrightarrowtriangle |
|  ∁ |  | \complement |  ∄ |  | \nexists |  ∅ |  | \varnothing |  ∆ |  | \increment |
|  ∇ |  | \nabla |  ∊ |  | \smallin |  ∍ |  | \smallni |  ∎ |  | \QED |
|  ∔ |  | \dotplus |  ∕ |  | \divslash |  √ |  | \sqrt |  ∟ |  | \rightangle |
|  ∡ |  | \measuredangle |  ∢ |  | \sphericalangle |  ∤ |  | \nmid |  ∦ |  | \nparallel |
|  ∲ |  | \lcirclerightint |  ∴ |  | \therefore |  ∵ |  | \because |  ∷ |  | \Colon |
|  ∹ |  | \eqcolon |  ∽ |  | \backsim |  ≊ |  | \approxeq |  ≎ |  | \Bumpeq |
|  ≏ |  | \bumpeq |  ≒ |  | \fallingdotseq |  ≓ |  | \risingdotseq |  ≔ |  | \coloneq |
|  ≖ |  | \eqcirc |  ≗ |  | \circeq |  ≘ |  | \arceq |  ≚ |  | \veeeq |
|  ≜ |  | \triangleq |  ≝ |  | \eqdef |  ≞ |  | \measeq |  ≟ |  | \questeq |
|  ≣ |  | \Equiv |  ≨ |  | \lneqq |  ≩ |  | \gneqq |  ≬ |  | \between |
|  ≭ |  | \nasymp |  ≴ |  | \nlesssim |  ≵ |  | \ngtrsim |  ≶ |  | \lessgtr |
|  ≷ |  | \gtrless |  ≼ |  | \preccurlyeq |  ≽ |  | \succcurlyeq |  ⊊ |  | \subsetneq |
|  ⊋ |  | \supsetneq |  ⊌ |  | \cupleftarrow |  ⊍ |  | \cupdot |  ⊏ |  | \sqsubset |
|  ⊐ |  | \sqsupset |  ⊚ |  | \circledcirc |  ⊛ |  | \circledast |  ⊜ |  | \circledequal |
|  ⊝ |  | \circleddash |  ⊞ |  | \boxplus |  ⊟ |  | \boxminus |  ⊠ |  | \boxtimes |
|  ⊡ |  | \boxdot |  ⊦ |  | \assert |  ⊩ |  | \Vdash |  ⊪ |  | \Vvdash |
|  ⊫ |  | \VDash |  ⊬ |  | \nvdash |  ⊭ |  | \nvDash |  ⊮ |  | \nVdash |
|  ⊯ |  | \nVDash |  ⊰ |  | \prurel |  ⊱ |  | \scurel |  ⊲ |  | \vartriangleleft |
|  ⊳ |  | \vartriangleright |  ⊴ |  | \trianglelefteq |  ⊵ |  | \trianglerighteq |  ⊸ |  | \multimap |
|  ⊺ |  | \intercal |  ⊻ |  | \veebar |  ⊼ |  | \barwedge |  ⊽ |  | \barvee |
|  ⊿ |  | \varlrtriangle |  ⋇ |  | \divideontimes |  ⋉ |  | \ltimes |  ⋊ |  | \rtimes |
|  ⋋ |  | \leftthreetimes |  ⋌ |  | \rightthreetimes |  ⋍ |  | \backsimeq |  ⋎ |  | \curlyvee |
|  ⋏ |  | \curlywedge |  ⋐ |  | \Subset |  ⋑ |  | \Supset |  ⋒ |  | \Cap |
|  ⋓ |  | \Cup |  ⋔ |  | \pitchfork |  ⋕ |  | \hash |  ⋖ |  | \lessdot |
|  ⋗ |  | \gtrdot |  ⋚ |  | \lesseqgtr |  ⋛ |  | \gtreqless |  ⋜ |  | \eqless |
|  ⋝ |  | \eqgtr |  ⋞ |  | \curlyeqprec |  ⋟ |  | \curlyeqsucc |  ⋠ |  | \npreceq |
|  ⋡ |  | \nsucceq |  ⋤ |  | \sqsubsetneq |  ⋥ |  | \sqsupsetneq |  ⋦ |  | \lnsim |
|  ⋧ |  | \gnsim |  ⋨ |  | \precedesnotsimilar |  ⋩ |  | \succnsim |  ⋬ |  | \ntrianglelefteq |
|  ⋭ |  | \ntrianglerighteq |  ⋲ |  | \disin |  ⋳ |  | \varisins |  ⋴ |  | \isins |
|  ⋵ |  | \isindot |  ⋷ |  | \isinobar |  ⋸ |  | \isinvb |  ⋹ |  | \isinE |
|  ⋺ |  | \nisd |  ⋻ |  | \varnis |  ⋼ |  | \nis |  ⋽ |  | \varniobar |
|  ⋾ |  | \niobar |  ⋿ |  | \bagmember |  ⌀ |  | \diameter |  ⌂ |  | \house |
|  ⌅ | \barwedge | \varbarwedge |  ⌐ |  | \invneg |  ⌒ |  | \profline |  ⌓ |  | \profsurf |
|  ⌗ |  | \viewdata |  ⌙ |  | \turnednot |  ⌜ |  | \ulcorner |  ⌝ |  | \urcorner |
|  ⌞ |  | \llcorner |  ⌟ |  | \lrcorner |  ⌠ |  | \inttop |  ⌡ |  | \intbottom |
|  ⌬ |  | \varhexagonlrbonds |  ⌲ |  | \conictaper |  ⌶ |  | \topbot |  ⌽ |  | \obar |
|  ⍓ |  | \APLboxupcaret |  ⍰ |  | \APLboxquestion |  ⍼ |  | \rangledownzigzagarrow |  ⎔ |  | \hexagon |
|  ⎛ |  | \lparenuend |  ⎜ |  | \lparenextender |  ⎝ |  | \lparenlend |  ⎞ |  | \rparenuend |
|  ⎟ |  | \rparenextender |  ⎠ |  | \rparenlend |  ⎡ |  | \lbrackuend |  ⎢ |  | \lbrackextender |
|  ⎣ |  | \lbracklend |  ⎤ |  | \rbrackuend |  ⎥ |  | \rbrackextender |  ⎦ |  | \rbracklend |
|  ⎧ |  | \lbraceuend |  ⎨ |  | \lbracemid |  ⎩ |  | \lbracelend |  ⎪ |  | \vbraceextender |
|  ⎫ |  | \rbraceuend |  ⎬ |  | \rbracemid |  ⎭ |  | \rbracelend |  ⎮ |  | \intextender |
|  ⎯ |  | \harrowextender |  ⎲ |  | \sumtop |  ⎳ |  | \sumbottom |  ⎴ |  | \overbracket |
|  ⎵ |  | \underbracket |  ⎶ |  | \bbrktbrk |  ⎷ |  | \sqrtbottom |  ⎸ |  | \lvboxline |
|  ⎹ |  | \rvboxline |  ⏎ |  | \varcarriagereturn |  ⏜ |  | \overparen |  ⏝ |  | \underparen |
|  ⏞ |  | \overbrace |  ⏟ |  | \underbrace |  ⏠ |  | \obrbrak |  ⏡ |  | \ubrbrak |
|  ⏢ |  | \trapezium |  ⏣ |  | \benzenr |  ⏤ |  | \strns |  ⏥ |  | \fltns |
|  ⏦ |  | \accurrent |  ⏧ |  | \elinters |  ␢ |  | \blanksymbol |  ␣ |  | \mathvisiblespace |
|  ┆ |  | \bdtriplevdash |  ▀ |  | \blockuphalf |  ▄ |  | \blocklowhalf |  █ |  | \blockfull |
|  ▌ |  | \blocklefthalf |  ▐ |  | \blockrighthalf |  ░ |  | \blockqtrshaded |  ▒ |  | \blockhalfshaded |
|  ▓ |  | \blockthreeqtrshaded |  ■ |  | \mdlgblksquare |  ▢ |  | \squoval |  ▣ |  | \blackinwhitesquare |
|  ▤ |  | \squarehfill |  ▥ |  | \squarevfill |  ▦ |  | \squarehvfill |  ▧ |  | \squarenwsefill |
|  ▨ |  | \squareneswfill |  ▩ |  | \squarecrossfill |  ▪ |  | \smblksquare |  ▫ |  | \smwhtsquare |
|  ▬ |  | \hrectangleblack |  ▭ |  | \hrectangle |  ▮ |  | \vrectangleblack |  ▯ |  | \vrectangle |
|  ▰ |  | \parallelogramblack |  ▱ |  | \parallelogram |  ▲ |  | \bigblacktriangleup |  △ |  | \bigtriangleup |
|  ▴ |  | \blacktriangle |  ▵ |  | \vartriangle |  ▸ |  | \smallblacktriangleright |  ▹ |  | \smalltriangleright |
|  ► |  | \blackpointerright |  ▻ |  | \whitepointerright |  ▼ |  | \bigblacktriangledown |  ▾ |  | \blacktriangledown |
|  ▿ |  | \triangledown |  ◂ |  | \smallblacktriangleleft |  ◃ |  | \smalltriangleleft |  ◄ |  | \blackpointerleft |
|  ◅ |  | \whitepointerleft |  ◈ |  | \blackinwhitediamond |  ◉ |  | \fisheye |  ◊ |  | \lozenge |
|  ◌ |  | \dottedcircle |  ◍ |  | \circlevertfill |  ◎ |  | \bullseye |  ◐ |  | \circlelefthalfblack |
|  ◑ |  | \circlerighthalfblack |  ◒ |  | \circlebottomhalfblack |  ◓ |  | \circletophalfblack |  ◔ |  | \circleurquadblack |
|  ◕ |  | \blackcircleulquadwhite |  ◖ |  | \blacklefthalfcircle |  ◗ |  | \blackrighthalfcircle |  ◘ |  | \inversebullet |
|  ◙ |  | \inversewhitecircle |  ◚ |  | \invwhiteupperhalfcircle |  ◛ |  | \invwhitelowerhalfcircle |  ◜ |  | \ularc |
|  ◝ |  | \urarc |  ◞ |  | \lrarc |  ◟ |  | \llarc |  ◠ |  | \topsemicircle |
|  ◡ |  | \botsemicircle |  ◢ |  | \lrblacktriangle |  ◣ |  | \llblacktriangle |  ◤ |  | \ulblacktriangle |
|  ◥ |  | \urblacktriangle |  ◦ |  | \smwhtcircle |  ◧ |  | \squareleftblack |  ◨ |  | \squarerightblack |
|  ◩ |  | \squareulblack |  ◪ |  | \squarelrblack |  ◫ |  | \boxbar |  ◬ |  | \trianglecdot |
|  ◭ |  | \triangleleftblack |  ◮ |  | \trianglerightblack |  ◰ |  | \squareulquad |  ◱ |  | \squarellquad |
|  ◲ |  | \squarelrquad |  ◳ |  | \squareurquad |  ◴ |  | \circleulquad |  ◵ |  | \circlellquad |
|  ◶ |  | \circlelrquad |  ◷ |  | \circleurquad |  ◸ |  | \ultriangle |  ◹ |  | \urtriangle |
|  ◺ |  | \lltriangle |  ◻ |  | \mdwhtsquare |  ◼ |  | \mdblksquare |  ◽ |  | \mdsmwhtsquare |
|  ◾ |  | \mdsmblksquare |  ◿ |  | \lrtriangle |  ★ |  | \bigstar |  ☆ |  | \bigwhitestar |
|  ☡ |  | \danger |  ☻ |  | \blacksmiley |  ☼ |  | \sun |  ☽ |  | \rightmoon |
|  ☾ |  | \leftmoon |  ♀ |  | \female |  ♂ |  | \male |  ♤ |  | \varspadesuit |
|  ♥ |  | \varheartsuit |  ♦ |  | \vardiamondsuit |  ♧ |  | \varclubsuit |  ♩ |  | \quarternote |
|  ♪ |  | \eighthnote |  ♫ |  | \twonotes |  ♬ |  | \sixteenthnote |  ♾ |  | \acidfree |
|  ⚀ |  | \dicei |  ⚁ |  | \diceii |  ⚂ |  | \diceiii |  ⚃ |  | \diceiv |
|  ⚄ |  | \dicev |  ⚅ |  | \dicevi |  ⚆ |  | \circledrightdot |  ⚇ |  | \circledtwodots |
|  ⚈ |  | \blackcircledrightdot |  ⚉ |  | \blackcircledtwodots |  ⚥ |  | \Hermaphrodite |  ⚬ |  | \mdsmwhtcircle |
|  ⚲ |  | \neuter |  ✓ |  | \checkmark |  ✠ |  | \maltese |  ✪ |  | \circledstar |
|  ✶ |  | \varstar |  ✽ |  | \dingasterisk |  ❲ |  | \lbrbrak |  ❳ |  | \rbrbrak |
|  ➛ |  | \draftingarrow |  ⟀ |  | \threedangle |  ⟁ |  | \whiteinwhitetriangle |  ⟃ |  | \subsetcirc |
|  ⟄ |  | \supsetcirc |  ⟇ |  | \veedot |  ⟈ |  | \bsolhsub |  ⟉ |  | \suphsol |
|  ⟋ |  | \diagup |  ⟌ |  | \longdivision |  ⟍ |  | \diagdown |  ⟑ |  | \wedgedot |
|  ⟒ |  | \upin |  ⟓ |  | \pullback |  ⟔ |  | \pushout |  ⟕ |  | \leftouterjoin |
|  ⟖ |  | \rightouterjoin |  ⟗ |  | \fullouterjoin |  ⟘ |  | \bigbot |  ⟙ |  | \bigtop |
|  ⟚ |  | \DashVDash |  ⟛ |  | \dashVdash |  ⟜ |  | \multimapinv |  ⟝ |  | \vlongdash |
|  ⟞ |  | \longdashv |  ⟟ |  | \cirbot |  ⟠ |  | \lozengeminus |  ⟡ |  | \concavediamond |
|  ⟢ |  | \concavediamondtickleft |  ⟣ |  | \concavediamondtickright |  ⟤ |  | \whitesquaretickleft |  ⟥ |  | \whitesquaretickright |
|  ⟫ |  | \rang |  ⟬ |  | \Lbrbrak |  ⟭ |  | \Rbrbrak |  ⟰ |  | \UUparrow |
|  ⟱ |  | \DDownarrow |  ⟲ |  | \acwgapcirclearrow |  ⟳ |  | \cwgapcirclearrow |  ⟴ |  | \rightarrowonoplus |
|  ⟻ |  | \longmapsfrom |  ⟽ |  | \Longmapsfrom |  ⟾ |  | \Longmapsto |  ⟿ |  | \longrightsquigarrow |
|  ⤁ |  | \nVtwoheadrightarrow |  ⤂ |  | \nvLeftarrow |  ⤃ |  | \nvRightarrow |  ⤄ |  | \nvLeftrightarrow |
|  ⤅ |  | \twoheadmapsto |  ⤆ |  | \Mapsfrom |  ⤇ |  | \Mapsto |  ⤈ |  | \downarrowbarred |
|  ⤉ |  | \uparrowbarred |  ⤊ |  | \Uuparrow |  ⤋ |  | \Ddownarrow |  ⤌ |  | \leftbkarrow |
|  ⤍ |  | \rightbkarrow |  ⤎ |  | \leftdbkarrow |  ⤏ |  | \dbkarrow |  ⤐ |  | \drbkarrow |
|  ⤑ |  | \rightdotarrow |  ⤗ |  | \nvtwoheadrightarrowtail |  ⤘ |  | \nVtwoheadrightarrowtail |  ⤙ |  | \lefttail |
|  ⤚ |  | \righttail |  ⤛ |  | \leftdbltail |  ⤜ |  | \rightdbltail |  ⤝ |  | \diamondleftarrow |
|  ⤞ |  | \rightarrowdiamond |  ⤟ |  | \diamondleftarrowbar |  ⤠ |  | \barrightarrowdiamond |  ⤡ |  | \nwsearrow |
|  ⤢ |  | \neswarrow |  ⤣ |  | \hknwarrow |  ⤤ |  | \hknearrow |  ⤥ |  | \hksearrow |
|  ⤦ |  | \hkswarrow |  ⤧ |  | \tona |  ⤨ |  | \toea |  ⤩ |  | \tosa |
|  ⤪ |  | \towa |  ⤫ |  | \rdiagovfdiag |  ⤬ |  | \fdiagovrdiag |  ⤭ |  | \seovnearrow |
|  ⤮ |  | \neovsearrow |  ⤯ |  | \fdiagovnearrow |  ⤰ |  | \rdiagovsearrow |  ⤱ |  | \neovnwarrow |
|  ⤲ |  | \nwovnearrow |  ⤳ |  | \rightcurvedarrow |  ⤴ |  | \uprightcurvearrow |  ⤵ |  | \downrightcurvedarrow |
|  ⤶ |  | \leftdowncurvedarrow |  ⤷ |  | \rightdowncurvedarrow |  ⤸ |  | \cwrightarcarrow |  ⤹ |  | \acwleftarcarrow |
|  ⤺ |  | \acwoverarcarrow |  ⤻ |  | \acwunderarcarrow |  ⤼ |  | \curvearrowrightminus |  ⤽ |  | \curvearrowleftplus |
|  ⤾ |  | \cwundercurvearrow |  ⤿ |  | \ccwundercurvearrow |  ⥂ |  | \rightarrowshortleftarrow |  ⥃ |  | \leftarrowshortrightarrow |
|  ⥄ |  | \shortrightarrowleftarrow |  ⥅ |  | \rightarrowplus |  ⥆ |  | \leftarrowplus |  ⥇ |  | \rightarrowx |
|  ⥈ |  | \leftrightarrowcircle |  ⥉ |  | \twoheaduparrowcircle |  ⥌ |  | \updownharpoonrightleft |  ⥍ |  | \updownharpoonleftright |
|  ⥎ |  | \leftrightharpoonupup |  ⥐ |  | \DownLeftRightVector |  ⥦ |  | \leftrightharpoonsup |  ⥧ |  | \leftrightharpoonsdown |
|  ⥨ |  | \rightleftharpoonsup |  ⥩ |  | \rightleftharpoonsdown |  ⥱ |  | \equalrightarrow |  ⥲ |  | \similarrightarrow |
|  ⥳ |  | \leftarrowsimilar |  ⥴ |  | \rightarrowsimilar |  ⥵ |  | \rightarrowapprox |  ⥶ |  | \ltlarr |
|  ⥷ |  | \leftarrowless |  ⥸ |  | \gtrarr |  ⥹ |  | \subrarr |  ⥺ |  | \leftarrowsubset |
|  ⥻ |  | \suplarr |  ⥼ |  | \leftfishtail |  ⥽ |  | \rightfishtail |  ⥾ |  | \upfishtail |
|  ⥿ |  | \downfishtail |  ⦀ |  | \Vvert |  ⦁ |  | \spot |  ⦂ |  | \typecolon |
|  ⦃ |  | \lBrace |  ⦄ |  | \rBrace |  ⦅ |  | \lParen |  ⦆ |  | \Elroang |
|  ⦇ |  | \limg |  ⦋ |  | \lbrackubar |  ⦌ |  | \rbrackubar |  ⦍ |  | \lbrackultick |
|  ⦎ |  | \rbracklrtick |  ⦏ |  | \lbracklltick |  ⦐ |  | \rbrackurtick |  ⦑ |  | \langledot |
|  ⦒ |  | \rangledot |  ⦓ |  | \lparenless |  ⦔ |  | \rparengtr |  ⦕ |  | \Lparengtr |
|  ⦖ |  | \Rparenless |  ⦗ |  | \lblkbrbrak |  ⦘ |  | \rblkbrbrak |  ⦙ |  | \fourvdots |
|  ⦚ |  | \vzigzag |  ⦛ |  | \measuredangleleft |  ⦝ |  | \rightanglemdot |  ⦞ |  | \angles |
|  ⦟ |  | \angdnr |  ⦠ |  | \gtlpar |  ⦡ |  | \sphericalangleup |  ⦢ |  | \turnangle |
|  ⦣ |  | \revangle |  ⦤ |  | \angleubar |  ⦥ |  | \revangleubar |  ⦦ |  | \wideangledown |
|  ⦧ |  | \wideangleup |  ⦨ |  | \measanglerutone |  ⦩ |  | \measanglelutonw |  ⦪ |  | \measanglerdtose |
|  ⦫ |  | \measangleldtosw |  ⦬ |  | \measangleurtone |  ⦭ |  | \measangleultonw |  ⦮ |  | \measangledrtose |
|  ⦯ |  | \measangledltosw |  ⦰ |  | \revemptyset |  ⦱ |  | \emptysetobar |  ⦲ |  | \emptysetocirc |
|  ⦳ |  | \emptysetoarr |  ⦴ |  | \emptysetoarrl |  ⦵ |  | \circlehbar |  ⦶ |  | \circledvert |
|  ⦷ |  | \circledparallel |  ⦸ |  | \circledbslash |  ⦹ |  | \operp |  ⦺ |  | \obot |
|  ⦻ |  | \olcross |  ⦼ |  | \odotslashdot |  ⦽ |  | \uparrowoncircle |  ⦾ |  | \circledwhitebullet |
|  ⦿ |  | \circledbullet |  ⧀ |  | \circledless |  ⧁ |  | \circledgtr |  ⧂ |  | \cirscir |
|  ⧃ |  | \cirE |  ⧅ |  | \boxbslash |  ⧆ |  | \boxast |  ⧇ |  | \boxcircle |
|  ⧈ |  | \boxbox |  ⧉ |  | \boxonbox |  ⧊ |  | \triangleodot |  ⧋ |  | \triangleubar |
|  ⧌ |  | \triangles |  ⧍ |  | \triangleserifs |  ⧎ |  | \rtriltri |  ⧑ |  | \lfbowtie |
|  ⧒ |  | \rfbowtie |  ⧓ |  | \fbowtie |  ⧔ |  | \lftimes |  ⧕ |  | \rftimes |
|  ⧖ |  | \hourglass |  ⧗ |  | \blackhourglass |  ⧘ |  | \lvzigzag |  ⧙ |  | \rvzigzag |
|  ⧚ |  | \Lvzigzag |  ⧛ |  | \Rvzigzag |  ⧜ |  | \iinfin |  ⧝ |  | \tieinfty |
|  ⧞ |  | \nvinfty |  ⧠ |  | \laplac |  ⧡ |  | \lrtriangleeq |  ⧢ |  | \shuffle |
|  ⧣ |  | \eparsl |  ⧤ |  | \smeparsl |  ⧥ |  | \eqvparsl |  ⧦ |  | \gleichstark |
|  ⧧ |  | \thermod |  ⧨ |  | \downtriangleleftblack |  ⧩ |  | \downtrianglerightblack |  ⧪ |  | \blackdiamonddownarrow |
|  ⧫ |  | \blacklozenge |  ⧬ |  | \circledownarrow |  ⧭ |  | \blackcircledownarrow |  ⧮ |  | \errbarsquare |
|  ⧯ |  | \errbarblacksquare |  ⧰ |  | \errbardiamond |  ⧱ |  | \errbarblackdiamond |  ⧲ |  | \errbarcircle |
|  ⧳ |  | \errbarblackcircle |  ⧴ |  | \RuleDelayed |  ⧶ |  | \dsol |  ⧷ |  | \rsolbar |
|  ⧸ |  | \xsol |  ⧺ |  | \doubleplus |  ⧻ |  | \tripleplus |  ⧼ |  | \lcurvyangle |
|  ⧽ |  | \rcurvyangle |  ⧾ |  | \tplus |  ⧿ |  | \tminus |  ⨃ |  | \bigcupdot |
|  ⨄ |  | \Elxuplus |  ⨅ |  | \bigsqcap |  ⨇ |  | \conjquant |  ⨈ |  | \disjquant |
|  ⨊ |  | \modtwosum |  ⨋ |  | \sumint |  ⨌ |  | \iiiint |  ⨍ |  | \intbar |
|  ⨎ |  | \intBar |  ⨐ |  | \cirfnint |  ⨑ |  | \awint |  ⨒ |  | \rppolint |
|  ⨓ |  | \scpolint |  ⨔ |  | \npolint |  ⨕ |  | \pointint |  ⨗ |  | \intlarhk |
|  ⨘ |  | \intx |  ⨙ |  | \intcap |  ⨚ |  | \intcup |  ⨛ |  | \upint |
|  ⨜ |  | \lowint |  ⨝ |  | \Join |  ⨞ |  | \bigtriangleleft |  ⨟ |  | \zcmp |
|  ⨠ |  | \zpipe |  ⨡ |  | \zproject |  ⨢ |  | \ringplus |  ⨣ |  | \plushat |
|  ⨤ |  | \simplus |  ⨥ |  | \plusdot |  ⨦ |  | \plussim |  ⨧ |  | \plussubtwo |
|  ⨨ |  | \plustrif |  ⨩ |  | \commaminus |  ⨪ |  | \minusdot |  ⨫ |  | \minusfdots |
|  ⨬ |  | \minusrdots |  ⨭ |  | \opluslhrim |  ⨮ |  | \oplusrhrim |  ⨯ |  | \vectimes |
|  ⨰ |  | \dottimes |  ⨱ |  | \timesbar |  ⨲ |  | \btimes |  ⨳ |  | \smashtimes |
|  ⨴ |  | \otimeslhrim |  ⨵ |  | \otimesrhrim |  ⨶ |  | \otimeshat |  ⨷ |  | \Otimes |
|  ⨸ |  | \odiv |  ⨹ |  | \triangleplus |  ⨺ |  | \triangleminus |  ⨻ |  | \triangletimes |
|  ⨼ |  | \intprod |  ⨽ |  | \intprodr |  ⨾ |  | \fcmp |  ⩀ |  | \capdot |
|  ⩁ |  | \uminus |  ⩂ |  | \barcup |  ⩃ |  | \barcap |  ⩄ |  | \capwedge |
|  ⩅ |  | \cupvee |  ⩆ |  | \cupovercap |  ⩇ |  | \capovercup |  ⩈ |  | \cupbarcap |
|  ⩉ |  | \capbarcup |  ⩊ |  | \twocups |  ⩋ |  | \twocaps |  ⩌ |  | \closedvarcup |
|  ⩍ |  | \closedvarcap |  ⩎ |  | \Sqcap |  ⩏ |  | \Sqcup |  ⩐ |  | \closedvarcupsmashprod |
|  ⩑ |  | \wedgeodot |  ⩒ |  | \veeodot |  ⩓ |  | \Wedge |  ⩔ |  | \Vee |
|  ⩕ |  | \wedgeonwedge |  ⩗ |  | \bigslopedvee |  ⩘ |  | \bigslopedwedge |  ⩙ |  | \veeonwedge |
|  ⩚ |  | \wedgemidvert |  ⩛ |  | \veemidvert |  ⩜ |  | \midbarwedge |  ⩝ |  | \midbarvee |
|  ⩟ |  | \wedgebar |  ⩠ |  | \wedgedoublebar |  ⩡ |  | \varveebar |  ⩢ |  | \doublebarvee |
|  ⩣ |  | \veedoublebar |  ⩤ |  | \dsub |  ⩥ |  | \rsub |  ⩦ |  | \eqdot |
|  ⩧ |  | \dotequiv |  ⩨ |  | \equivVert |  ⩩ |  | \equivVvert |  ⩪ |  | \dotsim |
|  ⩫ |  | \simrdots |  ⩬ |  | \simminussim |  ⩭ |  | \congdot |  ⩯ |  | \hatapprox |
|  ⩰ |  | \approxeqq |  ⩱ |  | \eqqplus |  ⩲ |  | \pluseqq |  ⩳ |  | \eqqsim |
|  ⩴ |  | \Coloneqq |  ⩷ |  | \ddotseq |  ⩸ |  | \equivDD |  ⩹ |  | \ltcir |
|  ⩺ |  | \gtcir |  ⩻ |  | \ltquest |  ⩼ |  | \gtquest |  ⩽ |  | \leqslant |
|  ⩾ |  | \geqslant |  ⩿ |  | \lesdot |  ⪀ |  | \gesdot |  ⪁ |  | \lesdoto |
|  ⪂ |  | \gesdoto |  ⪃ |  | \lesdotor |  ⪄ |  | \gesdotol |  ⪅ |  | \lessapprox |
|  ⪆ |  | \gtrapprox |  ⪇ |  | \lneq |  ⪈ |  | \gneq |  ⪉ |  | \lnapprox |
|  ⪊ |  | \gnapprox |  ⪋ |  | \lesseqqgtr |  ⪌ |  | \gtreqqless |  ⪍ |  | \lsime |
|  ⪎ |  | \gsime |  ⪏ |  | \lsimg |  ⪐ |  | \gsiml |  ⪑ |  | \lgE |
|  ⪒ |  | \glE |  ⪓ |  | \lesges |  ⪔ |  | \gesles |  ⪕ |  | \eqslantless |
|  ⪖ |  | \eqslantgtr |  ⪗ |  | \elsdot |  ⪘ |  | \egsdot |  ⪙ |  | \eqqless |
|  ⪚ |  | \eqqgtr |  ⪛ |  | \eqqslantless |  ⪜ |  | \eqqslantgtr |  ⪝ |  | \simless |
|  ⪞ |  | \simgtr |  ⪟ |  | \simlE |  ⪠ |  | \simgE |  ⪣ |  | \partialmeetcontraction |
|  ⪤ |  | \glj |  ⪥ |  | \gla |  ⪨ |  | \lescc |  ⪩ |  | \gescc |
|  ⪪ |  | \smt |  ⪫ |  | \lat |  ⪬ |  | \smte |  ⪭ |  | \late |
|  ⪮ |  | \bumpeqq |  ⪱ |  | \precneq |  ⪲ |  | \succneq |  ⪳ |  | \preceqq |
|  ⪴ |  | \succeqq |  ⪵ |  | \precneqq |  ⪶ |  | \succneqq |  ⪷ |  | \precapprox |
|  ⪸ |  | \succapprox |  ⪹ |  | \precnapprox |  ⪺ |  | \succnapprox |  ⪽ |  | \subsetdot |
|  ⪾ |  | \supsetdot |  ⪿ |  | \subsetplus |  ⫀ |  | \supsetplus |  ⫁ |  | \submult |
|  ⫂ |  | \supmult |  ⫃ |  | \subedot |  ⫄ |  | \supedot |  ⫅ |  | \subseteqq |
|  ⫆ |  | \supseteqq |  ⫇ |  | \subsim |  ⫈ |  | \supsim |  ⫉ |  | \subsetapprox |
|  ⫊ |  | \supsetapprox |  ⫋ |  | \subsetneqq |  ⫌ |  | \supsetneqq |  ⫍ |  | \lsqhook |
|  ⫎ |  | \rsqhook |  ⫏ |  | \csub |  ⫐ |  | \csup |  ⫑ |  | \csube |
|  ⫒ |  | \csupe |  ⫓ |  | \subsup |  ⫔ |  | \supsub |  ⫕ |  | \subsub |
|  ⫖ |  | \supsup |  ⫗ |  | \suphsub |  ⫘ |  | \supdsub |  ⫙ |  | \forkv |
|  ⫚ |  | \topfork |  ⫛ |  | \mlcp |  ⫝̸ |  | \forks |  ⫝ |  | \forksnot |
|  ⫞ |  | \shortlefttack |  ⫟ |  | \shortdowntack |  ⫠ |  | \shortuptack |  ⫡ |  | \perps |
|  ⫢ |  | \vDdash |  ⫣ |  | \dashV |  ⫤ |  | \Dashv |  ⫥ |  | \DashV |
|  ⫦ |  | \varVdash |  ⫧ |  | \Barv |  ⫨ |  | \vBar |  ⫩ |  | \vBarv |
|  ⫫ |  | \Vbar |  ⫬ |  | \Not |  ⫭ |  | \bNot |  ⫮ |  | \revnmid |
|  ⫯ |  | \cirmid |  ⫰ |  | \midcir |  ⫱ |  | \topcir |  ⫲ |  | \nhpar |
|  ⫳ |  | \parsim |  ⫴ |  | \interleave |  ⫵ |  | \nhVvert |  ⫶ |  | \threedotcolon |
|  ⫷ |  | \lllnest |  ⫸ |  | \gggnest |  ⫹ |  | \leqqslant |  ⫺ |  | \geqqslant |
|  ⫻ |  | \trslash |  ⫼ |  | \biginterleave |  ⫾ |  | \talloblong |  ⫿ |  | \bigtalloblong |
|  ⬒ |  | \squaretopblack |  ⬓ |  | \squarebotblack |  ⬔ |  | \squareurblack |  ⬕ |  | \squarellblack |
|  ⬖ |  | \diamondleftblack |  ⬗ |  | \diamondrightblack |  ⬘ |  | \diamondtopblack |  ⬙ |  | \diamondbotblack |
|  ⬚ |  | \dottedsquare |  ⬛ |  | \lgblksquare |  ⬜ |  | \lgwhtsquare |  ⬝ |  | \vysmblksquare |
|  ⬞ |  | \vysmwhtsquare |  ⬟ |  | \pentagonblack |  ⬠ |  | \pentagon |  ⬡ |  | \varhexagon |
|  ⬢ |  | \varhexagonblack |  ⬣ |  | \hexagonblack |  ⬤ |  | \lgblkcircle |  ⬥ |  | \mdblkdiamond |
|  ⬦ |  | \mdwhtdiamond |  ⬧ |  | \mdblklozenge |  ⬨ |  | \mdwhtlozenge |  ⬩ |  | \smblkdiamond |
|  ⬪ |  | \smblklozenge |  ⬫ |  | \smwhtlozenge |  ⬬ |  | \blkhorzoval |  ⬭ |  | \whthorzoval |
|  ⬮ |  | \blkvertoval |  ⬯ |  | \whtvertoval |  ⬰ |  | \circleonleftarrow |  ⬱ |  | \leftthreearrows |
|  ⬲ |  | \leftarrowonoplus |  ⬳ |  | \longleftsquigarrow |  ⬴ |  | \nvtwoheadleftarrow |  ⬵ |  | \nVtwoheadleftarrow |
|  ⬶ |  | \twoheadmapsfrom |  ⬷ |  | \twoheadleftdbkarrow |  ⬸ |  | \leftdotarrow |  ⬹ |  | \nvleftarrowtail |
|  ⬺ |  | \nVleftarrowtail |  ⬻ |  | \twoheadleftarrowtail |  ⬼ |  | \nvtwoheadleftarrowtail |  ⬽ |  | \nVtwoheadleftarrowtail |
|  ⬾ |  | \leftarrowx |  ⬿ |  | \leftcurvedarrow |  ⭀ |  | \equalleftarrow |  ⭁ |  | \bsimilarleftarrow |
|  ⭂ |  | \leftarrowbackapprox |  ⭃ |  | \rightarrowgtr |  ⭄ |  | \rightarrowsupset |  ⭅ |  | \LLeftarrow |
|  ⭆ |  | \RRightarrow |  ⭇ |  | \bsimilarrightarrow |  ⭈ |  | \rightarrowbackapprox |  ⭉ |  | \similarleftarrow |
|  ⭊ |  | \leftarrowapprox |  ⭋ |  | \leftarrowbsimilar |  ⭌ |  | \rightarrowbsimilar |  ⭐ |  | \medwhitestar |
|  ⭑ |  | \medblackstar |  ⭒ |  | \smwhitestar |  ⭓ |  | \rightpentagonblack |  ⭔ |  | \rightpentagon |
|  〒 |  | \postalmark |  〰 |  | \hzigzag |  | |  |  | |  |


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
|  ≂ |  | \texteqsim |  | |  |  | |  |  | |  |


### textcomp

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ¢ | \textcent |  |  £ | \textsterling |  |  ¤ | \textcurrency |  |  ¥ | \textyen |  |
|  ¦ | \textbrokenbar |  |  § | \textsection |  |  © | \textcopyright |  |  ª | \textordfeminine |  |
|  ® | \textregistered |  |  ° | \textdegree |  |  ¶ | \textparagraph |  |  º | \textordmasculine |  |
|  ð | \textdh |  |  ˙ | \textperiodcentered |  |  • | \textbullet |  |  ‰ | \textperthousand |  |
|  ‱ | \textpertenthousand |  |  ℞ | \textrecipe |  |  ™ | \texttrademark |  |  → | \textrightarrow |  |


### tipa

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ħ | \textcrh |  |  ĸ | ?? |  |  ƕ | \texthvlig |  |  ƞ | \textipa{\textnrleg} |  |
|  ɐ | \textipa{\textturna} |  |  ɒ | textipa{\textopeno} |  |  ɔ | \textipa{O} |  |  ɖ | \textrtaild |  |
|  ə | \textschwa |  |  ɤ | \textrevscripta |  |  ɸ | \textphi |  |  ʞ | \textturnk |  |
|  ˥ | \tone{55} |  |  ˦ | \tone{44} |  |  ˧ | \tone{33} |  |  ˨ | \tone{22} |  |
|  ˩ | \tone{11} |  |  ̀̄ | \textgravemacron |  |  ̀̇ | \textgravedot |  |  ́̄ | \textacutemacron |  |
|  ́̌ | \textacutewedge |  |  ̂̇ | \textcircumdot |  |  ̃̇ | \texttildedot |  |  ̄̀ | \textgravemacron |  |
|  ̆̄ | \textbrevemacron |  |  ̇́ | \textdotacute |  |  ̇̆ | \textdotbreve |  |  ̊̄ | \textringmacron |  |
|  ̍ | \textvbaraccent |  |  ̎ | \textdoublevbaraccent |  |  ̐ | \textdotbreve |  |  ̘ | \textadvancing |  |
|  ̙ | \textretracting |  |  ̚ | \textcorner |  |  ̜ | \textsublhalfring |  |  ̝ | \textraising |  |
|  ̞ | \textlowering |  |  ̟ | \textsubplus |  |  ̤ | \textsubumlaut |  |  ̥ | \textsubring |  |
|  ̩ | \textsyllabic |  |  ̪ | \textsubbridge |  |  ̬ | \textsubwedge |  |  ̯ | \textsubarch |  |
|  ̰ | \textsubtilde |  |  ̱ | \textsubbar |  |  ̴ | \textsuperimposetilde |  |  ̹ | \textsubrhalfring |  |
|  ̺ | \textinvsubbridge |  |  ̻ | \textsubsquare |  |  ̼ | \textseagull |  |  ̽ | \textovercross |  |
|  ₔ | \textsubscript{\textschwa} |  |  | |  |  | |  |  | |  |


### ipa

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ɯ | \textturnm |  |  | |  |  | |  |  | |  |


### mathscinet

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ʿ | \lasp |  |  | |  |  | |  |  | |  |


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


### wasysym

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  ☽ | \rightmoon |  |  ☾ | \leftmoon |  |  | |  |  | |  |

