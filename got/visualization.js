// Assignment 3


let dataset;
let filteredData;

d3.json("episodes.json", (error, data) => {
  if (error) return console.warn(error)
  dataset = data.episodes
  let episodes = filterBySeason(5, dataset)
  filteredData = getNumOfScenesPerLocation(episodes)
  filteredData.sort((a, b) => (a.yValue < b.yValue) ? 1 : -1);
  filteredData = filteredData.slice(0, 10)


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
  update(filteredData);

  function update(data) {

    console.log(data)

    x.domain(
      data.map(function(d) {
        return d.xValue;
      })
    );
    y.domain([
      0,
      d3.max(data, function(d) {
        return d.yValue;
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

})

function filterBySeason(season, data) {
  return data.filter((episode) => episode.seasonNum === season)
}

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