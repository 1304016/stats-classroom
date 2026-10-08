# Stats Classroom

A static website that explains 100 basic statistics terms to non-statisticians, in Bengali only. Every term has a simple definition, a small classroom or university example, and a short interactive picture the visitor can play with.
Author is Abdullah Al Zabir (Mango Seed). Readers are Bangladeshi students and new researchers.
Hosting is GitHub Pages, so the site is plain HTML, CSS and JavaScript. No framework, no build step, no npm packages.

Code, comments and file names are in English. Every text the visitor sees is Bengali. Technical terms such as mean, median, p-value stay in English inside Bengali sentences.

## Reference prototype
prototype/stats-classroom.html is the working English prototype with 8 lessons (mean, standard-deviation, correlation, p-value, histogram, normal-distribution, confidence-interval, regression). The Mean lesson also has Bengali text.
It is large. Do not read it whole. Use Grep on these markers and read only what you need with offset and limit.
- "/* ---------- Demo" (one section per demo template)
- "var CATS" (the 9 categories and 100 terms in English)
- "var LESSONS" (lesson texts)
- "@media (min-width:860px)" (the collapsing sidebar)
Reuse its CSS, layout and demo code. Do not redesign. Two parts of it are out of date and must be replaced as described below, the old banner markup and the missing Facebook icon.

## Decisions already made. Do not reopen them.
1. Bengali only. All visible text lives in data files, never inside demo logic, so another language can be added later without touching code.
2. Left sidebar. On screens 860px and wider it rests as a 56px rail with a menu button and a vertical title. It opens on hover or on the button and closes again after a term is chosen. On phones it is a drawer opened by a button at the top. It holds a search box and the 9 categories with 100 terms. A filled dot means the lesson is ready, a hollow dot means coming soon.
3. Nothing on the right side.
4. Lesson page order. Category label, title as "বাংলা নাম (English term)", simple definition, classroom example, interactive demo under "নিজে করে দেখুন", a "মনে রাখুন" box, previous and next buttons, bottom banner, footer row.
5. Bottom banner is the last big element on every lesson page. It uses assets/banner.jpg (a wide green banner for the book "গবেষণা ১০১"). Same width as the lesson text (max 780px), full width on phones, margin-top 40px, small rounded corners.
   Link https://rkmri.co/NA5AMleem25M/ with target="_blank" rel="noopener noreferrer". The link must open in a new tab.
   Alt text is "গবেষণা ১০১, সহজ ভাষায় গবেষণা। লেখক আব্দুল্লাহ আল জাবির। এখনই সংগ্রহ করুন।"
6. Footer row sits directly under the banner, same width, right aligned. It has one small Facebook icon (about 28px, inline SVG, no external image) linking to https://www.facebook.com/zabir.insight with target="_blank" rel="noopener noreferrer" and aria-label "Facebook পেজ". Icon colour is the muted ink colour, and it turns accent colour on hover and focus. It is part of the page flow, not a floating button.
7. Light and dark mode. Mobile friendly, no horizontal scroll, side gutter at least 16px. Hash routing (#slug) so every lesson has its own link. html lang is "bn".
8. No quiz, no analytics, no English version for now. Leave an HTML comment in index.html where an analytics snippet would go later (GoatCounter or Cloudflare Web Analytics).

## Design tokens
Light. bg #F2F5F2, surface #FFFFFF, surface-2 #E7EEE9, ink #13231D, ink-2 #4B5C54, line #CBD7CF, accent #0B6E5F, accent-soft #D5ECE5, second mark colour #B4530A.
Dark. bg #0E1714, surface #15221D, surface-2 #1D2D27, ink #E4EFE9, ink-2 #9DB3A9, line #2B3F37, accent #4FD1B5, accent-soft #17382F, second mark colour #F0A35E.
Fonts from Google Fonts. Noto Sans Bengali for all Bengali text, Bricolage Grotesque for the brand and big numbers, Atkinson Hyperlegible for English labels.
Never use uppercase or letter-spacing on Bengali text. Bengali needs line-height around 1.8.

## Files
index.html
css/style.css
js/app.js (routing, sidebar, lesson rendering)
data/terms.js (9 categories, 100 terms, each with slug, Bengali name, English name, one line Bengali meaning)
data/ui.js (every fixed UI string such as button names and demo messages)
data/lessons/<category-slug>.js (lesson text per category, demo id and demo strings)
js/demos/<template>.js (reusable demo templates)
assets/banner.jpg

## Demo templates
Do not write 100 different demos. Build a few templates and reuse them by changing data and strings.
Basic building blocks, a grid of students where the visitor clicks to pick a sample from the population.
Types of data, drag items into the right box (nominal, ordinal, interval, ratio and so on).
Sampling ideas, the same grid with a switch between random, stratified, cluster, systematic and convenience sampling.
Describing data, draggable dots on a number line (mean, median, mode, outlier, range) and sliders (variance, standard deviation, percentile, quartile, skewness).
Showing data, one data set that switches between histogram, bar chart, box plot, line chart and cross-tab.
Probability and distributions, coin and dice simulation, bell curve sliders, z-score, central limit theorem simulation.
Drawing conclusions, confidence interval, p-value, type I and II error, power, one and two tailed pictures.
Common tests, two or three groups of dots where moving a group changes the result of t-test, ANOVA, chi-square.
Relationships and regression, scatter, correlation slider, regression line, residual, R-squared, multicollinearity.
Every demo shows one short live message that explains what just changed. Dragging must work by touch (touch-action none on the drag area only) and by arrow keys. Charts redraw at the real container width.

## Bengali writing
Read BANGLA_STYLE.md before writing any lesson text and follow it exactly.

## How to work
Work one category at a time. When a category is finished, stop, list what was added, and wait for my review. Commit after each category with a short message.
Save tokens. Do not re-read files you just wrote. Edit a file instead of rewriting it when a small change is enough. No refactors nobody asked for. No test frameworks. After each category do one headless browser load at desktop and phone size and check the console for errors.
Do not create or push anything to GitHub other than what Phase 1 below says.

## Phase 1 (do this first, then stop)
1. Create the project structure listed under Files.
2. Write data/terms.js with all 100 terms. Take the English names from var CATS in the prototype. Give each a Bengali name and a one line simple Bengali meaning, in the style of BANGLA_STYLE.md.
3. Build index.html, css/style.css and js/app.js from the prototype layout. Include the sidebar rules, the bottom banner and the footer Facebook icon as written above.
4. Prepare assets/banner.jpg. The source is large, so resize it to about 1400px wide and compress it if it is heavier than 200KB.
5. Bring the 8 prototype lessons into Bengali. Reuse the demo code, move all visible text into data files, and write the Bengali text in the style of BANGLA_STYLE.md. For Mean, start from the Bengali text already in the prototype and in BANGLA_STYLE.md.
6. Terms without a lesson show the one line meaning and a note "এই পাঠ শিগগিরই আসছে"।
7. Check desktop and phone sizes in a headless browser. No console errors. The banner link and the Facebook link must open in a new tab.
8. Deploy. Initialise git, create a public GitHub repository named stats-classroom under my account, push, turn on GitHub Pages from the main branch root, wait until the page is live, load the live URL once to confirm, and give me the live link. If something needs my action on GitHub, tell me exactly what.
9. Stop and wait for my review.

## Status
Phase 1 is done and 41 of the 100 lessons are written. Work is one category at a time, then stop and wait for review.

### Lessons finished
- Basic building blocks (বেসিক কনসেপ্ট), 10 of 10. population, sample, parameter, statistic, variable, data, observation, unit-of-analysis, sampling, census.
- Describing data (ডেসক্রিপটিভ স্ট্যাটিস্টিকস), 15 of 15. mean, median, mode, range, variance, standard-deviation, percentile, quartile, interquartile-range, outlier, skewness, kurtosis, frequency, relative-frequency, coefficient-of-variation.
- Data types (ডেটা টাইপ), 10 of 10. qualitative-data, quantitative-data, categorical-variable, nominal-scale, ordinal-scale, interval-scale, ratio-scale, discrete-variable, continuous-variable, dummy-variable. All use the sorting demo template (js/demos/sorting.js).
- Lessons brought over from the prototype, now in Bengali, 6 more. histogram (Showing data), normal-distribution (Probability), p-value and confidence-interval (Drawing conclusions), correlation and regression (Relationships). These sit in their own categories, so those categories are otherwise still open.
- Every other term shows its one line meaning and the note "এই পাঠ শিগগিরই আসছে"।

### Next work
Data types is finished. Next is the rest in sidebar order, starting with Sampling ideas (স্যাম্পলিং). After each step stop, list what was added, and wait for review. Before and after writing a lesson, check the text against the word list at the end of BANGLA_STYLE.md.

### Open for the author's review
- The Census lesson example and demo (lost exam papers story, time only, 20000 students case). Rewritten again on request (1 minute per person, 40 minutes, 20000 students about 14 days), not yet reviewed.
- The "ছবি" words kept on purpose because they mean a real chart or curve. terms.js box plot meaning, describing-data.js (skewness example, kurtosis zoom hint and its alt text), showing-data.js (histogram lesson, 5 places). The author will decide later.
- Numbers and texts the author has not confirmed yet are flagged in each step's hand-over note. Examples are the made-up 40 scores (mean 62.5), the 8-student sample (mean 58.75), the kurtosis slider range, and the Bengali term names in data/terms.js.

### What is running and where
- Site. Plain static files. Work happens on branch claude/elegant-bohr-443vy9 and is pushed to main as well. GitHub Pages is on and the site is live at https://1304016.github.io/stats-classroom/ (reported by the author, not loaded from here).
- Bottom banner. The switch showBanner in data/ui.js is now true, so the banner shows on every lesson page with its scroll-reveal effect, link and alt text. It is never shown on the home page. To hide it, set showBanner to false; the footer row then moves up into its place. The banner markup and image stay in the code either way.
- Facebook footer icon. Shows on every page including home.
- Analytics. Not installed yet. The choice is now Google Analytics (GA4), and the Measurement ID has not arrived. index.html has an HTML comment where the GA4 snippet will go once the ID is available. (Decision 8 above still names GoatCounter and Cloudflare, which is now out of date.)
- Theme. Light and dark toggle in the top bar, saved in localStorage.
- Demo templates in js/demos. sorting (types of data, drag into boxes, with a "first try" count), dots, spread (describing.js), shape (skew and kurtosis), tally (frequency), grid (students), columns (table), units (unit of analysis), plus the prototype ones for histogram, bell curve, p-value, confidence interval, correlation and regression.
- Words. All visible text lives in data/. The banned and replacement word list is at the end of BANGLA_STYLE.md.
