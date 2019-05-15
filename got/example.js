

d3.csv("data.csv", function(error, data) {
  data.forEach(function(d) {
    var dates = d.date.split("-");
    d.year = dates[0];
    d.month = dates[1];
    d.value = +d.value;
    return d;
  });

  var margin = { top: 25, bottom: 10, left: 25, right: 25 },
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  var svg = d3
    .select("#example-container")
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

  // 1. to make it interactive, add each year as an option tag for the dropdown
  var years = [
    ...new Set(
      data.map(function(d) {
        return d.year;
      })
    )
  ];

  var options = d3
    .select("#year")
    .selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .text(function(d) {
      return d;
    });

  // var select = d3.select("#year").on("change", function() {
  //   update(data, this.value);
  // });

  // 3. call update function for the first-time render case
  update(data, d3.select("#year").property("value"));

  // 2. create update function to update domain, re-render axis, bar
  function update(data, years) {
    // filter data based on the given years
    // var data = data.filter(function(d) {
    //   return d.year == years;
    // });

    console.log(data)

    x.domain(
      data.map(function(d) {
        return d.month;
      })
    );
    y.domain([
      0,
      d3.max(data, function(d) {
        return d.value;
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
      return d.month;
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
        return x(d.month);
      })
      .attr("y", function(d) {
        return y(d.value);
      })
      .attr("height", function(d) {
        return y(0) - y(d.value);
      });
  }
});