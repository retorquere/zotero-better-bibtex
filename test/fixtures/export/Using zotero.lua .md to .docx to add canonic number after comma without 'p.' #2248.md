---
title: 'The rhetoric of tests'
bibliography: library.json
csl: apa7.csl
zotero:
	csl-style: apa
papersize: a4
---

\newpage
# The rhetoric of tests: Zotero, BBT, and `pandoc --lua-filter=zotero.lua 05_Analysis_test.md -o 05_Analysis_test.docx`

## Original doc references

Aristotle [-@Aristotle2006RhetoricTheory{}, 1365b] \[This one should render as 
`Aristotle (ca. 322 B.C.E./2006, 1365b)`\] distinguished three rhetorical genres based on how the audience judges an argument: deliberative, judged by what is useful or beneficial; judicial, by what is factual or just; and epideictic, by what is great or beautiful.

\[...\]

In this chapter I lean towards the other movement of rhetorical psychology: how we think by continuing and transforming ideological traditions [@Billig1991IdeologyOpinions, esp. chapters 1 and 6] \[this  one should rended as (Billig, 1991, esp. chapters 1 and 6)\].

## References for testing
### Input
```
1. [@Billig1991IdeologyOpinions, one suffix after comma]
2. [@Billig1991IdeologyOpinions 2 suffix without comma]
3. [@Billig1991IdeologyOpinions, 3 suffix after comma with number]
4. [@Billig1991IdeologyOpinions, iv wordAfterRoman]
5. [@Billig1991IdeologyOpinions, one]
6. [@Billig1991IdeologyOpinions, p. vi]
7. [@Billig1991IdeologyOpinions a seventh case without comma]

# Equivalent to Pandoc Manual's examples

9. [@Billig1991IdeologyOpinions{ii, A, D-Z}, with a suffix]  
10. [@Billig1991IdeologyOpinions, {pp. iv, vi-xi, (xv)-(xvii)} with suffix here]   
11. [@Billig1991IdeologyOpinions{}, 99 years later]  
```

### Expected (citeproc) output

```
1. (Billig, 1991, one suffix after comma)
2. (Billig, 1991, p. 2 suffix without comma)
3. (Billig, 1991, p. 3 suffix after comma with number)
4. (Billig, 1991, iv wordAfterRoman)
5. (Billig, 1991, one)
6. (Billig, 1991, p. vi)
7. (Billig, 1991 a seventh case without comma)

# Equivalent to Pandoc Manual's examples

9. (Billig, 1991, ii, A, D-Z, with a suffix] )
10. (Billig, 1991, pp. iv, vi-xi, (xv)-(xvii) with suffix here)
11. (Billig, 1991, 99 years later)  
```

### Actual output
1. [@Billig1991IdeologyOpinions, one suffix after comma]  
2. [@Billig1991IdeologyOpinions 2 suffix without comma]  
3. [@Billig1991IdeologyOpinions, 3 suffix after comma with number]  
4. [@Billig1991IdeologyOpinions, iv wordAfterRoman]  
5. [@Billig1991IdeologyOpinions, one]  
6. [@Billig1991IdeologyOpinions, p. vi]  
7. [@Billig1991IdeologyOpinions a seventh case without comma]  

#### Equivalent to Pandoc Manual's examples

9. [@Billig1991IdeologyOpinions{ii, A, D-Z}, with a suffix]  
10. [@Billig1991IdeologyOpinions, {pp. iv, vi-xi, (xv)-(xvii)} with suffix here]   
11. [@Billig1991IdeologyOpinions{}, 99 years later]  


### Manually adjusted output with citation picker
1. [@Billig1991IdeologyOpinions, one suffix after comma]  
2. [@Billig1991IdeologyOpinions 2 suffix without comma]  
3. [@Billig1991IdeologyOpinions, 3 suffix after comma with number]  
4. [@Billig1991IdeologyOpinions, iv wordAfterRoman]  
5. [@Billig1991IdeologyOpinions, one]  
6. [@Billig1991IdeologyOpinions, p. vi]  
7. [@Billig1991IdeologyOpinions a seventh case without comma]  

#### Equivalent to Pandoc Manual's examples

9. [@Billig1991IdeologyOpinions{ii, A, D-Z}, with a suffix]  
10. [@Billig1991IdeologyOpinions, {pp. iv, vi-xi, (xv)-(xvii)} with suffix here]   
11. [@Billig1991IdeologyOpinions{}, 99 years later]  


\newpage
# References

::: {#refs}
:::
