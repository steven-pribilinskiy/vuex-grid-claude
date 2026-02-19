# Cloudbeds Test task

We have a grid 40000x40000 with cells that contain checkbox and input fields. 
A user should see a limited number of cells (as many as screen size allows) 
and have the ability to scroll visible rectangle area to any point of the grid to see data at that point.

- Data should be loaded dynamically (emulate that with a method that generates data with a delay of 0.5 sec)
- If a checkbox is selected, it should disable input field.
- Input field should allow only digits to be typed.
- When you change checkbox or input fields, save button should appear. 
  When a user clicks on it, all modified data should appear in the console
- Should have rulers at the top and left to identify cell coordinates

Requirements:
- Vue + Vuex
- User should see the result as soon as possible after scrolling
- Code must be well documented
- Pure HTML/CSS (Bootstrap, etc are prohibited)
- No performance issues and smooth interaction
- Application must be allocated on Github (please provide the link)
- (optional, as a bonus) Covered by tests (you can choose instruments by yourself)
- (will be helpful) To speedup the feedback process please host the solution somewhere and provide the link

---

## Existing grid solutions investigation

There are several table/grid libraries available that solve the task, including libraries for Vue.js 
so it's very tempting to look at those implementations instead of "building a bicycle" :)
- [Awesome Vue: Table/Grid components](https://github.com/vuejs/awesome-vue#table)
- [Awesome Grid](https://github.com/FancyGrid/awesome-grid)

I'll look only at the two most popular sheet/table editors:

- **Google Sheets** is implemented with `canvas` and can contain a maximum of [2 million cells](https://support.google.com/drive/answer/37603?hl=en) (roughly 1414 x 1414)

- **MS Excel Online** limitation is [around 17 billion: 1,048,576 rows by 16,384 columns](https://support.office.com/en-us/article/excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3)
The wrapper is an actual `<table>` but the rows and cells are `<div>`-s in a single `<td>`
Implements dynamic reuse of elements. There's a drawback with the scrollbar in that it scales also dynamically while scrolling
and scrolling stops when mouse cursor reaches an edge of the screen. The reason behind this is to not have a tiny scrollbar thumb
