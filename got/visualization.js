// Assignment 3


let dataset;
let filteredData;
let currentSeason = 1;
let currentX = 'locations';
let currentY = 'numOfScenes';

d3.json("locations.json", (error, data) => {
  if (error) return console.warn(error)
  // get the main dataset
  dataset = data

  var seasons = [1, 2, 3, 4, 5, 6, 7, 8]
  var xArray = ["characters", "locations", "houses"]
  var yArray = ["numOfScenes", "numOfDeaths", "screenTime"]

  // populate the options text
  d3.select("#season").selectAll("option")
    .data(seasons)
    .enter().append("option")
    .text(function(d) {return d;})

  // add on change effect
  d3.select("#season")
    .on("change", function() {
      currentSeason = this.value
      update()
    })

  // populate the options text
  d3.select("#y-axis").selectAll("option")
    .data(yArray)
    .enter().append("option")
    .text(function(d) {return d;})

  // add on change effect
  d3.select("#y-axis")
    .on("change", function() {
      currentY = this.value
      update()
    })
  
  // populate the options text
  d3.select("#x-axis").selectAll("option")
    .data(xArray)
    .enter().append("option")
    .text(function(d) {return d;})

  // add on change effect
  d3.select("#x-axis")
    .on("change", function() {
      currentX = this.value
      update()
    })

  /*
  // filter by the season 
  let episodes = filterBySeason(5, dataset)
  // filter by y and then sort it
  filteredData = getNumOfScenesPerLocation(episodes)
  filteredData.sort((a, b) => (a.yValue < b.yValue) ? 1 : -1);
  filteredData = filteredData.slice(0, 10)
  */
 // redraw once in the beginning
  update()

})

// creating the main graph
var margin = { top: 25, bottom: 10, left: 25, right: 25 },
width = 1400 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

var svg = d3
.select("main")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.attr("id", "chart")
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3
.scaleBand()
.range([margin.left, width - margin.right])
.padding(0.1);

var y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

var yAxis = d3.axisLeft().scale(y);

var xAxis = d3.axisBottom().scale(x);

svg
.append("g")
.attr("transform", "translate(0," + (height - margin.bottom) + ")")
.attr("class", "x-axis")
.call(xAxis);

svg
.append("g")
.attr("transform", "translate(" + margin.left + ",0)")
.attr("class", "y-axis")
.call(yAxis);

// function to redraw the x and y based on new values
function update() {
  // filter by the current season 
  console.log(dataset)
  // filter by season 
  let filteredData = dataset[currentSeason - 1]
  // transform it 

  
  // filter by y and then sort it
  filteredData.sort((a, b) => (a[currentY] < b[currentY]) ? 1 : -1);
  data = filteredData.slice(0, 10)
  
  x.domain(
    data.map(function(d) {
      return d[currentX];
    })
  );
  y.domain([
    0,
    d3.max(data, function(d) {
      return d[currentY];
    })
  ]).nice();

  // re-render axis based on the new data
  svg
    .selectAll(".x-axis")
    .transition()
    .duration(0)
    .call(xAxis);

  svg
    .selectAll(".y-axis")
    .transition()
    .duration(0)
    .call(yAxis);

  //modify bar elements to accomodate new data, add exit, merge functions
  var bar = svg.selectAll(".bar").data(data, function(d) {
    return d.xValue;
  });

  bar.exit().remove();

  bar
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("fill", "steelblue")
    .attr("width", x.bandwidth())
    .merge(bar)
    .transition()
    .duration(1000)
    .attr("x", function(d) {
      return x(d.xValue);
    })
    .attr("y", function(d) {
      return y(d.yValue);
    })
    .attr("height", function(d) {
      return y(0) - y(d.yValue);
    });
}




// take in season and data and filter it
function filterBySeason(seasonNum, data) {
  // making sure that it is an int to compare
  seasonNum = parseInt(seasonNum, 10)
  return data.filter((current) => current.season == seasonNum)
}

// function to creat an object with x and y values
function getNumOfScenesPerLocation(episodes) {
  let locations = {}

  episodes.forEach((episode) => {
    episode.scenes.forEach((scene) => {

      if (locations[scene.location]) {
        locations[scene.location]++
      } else {
        locations[scene.location] = 1
      }

    })
  })

  let result = Object.entries(locations).map((arr) => {
    return { xValue : arr[0], yValue : arr[1]}
  })

  return result
}

function sortEpisodes(episodes) {
 episodes.sort()
}