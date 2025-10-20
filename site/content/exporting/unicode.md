---
title: Unicode
weight: 8
---
## LaTeX en unicode

If you're lucky and you live in the 21st century or later, you can just use unicode in BibLaTeX and you don't have to bother about anything that follows except if you're the curious kind.

Some of us though are bound to outlets that still demand BibTeX, and there's geezers like me who just prefer the aesthetic of TeX commands over fancy-schmancy unicode, or you find TeX commands easier to search for in your doc than having to memorize how to enter `Ψ`. BBT has an extensive map of unicode characters, but translating unicode to TeX comes with a massive downside -- support for non-ascii characters is scattered across a myriad of packages that you will have to `usepackage` into your document. The default set are supported by your latex distribution, and require nothing extra in your preamble, but to achieve that I've had to make some compromises. You can amend those choices by telling BBT you have extra packages available. BBT can export commands from the following packages:

<!-- generated tables below -->


### 

| **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** | **character** | **text** | **math** |
|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|---------------|----------|----------|
|  # | \# | \# |  $ | \$ | \$ |  % | \% | \% |  & | \& | \& |
|  _ | \_ | \_ |    | ~ | ~ |  £ | \pounds | \pounds |  § | \S | \S |
|  © | \copyright | \copyright |  ­ | \- | \- |  ¶ | \P | \P |  † | \dag | \dag |
|  ‡ | \ddag | \ddag |  … | \dots | \dots |    | \: | \: |  − | - | - |
|  ☿ | \mercury | \mercury |  ♃ | \jupiter | \jupiter |  ♄ | \saturn | \saturn |  ♅ | \uranus | \uranus |
|  ♆ | \neptune | \neptune |  ♇ | \pluto | \pluto |  ♈ | \aries | \aries |  ♉ | \taurus | \taurus |
|  ♊ | \gemini | \gemini |  ♋ | \cancer | \cancer |  ♌ | \leo | \leo |  ♍ | \virgo | \virgo |
|  ♎ | \libra | \libra |  ♏ | \scorpio | \scorpio |  ♐ | \sagittarius | \sagittarius |  ♑ | \capricornus | \capricornus |
|  ♒ | \aquarius | \aquarius |  < |  | < |  > |  | > |  \ | \textbackslash | \backslash |
|  | | \textbar | \vert |  ¬ | \textlnot | \lnot |  ° |  | ^\circ |  ± | \textpm | \pm |
|  ² |  | ^{2} |  ³ |  | ^{3} |  · |  | \cdot |  ¹ |  | ^{1} |
|  ¼ |  | \frac{1}{4} |  ½ |  | \frac{1}{2} |  ¾ |  | \frac{3}{4} |  × | \texttimes | \times |
|  ÷ | \textdiv | \div |  ħ |  | \hbar |  ı | \i | \imath |  ƒ | \textflorin | f |
|  ȷ |  | \jmath |  ɛ |  | \varepsilon |  ɣ |  | \gamma |  ʰ | \textsuperscript{h} | ^{h} |
|  ʲ | \textsuperscript{j} | ^{j} |  ʳ | \textsuperscript{r} | ^{r} |  ʷ | \textsuperscript{w} | ^{w} |  ʸ | \textsuperscript{y} | ^{y} |
|  ˡ | \textsuperscript{l} | ^{l} |  ˢ | \textsuperscript{s} | ^{s} |  ˣ | \textsuperscript{x} | ^{x} |  ̅ |  | \overline |
|  ̊ | \r | \mathring |  ̱ |  | \underbar |  ̲ |  | \underline |  ̸ |  | \not |
|  Ύ |  | \mathrm{'Y} |  Ώ |  | \mathrm{'\Omega} |  ΐ |  | \acute{\ddot{\iota}} |  Γ |  | \Gamma |
|  Δ |  | \Delta |  Θ |  | \Theta |  Λ |  | \Lambda |  Ξ |  | \Xi |
|  Π |  | \Pi |  Σ |  | \Sigma |  Υ |  | \Upsilon |  Φ |  | \Phi |
|  Ψ |  | \Psi |  Ω | \textohm | \Omega |  Ϊ |  | \mathrm{\ddot{I}} |  Ϋ |  | \mathrm{\ddot{Y}} |
|  ά |  | \acute{\alpha} |  έ |  | \acute{\epsilon} |  ή |  | \acute{\eta} |  ί |  | \acute{\iota} |
|  ΰ |  | \acute{\ddot{\upsilon}} |  α |  | \alpha |  β |  | \beta |  γ |  | \gamma |
|  δ |  | \delta |  ε |  | \varepsilon |  ζ |  | \zeta |  η |  | \eta |
|  θ | \texttheta | \theta |  ι |  | \iota |  κ |  | \kappa |  λ |  | \lambda |
|  μ |  | \mu |  ν |  | \nu |  ξ |  | \xi |  π |  | \pi |
|  𝜌 |  | \rho |  ρ |  | \rho |  ς |  | \varsigma |  σ |  | \sigma |
|  τ |  | \tau |  υ |  | \upsilon |  φ |  | \varphi |  χ |  | \chi |
|  ψ |  | \psi |  ω |  | \omega |  ϊ |  | \ddot{\iota} |  ϋ |  | \ddot{\upsilon} |
|  ύ |  | \acute{\upsilon} |  ώ |  | \acute{\omega} |  ϑ | \textvartheta | \vartheta |  ϒ |  | \Upsilon |
|  ϕ |  | \phi |  ϖ |  | \varpi |  Ϙ |  | \Qoppa |  ϙ |  | \qoppa |
|  Ϛ |  | \Stigma |  ϛ |  | \stigma |  Ϝ |  | \Digamma |  ϝ |  | \digamma |
|  Ϟ |  | \Koppa |  ϟ |  | \koppa |  Ϡ |  | \Sampi |  ϡ |  | \sampi |
|  ϱ |  | \varrho |  ϴ | \textTheta | \upvarTheta |  ϵ |  | \epsilon |  ϶ |  | \backepsilon |
|  ࡱ |  | \\backslash |  ᵃ | \textsuperscript{a} | ^{a} |  ᴬ | \textsuperscript{A} | ^{A} |  ᵇ | \textsuperscript{b} | ^{b} |
|  ᵈ | \textsuperscript{d} | ^{d} |  ᵉ | \textsuperscript{e} | ^{e} |  ᵍ | \textsuperscript{g} | ^{g} |  ᵏ | \textsuperscript{k} | ^{k} |
|  ᵐ | \textsuperscript{m} | ^{m} |  ᵒ | \textsuperscript{o} | ^{o} |  ᵖ | \textsuperscript{p} | ^{p} |  ᵗ | \textsuperscript{t} | ^{t} |
|  ᵘ | \textsuperscript{u} | ^{u} |  ᵛ | \textsuperscript{v} | ^{v} |  ᶜ | \textsuperscript{c} | ^{c} |  ᶠ | \textsuperscript{f} | ^{f} |
|  ᶻ | \textsuperscript{z} | ^{z} |    |  | \quad |    |  | \mkern1mu |  • |  | \bullet |
|  ′ |  | \prime |  ″ |  | {''} |  ‴ |  | {'''} |  ⁗ |  | '''' |
|  ⁰ |  | ^{0} |  ⁱ | \textsuperscript{i} | ^{i} |  ⁴ |  | ^{4} |  ⁵ |  | ^{5} |
|  ⁶ |  | ^{6} |  ⁷ |  | ^{7} |  ⁸ |  | ^{8} |  ⁹ |  | ^{9} |
|  ⁺ |  | ^{+} |  ⁻ |  | ^{-} |  ⁼ |  | ^{=} |  ⁽ |  | ^{(} |
|  ⁾ |  | ^{)} |  ⁿ |  | ^{n} |  ₀ |  | _{0} |  ₁ |  | _{1} |
|  ₂ |  | _{2} |  ₃ |  | _{3} |  ₄ |  | _{4} |  ₅ |  | _{5} |
|  ₆ |  | _{6} |  ₇ |  | _{7} |  ₈ |  | _{8} |  ₉ |  | _{9} |
|  ₊ |  | _{+} |  ₋ |  | _{-} |  ₌ |  | _{=} |  ₍ |  | _{(} |
|  ₎ |  | _{)} |  ₐ | \textsubscript{a} | _{a} |  ₑ | \textsubscript{e} | _{e} |  ₒ | \textsubscript{o} | _{o} |
|  ₓ | \textsubscript{x} | _{x} |  ₕ | \textsubscript{h} | _{h} |  ₖ | \textsubscript{k} | _{k} |  ₗ | \textsubscript{l} | _{l} |
|  ₘ | \textsubscript{m} | _{m} |  ₙ | \textsubscript{n} | _{n} |  ₚ | \textsubscript{p} | _{p} |  ₛ | \textsubscript{s} | _{s} |
|  ₜ | \textsubscript{t} | _{t} |  ⃐ |  | \lvec |  ⃖ |  | \LVec |  ℂ |  | \mathbb{C} |
|  ℇ |  | \Euler |  ℋ |  | \mathcal{H} |  ℌ |  | \mathfrak{H} |  ℍ |  | \mathbb{H} |
|  ℑ |  | \mathfrak{I} |  ℓ |  | \ell |  ℕ |  | \mathbb{N} |  ℘ |  | \wp |
|  ℙ |  | \mathbb{P} |  ℚ |  | \mathbb{Q} |  ℜ |  | \mathfrak{R} |  ℝ |  | \mathbb{R} |
|  ℤ |  | \mathbb{Z} |  ℨ |  | \mathfrak{Z} |  Å | \AA | \Angstroem |  ℭ |  | \mathfrak{C} |
|  ℵ |  | \aleph |  ℼ |  | \mathbb{\pi} |  ℽ |  | \mathbb{\gamma} |  ℾ |  | \mathbb{\Gamma} |
|  ℿ |  | \mathbb{\Pi} |  ⅀ |  | \mathbb{\Sigma} |  ⅆ |  | \DifferentialD |  ⅇ |  | \ExponetialE |
|  ⅈ |  | \ComplexI |  ⅉ |  | \ComplexJ |  ⅋ |  | \invamp |  ⅐ |  | \frac{1}{7} |
|  ⅑ |  | \frac{1}{9} |  ⅒ |  | \frac{1}{10} |  ⅓ |  | \frac{1}{3} |  ⅔ |  | \frac{2}{3} |
|  ⅕ |  | \frac{1}{5} |  ⅖ |  | \frac{2}{5} |  ⅗ |  | \frac{3}{5} |  ⅘ |  | \frac{4}{5} |
|  ⅙ |  | \frac{1}{6} |  ⅚ |  | \frac{5}{6} |  ⅛ |  | \frac{1}{8} |  ⅜ |  | \frac{3}{8} |
|  ⅝ |  | \frac{5}{8} |  ⅞ |  | \frac{7}{8} |  ⅟ |  | \frac{1} |  ↉ |  | \frac{0}{3} |
|  ← | \textleftarrow | \leftarrow |  ↑ |  | \uparrow |  → |  | \rightarrow |  ↓ | \textdownarrow | \downarrow |
|  ↔ |  | \leftrightarrow |  ↕ |  | \updownarrow |  ↖ |  | \nwarrow |  ↗ |  | \nearrow |
|  ↘ |  | \searrow |  ↙ |  | \swarrow |  ↜ |  | \arrowwaveleft |  ↝ |  | \arrowwaveright |
|  ↦ |  | \mapsto |  ↩ |  | \hookleftarrow |  ↪ |  | \hookrightarrow |  ↯ |  | \lightning |
|  ↲ |  | \dlsh |  ↻ |  | \circlearrowright |  ↼ |  | \leftharpoonup |  ↽ |  | \leftharpoondown |
|  ⇀ |  | \rightharpoonup |  ⇅ |  | \dblarrowupdown |  ⇌ |  | \rightleftharpoons |  ⇐ |  | \Leftarrow |
|  ⇑ |  | \Uparrow |  ⇒ |  | \Rightarrow |  ⇓ |  | \Downarrow |  ⇔ |  | \Leftrightarrow |
|  ⇕ |  | \Updownarrow |  ⇠ |  | \dashleftarrow |  ⇢ |  | \dashrightarrow |  ⇤ |  | \LeftArrowBar |
|  ⇥ |  | \RightArrowBar |  ⇵ |  | \DownArrowUpArrow |  ⇸ |  | \pfun |  ⇻ |  | \ffun |
|  ∀ |  | \forall |  ∂ |  | \partial |  ∃ |  | \exists |  ∈ |  | \in |
|  ∉ |  | \notin |  ∋ |  | \ni |  ∌ |  | \not\ni |  ∏ |  | \prod |
|  ∐ |  | \coprod |  ∑ |  | \sum |  ∓ |  | \mp |  ∗ |  | \ast |
|  ∘ |  | \circ |  ∙ |  | \bullet |  ∛ |  | \sqrt[3] |  ∜ |  | \sqrt[4] |
|  ∝ |  | \propto |  ∞ |  | \infty |  ∠ |  | \angle |  ∣ |  | \mid |
|  ∥ |  | \parallel |  ∧ |  | \wedge |  ∨ |  | \vee |  ∩ |  | \cap |
|  ∪ |  | \cup |  ∫ |  | \int |  ∬ |  | {\int\!\int} |  ∭ |  | {\int\!\int\!\int} |
|  ∮ |  | \oint |  ∯ |  | \surfintegral |  ∰ |  | \volintegral |  ∱ |  | \clwintegral |
|  ∶ |  | : |  ∺ |  | \mathbin{{:}\!\!{-}\!\!{:}} |  ∻ |  | \homothetic |  ∼ |  | \sim |
|  ∾ |  | \lazysinv |  ∿ |  | \AC |  ≀ |  | \wr |  ≁ |  | \not\sim |
|  ≂̸ |  | \NotEqualTilde |  ≃ |  | \simeq |  ≄ |  | \not\simeq |  ≅ |  | \cong |
|  ≆ |  | \approxnotequal |  ≇ |  | \not\cong |  ≈ |  | \approx |  ≉ |  | \not\approx |
|  ≋ |  | \tildetrpl |  ≋̸ |  | \not\apid |  ≌ |  | \allequal |  ≍ |  | \asymp |
|  ≎̸ |  | \NotHumpDownHump |  ≏̸ |  | \NotHumpEqual |  ≐ |  | \doteq |  ≐̸ |  | \not\doteq |
|  ≑ |  | \doteqdot |  ≔ | := | := |  ≕ |  | =: |  ≙ |  | \estimates |
|  ≛ |  | \starequal |  ≠ |  | \neq |  ≡ |  | \equiv |  ≢ |  | \not\equiv |
|  ≤ |  | \leq |  ≥ |  | \geq |  ≦ |  | \leqq |  ≧ |  | \geqq |
|  ≨︀ |  | \lvertneqq |  ≩︀ |  | \gvertneqq |  ≪ |  | \ll |  ≪̸ |  | \NotLessLess |
|  ≫ |  | \gg |  ≫̸ |  | \NotGreaterGreater |  ≭ |  | {\not\kern-0.3em\times} |  ≮ |  | \not< |
|  ≯ |  | \not> |  ≰ |  | \not\leq |  ≱ |  | \not\geq |  ≲ |  | \lessequivlnt |
|  ≳ |  | \greaterequivlnt |  ≸ |  | \notlessgreater |  ≹ |  | \notgreaterless |  ≺ |  | \prec |
|  ≻ |  | \succ |  ≾ |  | \precapprox |  ≾̸ |  | \NotPrecedesTilde |  ≿ |  | \succapprox |
|  ≿̸ |  | \NotSucceedsTilde |  ⊀ |  | \not\prec |  ⊁ |  | \not\succ |  ⊂ |  | \subset |
|  ⊃ |  | \supset |  ⊄ |  | \not\subset |  ⊅ |  | \not\supset |  ⊆ |  | \subseteq |
|  ⊇ |  | \supseteq |  ⊈ |  | \not\subseteq |  ⊉ |  | \not\supseteq |  ⊊︀ |  | \varsubsetneqq |
|  ⊋︀ |  | \varsupsetneq |  ⊎ |  | \uplus |  ⊏̸ |  | \NotSquareSubset |  ⊐̸ |  | \NotSquareSuperset |
|  ⊑ |  | \sqsubseteq |  ⊒ |  | \sqsupseteq |  ⊓ |  | \sqcap |  ⊔ |  | \sqcup |
|  ⊕ |  | \oplus |  ⊖ |  | \ominus |  ⊗ |  | \otimes |  ⊘ |  | \oslash |
|  ⊙ |  | \odot |  ⊢ |  | \vdash |  ⊣ |  | \dashv |  ⊤ |  | \top |
|  ⊥ |  | \perp |  ⊧ |  | \truestate |  ⊨ |  | \forcesextra |  ⊶ |  | \original |
|  ⊷ |  | \image |  ⊹ |  | \hermitconjmatrix |  ⊾ |  | \rightanglearc |  ⋀ |  | \bigwedge |
|  ⋁ |  | \bigvee |  ⋂ |  | \bigcap |  ⋃ |  | \bigcup |  ⋄ |  | \diamond |
|  ⋅ |  | \cdot |  ⋆ |  | \star |  ⋈ |  | \bowtie |  ⋘ |  | \verymuchless |
|  ⋙ |  | \verymuchgreater |  ⋢ |  | \not\sqsubseteq |  ⋣ |  | \not\sqsupseteq |  ⋪ |  | \ntriangleleft |
|  ⋫ |  | \ntriangleright |  ⋮ |  | \vdots |  ⋯ |  | \cdots |  ⋰ |  | \upslopeellipsis |
|  ⋱ |  | \ddots |  ⋶ |  | \barin |  ⌆ |  | \perspcorrespond |  ⌈ |  | \lceil |
|  ⌉ |  | \rceil |  ⌊ |  | \lfloor |  ⌋ |  | \rfloor |  ⌑ |  | \wasylozenge |
|  ⌕ |  | \recorder |  ⌖ |  | {\mathchar"2208} |  ⌢ |  | \frown |  ⌣ |  | \smile |
|  〈 | \textlangle | \langle |  〉 | \textrangle | \rangle |  ⌹ |  | \APLinv |  ⌿ |  | \notslash |
|  ⍀ |  | \notbackslash |  ⍇ |  | \APLleftarrowbox |  ⍈ |  | \APLrightarrowbox |  ⍉ |  | \invdiameter |
|  ⍐ |  | \APLuparrowbox |  ⍗ |  | \APLdownarrowbox |  ⍝ |  | \APLcomment |  ⍞ |  | \APLinput |
|  ⍟ |  | \APLlog |  ⎰ |  | \lmoustache |  ⎱ |  | \rmoustache |  Ⓢ |  | \circledS |
|  ╱ |  | \diagup |  □ |  | \square |  ▶ |  | \RHD |  ▷ |  | \rhd |
|  ▽ |  | \bigtriangledown |  ◀ |  | \LHD |  ◁ |  | \lhd |  ◆ | \ding{117} | \Diamondblack |
|  ◇ |  | \Diamond |  ○ |  | \bigcirc |  ● | \ding{108} | \CIRCLE |  ◯ | \textbigcircle | \bigcirc |
|  ☉ |  | \Sun |  ☐ |  | \Square |  ☑ |  | \CheckedBox |  ☒ |  | \XBox |
|  ☕ |  | \steaming |  ☞ | \ding{43} | \pointright |  ☠ |  | \skull |  ☢ |  | \radiation |
|  ☣ |  | \biohazard |  ☯ |  | \yinyang |  ☹ |  | \frownie |  ☺ |  | \smiley |
|  ♁ |  | \earth |  ♠ | \ding{171} | \spadesuit |  ♡ |  | \heartsuit |  ♢ |  | \diamondsuit |
|  ♣ |  | \clubsuit |  ♭ |  | \flat |  ♮ |  | \natural |  ♯ |  | \sharp |
|  ♻ |  | \recycle |  ⚓ |  | \anchor |  ⚔ |  | \swords |  ⚠ |  | \warning |
|  ⚪ |  | \medcirc |  ⚫ |  | \medbullet |  ✎ | \ding{46} | \pencil |  ✗ | \ding{55} | \ballotx |
|  ➢ | \ding{226} | \arrowbullet |  ⟂ |  | \perp |  ⟅ |  | \Lbag |  ⟆ |  | \Rbag |
|  ⟐ |  | \Diamonddot |  ⟦ |  | \llbracket |  ⟧ |  | \rrbracket |  ⟨ |  | \langle |
|  ⟩ |  | \rangle |  ⟪ |  | \lang |  ⟮ |  | \lgroup |  ⟯ |  | \rgroup |
|  ⟵ |  | \longleftarrow |  ⟶ |  | \longrightarrow |  ⟷ |  | \longleftrightarrow |  ⟸ |  | \Longleftarrow |
|  ⟹ |  | \Longrightarrow |  ⟺ |  | \Longleftrightarrow |  ⟼ |  | \longmapsto |  ⤀ |  | \psur |
|  ⤒ |  | \UpArrowBar |  ⤓ |  | \DownArrowBar |  ⤔ |  | \pinj |  ⤕ |  | \finj |
|  ⤖ |  | \bij |  ⥀ |  | \Elolarr |  ⥁ |  | \Elorarr |  ⥊ |  | \leftrightharpoon |
|  ⥋ |  | \rightleftharpoon |  ⥏ |  | \RightUpDownVector |  ⥑ |  | \LeftUpDownVector |  ⥒ |  | \LeftVectorBar |
|  ⥓ |  | \RightVectorBar |  ⥔ |  | \RightUpVectorBar |  ⥕ |  | \RightDownVectorBar |  ⥖ |  | \DownLeftVectorBar |
|  ⥗ |  | \DownRightVectorBar |  ⥘ |  | \LeftUpVectorBar |  ⥙ |  | \LeftDownVectorBar |  ⥚ |  | \LeftTeeVector |
|  ⥛ |  | \RightTeeVector |  ⥜ |  | \RightUpTeeVector |  ⥝ |  | \RightDownTeeVector |  ⥞ |  | \DownLeftTeeVector |
|  ⥟ |  | \DownRightTeeVector |  ⥠ |  | \LeftUpTeeVector |  ⥡ |  | \LeftDownTeeVector |  ⥢ |  | \leftleftharpoons |
|  ⥣ |  | \upupharpoons |  ⥤ |  | \rightrightharpoons |  ⥥ |  | \downdownharpoons |  ⥪ |  | \leftbarharpoon |
|  ⥫ |  | \barleftharpoon |  ⥬ |  | \rightbarharpoon |  ⥭ |  | \barrightharpoon |  ⥮ |  | \UpEquilibrium |
|  ⥯ |  | \ReverseUpEquilibrium |  ⥰ |  | \RoundImplies |  ⦈ |  | \rimg |  ⦉ |  | \lblot |
|  ⦊ |  | \rblot |  ⦜ |  | \Angle |  ⧄ |  | \boxslash |  ⧏ |  | \LeftTriangleBar |
|  ⧏̸ |  | \NotLeftTriangleBar |  ⧐ |  | \RightTriangleBar |  ⧐̸ |  | \NotRightTriangleBar |  ⧟ |  | \multimapboth |
|  ⧵ |  | \setminus |  ⧹ |  | \zhide |  ⨀ |  | \bigodot |  ⨁ |  | \bigoplus |
|  ⨂ |  | \bigotimes |  ⨆ |  | \Elxsqcup |  ⨉ |  | \varprod |  ⨏ |  | \clockoint |
|  ⨖ |  | \sqrint |  ⨿ |  | \amalg |  ⩖ |  | \ElOr |  ⩮ |  | \stackrel{*}{=} |
|  ⩵ |  | \Equal |  ⩶ |  | \Same |  ⩽ |  | \leq |  ⪡ |  | \NestedLessLess |
|  ⪡̸ |  | \NotNestedLessLess |  ⪢ |  | \NestedGreaterGreater |  ⪢̸ |  | \NotNestedGreaterGreater |  ⪦ |  | \leftslice |
|  ⪧ |  | \rightslice |  ⪯ |  | \preceq |  ⪯̸ |  | \not\preceq |  ⪰ |  | \succeq |
|  ⪰̸ |  | \not\succeq |  ⪻ |  | \llcurly |  ⪼ |  | \ggcurly |  ⫅̸ |  | \nsubseteqq |
|  ⫆̸ |  | \nsupseteqq |  ⫝̸ |  | \forks |  ⫪ |  | \Top |  ⫽ |  | {{/}\!\!{/}} |
|  ⫽⃥ |  | {\rlap{\textbackslash}{{/}\!\!{/}}} |  〔 |  | \lbrbrak |  〕 |  | \rbrbrak |  〚 |  | \openbracketleft |
|  〛 |  | \openbracketright |  𝐀 |  | \mathbf{A} |  𝐁 |  | \mathbf{B} |  𝐂 |  | \mathbf{C} |
|  𝐃 |  | \mathbf{D} |  𝐄 |  | \mathbf{E} |  𝐅 |  | \mathbf{F} |  𝐆 |  | \mathbf{G} |
|  𝐇 |  | \mathbf{H} |  𝐈 |  | \mathbf{I} |  𝐉 |  | \mathbf{J} |  𝐊 |  | \mathbf{K} |
|  𝐋 |  | \mathbf{L} |  𝐌 |  | \mathbf{M} |  𝐍 |  | \mathbf{N} |  𝐎 |  | \mathbf{O} |
|  𝐏 |  | \mathbf{P} |  𝐐 |  | \mathbf{Q} |  𝐑 |  | \mathbf{R} |  𝐒 |  | \mathbf{S} |
|  𝐓 |  | \mathbf{T} |  𝐔 |  | \mathbf{U} |  𝐕 |  | \mathbf{V} |  𝐖 |  | \mathbf{W} |
|  𝐗 |  | \mathbf{X} |  𝐘 |  | \mathbf{Y} |  𝐙 |  | \mathbf{Z} |  𝐚 |  | \mathbf{a} |
|  𝐛 |  | \mathbf{b} |  𝐜 |  | \mathbf{c} |  𝐝 |  | \mathbf{d} |  𝐞 |  | \mathbf{e} |
|  𝐟 |  | \mathbf{f} |  𝐠 |  | \mathbf{g} |  𝐡 |  | \mathbf{h} |  𝐢 |  | \mathbf{i} |
|  𝐣 |  | \mathbf{j} |  𝐤 |  | \mathbf{k} |  𝐥 |  | \mathbf{l} |  𝐦 |  | \mathbf{m} |
|  𝐧 |  | \mathbf{n} |  𝐨 |  | \mathbf{o} |  𝐩 |  | \mathbf{p} |  𝐪 |  | \mathbf{q} |
|  𝐫 |  | \mathbf{r} |  𝐬 |  | \mathbf{s} |  𝐭 |  | \mathbf{t} |  𝐮 |  | \mathbf{u} |
|  𝐯 |  | \mathbf{v} |  𝐰 |  | \mathbf{w} |  𝐱 |  | \mathbf{x} |  𝐲 |  | \mathbf{y} |
|  𝐳 |  | \mathbf{z} |  𝐴 |  | A |  𝐵 |  | B |  𝐶 |  | C |
|  𝐷 |  | D |  𝐸 |  | E |  𝐹 |  | F |  𝐺 |  | G |
|  𝐻 |  | H |  𝐼 |  | I |  𝐽 |  | J |  𝐾 |  | K |
|  𝐿 |  | L |  𝑀 |  | M |  𝑁 |  | N |  𝑂 |  | O |
|  𝑃 |  | P |  𝑄 |  | Q |  𝑅 |  | R |  𝑆 |  | S |
|  𝑇 |  | T |  𝑈 |  | U |  𝑉 |  | V |  𝑊 |  | W |
|  𝑋 |  | X |  𝑌 |  | Y |  𝑍 |  | Z |  𝑎 |  | a |
|  𝑏 |  | b |  𝑐 |  | c |  𝑑 |  | d |  𝑒 |  | e |
|  𝑓 |  | f |  𝑔 |  | g |  𝑖 |  | i |  𝑗 |  | j |
|  𝑘 |  | k |  𝑙 |  | l |  𝑚 |  | m |  𝑛 |  | n |
|  𝑜 |  | o |  𝑝 |  | p |  𝑞 |  | q |  𝑟 |  | r |
|  𝑠 |  | s |  𝑡 |  | t |  𝑢 |  | u |  𝑣 |  | v |
|  𝑤 |  | w |  𝑥 |  | x |  𝑦 |  | y |  𝑧 |  | z |
|  𝑨 |  | \mathbit{A} |  𝑩 |  | \mathbit{B} |  𝑪 |  | \mathbit{C} |  𝑫 |  | \mathbit{D} |
|  𝑬 |  | \mathbit{E} |  𝑭 |  | \mathbit{F} |  𝑮 |  | \mathbit{G} |  𝑯 |  | \mathbit{H} |
|  𝑰 |  | \mathbit{I} |  𝑱 |  | \mathbit{J} |  𝑲 |  | \mathbit{K} |  𝑳 |  | \mathbit{L} |
|  𝑴 |  | \mathbit{M} |  𝑵 |  | \mathbit{N} |  𝑶 |  | \mathbit{O} |  𝑷 |  | \mathbit{P} |
|  𝑸 |  | \mathbit{Q} |  𝑹 |  | \mathbit{R} |  𝑺 |  | \mathbit{S} |  𝑻 |  | \mathbit{T} |
|  𝑼 |  | \mathbit{U} |  𝑽 |  | \mathbit{V} |  𝑾 |  | \mathbit{W} |  𝑿 |  | \mathbit{X} |
|  𝒀 |  | \mathbit{Y} |  𝒁 |  | \mathbit{Z} |  𝒂 |  | \mathbit{a} |  𝒃 |  | \mathbit{b} |
|  𝒄 |  | \mathbit{c} |  𝒅 |  | \mathbit{d} |  𝒆 |  | \mathbit{e} |  𝒇 |  | \mathbit{f} |
|  𝒈 |  | \mathbit{g} |  𝒉 |  | \mathbit{h} |  𝒊 |  | \mathbit{i} |  𝒋 |  | \mathbit{j} |
|  𝒌 |  | \mathbit{k} |  𝒍 |  | \mathbit{l} |  𝒎 |  | \mathbit{m} |  𝒏 |  | \mathbit{n} |
|  𝒐 |  | \mathbit{o} |  𝒑 |  | \mathbit{p} |  𝒒 |  | \mathbit{q} |  𝒓 |  | \mathbit{r} |
|  𝒔 |  | \mathbit{s} |  𝒕 |  | \mathbit{t} |  𝒖 |  | \mathbit{u} |  𝒗 |  | \mathbit{v} |
|  𝒘 |  | \mathbit{w} |  𝒙 |  | \mathbit{x} |  𝒚 |  | \mathbit{y} |  𝒛 |  | \mathbit{z} |
|  𝓐 |  | \mathmit{A} |  𝓑 |  | \mathmit{B} |  𝓒 |  | \mathmit{C} |  𝓓 |  | \mathmit{D} |
|  𝓔 |  | \mathmit{E} |  𝓕 |  | \mathmit{F} |  𝓖 |  | \mathmit{G} |  𝓗 |  | \mathmit{H} |
|  𝓘 |  | \mathmit{I} |  𝓙 |  | \mathmit{J} |  𝓚 |  | \mathmit{K} |  𝓛 |  | \mathmit{L} |
|  𝓜 |  | \mathmit{M} |  𝓝 |  | \mathmit{N} |  𝓞 |  | \mathmit{O} |  𝓟 |  | \mathmit{P} |
|  𝓠 |  | \mathmit{Q} |  𝓡 |  | \mathmit{R} |  𝓢 |  | \mathmit{S} |  𝓣 |  | \mathmit{T} |
|  𝓤 |  | \mathmit{U} |  𝓥 |  | \mathmit{V} |  𝓦 |  | \mathmit{W} |  𝓧 |  | \mathmit{X} |
|  𝓨 |  | \mathmit{Y} |  𝓩 |  | \mathmit{Z} |  𝓪 |  | \mathmit{a} |  𝓫 |  | \mathmit{b} |
|  𝓬 |  | \mathmit{c} |  𝓭 |  | \mathmit{d} |  𝓮 |  | \mathmit{e} |  𝓯 |  | \mathmit{f} |
|  𝓰 |  | \mathmit{g} |  𝓱 |  | \mathmit{h} |  𝓲 |  | \mathmit{i} |  𝓳 |  | \mathmit{j} |
|  𝓴 |  | \mathmit{k} |  𝓵 |  | \mathmit{l} |  𝓶 |  | \mathmit{m} |  𝓷 |  | \mathmit{n} |
|  𝓸 |  | \mathmit{o} |  𝓹 |  | \mathmit{p} |  𝓺 |  | \mathmit{q} |  𝓻 |  | \mathmit{r} |
|  𝓼 |  | \mathmit{s} |  𝓽 |  | \mathmit{t} |  𝓾 |  | \mathmit{u} |  𝓿 |  | \mathmit{v} |
|  𝔀 |  | \mathmit{w} |  𝔁 |  | \mathmit{x} |  𝔂 |  | \mathmit{y} |  𝔃 |  | \mathmit{z} |
|  𝔄 |  | \mathfrak{A} |  𝔅 |  | \mathfrak{B} |  𝔇 |  | \mathfrak{D} |  𝔈 |  | \mathfrak{E} |
|  𝔉 |  | \mathfrak{F} |  𝔊 |  | \mathfrak{G} |  𝔍 |  | \mathfrak{J} |  𝔎 |  | \mathfrak{K} |
|  𝔏 |  | \mathfrak{L} |  𝔐 |  | \mathfrak{M} |  𝔑 |  | \mathfrak{N} |  𝔒 |  | \mathfrak{O} |
|  𝔓 |  | \mathfrak{P} |  𝔔 |  | \mathfrak{Q} |  𝔖 |  | \mathfrak{S} |  𝔗 |  | \mathfrak{T} |
|  𝔘 |  | \mathfrak{U} |  𝔙 |  | \mathfrak{V} |  𝔚 |  | \mathfrak{W} |  𝔛 |  | \mathfrak{X} |
|  𝔜 |  | \mathfrak{Y} |  𝔞 |  | \mathfrak{a} |  𝔟 |  | \mathfrak{b} |  𝔠 |  | \mathfrak{c} |
|  𝔡 |  | \mathfrak{d} |  𝔢 |  | \mathfrak{e} |  𝔣 |  | \mathfrak{f} |  𝔤 |  | \mathfrak{g} |
|  𝔥 |  | \mathfrak{h} |  𝔦 |  | \mathfrak{i} |  𝔧 |  | \mathfrak{j} |  𝔨 |  | \mathfrak{k} |
|  𝔩 |  | \mathfrak{l} |  𝔪 |  | \mathfrak{m} |  𝔫 |  | \mathfrak{n} |  𝔬 |  | \mathfrak{o} |
|  𝔭 |  | \mathfrak{p} |  𝔮 |  | \mathfrak{q} |  𝔯 |  | \mathfrak{r} |  𝔰 |  | \mathfrak{s} |
|  𝔱 |  | \mathfrak{t} |  𝔲 |  | \mathfrak{u} |  𝔳 |  | \mathfrak{v} |  𝔴 |  | \mathfrak{w} |
|  𝔵 |  | \mathfrak{x} |  𝔶 |  | \mathfrak{y} |  𝔷 |  | \mathfrak{z} |  𝔸 |  | \mathbb{A} |
|  𝔹 |  | \mathbb{B} |  𝔻 |  | \mathbb{D} |  𝔼 |  | \mathbb{E} |  𝔽 |  | \mathbb{F} |
|  𝔾 |  | \mathbb{G} |  𝕀 |  | \mathbb{I} |  𝕁 |  | \mathbb{J} |  𝕂 |  | \mathbb{K} |
|  𝕃 |  | \mathbb{L} |  𝕄 |  | \mathbb{M} |  𝕆 |  | \mathbb{O} |  𝕊 |  | \mathbb{S} |
|  𝕋 |  | \mathbb{T} |  𝕌 |  | \mathbb{U} |  𝕍 |  | \mathbb{V} |  𝕎 |  | \mathbb{W} |
|  𝕏 |  | \mathbb{X} |  𝕐 |  | \mathbb{Y} |  𝕒 |  | \mathbb{a} |  𝕓 |  | \mathbb{b} |
|  𝕔 |  | \mathbb{c} |  𝕕 |  | \mathbb{d} |  𝕖 |  | \mathbb{e} |  𝕗 |  | \mathbb{f} |
|  𝕘 |  | \mathbb{g} |  𝕙 |  | \mathbb{h} |  𝕚 |  | \mathbb{i} |  𝕛 |  | \mathbb{j} |
|  𝕜 |  | \mathbb{k} |  𝕝 |  | \mathbb{l} |  𝕞 |  | \mathbb{m} |  𝕟 |  | \mathbb{n} |
|  𝕠 |  | \mathbb{o} |  𝕡 |  | \mathbb{p} |  𝕢 |  | \mathbb{q} |  𝕣 |  | \mathbb{r} |
|  𝕤 |  | \mathbb{s} |  𝕥 |  | \mathbb{t} |  𝕦 |  | \mathbb{u} |  𝕧 |  | \mathbb{v} |
|  𝕨 |  | \mathbb{w} |  𝕩 |  | \mathbb{x} |  𝕪 |  | \mathbb{y} |  𝕫 |  | \mathbb{z} |
|  𝕬 |  | A |  𝕭 |  | B |  𝕮 |  | C |  𝕯 |  | D |
|  𝕰 |  | E |  𝕱 |  | F |  𝕲 |  | G |  𝕳 |  | H |
|  𝕴 |  | I |  𝕵 |  | J |  𝕶 |  | K |  𝕷 |  | L |
|  𝕸 |  | M |  𝕹 |  | N |  𝕺 |  | O |  𝕻 |  | P |
|  𝕼 |  | Q |  𝕽 |  | R |  𝕾 |  | S |  𝕿 |  | T |
|  𝖀 |  | U |  𝖁 |  | V |  𝖂 |  | W |  𝖃 |  | X |
|  𝖄 |  | Y |  𝖅 |  | Z |  𝖆 |  | a |  𝖇 |  | b |
|  𝖈 |  | c |  𝖉 |  | d |  𝖊 |  | e |  𝖋 |  | f |
|  𝖌 |  | g |  𝖍 |  | h |  𝖎 |  | i |  𝖏 |  | j |
|  𝖐 |  | k |  𝖑 |  | l |  𝖒 |  | m |  𝖓 |  | n |
|  𝖔 |  | o |  𝖕 |  | p |  𝖖 |  | q |  𝖗 |  | r |
|  𝖘 |  | s |  𝖙 |  | t |  𝖚 |  | u |  𝖛 |  | v |
|  𝖜 |  | w |  𝖝 |  | x |  𝖞 |  | y |  𝖟 |  | z |
|  𝖠 |  | \mathsf{A} |  𝖡 |  | \mathsf{B} |  𝖢 |  | \mathsf{C} |  𝖣 |  | \mathsf{D} |
|  𝖤 |  | \mathsf{E} |  𝖥 |  | \mathsf{F} |  𝖦 |  | \mathsf{G} |  𝖧 |  | \mathsf{H} |
|  𝖨 |  | \mathsf{I} |  𝖩 |  | \mathsf{J} |  𝖪 |  | \mathsf{K} |  𝖫 |  | \mathsf{L} |
|  𝖬 |  | \mathsf{M} |  𝖭 |  | \mathsf{N} |  𝖮 |  | \mathsf{O} |  𝖯 |  | \mathsf{P} |
|  𝖰 |  | \mathsf{Q} |  𝖱 |  | \mathsf{R} |  𝖲 |  | \mathsf{S} |  𝖳 |  | \mathsf{T} |
|  𝖴 |  | \mathsf{U} |  𝖵 |  | \mathsf{V} |  𝖶 |  | \mathsf{W} |  𝖷 |  | \mathsf{X} |
|  𝖸 |  | \mathsf{Y} |  𝖹 |  | \mathsf{Z} |  𝖺 |  | \mathsf{a} |  𝖻 |  | \mathsf{b} |
|  𝖼 |  | \mathsf{c} |  𝖽 |  | \mathsf{d} |  𝖾 |  | \mathsf{e} |  𝖿 |  | \mathsf{f} |
|  𝗀 |  | \mathsf{g} |  𝗁 |  | \mathsf{h} |  𝗂 |  | \mathsf{i} |  𝗃 |  | \mathsf{j} |
|  𝗄 |  | \mathsf{k} |  𝗅 |  | \mathsf{l} |  𝗆 |  | \mathsf{m} |  𝗇 |  | \mathsf{n} |
|  𝗈 |  | \mathsf{o} |  𝗉 |  | \mathsf{p} |  𝗊 |  | \mathsf{q} |  𝗋 |  | \mathsf{r} |
|  𝗌 |  | \mathsf{s} |  𝗍 |  | \mathsf{t} |  𝗎 |  | \mathsf{u} |  𝗏 |  | \mathsf{v} |
|  𝗐 |  | \mathsf{w} |  𝗑 |  | \mathsf{x} |  𝗒 |  | \mathsf{y} |  𝗓 |  | \mathsf{z} |
|  𝗔 |  | \mathsfbf{A} |  𝗕 |  | \mathsfbf{B} |  𝗖 |  | \mathsfbf{C} |  𝗗 |  | \mathsfbf{D} |
|  𝗘 |  | \mathsfbf{E} |  𝗙 |  | \mathsfbf{F} |  𝗚 |  | \mathsfbf{G} |  𝗛 |  | \mathsfbf{H} |
|  𝗜 |  | \mathsfbf{I} |  𝗝 |  | \mathsfbf{J} |  𝗞 |  | \mathsfbf{K} |  𝗟 |  | \mathsfbf{L} |
|  𝗠 |  | \mathsfbf{M} |  𝗡 |  | \mathsfbf{N} |  𝗢 |  | \mathsfbf{O} |  𝗣 |  | \mathsfbf{P} |
|  𝗤 |  | \mathsfbf{Q} |  𝗥 |  | \mathsfbf{R} |  𝗦 |  | \mathsfbf{S} |  𝗧 |  | \mathsfbf{T} |
|  𝗨 |  | \mathsfbf{U} |  𝗩 |  | \mathsfbf{V} |  𝗪 |  | \mathsfbf{W} |  𝗫 |  | \mathsfbf{X} |
|  𝗬 |  | \mathsfbf{Y} |  𝗭 |  | \mathsfbf{Z} |  𝗮 |  | \mathsfbf{a} |  𝗯 |  | \mathsfbf{b} |
|  𝗰 |  | \mathsfbf{c} |  𝗱 |  | \mathsfbf{d} |  𝗲 |  | \mathsfbf{e} |  𝗳 |  | \mathsfbf{f} |
|  𝗴 |  | \mathsfbf{g} |  𝗵 |  | \mathsfbf{h} |  𝗶 |  | \mathsfbf{i} |  𝗷 |  | \mathsfbf{j} |
|  𝗸 |  | \mathsfbf{k} |  𝗹 |  | \mathsfbf{l} |  𝗺 |  | \mathsfbf{m} |  𝗻 |  | \mathsfbf{n} |
|  𝗼 |  | \mathsfbf{o} |  𝗽 |  | \mathsfbf{p} |  𝗾 |  | \mathsfbf{q} |  𝗿 |  | \mathsfbf{r} |
|  𝘀 |  | \mathsfbf{s} |  𝘁 |  | \mathsfbf{t} |  𝘂 |  | \mathsfbf{u} |  𝘃 |  | \mathsfbf{v} |
|  𝘄 |  | \mathsfbf{w} |  𝘅 |  | \mathsfbf{x} |  𝘆 |  | \mathsfbf{y} |  𝘇 |  | \mathsfbf{z} |
|  𝘈 |  | \mathsfsl{A} |  𝘉 |  | \mathsfsl{B} |  𝘊 |  | \mathsfsl{C} |  𝘋 |  | \mathsfsl{D} |
|  𝘌 |  | \mathsfsl{E} |  𝘍 |  | \mathsfsl{F} |  𝘎 |  | \mathsfsl{G} |  𝘏 |  | \mathsfsl{H} |
|  𝘐 |  | \mathsfsl{I} |  𝘑 |  | \mathsfsl{J} |  𝘒 |  | \mathsfsl{K} |  𝘓 |  | \mathsfsl{L} |
|  𝘔 |  | \mathsfsl{M} |  𝘕 |  | \mathsfsl{N} |  𝘖 |  | \mathsfsl{O} |  𝘗 |  | \mathsfsl{P} |
|  𝘘 |  | \mathsfsl{Q} |  𝘙 |  | \mathsfsl{R} |  𝘚 |  | \mathsfsl{S} |  𝘛 |  | \mathsfsl{T} |
|  𝘜 |  | \mathsfsl{U} |  𝘝 |  | \mathsfsl{V} |  𝘞 |  | \mathsfsl{W} |  𝘟 |  | \mathsfsl{X} |
|  𝘠 |  | \mathsfsl{Y} |  𝘡 |  | \mathsfsl{Z} |  𝘢 |  | \mathsfsl{a} |  𝘣 |  | \mathsfsl{b} |
|  𝘤 |  | \mathsfsl{c} |  𝘥 |  | \mathsfsl{d} |  𝘦 |  | \mathsfsl{e} |  𝘧 |  | \mathsfsl{f} |
|  𝘨 |  | \mathsfsl{g} |  𝘩 |  | \mathsfsl{h} |  𝘪 |  | \mathsfsl{i} |  𝘫 |  | \mathsfsl{j} |
|  𝘬 |  | \mathsfsl{k} |  𝘭 |  | \mathsfsl{l} |  𝘮 |  | \mathsfsl{m} |  𝘯 |  | \mathsfsl{n} |
|  𝘰 |  | \mathsfsl{o} |  𝘱 |  | \mathsfsl{p} |  𝘲 |  | \mathsfsl{q} |  𝘳 |  | \mathsfsl{r} |
|  𝘴 |  | \mathsfsl{s} |  𝘵 |  | \mathsfsl{t} |  𝘶 |  | \mathsfsl{u} |  𝘷 |  | \mathsfsl{v} |
|  𝘸 |  | \mathsfsl{w} |  𝘹 |  | \mathsfsl{x} |  𝘺 |  | \mathsfsl{y} |  𝘻 |  | \mathsfsl{z} |
|  𝘼 |  | \mathsfbfsl{A} |  𝘽 |  | \mathsfbfsl{B} |  𝘾 |  | \mathsfbfsl{C} |  𝘿 |  | \mathsfbfsl{D} |
|  𝙀 |  | \mathsfbfsl{E} |  𝙁 |  | \mathsfbfsl{F} |  𝙂 |  | \mathsfbfsl{G} |  𝙃 |  | \mathsfbfsl{H} |
|  𝙄 |  | \mathsfbfsl{I} |  𝙅 |  | \mathsfbfsl{J} |  𝙆 |  | \mathsfbfsl{K} |  𝙇 |  | \mathsfbfsl{L} |
|  𝙈 |  | \mathsfbfsl{M} |  𝙉 |  | \mathsfbfsl{N} |  𝙊 |  | \mathsfbfsl{O} |  𝙋 |  | \mathsfbfsl{P} |
|  𝙌 |  | \mathsfbfsl{Q} |  𝙍 |  | \mathsfbfsl{R} |  𝙎 |  | \mathsfbfsl{S} |  𝙏 |  | \mathsfbfsl{T} |
|  𝙐 |  | \mathsfbfsl{U} |  𝙑 |  | \mathsfbfsl{V} |  𝙒 |  | \mathsfbfsl{W} |  𝙓 |  | \mathsfbfsl{X} |
|  𝙔 |  | \mathsfbfsl{Y} |  𝙕 |  | \mathsfbfsl{Z} |  𝙖 |  | \mathsfbfsl{a} |  𝙗 |  | \mathsfbfsl{b} |
|  𝙘 |  | \mathsfbfsl{c} |  𝙙 |  | \mathsfbfsl{d} |  𝙚 |  | \mathsfbfsl{e} |  𝙛 |  | \mathsfbfsl{f} |
|  𝙜 |  | \mathsfbfsl{g} |  𝙝 |  | \mathsfbfsl{h} |  𝙞 |  | \mathsfbfsl{i} |  𝙟 |  | \mathsfbfsl{j} |
|  𝙠 |  | \mathsfbfsl{k} |  𝙡 |  | \mathsfbfsl{l} |  𝙢 |  | \mathsfbfsl{m} |  𝙣 |  | \mathsfbfsl{n} |
|  𝙤 |  | \mathsfbfsl{o} |  𝙥 |  | \mathsfbfsl{p} |  𝙦 |  | \mathsfbfsl{q} |  𝙧 |  | \mathsfbfsl{r} |
|  𝙨 |  | \mathsfbfsl{s} |  𝙩 |  | \mathsfbfsl{t} |  𝙪 |  | \mathsfbfsl{u} |  𝙫 |  | \mathsfbfsl{v} |
|  𝙬 |  | \mathsfbfsl{w} |  𝙭 |  | \mathsfbfsl{x} |  𝙮 |  | \mathsfbfsl{y} |  𝙯 |  | \mathsfbfsl{z} |
|  𝙰 |  | \mathtt{A} |  𝙱 |  | \mathtt{B} |  𝙲 |  | \mathtt{C} |  𝙳 |  | \mathtt{D} |
|  𝙴 |  | \mathtt{E} |  𝙵 |  | \mathtt{F} |  𝙶 |  | \mathtt{G} |  𝙷 |  | \mathtt{H} |
|  𝙸 |  | \mathtt{I} |  𝙹 |  | \mathtt{J} |  𝙺 |  | \mathtt{K} |  𝙻 |  | \mathtt{L} |
|  𝙼 |  | \mathtt{M} |  𝙽 |  | \mathtt{N} |  𝙾 |  | \mathtt{O} |  𝙿 |  | \mathtt{P} |
|  𝚀 |  | \mathtt{Q} |  𝚁 |  | \mathtt{R} |  𝚂 |  | \mathtt{S} |  𝚃 |  | \mathtt{T} |
|  𝚄 |  | \mathtt{U} |  𝚅 |  | \mathtt{V} |  𝚆 |  | \mathtt{W} |  𝚇 |  | \mathtt{X} |
|  𝚈 |  | \mathtt{Y} |  𝚉 |  | \mathtt{Z} |  𝚊 |  | \mathtt{a} |  𝚋 |  | \mathtt{b} |
|  𝚌 |  | \mathtt{c} |  𝚍 |  | \mathtt{d} |  𝚎 |  | \mathtt{e} |  𝚏 |  | \mathtt{f} |
|  𝚐 |  | \mathtt{g} |  𝚑 |  | \mathtt{h} |  𝚒 |  | \mathtt{i} |  𝚓 |  | \mathtt{j} |
|  𝚔 |  | \mathtt{k} |  𝚕 |  | \mathtt{l} |  𝚖 |  | \mathtt{m} |  𝚗 |  | \mathtt{n} |
|  𝚘 |  | \mathtt{o} |  𝚙 |  | \mathtt{p} |  𝚚 |  | \mathtt{q} |  𝚛 |  | \mathtt{r} |
|  𝚜 |  | \mathtt{s} |  𝚝 |  | \mathtt{t} |  𝚞 |  | \mathtt{u} |  𝚟 |  | \mathtt{v} |
|  𝚠 |  | \mathtt{w} |  𝚡 |  | \mathtt{x} |  𝚢 |  | \mathtt{y} |  𝚣 |  | \mathtt{z} |
|  𝚤 |  | \imath |  𝚥 |  | \jmath |  𝚨 |  | \mathbf{A} |  𝚩 |  | \mathbf{B} |
|  𝚪 |  | \mathbf{\Gamma} |  𝚫 |  | \mathbf{\Delta} |  𝚬 |  | \mathbf{E} |  𝚭 |  | \mathbf{Z} |
|  𝚮 |  | \mathbf{H} |  𝚯 |  | \mathbf{\Theta} |  𝚰 |  | \mathbf{I} |  𝚱 |  | \mathbf{K} |
|  𝚲 |  | \mathbf{\Lambda} |  𝚳 |  | M |  𝚴 |  | N |  𝚵 |  | \mathbf{\Xi} |
|  𝚶 |  | O |  𝚷 |  | \mathbf{\Pi} |  𝚸 |  | \mathbf{P} |  𝚹 |  | \mathbf{\vartheta} |
|  𝚺 |  | \mathbf{\Sigma} |  𝚻 |  | \mathbf{T} |  𝚼 |  | \mathbf{\Upsilon} |  𝚽 |  | \mathbf{\Phi} |
|  𝚾 |  | \mathbf{X} |  𝚿 |  | \mathbf{\Psi} |  𝛀 |  | \mathbf{\Omega} |  𝛁 |  | \mathbf{\nabla} |
|  𝛂 |  | \mathbf{\alpha} |  𝛃 |  | \mathbf{\beta} |  𝛄 |  | \mathbf{\gamma} |  𝛅 |  | \mathbf{\delta} |
|  𝛆 |  | \mathbf{\epsilon} |  𝛇 |  | \mathbf{\zeta} |  𝛈 |  | \mathbf{\eta} |  𝛉 |  | \mathbf{\theta} |
|  𝛊 |  | \mathbf{I} |  𝛋 |  | \mathbf{K} |  𝛌 |  | \mathbf{\lambda} |  𝛍 |  | m |
|  𝛎 |  | v |  𝛏 |  | \mathbf{\xi} |  𝛐 |  | O |  𝛑 |  | \mathbf{\pi} |
|  𝛒 |  | \mathbf{P} |  𝛓 |  | \mathbf{\varsigma} |  𝛔 |  | \mathbf{\sigma} |  𝛕 |  | \mathbf{T} |
|  𝛖 |  | \mathbf{\upsilon} |  𝛗 |  | \mathbf{\phi} |  𝛘 |  | \mathbf{X} |  𝛙 |  | \mathbf{\psi} |
|  𝛚 |  | \mathbf{\omega} |  𝛛 |  | \partial |  𝛜 |  | \in |  𝛝 |  | \mathbf{\vartheta} |
|  𝛞 |  | \mathbf{\varkappa} |  𝛟 |  | \mathbf{\phi} |  𝛠 |  | \mathbf{\varrho} |  𝛡 |  | \mathbf{\varpi} |
|  𝛢 |  | A |  𝛣 |  | B |  𝛤 |  | \Gamma |  𝛥 |  | \Delta |
|  𝛦 |  | E |  𝛧 |  | Z |  𝛨 |  | H |  𝛩 |  | \Theta |
|  𝛪 |  | I |  𝛫 |  | K |  𝛬 |  | \Lambda |  𝛭 |  | M |
|  𝛮 |  | N |  𝛯 |  | \Xi |  𝛰 |  | O |  𝛱 |  | \Pi |
|  𝛲 |  | P |  𝛳 |  | \Theta |  𝛴 |  | \Sigma |  𝛵 |  | T |
|  𝛶 |  | \Upsilon |  𝛷 |  | \Phi |  𝛸 |  | X |  𝛹 |  | \Psi |
|  𝛺 |  | \Omega |  𝛻 |  | \nabla |  𝛼 |  | A |  𝛽 |  | B |
|  𝛾 |  | \gamma |  𝛿 |  | \delta |  𝜀 |  | E |  𝜁 |  | Z |
|  𝜂 |  | H |  𝜃 |  | \theta |  𝜄 |  | I |  𝜅 |  | K |
|  𝜆 |  | \lambda |  𝜇 |  | \mu |  𝜈 |  | \nu |  𝜉 |  | \xi |
|  𝜊 |  | o |  𝜋 |  | \pi |  𝜍 |  | \varsigma |  𝜎 |  | \sigma |
|  𝜏 |  | T |  𝜐 |  | \upsilon |  𝜑 |  | \varphi |  𝜒 |  | X |
|  𝜓 |  | \psi |  𝜔 |  | \omega |  𝜕 |  | \partial |  𝜖 |  | \in |
|  𝜗 |  | \vartheta |  𝜘 |  | \varkappa |  𝜙 |  | \phi |  𝜚 |  | \varrho |
|  𝜛 |  | \varpi |  𝜜 |  | \mathbit{A} |  𝜝 |  | \mathbit{B} |  𝜞 |  | \mathbit{\Gamma} |
|  𝜟 |  | \mathbit{\Delta} |  𝜠 |  | \mathbit{E} |  𝜡 |  | \mathbit{Z} |  𝜢 |  | \mathbit{H} |
|  𝜣 |  | \mathbit{\Theta} |  𝜤 |  | \mathbit{I} |  𝜥 |  | \mathbit{K} |  𝜦 |  | \mathbit{\Lambda} |
|  𝜧 |  | M |  𝜨 |  | N |  𝜩 |  | \mathbit{\Xi} |  𝜪 |  | O |
|  𝜫 |  | \mathbit{\Pi} |  𝜬 |  | \mathbit{P} |  𝜭 |  | \mathbit{O} |  𝜮 |  | \mathbit{\Sigma} |
|  𝜯 |  | \mathbit{T} |  𝜰 |  | \mathbit{\Upsilon} |  𝜱 |  | \mathbit{\Phi} |  𝜲 |  | \mathbit{X} |
|  𝜳 |  | \mathbit{\Psi} |  𝜴 |  | \mathbit{\Omega} |  𝜵 |  | \mathbit{\nabla} |  𝜶 |  | \mathbit{\alpha} |
|  𝜷 |  | \mathbit{\beta} |  𝜸 |  | \mathbit{\gamma} |  𝜹 |  | \mathbit{\delta} |  𝜺 |  | \mathbit{\epsilon} |
|  𝜻 |  | \mathbit{\zeta} |  𝜼 |  | \mathbit{\eta} |  𝜽 |  | \mathbit{\theta} |  𝜾 |  | \mathbit{\imath} |
|  𝜿 |  | \mathbit{\kappa} |  𝝀 |  | \mathbit{\lambda} |  𝝁 |  | \mu |  𝝂 |  | v |
|  𝝃 |  | \mathbit{\xi} |  𝝄 |  | O |  𝝅 |  | \mathbit{\pi} |  𝝆 |  | \mathbit{\rho} |
|  𝝇 |  | \mathbit{\varsigma} |  𝝈 |  | \mathbit{\sigma} |  𝝉 |  | \mathbit{\tau} |  𝝊 |  | \mathbit{\upsilon} |
|  𝝋 |  | \mathbit{\varphi} |  𝝌 |  | \mathbit{\chi} |  𝝍 |  | \mathbit{\psi} |  𝝎 |  | \mathbit{\omega} |
|  𝝏 |  | \partial |  𝝐 |  | \in |  𝝑 |  | \mathbit{\vartheta} |  𝝒 |  | \mathbit{\varkappa} |
|  𝝓 |  | \mathbit{\phi} |  𝝔 |  | \mathbit{\varrho} |  𝝕 |  | \mathbit{\varpi} |  𝝖 |  | \mathsfbf{A} |
|  𝝗 |  | \mathsfbf{B} |  𝝘 |  | \mathsfbf{\Gamma} |  𝝙 |  | \mathsfbf{\Delta} |  𝝚 |  | \mathsfbf{E} |
|  𝝛 |  | \mathsfbf{Z} |  𝝜 |  | \mathsfbf{H} |  𝝝 |  | \mathsfbf{\Theta} |  𝝞 |  | \mathsfbf{I} |
|  𝝟 |  | \mathsfbf{K} |  𝝠 |  | \mathsfbf{\Lambda} |  𝝡 |  | M |  𝝢 |  | N |
|  𝝣 |  | \mathsfbf{\Xi} |  𝝤 |  | O |  𝝥 |  | \mathsfbf{\Pi} |  𝝦 |  | \mathsfbf{P} |
|  𝝧 |  | \mathsfbf{\Theta} |  𝝨 |  | \mathsfbf{\Sigma} |  𝝩 |  | \mathsfbf{T} |  𝝪 |  | \mathsfbf{\Upsilon} |
|  𝝫 |  | \mathsfbf{\Phi} |  𝝬 |  | \mathsfbf{X} |  𝝭 |  | \mathsfbf{\Psi} |  𝝮 |  | \mathsfbf{\Omega} |
|  𝝯 |  | \mathsfbf{\nabla} |  𝝰 |  | \mathsfbf{\alpha} |  𝝱 |  | \mathsfbf{\beta} |  𝝲 |  | \mathsfbf{\gamma} |
|  𝝳 |  | \mathsfbf{\delta} |  𝝴 |  | \mathsfbf{\varepsilon} |  𝝵 |  | \mathsfbf{\zeta} |  𝝶 |  | \mathsfbf{\eta} |
|  𝝷 |  | \mathsfbf{\theta} |  𝝸 |  | \mathsfbf{\imath} |  𝝹 |  | \mathsfbf{\kappa} |  𝝺 |  | \mathsfbf{\lambda} |
|  𝝻 |  | \mu |  𝝼 |  | \nu |  𝝽 |  | \mathsfbf{\xi} |  𝝾 |  | o |
|  𝝿 |  | \mathsfbf{\pi} |  𝞀 |  | \mathsfbf{\rho} |  𝞁 |  | \mathsfbf{\varsigma} |  𝞂 |  | \mathsfbf{\sigma} |
|  𝞃 |  | \mathsfbf{\tau} |  𝞄 |  | \mathsfbf{\upsilon} |  𝞅 |  | \mathsfbf{\varphi} |  𝞆 |  | \mathsfbf{\chi} |
|  𝞇 |  | \mathsfbf{\psi} |  𝞈 |  | \mathsfbf{\omega} |  𝞉 |  | \partial |  𝞊 |  | \in |
|  𝞋 |  | \mathsfbf{\vartheta} |  𝞌 |  | \mathsfbf{\varkappa} |  𝞍 |  | \mathsfbf{\phi} |  𝞎 |  | \mathsfbf{\varrho} |
|  𝞏 |  | \mathsfbf{\varpi} |  𝞐 |  | \mathsfbfsl{A} |  𝞑 |  | \mathsfbfsl{B} |  𝞒 |  | \mathsfbfsl{\Gamma} |
|  𝞓 |  | \mathsfbfsl{\Delta} |  𝞔 |  | \mathsfbfsl{E} |  𝞕 |  | \mathsfbfsl{Z} |  𝞖 |  | \mathsfbfsl{H} |
|  𝞗 |  | \mathsfbfsl{\Theta} |  𝞘 |  | \mathsfbfsl{I} |  𝞙 |  | \mathsfbfsl{K} |  𝞚 |  | \mathsfbfsl{\Lambda} |
|  𝞛 |  | \mathsfbfsl{M} |  𝞜 |  | \mathsfbfsl{N} |  𝞝 |  | \mathsfbfsl{\Xi} |  𝞞 |  | \mathsfbfsl{O} |
|  𝞟 |  | \mathsfbfsl{\Pi} |  𝞠 |  | \mathsfbfsl{P} |  𝞡 |  | \mathsfbfsl{\Theta} |  𝞢 |  | \mathsfbfsl{\Sigma} |
|  𝞣 |  | \mathsfbfsl{T} |  𝞤 |  | \mathsfbfsl{\Upsilon} |  𝞥 |  | \mathsfbfsl{\Phi} |  𝞦 |  | \mathsfbfsl{X} |
|  𝞧 |  | \mathsfbfsl{\Psi} |  𝞨 |  | \mathsfbfsl{\Omega} |  𝞩 |  | \mathsfbfsl{\nabla} |  𝞪 |  | \mathsfbfsl{\alpha} |
|  𝞫 |  | \mathsfbfsl{\beta} |  𝞬 |  | \mathsfbfsl{\gamma} |  𝞭 |  | \mathsfbfsl{\delta} |  𝞮 |  | \mathsfbfsl{\varepsilon} |
|  𝞯 |  | \mathsfbfsl{\zeta} |  𝞰 |  | \mathsfbfsl{\eta} |  𝞱 |  | \mathsfbfsl{\theta} |  𝞲 |  | \mathsfbfsl{\imath} |
|  𝞳 |  | \mathsfbfsl{\kappa} |  𝞴 |  | \mathsfbfsl{\lambda} |  𝞵 |  | \mu |  𝞶 |  | \nu |
|  𝞷 |  | \mathsfbfsl{\xi} |  𝞸 |  | o |  𝞹 |  | \mathsfbfsl{\pi} |  𝞺 |  | \mathsfbfsl{\rho} |
|  𝞻 |  | \mathsfbfsl{\varsigma} |  𝞼 |  | \mathsfbfsl{\sigma} |  𝞽 |  | \mathsfbfsl{\tau} |  𝞾 |  | \mathsfbfsl{\upsilon} |
|  𝞿 |  | \mathsfbfsl{\varphi} |  𝟀 |  | \mathsfbfsl{\chi} |  𝟁 |  | \mathsfbfsl{\psi} |  𝟂 |  | \mathsfbfsl{\omega} |
|  𝟃 |  | \partial |  𝟄 |  | \in |  𝟅 |  | \mathsfbfsl{\vartheta} |  𝟆 |  | \mathsfbfsl{\varkappa} |
|  𝟇 |  | \mathsfbfsl{\phi} |  𝟈 |  | \mathsfbfsl{\varrho} |  𝟉 |  | \mathsfbfsl{\varpi} |  𝟊 |  | \mbfDigamma |
|  𝟋 |  | \mbfdigamma |  𝟎 |  | \mathbf{0} |  𝟏 |  | \mathbf{1} |  𝟐 |  | \mathbf{2} |
|  𝟑 |  | \mathbf{3} |  𝟒 |  | \mathbf{4} |  𝟓 |  | \mathbf{5} |  𝟔 |  | \mathbf{6} |
|  𝟕 |  | \mathbf{7} |  𝟖 |  | \mathbf{8} |  𝟗 |  | \mathbf{9} |  𝟘 |  | \mathbb{0} |
|  𝟙 |  | \mathbb{1} |  𝟚 |  | \mathbb{2} |  𝟛 |  | \mathbb{3} |  𝟜 |  | \mathbb{4} |
|  𝟝 |  | \mathbb{5} |  𝟞 |  | \mathbb{6} |  𝟟 |  | \mathbb{7} |  𝟠 |  | \mathbb{8} |
|  𝟡 |  | \mathbb{9} |  𝟢 |  | \mathsf{0} |  𝟣 |  | \mathsf{1} |  𝟤 |  | \mathsf{2} |
|  𝟥 |  | \mathsf{3} |  𝟦 |  | \mathsf{4} |  𝟧 |  | \mathsf{5} |  𝟨 |  | \mathsf{6} |
|  𝟩 |  | \mathsf{7} |  𝟪 |  | \mathsf{8} |  𝟫 |  | \mathsf{9} |  𝟬 |  | \mathsfbf{0} |
|  𝟭 |  | \mathsfbf{1} |  𝟮 |  | \mathsfbf{2} |  𝟯 |  | \mathsfbf{3} |  𝟰 |  | \mathsfbf{4} |
|  𝟱 |  | \mathsfbf{5} |  𝟲 |  | \mathsfbf{6} |  𝟳 |  | \mathsfbf{7} |  𝟴 |  | \mathsfbf{8} |
|  𝟵 |  | \mathsfbf{9} |  𝟶 |  | \mathtt{0} |  𝟷 |  | \mathtt{1} |  𝟸 |  | \mathtt{2} |
|  𝟹 |  | \mathtt{3} |  𝟺 |  | \mathtt{4} |  𝟻 |  | \mathtt{5} |  𝟼 |  | \mathtt{6} |
|  𝟽 |  | \mathtt{7} |  𝟾 |  | \mathtt{8} |  𝟿 |  | \mathtt{9} |   ͚ |  | _\infty |
|    | \par |  |  /​ | \slash |  |  ^ | \textasciicircum |  |  i︠a︡ | \t{ia} |  |
|  { | \{ |  |  } | \} |  |  ~ | \textasciitilde |  |  ¡ | \textexclamdown |  |
|  € | \texteuro |  |  ¨ | \textasciidieresis |  |  « | << |  |  ® | \textregistered |  |
|  ¯ | \textasciimacron |  |  ´ | \textasciiacute |  |  µ | \textmu |  |  ¸ | \c |  |
|  » | >> |  |  ¿ | \textquestiondown |  |  Æ | \AE |  |  Ð | \DH |  |
|  Ø | \O |  |  Þ | \TH |  |  ß | \ss |  |  å | \aa |  |
|  æ | \ae |  |  ð | \dh |  |  ø | \o |  |  þ | \th |  |
|  Đ | \DJ |  |  đ | \dj |  |  ĭ | {\u \i} |  |  Ĳ | \IJ |  |
|  ĳ | \ij |  |  ĵ | \^\j |  |  ĸ | K |  |  Ł | \L |  |
|  ł | \l |  |  ŉ | 'n |  |  Ŋ | \NG |  |  ŋ | \ng |  |
|  Œ | \OE |  |  œ | \oe |  |  ſ | s |  |  ƪ | \textesh |  |
|  ǂ | \textdoublepipe |  |  ɡ | g |  |  ʹ | ' |  |  ʻ | ' |  |
|  ʼ | ' |  |  ʽ | ' |  |  ˆ | \textasciicircum |  |  ˇ | \textasciicaron |  |
|  ˉ | - |  |  ˘ | \textasciibreve |  |  ˚ | \r{} |  |  ˛ | \k{} |  |
|  ˜ | \texttildelow |  |  ˝ | \textacutedbl |  |  ̀ | \` |  |  ́ | \' |  |
|  ̂ | \^ |  |  ̃ | \~ |  |  ̄ | \= |  |  ̆ | \u |  |
|  ̇ | \. |  |  ̈ | \" |  |  ̋ | \H |  |  ̌ | \v |  |
|  ̏ | \textdoublegrave |  |  ̖ | \textsubgrave |  |  ̣ | \d |  |  ̦ | \textcommabelow |  |
|  ̧ | \c |  |  ̨ | \k |  |  ͵ | , |  |  ; | ; |  |
|  Ί | {\'{}I} |  |  Ό | {\'{}O} |  |  ϐ | \Pisymbol{ppi022}{87} |  |  ѫ | \cyrchar\cyrbyus |  |
|  ѳ | \cyrchar\cyrfita |  |  ѵ | \cyrchar\cyrizh |  |  Ӆ | \cyrchar\CYRLDSC |  |  ӆ | \cyrchar\cyrldsc |  |
|  Ӎ | \cyrchar\CYRMDSC |  |  ӎ | \cyrchar\cyrmdsc |  |  ѣ | \cyrchar\cyryat |  |  Ё | \cyrchar\CYRYO |  |
|  Ђ | \cyrchar\CYRDJE |  |  Ѓ | \cyrchar{\'\CYRG} |  |  Є | \cyrchar\CYRIE |  |  Ѕ | \cyrchar\CYRDZE |  |
|  І | \cyrchar\CYRII |  |  Ї | \cyrchar\CYRYI |  |  Ј | \cyrchar\CYRJE |  |  Љ | \cyrchar\CYRLJE |  |
|  Њ | \cyrchar\CYRNJE |  |  Ћ | \cyrchar\CYRTSHE |  |  Ќ | \cyrchar{\'\CYRK} |  |  Ў | \cyrchar\CYRUSHRT |  |
|  Џ | \cyrchar\CYRDZHE |  |  А | \cyrchar\CYRA |  |  Б | \cyrchar\CYRB |  |  В | \cyrchar\CYRV |  |
|  Г | \cyrchar\CYRG |  |  Д | \cyrchar\CYRD |  |  Е | \cyrchar\CYRE |  |  Ж | \cyrchar\CYRZH |  |
|  З | \cyrchar\CYRZ |  |  И | \cyrchar\CYRI |  |  Й | \cyrchar\CYRISHRT |  |  К | \cyrchar\CYRK |  |
|  Л | \cyrchar\CYRL |  |  М | \cyrchar\CYRM |  |  Н | \cyrchar\CYRN |  |  О | \cyrchar\CYRO |  |
|  П | \cyrchar\CYRP |  |  Р | \cyrchar\CYRR |  |  С | \cyrchar\CYRS |  |  Т | \cyrchar\CYRT |  |
|  У | \cyrchar\CYRU |  |  Ф | \cyrchar\CYRF |  |  Х | \cyrchar\CYRH |  |  Ц | \cyrchar\CYRC |  |
|  Ч | \cyrchar\CYRCH |  |  Ш | \cyrchar\CYRSH |  |  Щ | \cyrchar\CYRSHCH |  |  Ъ | \cyrchar\CYRHRDSN |  |
|  Ы | \cyrchar\CYRERY |  |  Ь | \cyrchar\CYRSFTSN |  |  Э | \cyrchar\CYREREV |  |  Ю | \cyrchar\CYRYU |  |
|  Я | \cyrchar\CYRYA |  |  а | \cyrchar\cyra |  |  б | \cyrchar\cyrb |  |  в | \cyrchar\cyrv |  |
|  г | \cyrchar\cyrg |  |  д | \cyrchar\cyrd |  |  е | \cyrchar\cyre |  |  ж | \cyrchar\cyrzh |  |
|  з | \cyrchar\cyrz |  |  и | \cyrchar\cyri |  |  й | \cyrchar\cyrishrt |  |  к | \cyrchar\cyrk |  |
|  л | \cyrchar\cyrl |  |  м | \cyrchar\cyrm |  |  н | \cyrchar\cyrn |  |  о | \cyrchar\cyro |  |
|  п | \cyrchar\cyrp |  |  р | \cyrchar\cyrr |  |  с | \cyrchar\cyrs |  |  т | \cyrchar\cyrt |  |
|  у | \cyrchar\cyru |  |  ф | \cyrchar\cyrf |  |  х | \cyrchar\cyrh |  |  ц | \cyrchar\cyrc |  |
|  ч | \cyrchar\cyrch |  |  ш | \cyrchar\cyrsh |  |  щ | \cyrchar\cyrshch |  |  ъ | \cyrchar\cyrhrdsn |  |
|  ы | \cyrchar\cyrery |  |  ь | \cyrchar\cyrsftsn |  |  э | \cyrchar\cyrerev |  |  ю | \cyrchar\cyryu |  |
|  я | \cyrchar\cyrya |  |  ё | \cyrchar\cyryo |  |  ђ | \cyrchar\cyrdje |  |  ѓ | \cyrchar{\'\cyrg} |  |
|  є | \cyrchar\cyrie |  |  ѕ | \cyrchar\cyrdze |  |  і | \cyrchar\cyrii |  |  ї | \cyrchar\cyryi |  |
|  ј | \cyrchar\cyrje |  |  љ | \cyrchar\cyrlje |  |  њ | \cyrchar\cyrnje |  |  ћ | \cyrchar\cyrtshe |  |
|  ќ | \cyrchar{\'\cyrk} |  |  ў | \cyrchar\cyrushrt |  |  џ | \cyrchar\cyrdzhe |  |  Ѡ | \cyrchar\CYROMEGA |  |
|  ѡ | \cyrchar\cyromega |  |  Ѣ | \cyrchar\CYRYAT |  |  Ѥ | \cyrchar\CYRIOTE |  |  ѥ | \cyrchar\cyriote |  |
|  Ѧ | \cyrchar\CYRLYUS |  |  ѧ | \cyrchar\cyrlyus |  |  Ѩ | \cyrchar\CYRIOTLYUS |  |  ѩ | \cyrchar\cyriotlyus |  |
|  Ѫ | \cyrchar\CYRBYUS |  |  Ѭ | \cyrchar\CYRIOTBYUS |  |  ѭ | \cyrchar\cyriotbyus |  |  Ѯ | \cyrchar\CYRKSI |  |
|  ѯ | \cyrchar\cyrksi |  |  Ѱ | \cyrchar\CYRPSI |  |  ѱ | \cyrchar\cyrpsi |  |  Ѳ | \cyrchar\CYRFITA |  |
|  Ѵ | \cyrchar\CYRIZH |  |  Ѹ | \cyrchar\CYRUK |  |  ѹ | \cyrchar\cyruk |  |  Ѻ | \cyrchar\CYROMEGARND |  |
|  ѻ | \cyrchar\cyromegarnd |  |  Ѽ | \cyrchar\CYROMEGATITLO |  |  ѽ | \cyrchar\cyromegatitlo |  |  Ѿ | \cyrchar\CYROT |  |
|  ѿ | \cyrchar\cyrot |  |  Ҁ | \cyrchar\CYRKOPPA |  |  ҁ | \cyrchar\cyrkoppa |  |  ҂ | \cyrchar\cyrthousands |  |
|  ҈ | \cyrchar\cyrhundredthousands |  |  ҉ | \cyrchar\cyrmillions |  |  Ҍ | \cyrchar\CYRSEMISFTSN |  |  ҍ | \cyrchar\cyrsemisftsn |  |
|  Ҏ | \cyrchar\CYRRTICK |  |  ҏ | \cyrchar\cyrrtick |  |  Ґ | \cyrchar\CYRGUP |  |  ґ | \cyrchar\cyrgup |  |
|  Ғ | \cyrchar\CYRGHCRS |  |  ғ | \cyrchar\cyrghcrs |  |  Ҕ | \cyrchar\CYRGHK |  |  ҕ | \cyrchar\cyrghk |  |
|  Җ | \cyrchar\CYRZHDSC |  |  җ | \cyrchar\cyrzhdsc |  |  Ҙ | \cyrchar\CYRZDSC |  |  ҙ | \cyrchar\cyrzdsc |  |
|  Қ | \cyrchar\CYRKDSC |  |  қ | \cyrchar\cyrkdsc |  |  Ҝ | \cyrchar\CYRKVCRS |  |  ҝ | \cyrchar\cyrkvcrs |  |
|  Ҟ | \cyrchar\CYRKHCRS |  |  ҟ | \cyrchar\cyrkhcrs |  |  Ҡ | \cyrchar\CYRKBEAK |  |  ҡ | \cyrchar\cyrkbeak |  |
|  Ң | \cyrchar\CYRNDSC |  |  ң | \cyrchar\cyrndsc |  |  Ҥ | \cyrchar\CYRNG |  |  ҥ | \cyrchar\cyrng |  |
|  Ҧ | \cyrchar\CYRPHK |  |  ҧ | \cyrchar\cyrphk |  |  Ҩ | \cyrchar\CYRABHHA |  |  ҩ | \cyrchar\cyrabhha |  |
|  Ҫ | \cyrchar\CYRSDSC |  |  ҫ | \cyrchar\cyrsdsc |  |  Ҭ | \cyrchar\CYRTDSC |  |  ҭ | \cyrchar\cyrtdsc |  |
|  Ү | \cyrchar\CYRY |  |  ү | \cyrchar\cyry |  |  Ұ | \cyrchar\CYRYHCRS |  |  ұ | \cyrchar\cyryhcrs |  |
|  Ҳ | \cyrchar\CYRHDSC |  |  ҳ | \cyrchar\cyrhdsc |  |  Ҵ | \cyrchar\CYRTETSE |  |  ҵ | \cyrchar\cyrtetse |  |
|  Ҷ | \cyrchar\CYRCHRDSC |  |  ҷ | \cyrchar\cyrchrdsc |  |  Ҹ | \cyrchar\CYRCHVCRS |  |  ҹ | \cyrchar\cyrchvcrs |  |
|  Һ | \cyrchar\CYRSHHA |  |  һ | \cyrchar\cyrshha |  |  Ҽ | \cyrchar\CYRABHCH |  |  ҽ | \cyrchar\cyrabhch |  |
|  Ҿ | \cyrchar\CYRABHCHDSC |  |  ҿ | \cyrchar\cyrabhchdsc |  |  Ӏ | \cyrchar\CYRpalochka |  |  Ӄ | \cyrchar\CYRKHK |  |
|  ӄ | \cyrchar\cyrkhk |  |  Ӈ | \cyrchar\CYRNHK |  |  ӈ | \cyrchar\cyrnhk |  |  Ӌ | \cyrchar\CYRCHLDSC |  |
|  ӌ | \cyrchar\cyrchldsc |  |  Ӕ | \cyrchar\CYRAE |  |  ӕ | \cyrchar\cyrae |  |  Ә | \cyrchar\CYRSCHWA |  |
|  ә | \cyrchar\cyrschwa |  |  Ӡ | \cyrchar\CYRABHDZE |  |  ӡ | \cyrchar\cyrabhdze |  |  Ө | \cyrchar\CYROTLD |  |
|  ө | \cyrchar\cyrotld |  |  Ḝ | \c{\u{E}} |  |  ḝ | \c{\u{e}} |  |    | \enspace |  |
|     | \qquad |  |    | \; |  |    | \> |  |    | \hspace{0.166em} |  |
|    | \hphantom{0} |  |    | \hphantom{,} |  |    | \, |  |  ​ | \hspace{0pt} |  |
|  ‌ | \null |  |  ‐ | - |  |  ‑ | - |  |  ‒ | - |  |
|  – | -- |  |  — | --- |  |  ― | \texthorizontalbar |  |  ‖ | \textbardbl |  |
|  ‘ | ` |  |  ’ | ' |  |  ‚ | \quotesinglbase |  |  “ | `` |  |
|  ” | '' |  |  „ | ,, |  |  ‟ | \quotedblbase |  |  ‣ | > |  |
|  ․ | . |  |  ‥ | .. |  |  ‧ | - |  |    | \, |  |
|  ‹ | \guilsinglleft |  |  › | \guilsinglright |  |  ‾ | - |  |  ⁄ | \textfractionsolidus |  |
|  ⁈ | ?! |  |  ⁉ | !? |  |  ⁊ | 7 |  |  ⁠ | \nolinebreak |  |
|  ℀ | a/c |  |  ℁ | a/s |  |  ℃ | \textcelsius |  |  ℅ | c/o |  |
|  ℆ | c/u |  |  ℉ | F |  |  № | \textnumero |  |  ℗ | \textcircledP |  |
|  ℠ | \textservicemark |  |  ℡ | TEL |  |  ℧ | \textmho |  |  ℩ | \textriota |  |
|  ℮ | \textestimated |  |  Ⅰ | I |  |  Ⅱ | II |  |  Ⅲ | III |  |
|  Ⅳ | IV |  |  Ⅴ | V |  |  Ⅵ | VI |  |  Ⅶ | VII |  |
|  Ⅷ | VIII |  |  Ⅸ | IX |  |  Ⅹ | X |  |  Ⅺ | XI |  |
|  Ⅻ | XII |  |  Ⅼ | L |  |  Ⅽ | C |  |  Ⅾ | D |  |
|  Ⅿ | M |  |  ⅰ | i |  |  ⅱ | ii |  |  ⅲ | iii |  |
|  ⅳ | iv |  |  ⅴ | v |  |  ⅵ | vi |  |  ⅶ | vii |  |
|  ⅷ | viii |  |  ⅸ | ix |  |  ⅹ | x |  |  ⅺ | xi |  |
|  ⅻ | xii |  |  ⅼ | l |  |  ⅽ | c |  |  ⅾ | d |  |
|  ⅿ | m |  |  ∕ | / |  |  √ | \textsurd |  |  ␢ | \textblank |  |
|  ① | \ding{172} |  |  ② | \ding{173} |  |  ③ | \ding{174} |  |  ④ | \ding{175} |  |
|  ⑤ | \ding{176} |  |  ⑥ | \ding{177} |  |  ⑦ | \ding{178} |  |  ⑧ | \ding{179} |  |
|  ⑨ | \ding{180} |  |  ⑩ | \ding{181} |  |  ⑪ | (11) |  |  ⑫ | (12) |  |
|  ⑬ | (13) |  |  ⑭ | (14) |  |  ⑮ | (15) |  |  ⑯ | (16) |  |
|  ⑰ | (17) |  |  ⑱ | (18) |  |  ⑲ | (19) |  |  ⑳ | (20) |  |
|  ⑴ | (1) |  |  ⑵ | (2) |  |  ⑶ | (3) |  |  ⑷ | (4) |  |
|  ⑸ | (5) |  |  ⑹ | (6) |  |  ⑺ | (7) |  |  ⑻ | (8) |  |
|  ⑼ | (9) |  |  ⑽ | (10) |  |  ⑾ | (11) |  |  ⑿ | (12) |  |
|  ⒀ | (13) |  |  ⒁ | (14) |  |  ⒂ | (15) |  |  ⒃ | (16) |  |
|  ⒄ | (17) |  |  ⒅ | (18) |  |  ⒆ | (19) |  |  ⒇ | (20) |  |
|  ⒈ | 1. |  |  ⒉ | 2. |  |  ⒊ | 3. |  |  ⒋ | 4. |  |
|  ⒌ | 5. |  |  ⒍ | 6. |  |  ⒎ | 7. |  |  ⒏ | 8. |  |
|  ⒐ | 9. |  |  ⒑ | 10. |  |  ⒒ | 11. |  |  ⒓ | 12. |  |
|  ⒔ | 13. |  |  ⒕ | 14. |  |  ⒖ | 15. |  |  ⒗ | 16. |  |
|  ⒘ | 17. |  |  ⒙ | 18. |  |  ⒚ | 19. |  |  ⒛ | 20. |  |
|  ⒜ | (a) |  |  ⒝ | (b) |  |  ⒞ | (c) |  |  ⒟ | (d) |  |
|  ⒠ | (e) |  |  ⒡ | (f) |  |  ⒢ | (g) |  |  ⒣ | (h) |  |
|  ⒤ | (i) |  |  ⒥ | (j) |  |  ⒦ | (k) |  |  ⒧ | (l) |  |
|  ⒨ | (m) |  |  ⒩ | (n) |  |  ⒪ | (o) |  |  ⒫ | (p) |  |
|  ⒬ | (q) |  |  ⒭ | (r) |  |  ⒮ | (s) |  |  ⒯ | (t) |  |
|  ⒰ | (u) |  |  ⒱ | (v) |  |  ⒲ | (w) |  |  ⒳ | (x) |  |
|  ⒴ | (y) |  |  ⒵ | (z) |  |  ─ | - |  |  ┄ | - |  |
|  ┈ | - |  |  ╌ | - |  |  ╲ | \ |  |  ╳ | X |  |
|  ╼ | - |  |  ╾ | - |  |  ■ | \ding{110} |  |  ▲ | \ding{115} |  |
|  ▼ | \ding{116} |  |  ◗ | \ding{119} |  |  ◦ | \textopenbullet |  |  ★ | \ding{72} |  |
|  ☆ | \ding{73} |  |  ☎ | \ding{37} |  |  ☓ | X |  |  ☛ | \ding{42} |  |
|  ♀ | \venus |  |  ♥ | \ding{170} |  |  ♦ | \ding{169} |  |  ♪ | \textmusicalnote |  |
|  ✁ | \ding{33} |  |  ✂ | \ding{34} |  |  ✃ | \ding{35} |  |  ✄ | \ding{36} |  |
|  ✆ | \ding{38} |  |  ✇ | \ding{39} |  |  ✈ | \ding{40} |  |  ✉ | \ding{41} |  |
|  ✌ | \ding{44} |  |  ✍ | \ding{45} |  |  ✏ | \ding{47} |  |  ✐ | \ding{48} |  |
|  ✑ | \ding{49} |  |  ✒ | \ding{50} |  |  ✓ | \ding{51} |  |  ✔ | \ding{52} |  |
|  ✕ | \ding{53} |  |  ✖ | \ding{54} |  |  ✘ | \ding{56} |  |  ✙ | \ding{57} |  |
|  ✚ | \ding{58} |  |  ✛ | \ding{59} |  |  ✜ | \ding{60} |  |  ✝ | \ding{61} |  |
|  ✞ | \ding{62} |  |  ✟ | \ding{63} |  |  ✠ | \ding{64} |  |  ✡ | \ding{65} |  |
|  ✢ | \ding{66} |  |  ✣ | \ding{67} |  |  ✤ | \ding{68} |  |  ✥ | \ding{69} |  |
|  ✦ | \ding{70} |  |  ✧ | \ding{71} |  |  ✩ | \ding{73} |  |  ✪ | \ding{74} |  |
|  ✫ | \ding{75} |  |  ✬ | \ding{76} |  |  ✭ | \ding{77} |  |  ✮ | \ding{78} |  |
|  ✯ | \ding{79} |  |  ✰ | \ding{80} |  |  ✱ | \ding{81} |  |  ✲ | \ding{82} |  |
|  ✳ | \ding{83} |  |  ✴ | \ding{84} |  |  ✵ | \ding{85} |  |  ✶ | \ding{86} |  |
|  ✷ | \ding{87} |  |  ✸ | \ding{88} |  |  ✹ | \ding{89} |  |  ✺ | \ding{90} |  |
|  ✻ | \ding{91} |  |  ✼ | \ding{92} |  |  ✽ | \ding{93} |  |  ✾ | \ding{94} |  |
|  ✿ | \ding{95} |  |  ❀ | \ding{96} |  |  ❁ | \ding{97} |  |  ❂ | \ding{98} |  |
|  ❃ | \ding{99} |  |  ❄ | \ding{100} |  |  ❅ | \ding{101} |  |  ❆ | \ding{102} |  |
|  ❇ | \ding{103} |  |  ❈ | \ding{104} |  |  ❉ | \ding{105} |  |  ❊ | \ding{106} |  |
|  ❋ | \ding{107} |  |  ❍ | \ding{109} |  |  ❏ | \ding{111} |  |  ❐ | \ding{112} |  |
|  ❑ | \ding{113} |  |  ❒ | \ding{114} |  |  ❖ | \ding{118} |  |  ❘ | \ding{120} |  |
|  ❙ | \ding{121} |  |  ❚ | \ding{122} |  |  ❛ | \ding{123} |  |  ❜ | \ding{124} |  |
|  ❝ | \ding{125} |  |  ❞ | \ding{126} |  |  ❡ | \ding{161} |  |  ❢ | \ding{162} |  |
|  ❣ | \ding{163} |  |  ❤ | \ding{164} |  |  ❥ | \ding{165} |  |  ❦ | \ding{166} |  |
|  ❧ | \ding{167} |  |  ❶ | \ding{182} |  |  ❷ | \ding{183} |  |  ❸ | \ding{184} |  |
|  ❹ | \ding{185} |  |  ❺ | \ding{186} |  |  ❻ | \ding{187} |  |  ❼ | \ding{188} |  |
|  ❽ | \ding{189} |  |  ❾ | \ding{190} |  |  ❿ | \ding{191} |  |  ➀ | \ding{192} |  |
|  ➁ | \ding{193} |  |  ➂ | \ding{194} |  |  ➃ | \ding{195} |  |  ➄ | \ding{196} |  |
|  ➅ | \ding{197} |  |  ➆ | \ding{198} |  |  ➇ | \ding{199} |  |  ➈ | \ding{200} |  |
|  ➉ | \ding{201} |  |  ➊ | \ding{202} |  |  ➋ | \ding{203} |  |  ➌ | \ding{204} |  |
|  ➍ | \ding{205} |  |  ➎ | \ding{206} |  |  ➏ | \ding{207} |  |  ➐ | \ding{208} |  |
|  ➑ | \ding{209} |  |  ➒ | \ding{210} |  |  ➓ | \ding{211} |  |  ➔ | \ding{212} |  |
|  ➘ | \ding{216} |  |  ➙ | \ding{217} |  |  ➚ | \ding{218} |  |  ➛ | \ding{219} |  |
|  ➜ | \ding{220} |  |  ➝ | \ding{221} |  |  ➞ | \ding{222} |  |  ➟ | \ding{223} |  |
|  ➠ | \ding{224} |  |  ➡ | \ding{225} |  |  ➣ | \ding{227} |  |  ➤ | \ding{228} |  |
|  ➥ | \ding{229} |  |  ➦ | \ding{230} |  |  ➧ | \ding{231} |  |  ➨ | \ding{232} |  |
|  ➩ | \ding{233} |  |  ➪ | \ding{234} |  |  ➫ | \ding{235} |  |  ➬ | \ding{236} |  |
|  ➭ | \ding{237} |  |  ➮ | \ding{238} |  |  ➯ | \ding{239} |  |  ➱ | \ding{241} |  |
|  ➲ | \ding{242} |  |  ➳ | \ding{243} |  |  ➴ | \ding{244} |  |  ➵ | \ding{245} |  |
|  ➶ | \ding{246} |  |  ➷ | \ding{247} |  |  ➸ | \ding{248} |  |  ➹ | \ding{249} |  |
|  ➺ | \ding{250} |  |  ➻ | \ding{251} |  |  ➼ | \ding{252} |  |  ➽ | \ding{253} |  |
|  ➾ | \ding{254} |  |  ﬀ | ff |  |  ﬁ | fi |  |  ﬂ | fl |  |
|  ﬃ | ffi |  |  ﬄ | ffl |  |  ﬅ | st |  |  ﬆ | st |  |
|  � | \dbend |  |  ⁒ | \textdiscount |  |  ‽ | \textinterrobang |  |  ※ | \textreferencemark |  |
|  Ŧ | \textTstroke |  |  ŧ | \texttstroke |  |  ˋ | \textasciigrave |  |  Α |  | A |
|  Β |  | B |  Ε |  | E |  Ζ |  | Z |  Η |  | H |
|  Ι |  | I |  Κ |  | K |  Μ |  | M |  Ν |  | N |
|  Ο |  | O |  Ρ |  | P |  Τ |  | T |  Χ |  | X |
|  ο |  | o |  ℊ |  | g |  ℐ |  | I |  ℒ |  | L |
|  ℛ |  | R |  ℬ |  | B |  ℯ |  | e |  ℰ |  | E |
|  ℱ |  | F |  ℳ |  | M |  ℴ |  | o |  𝒜 |  | A |
|  𝒞 |  | C |  𝒟 |  | D |  𝒢 |  | G |  𝒥 |  | J |
|  𝒦 |  | K |  𝒩 |  | N |  𝒪 |  | O |  𝒫 |  | P |
|  𝒬 |  | Q |  𝒮 |  | S |  𝒯 |  | T |  𝒰 |  | U |
|  𝒱 |  | V |  𝒲 |  | W |  𝒳 |  | X |  𝒴 |  | Y |
|  𝒵 |  | Z |  𝒶 |  | a |  𝒷 |  | b |  𝒸 |  | c |
|  𝒹 |  | d |  𝒻 |  | f |  𝒽 |  | h |  𝒾 |  | i |
|  𝒿 |  | j |  𝓀 |  | k |  𝓁 |  | l |  𝓂 |  | m |
|  𝓃 |  | n |  𝓅 |  | p |  𝓆 |  | q |  𝓇 |  | r |
|  𝓈 |  | s |  𝓉 |  | t |  𝓊 |  | u |  𝓋 |  | v |
|  𝓌 |  | w |  𝓍 |  | x |  𝓎 |  | y |  𝓏 |  | z |
|  Ⓐ | (A) |  |  Ⓑ | (B) |  |  Ⓒ | (C) |  |  Ⓓ | (D) |  |
|  Ⓔ | (E) |  |  Ⓕ | (F) |  |  Ⓖ | (G) |  |  Ⓗ | (H) |  |
|  Ⓘ | (I) |  |  Ⓙ | (J) |  |  Ⓚ | (K) |  |  Ⓛ | (L) |  |
|  Ⓜ | (M) |  |  Ⓝ | (N) |  |  Ⓞ | (O) |  |  Ⓟ | (P) |  |
|  Ⓠ | (Q) |  |  Ⓡ | (R) |  |  Ⓣ | (T) |  |  Ⓤ | (U) |  |
|  Ⓥ | (V) |  |  Ⓦ | (W) |  |  Ⓧ | (X) |  |  Ⓨ | (Y) |  |
|  Ⓩ | (Z) |  |  ⓐ | (a) |  |  ⓑ | (b) |  |  ⓒ | (c) |  |
|  ⓓ | (d) |  |  ⓔ | (e) |  |  ⓕ | (f) |  |  ⓖ | (g) |  |
|  ⓗ | (h) |  |  ⓘ | (i) |  |  ⓙ | (j) |  |  ⓚ | (k) |  |
|  ⓛ | (l) |  |  ⓜ | (m) |  |  ⓝ | (n) |  |  ⓞ | (o) |  |
|  ⓟ | (p) |  |  ⓠ | (q) |  |  ⓡ | (r) |  |  ⓢ | (s) |  |
|  ⓣ | (t) |  |  ⓤ | (u) |  |  ⓥ | (v) |  |  ⓦ | (w) |  |
|  ⓧ | (x) |  |  ⓨ | (y) |  |  ⓩ | (z) |  |  ⓪ | (0) |  |
|  ━ | = |  |  │ | | |  |  ┃ | | |  |  ┅ | = |  |
|  ┇ | | |  |  ┉ | = |  |  ┊ | | |  |  ┋ | | |  |
|  ╍ | = |  |  ╎ | | |  |  ╏ | | |  |  ═ | = |  |
|  ║ | | |  |  ╽ | | |  |  ╿ | | |  |  | |  |


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

