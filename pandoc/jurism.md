---
title: "(my title)"
author: Ryan Ka Yau Lai
output:
  word_document: default
  bookdown::word_document2: default
zotero:
  scannable-cite: false # only relevant when your compiling to scannable-cite .odt
  client: jurism # defaults to zotero
  author-in-text: false # when true, enabled fake author-name-only cites by replacing it with the text of the last names of the authors
  csl-style: apa # pre-fill the style
---
# Introduction

The course \textit{Advanced Software Design} is built around the achievement-driven learning methodology [@wrigstad2017mastery]
(more details in [@sec:theory]).
This methodology gives students more  control of their
learning with enough flexibility to engage them in deeper learning [@biggsTang2011].
Yet, year after year, although the course \textit{Advanced Software Design} has increased in the number
of students, we observed that students do not pursue higher grades.
In this course, a higher grade implies the possibility of deeper learning, as students need
to justify the design choices of the software-under-construction and they
cannot just memorise solutions (Section \ref{sec:theory} explains more details).

To motivate students to pursue higher grades and deeper learning,
we designed a new opt-in game on top of the achievement-driven learning methodology,
adding gaming elements such as leaderboard, cards and points. To answer whether the enjoyment
and motivation provided by the game has an effect on grades we built
a regression model
that explains 55\% of the variation in grades.

The paper makes the following contributions:

\begin{itemize}
\item Gamification of the achievement-driven learning method
\item Evidence that students motivated by the game get higher grades
\item Implementation experience.
\end{itemize}

# Theory {#sec:theory}

## Achievement-driven learning methodology {#sec:achievement-driven}

The learning outcomes specified to help students succeed with their courses [@biggs1996, p. 20] are often necessarily at a high level, for instance to allow course content to change more fluidly, and thus arguably do not help students as much as they should. Five to ten goals might be specified for a course, but this does not tell a student what needs to be done to earn a specific grade. Indeed, often the learning outcomes can only be fully understood by someone who has completed the course.

To make these learning outcomes more achievable, comprehensible and accessible,
Tobias Wrigstad and Elias Castegren [@wrigstad2017mastery]  developed a new
assessment technique, called \textit{achievement-driven learning}, based on a more fine-grained collection of achievements, which taken together encompass the course's learning outcomes, but are more achievable when taken individually. The list of achievements makes more explicit what a student needs to master in order to pass the course, but also to achieve higher grades. In a sense, achievement-driven learning refines constructive alignment to the micro level and provides a means for linking learning outcomes with assessment activities---it aims to hit a sweet spot in the constructive alignment design space.

In achievement-driven learning, students are presented with a number of achievements (21 in Advanced Software Design) that need to be satisfactorily demonstrated to achieve each grade. Achievements are divided into 3 groups (3, 4, 5)\footnote{In many courses at Uppsala University, grades are given from a 4-point scale, U (fail),
3 (pass), 4 (pass with distinction), and 5 (pass with excellence).}, and students need to demonstrate all 3s to get a 3, all 3s and 4s to get a 4 and all achievements to get a 5. Demonstration of achievements involves a dialogue with a teaching assistant, which creates a reason to interact with knowledgable assistants beyond
the usual correction of assignments and troubleshooting, and feedback comes naturally. Feedback, of course, enhances learning quality [@hattie2012].

Achievement-driven learning adopts aspects of mastery learning [@bloom1974].
Students are required to master all achievements specified for each given grade, and achievements must be retried until the teaching assistant is satisfied. This gives students freedom to fail, but also ensures that students passing the course do actually satisfy the learning outcomes---in contrast, grading schemes in which students only need to obtain a certain number of points do not guarantee coverage of the learning outcomes.

Typically, there are far too many achievements to demonstrate all individually during the time available (certainly, to obtain higher grades). To counter this, achievement-driven learning encourages students to see the relationship between multiple achievements, and to group and demonstrate them coherently together. Not only does this reduce their workload, it forces students to search for the connections between topics. Achievements can often be grouped vertically: level 5 achievements on a certain topic often encompass level 3 and level 4 achievements on the same topic---the quality of learning being demonstrated is the key difference. Achievements can also be grouped horizontally: a single presentation can be used to demonstrate achievements addressing different topics, assuming that students establish the relationship between the topics within their presentation. In a sense, achievement-driven learning forces students to solve a puzzle in order to optimise their time---similar to ideas underlying gamification [@leeHammer2011]---and as a result they are compelled to explore the connections between concepts. The idea of vertical combinations of achievements is compatible with the requirement of the Bologna Process that greater \textit{quality} of work \textbf{not} greater \textit{quantity} earns higher grades [@bolognaDeclaration].

Achievement-driven learning has a lot in common with self-regulatory learning, which sees successful learners as able to plan, set goals, organise, self-monitor, and self-evaluate [@zimmerman1986], then the teaching assistant can stop the demonstration. Students are not only forced to plan, but they need to evaluate whether their plan will be good enough---although having a demonstration `failed' does not directly affect a student's grade, only a finite number of opportunities to demonstrate are available. In general students need to reflect on their learning as a whole, and cannot simply hope to get by without engaging with the material. Students are forced to determine their own learning trajectory. Indeed, students are free to choose the most appropriate form of examination, avoiding examination formats that do not match the task at hand (e.g., a written exam for a software design process). Achievement-driven learning puts more responsibility on students for their own education, while providing more freedom in how they embrace the subject. To clarify for the student what she actually can do, thereby building both self-awareness and self-confidence, more so that an standard collection of learning outcomes, and flexibility motivates students to engage in deeper learning [@biggsTang2011].

Achievement-driven learning is similar to Clark's approach based on Student Observable Behaviours (SOBs) [@clark2013]. SOBs are similar to achievements and software exists to support both schemes. A major difference is that achievement-driven learning compels students to combine achievements and understand the relationship between topics.

The achievement list is presented to students at the start of the course and it is made clear which ones need to be completed in order to get each grade (3, 4, 5). In this respect an achievement list resembles a grading criteria, and literature on the impact of good grading criteria on learning [@rustPrice2003] is arguably applicable to achievement-driven learning. A key difference is the
combination of achievement that students must explore to construct their own demonstrations.

## Gamification

Gamification refers to the use of game elements in non-gaming environments [@deterding2011game].
Gamification in education is not a new idea [@huang2013gamification;@dicheva2015gamification;@gamification-leaderboard-benefits]
and courses that use gamification elements do not put the emphasis on the game,
rather it uses the game as a motivational and driving factor.
Thus, the most important benefit is its potential to increase students' motivation
and engagement [@SEABORN201514;@gamification-leaderboard-benefits].
There are two types of gamification: reward-based and meaningful [@oldwine]. Reward-based uses badges,
leaderboards and achievements -- external elements -- as a way of measuring progress;
meaningful gamification strategies try to find a connection with the participant -- intrinsic motivation.
From the psychological point of view, these match with extrinsic and intrinsic motivational factors [@intrinsic-book;@psychologyMotivation;@RYAN200054]. Motivation is
\textit{extrinsic} if an individual is motivated
by external factors, e.g. recognition after completion of a task
and \textit{intrinsic} if an individual
experiences joy when performing a task  .
The use of gamification in the learning process can trigger both extrinsic and intrinsic motivation,
which could induce deep learning and higher grades.

Therefore we derive the following hypothesis:

\begin{description}
\item[H] Motivation and enjoyment from gamification increases grades.
\end{description}

# Background

Advanced Software Design is a masters-level course taught
in the Department of Information Technology
at Uppsala University.
The course covers topics such as object-oriented analysis
and design, domain modelling, software architecture,
class and object modelling, behavioural modelling, design
patterns, GRASP principles, design evaluation,
and design improvement/refactoring. The course does not involve
any programming, and instead uses UML, text, and
oral presentation as the means for recording  and
communicating designs.
Students taking the course are
expected to have a solid background in programming,
in particular in object-oriented programming.
The course offers 8--10 interactive lectures describing
the material and a course-long project.
Students form teams on their own (of 4 members and they are encouraged to
diversify the team's skill set) and work together on the
achievements. Teams get a fixed teacher assistant (TA) for the duration of the course.
Each team has a weekly, thirty-minute-long
meeting and feedback sessions with a TA.
During the meetings team members are evaluated individually, i.e. some team members
may pass an achievement while others will have to try
again in the next meeting.
The assessment scheme for the project is based
on achievement-driven learning [@wrigstad2017mastery],
as described in Section [@sec:achievement-driven].
There is a total of 21 achievements\footnote{Link to the overview, achievement goals and requirements: \url{https://goo.gl/CNLLLg}}: 11 achievements
of level 3, 9 achievements of level 4 and a single individual
achievement of level 5. There is no exam.

# Methodology {#sec:methodology}

\begin{figure}[t]
\begin{tabular}{|c|c|}
\hline
Achievement & Points \\
Grade & \\
\hline
3 & 50 \\
\hline
4 & 100 \\
\hline
\end{tabular}
\caption{\label{fig:point-system}Number of points of each achievement. Students get \textit{floor(points/100)} cards per meeting.}
\end{figure}

\begin{figure}[t]
\begin{tabular}{|r|l|l|}
\hline
Category & Name & Overview \\
\hline
& Thief & Steal 20 points from \\
&& leading team \\ \cline{2-3}
Attacks & Master Thief & Steal 20 points from \\
&& two teams \\ \cline{2-3}
& Destroyer & Reduce 50 points of \\
&& chosen team \\ \cline{2-3}
& Longinus Spear & Impale up-to 3 teams, steal \\
&&20 points from each team \\ \cline{2-3}
\hline
& Safe pockets & Protection against Thieves  \\ \cline{2-3}
Shields & Safe box & Protection against \\
&& (Master) Thieves \\ \cline{2-3}
& Self preservation & Protection against Destroyer  \\ \cline{2-3}
\hline
Others & Death note & Forbids chosen team from \\
&& making a move\\ \cline{2-3}
& Sell out & System buys card for 30 points \\ \cline{2-3}
\hline
\end{tabular}
\caption{\label{fig:available-cards}Cards available in the game.}
\end{figure}

## The Game {#sec:the-game}

We developed a game of top of the achievement-driven learning methodology.
This game uses points, leaderboards and cards and
is played at a meta-level, i.e.
the game is not related to the software design process but rather
it uses the achievements passed by teams during the meetings as its internal structure,
e.g. to give cards to a team so that they can use them to perform some special action in the game such
as stealing points from other team.
\textit{Students earn points by passing achievements and by playing the game, but
points won or lost in the game do not influence the number of achievements passed or the final grade.}

Students form teams and teams are place randomly in mini-competitions (made up of 4 teams) that are course-wide;
the team with most points wins.
Each achievement has a fixed number of points, linked to its level (Figure \ref{fig:point-system}):
students who pass achievements of level 3 get 50 points, students who pass achievements
of level 4 get 100 points.
Teams demonstrate their knowledge to the TA and gain the total sum of the points in the achievements that
they successfully pass each week. The more points a team gets, the more cards a team can draw;
teams draw \textit{floor(number of points/100)} cards per meeting
(cards are randomly drawn from an online number generator).
Cards allow teams to attack to each other (subtracting points), steal points (subtract-and-gain points),
block teams from using cards and even raise their own score
(Figures \ref{fig:available-cards} and \ref{fig:ncards}). Each card
has a priority number, which is randomly generated when students get a card, and this
number establishes the order in which the cards are applied, within each round of the competition.
Cards with higher priority number will be played before cards with a lower number.
This system removes the advantage that some teams may get by scheduling meetings early in the week
since the priority number is randomly generated.

Teams may decide to keep cards and use them all in the last meeting of the game
or they may decide to play them as they come. Ultimately, the strategy is in their own hands.

Each week the TAs have meetings with the teams, who prove their knowledge presenting achievements
and the teams get the corresponding points and cards. Teams tell TAs which cards they would like to
use and the TAs collect this information (cards and their priorities). Based on this information,
the TAs make up a story timeline of what happens when they applied the cards (based on their priorities),
always trying to be funny and unpredictable as well as to encourage students when they put effort and performed well.

For example, the team \textit{Yin Yang} passed at least 2 achievements of level 3 in week 46 (granting them
a card) and they got a \textit{Thief} card with a high priority number. They decided to use it that week, which led to the following
comment in the story timeline:

\begin{quote}
Yin Yang are sneaky and steal from (team) Number One, 20 points (using a Thief card).
Number One is still on the lead, but not by far. This is going to be a tough competition.
\end{quote}

An example of encouragement words to keep them motivated:

\begin{quote}
Team Number One got 100 points again.
They seem to have found the sweet spot to tick off achievements!
\end{quote}

The story timeline shows the classification before and after the application of cards.

## Gaming design

The game is optional and does
not link the game to the final grade (avoids creation of parallel assessment routes [@glover2013play]).
If the students decide to not participate, the course takes
place as in previous years. From the beginning, we told students that
they have nothing to lose and they should try the game.

The main idea was to foster competition, motivation, engagement and higher grades with the introduction
of the gaming elements (points, a leaderboard and cards). As mentioned before,
students form teams placed randomly in mini-competitions;
the use of mini-competitions serves to keep
teams always close to each other, preventing  a team being put in a far-from-the-top position,
which can be discouraging [@gamification-brain-trust].

To make the game appealing, we added the card system
and we release new cards each week, to prevent stagnation.
The introduction of cards and leaderboard for the mini-competition introduces extrinsic
motivation [@zichermann2011gamification].

To counteract the fact that students have meetings at different times during the week,
the game is not played in real time, but cards are played at the end of each week based
on a random priority assigned to the cards,  as explained in Section [@sec:the-game].

Finally, we created a story timeline, so that students know why they get different
points from the ones collected during the meetings (due to attacks, shields, etc).

In terms of platform, we used Google Spreadsheets\footnote{https://goo.gl/iZLS5p} with three tabs:
\begin{description}
\item[Leaderboard:] contains the leaderboard and the rules
\item[Timeline:] contains the timeline for each mini-competition
\item[Cards:] contains the number of cards, which ones have been just released and clear explanation
\end{description}

The main reason for using Google Spreadsheets was that it is
simple to use, platform agnostic (no need to commit to any platform)
and let us connect Google Analytics to gain further insights.


# Evaluation: Questionnaire and variable measurement
As part of evaluating the gamification methodology students were asked to answer two questions about their experience with the game. First, we asked to which extent they enjoyed the game, which became our independent variable "Enjoy". Students answered on a Likert scale from 1 ("Not at all") to 5 ("Loved it"). Second, students reported on a Likert scale from 1 ("I didn't bother") to 5 ("I tried to get as many as possible") to which degree the game competition motivated them to get more cards, which became our independent variable "Motivation".

Our dependent variable "Grade" was computed from 2 to 5, 2 being suspended, 3 being pass, 4 being pass with distinction, and 5 being pass with excellence. The boxes "Enjoy", "Grade" and "Motivation" ([@fig:matrix]) show the distribution and frequency of responses for our 3 variables.

Questionnaire responses were anonymous within teams, meaning that we could not identify individual responses or names within teams, except for 3 individuals who got different grades than their team members and were personally asked whether they wanted to share their answer for data matching purposes.

# Results and Discussion

\begin{table*}[t]
\centering
\begin{tabular}{|r|r|r|r|r|r|r|r|r|r|r|r|r|}
\hline
 & vars & n & mean & sd & median & trimmed & min & max & range & skew & kurtosis & se \\
\hline
Enjoyment & 1 & 71 & 2.79 & 1.57 & 3 & 2.74 & 1 & 5 & 4 & 0.10 & -1.60 & 0.19 \\
\hline
Motivation & 2 & 71 & 2.65 & 1.64 & 2 & 2.56 & 1 & 5 & 4 & 0.22 & -1.67 & 0.19 \\
\hline
Grade & 3 & 71 & 3.65 & 0.81 & 3 & 3.60 & 2 & 5 & 3 & 0.39 & -0.91 & 0.10 \\
\hline
\end{tabular}
\caption{\label{tbl:statistics}Descriptive statistics. \emph{sd} stands for \emph{standard deviation}
and \emph{se} for \emph{standard error}}
\end{table*}


Statistical analyses were performed using R version 3.5.0.

71 students answered the questionnaire providing 71 observations without missing data. Table \ref{tbl:statistics} shows descriptive statistics of our 3 variables, including means, standards deviations, skewness and kurtosis scores.
The Pearson correlation matrix in Table \ref{tbl:pearson} shows that both "Motivation" and "Enjoyment" are positively correlated with our dependent variable "Grades". The correlation between the two independent variables is below $0.90$, meaning that we do not seem to have issues with multicollinearity. The scatterplot matrix (Figure \ref{fig:matrix}) confirms furthermore that the relationships between our 3 variables are linear. For example, the upper right box shows a linear correlation between "Motivation" on the x-axis and "Enjoyment" on the y-axis.

\begin{table}[t]
\begin{tabular}{|r|l|l|l|}
\hline
 & Enjoyment & Motivation & Grade \\
 \hline
 Enjoyment & 1.0000000 & 0.8659292 & 0.6927165\\
 \hline
 Motivation & 0.8659292 & 1.0000000 & 0.7313952 \\
 \hline
 Grade & 0.6927165  & 0.7313952 & 1.0000000 \\
 \hline
\end{tabular}
\caption{\label{tbl:pearson}Pearson correlation}
\end{table}

\begin{table}
\begin{tabular}{|r|l|l|l|l|}
\hline
& Estimate & Std. Error & t value & Pr(>|t|)  \\
 \hline
(Intercept)  & 2.61479 &   0.13519  & 19.342 & < 2e-16 *** \\
 \hline
Enjoyment &        0.12307 &    0.08442 &   1.458 &  0.14949     \\
 \hline
Motivation &   0.26054 &    0.08067 &   3.230 &  0.00191 **  \\
 \hline
 \multicolumn{5}{|l|}{ Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1} \\
 \hline
 \multicolumn{5}{|l|}{Residual standard error: 0.5535 on 68 degrees of freedom} \\
 \multicolumn{5}{|l|}{Multiple R-squared:  0.549,	Adjusted R-squared:  0.5358 } \\
 \multicolumn{5}{|l|}{ F-statistic: 41.39 on 2 and 68 DF,  p-value: 1.741e-12}\\
 \hline
\end{tabular}
\caption{\label{tbl:regression}Regression analysis}
\end{table}

\begin{table}[t]
\begin{tabular}{|r|l|l|}
\hline
 & W & p-value \\
 \hline
 Residuals & 0.89516 & 2.223e-05 \\
 \hline
\end{tabular}
\caption{\label{tbl:shapiro}Shapiro-Wilk normality test}
\end{table}

\begin{figure}[t]
\includegraphics[width=0.5\textwidth]{data/scatterplots/RScatterplotMatrix2.png}
\caption{\label{fig:matrix}Scatterplot matrix}
\end{figure}


<!-- ```{=latex} -->
<!-- \begin{figure} -->
<!-- ``` -->
<!-- ![](data/scatterplots/RScatterplotMatrix2.png){#id .class width=50%} -->
<!-- ```{=latex} -->
<!-- \caption{Scatterplit} -->
<!-- \label{fig:figure} -->
<!-- \end{figure} -->
<!-- ``` -->

<!-- Example [@fig:figure] -->


\begin{figure}
\includegraphics[trim=0 0 0 0.7cm,clip,width=0.5\textwidth]{data/Rplot/Rplotqq.png}
\caption{\label{fig:qq} Normal QQ plot}
\end{figure}

\begin{figure}
\includegraphics[width=0.5\textwidth]{data/Rplot/RplotHistResidual.png}
\caption{\label{fig:res-hist} Residual histogram}
\end{figure}


Results of our linear regression analysis (Table \ref{tbl:regression}) show that "Enjoyment" and "Motivation" explain 55\% of the variance in students' grades. The critical cutoff value of the F-distribution at a 5\% significance level is 3.13. Since our F-value of 41.39 is larger than 3.13, we can conclude that our model fits the data well. However, only the relationship between "Motivation" and "Grade" is significant (t-value 3.20, p<0.01), which implies that "Motivation" drives the overall effect of the model. The relationship between "Enjoyment" and "Grade" is not significant. The results suggest that the more the students were motivated by the game, the higher their grades on the course (and vice versa). Consequently, our hypothesis is partially confirmed.



Tests for normality indicate that our residuals deviate from a normal distribution (Shapiro-Wilk test: p-value < 0.05, Table \ref{tbl:shapiro} and residual QQ plot, Figure \ref{fig:qq}). However, the residual histogram shows that the distribution looks symmetric and bell-shaped (Figure \ref{fig:res-hist}). The impact of non-normality depends on both distribution and sample size [@hair2010multivariate]. According to [@hair2010multivariate], small sample sizes below 50 observations might be problematic, while larger sample sizes increasingly cancel out violations against normality. Given that our sample size is 71, we believe that results from our regressions are still accurate despite non-normality of the residuals.

# Implementation experience {#sec:implementation}

\begin{figure}[t]
\begin{tabular}{|r|l|l|}
\hline
Category & Name & Overview \\
\hline
& Mini-turn & Get 15 min extra feedback  \\
& (retired) & \\ \cline{2-3}
Wisdom & Extra turn & Get 15 min extra to \\
& (not available) & tick off achievements \\ \cline{2-3}
& E-Deadline & Get 24h to re-submit  \\
& (not available) & after feedback from TA \\ \cline{2-3}
\hline
Others & Eavesdrop & Show hand (cards) of all teams \\
\hline
\end{tabular}
\caption{\label{fig:ncards}Problematic cards.
Cards retired from the game are marked as \emph{retired}.
Cards that were in the released schedule but
never went live are marked as \emph{not available}.}
\end{figure}

In this section we discuss our experience when using gamification elements in the
course Advanced Software Design, focusing on:

\begin{itemize}
\item Time to create a game
\item Designing a game for maintainability
\item Educational laws and games
\item Gamers need help
\item Implementation.
\end{itemize}

### Time to create a game {-}

Creating a fair game is no easy task and requires \emph{plenty} of time.
Fairness means that the best team should win.
You should plan with enough time to come up and design your gaming elements.
In our setting, gaming elements are cards and points, whether to play in real time or using a priority system
and its consequences, among other things.
Do not underestimate the time that it takes to write unambiguous game rules
and ask for feedback on the wording. From our experience,
we were a diverse group of TAs (one Spanish, one Chinese and one Vietnamese)
and the game rules were more understandable after a common discussion.

### Designing a game for maintainability {-}

We wanted to create an engaging game that, together with the course, could be maintained by two TAs working
full time (120 h for the duration of the course, 10 weeks) and one TA working a maximum of 60 h. To do this, teams should \emph{not}
be able to get too many cards per week or the game would not be maintainable. The non-maintainability comes from
playing actions (using cards), which need a story and to keep track of the order in which each action is taken.
For this reason, we tested playing a few hands and we settled on \textit{floor(number of points/100)} cards per
meeting (Figure \ref{fig:point-system}).
Writing the story timeline and keeping the scores up-to-date per action takes at least two hours per mini-competition
and we had 5 mini-competitions. Each TA was responsible for writing their teams story timeline.
Overall, our feeling is that the gamification of the achievement-driven methodology
is very TA intensive, although manageable if well planned.


\begin{figure}[t]
\includegraphics[width=0.4\textwidth]{data/histograms/EnjoyMotivationHistogramGrey.png}
\caption{\label{fig:histogram-enjoy-motiv}Histogram showing students enjoyment and motivation by the game.
Numbers from 1--5 represent the Likert degree (1 lowest, 5 maximum).}
\end{figure}

\begin{figure}[t]
\includegraphics[width=0.4\textwidth]{data/histograms/RplotGradesBoxed.png}
\caption{\label{fig:game-grades}Histogram showing students grades}
\end{figure}

\begin{figure}[t]
\includegraphics[width=0.4\textwidth]{data/histograms/EnjoyMotivationHistogram_TAGrey.png}
\caption{\label{fig:game-enjoy-support-ta}Histogram showing students enjoyment and motivation by the game,
with support from TA.
Numbers from 1--5 indicate the degree (1 lowest, 5 maximum)}
\end{figure}

\begin{figure}[t]
\includegraphics[width=0.4\textwidth]{data/histograms/RplotHistogramTA.png}
\caption{\label{fig:game-grades-support-ta}Histogram showing students grades
when the TA provides support during the game}
\end{figure}

\subsubsection*{Educational laws and games}

Regarding the cards and their utility, we had more cards than the ones that were available
(Figure \ref{fig:available-cards} and \ref{fig:ncards}). Wisdom cards were particularly problematic (Figure \ref{fig:ncards}):
the card \emph{Mini-turn} had to be retired
after the second week due to its potential unfair treatment to students, i.e.
some students could receive more feedback than others.
(This is not allowed under the Swedish Educational Law.)
Based on the same principle,
cards \emph{Extra turn} and \emph{E-deadline} were going to be released later on but never saw the day of light.
One needs to be careful when designing and implementing
a game and know the educational laws of the country in which the course takes place.


### Gamers need help {-}

One thing to improve was to be consistent in how we encourage and support students to play the game.
TAs were instructed to encourage students to play the game.
One TA added 10 extra minutes per group meeting to provide support to students by
answering questions regarding the game, cards and leaderboard score. The result was that most of his
students were engaged, highly motivated by the game and they got better grades (overall result in Figure \ref{fig:histogram-enjoy-motiv}
and the overall grades in Figure \ref{fig:game-grades};
subset of students with support from the TA in Figure \ref{fig:game-enjoy-support-ta}
and their grades in Figure \ref{fig:game-grades-support-ta}).

The other TAs did not add these 10 extra minutes to their
meetings and, when students asked questions regarding the rules and cards, they referred the students
to the online documentation. These students did not participate in the game that much and some teams
thought that the achievement-driven learning methodology was already too complex to add a game on top of.

### Implementation {-}

During the game competition we observed that
fostering competition makes students go beyond what is expected
to lead the classification; something that was also discovered in a previous study [@gamification-leaderboard-benefits].

### Summary {-}

Creating a game takes time and we recommend not to take this lightly [@review-gamification-framework].
In the integration of your game and course, always think about the effort
that the gamification elements entail, i.e. adding game elements that are easy to integrate with
your course and that you can maintain. The game should be easy to understand, or
students will not make the effort to play. Finally, make sure that the game satisfies the educational laws
of your country (check them!).

# Limitations and threats to validity

A limitation of the study is related to the use of cross-sectional data, as we cannot claim causality of the effects of gamification. However, given that students filled out questionnaires before they knew their grades helps us to infer that motivation most likely affected grades, and not that better grades made students more motivated. Regarding construct validity, another limitation might have been the use of one-item measures for our independent variables.

Another threat to validity refers to the achievement-driven methodology applied to a software design course:
TAs were trained to evaluate software designs and welcomed to talk to the main
lecturer in case of doubts regarding designs. However, whether team members pass or fail
an achievement is completely subjective to the TA's opinion.
Regarding the encouragement and support from the TAs (to students) to play the game, the TAs come from
different cultures and the way they provide encouragement and support may be differently shown.
This could affect the validity of the subsection \textit{Gamers need help} ([@sec:implementation]).

# Related work

In our case, the steps to the gamification of the course closely follow
the suggested guidelines by De Paz [@gamification-thesis].
Points of departure were related to issues outside of our control,
such as, gathering team members and knowing your players.
In the former, the TAs have the knowledge but we lack experience
(consistency between TAs, [@sec:implementation]).
In the latter, the course takes Swedes and international students and students come from
different backgrounds, which made difficult finding a
unifying game that could satisfy them all.

The achievement-driven learning [@wrigstad2017mastery] uses gamification
to force students to solve a puzzle in order to optimise their time. This work extends
achievement-driven learning, introducing explicit gaming elements to foster competition,
engagement and the possibility of deeper learning.

Gamification of computer science courses that
add gaming elements often use points, leaderboards and badges
and report on higher engagement from students [@eng-engineering-gamification;@freitas-twice;@todor;@Villagrasa;@ODonovan].
Instead, our work uses similar gaming elements although we measure whether gamification elements
induce higher grades.

The gamification of a course does not always succeed, even when
one adds leaderboards, points and other gaming elements, as noted by K. Berkling et al [@Berkling].
In this paper, we report mixed feelings from students (Figure \ref{fig:histogram-enjoy-motiv}),
where we found two extremes, students who loved the game and students who didn't like it.
However, we found that adding 10 extra minutes to discuss the game mechanics
can have a huge impact on the motivation, enjoyment of the game and students' grades (Figures \ref{fig:game-enjoy-support-ta} and
\ref{fig:game-grades-support-ta}, [@sec:implementation]).

We report our implementation experience, something that de Sousa Borges argues
 is often forgotten [@deSousaBorges:2014:SMG:2554850.2554956].
 In this regard, our experience coincides with O'Donovan's work [@ODonovan], that is,
 the creation of a game takes time. O'Donovan's report that the gamification of a course can incur in high (monetary) costs,
as they hired a programmer and designer to create a game.
In our setting, we used a platform-free software, i.e. the free Google Excel Sheet.

# Conclusion

We have added gaming elements to the \textit{Advanced Software Design} course,
based on the achievement-driven learning methodology [@wrigstad2017mastery],
to motivate students to get higher grades.
The gaming elements provide enjoyment and motivational factors. We have built a regression model where enjoyment and motivation explain 55\% of the variation in grades, whereby motivation drives the overall effect of the model, meaning that students who were motivated by the game also got higher grades. The link between enjoyment and grades, however, was insignificant. A future research direction could be to further explore the motivational factors that drive higher grades. Are students motivated intrinsically or extrinsically by opt-in gamification elements? What is it that drives motivation when it comes to gamification? If enjoyment, which was insignificant in our model, is indeed an intrinsic motivational factor, as suggested by [@RYAN200054],
our results suggest that intrinsic motivational factors may be less likely to influence students' grades after all. Our results provide a hint that extrinsic motivational factors in form of achievements may be more important in students' motivation. However, future research is needed to corroborate those suggestions.

Finally, we report on the implementation of the game and
remark that adding 10 extra minutes per meeting can potentially
have a positive effect on students enjoyment, motivation of the game and thus,
higher grades.
