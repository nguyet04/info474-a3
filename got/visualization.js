// Assignment 3


let datasets = {}
let dataset;
let filteredData;
let currentSeason = '1';
let currentX = 'location';
let currentY = 'numOfScenes';

d3.json("data/characters.json", (error, characterData) => {
  d3.json("data/locations.json", (error, locationData) => {
    if (error) return console.warn(error)
    datasets["locations"] = locationData.map((season) => {
      return season.map((episode) => {
        episode["screenTime"] = hmsToMinutes(episode["screenTime"])
        return episode
      })
    });
    datasets["characters"] = characterData.map((season) => {
      return season.map((episode) => {
        episode["screenTime"] = hmsToMinutes(episode["screenTime"])
        return episode
      })
    });

    // add on change effect
    d3.select("#season")
      .on("change", function() {
        currentSeason = this.value
        update()
      })

    // add on change effect
    d3.select("#y-axis")
      .on("change", function() {
        currentY = this.value
        update()
      })
    
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
    filteredData.sort((a, b) => (a[currentY] < b[currentY]) ? 1 : -1);
    filteredData = filteredData.slice(0, 10)
    */
  // redraw once in the beginning
    update()

  })
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
  // get the main dataset
  if (currentX == 'location') {
    dataset = datasets["locations"] 
    d3.select("#numOfDeaths").text("number of deaths")
  } else {
    dataset = datasets["characters"]

    // currentY is different for this character
    if (currentY === 'numOfDeaths') {
      currentY = 'numOfKills'
    }
    //change text
    d3.select("#numOfDeaths").text("number of kills")
  }

  // filter by the current season if it is not all
  let filteredData; 

  if (currentSeason != "all") {
    filteredData = dataset[parseInt(currentSeason, 10) - 1]
  } else {
    allSeasons = [].concat.apply([], dataset);
    xDict = {};
    allSeasons.forEach((xValue) => {
      if (xDict[xValue[currentX]]) {
        curr = xDict[xValue[currentX]]
        if (curr.numOfScenes) {
          curr.numOfScenes += xValue.numOfScenes
        }
        if (curr.numOfDeaths) {
          curr.numOfDeaths += xValue.numOfDeaths
        }
        if (curr.screenTime) {
          curr.screenTime += xValue.screenTime
        }
        if (curr.numOfKills) {
          curr.numOfKills += xValue.numOfKills
        }
      } else {
        xDict[xValue[currentX]] = {}
        curr = xDict[xValue[currentX]]
        if (xValue.numOfScenes) {
          curr.numOfScenes = xValue.numOfScenes
        } else {
          curr.numOfScenes = 0
        }
        if (xValue.numOfDeaths) {
          curr.numOfDeaths = xValue.numOfDeaths
        } else {
          curr.numOfDeaths = 0
        }
        if (xValue.screenTime) {
          curr.screenTime = xValue.screenTime
        } else {
          curr.screenTime = 0
        }
        if (xValue.numOfKills) {
          curr.numOfKills = xValue.numOfKills
        } else {
          curr.numOfKills = 0
        }
        if (xValue.house) {
          curr.house = xValue.house
        }
      }
    })
    filteredData = []
    for (let key in xDict) {
      nextObj = {}
      nextObj[currentX] = key
      for (let xKey in xDict[key]) {
        nextObj[xKey] = xDict[key][xKey]
      }
      filteredData.push(nextObj)
    }
  }

  if (currentX === "house") {
    data = characterToHouse(filteredData)
  } else {
    data = filteredData
  }
  
  // filter by y and then sort it
  data.sort((a, b) => (a[currentY] < b[currentY]) ? 1 : -1);
  data = data.slice(0, 10).filter((obj) => obj[currentY] > 0)

  console.log(data)

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
    return d[currentX];
  });

  bar.exit().remove();

  bar
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("fill", "steelblue")
    .merge(bar)
    .transition()
    .duration(1000)
    .attr("width", x.bandwidth())
    .attr("x", function(d) {
      return x(d[currentX]);
    })
    .attr("y", function(d) {
      return y(d[currentY]);
    })
    .attr("height", function(d) {
      return y(0) - y(d[currentY]);
    });
}




// take in season and data and filter it
function filterBySeason(seasonNum, data) {
  // making sure that it is an int to compare
  seasonNum = parseInt(seasonNum, 10)
  return data.filter((current) => current.season == seasonNum)
}

// function to creat an object with x and y values
// function getNumOfScenesPerLocation(episodes) {
//   let locations = {}

//   episodes.forEach((episode) => {
//     episode.scenes.forEach((scene) => {

//       if (locations[scene.location]) {
//         locations[scene.location]++
//       } else {
//         locations[scene.location] = 1
//       }

//     })
//   })

//   let result = Object.entries(locations).map((arr) => {
//     return { xValue : arr[0], yValue : arr[1]}
//   })

//   return result
// }

function sortEpisodes(episodes) {
 episodes.sort()
}

function hmsToMinutes(hms) {
  var a = hms.split(':'); // split it at the colons
  return (+a[0]) * 60 + (+a[1]);
}

function characterToHouse(dataset) {
  houses = {}
  dataset.forEach((character) => {
    if (character.house === "null" || !character.house) {
      return
    } 

   house = character.house;
    if (Array.isArray(character["house"])) {
      house = character.house[0]
    }

    if (houses[house]) {
      curr = houses[house]
      if (character.numOfScenes) {
        curr.numOfScenes += character.numOfScenes
      }
      if (character.screenTime) {
        curr.screenTime += character.screenTime
      }
      if (character.numOfKills) {
        curr.numOfKills += character.numOfKills
      }
    } else {
      houses[house] = {}
      curr = houses[house]
      if (character.numOfScenes) {
        curr.numOfScenes = character.numOfScenes
      } else {
        curr.numOfScenes = 0
      }
      if (character.screenTime) {
        curr.screenTime = character.screenTime
      } else {
        curr.screenTime = 0
      }
      if (character.numOfKills) {
        curr.numOfKills = character.numOfKills
      } else {
        curr.numOfKills = 0
      }

    }
  })

  result = []
  for (let key in houses) {
    nextObj = {}
    nextObj[currentX] = key
    for (let xKey in houses[key]) {
      nextObj[xKey] = houses[key][xKey]
    }
    result.push(nextObj)
  }
  return result 
}