/**
 * example of how to "chain" multiple transitions
 * using a for loop and setTimeout
 * 
 * note: this file uses the dataEveryYear.csv file which
 * does not have "NA" values but also does not include as much
 * data as the gapminder.csv file
 */

// measurements for our plot
let m = {
  width: 500,
  height: 500,
  margin: 50,
  dotMin: 5,
  dotMax: 30,
}

let svg = d3.select('body')
  .append('svg')
  .attr('width', m.width)
  .attr('height', m.height)
  .attr('id', 'svg')

d3.csv('../data/dataEveryYear.csv').then(function(data) {

  // get limits
  let fertilityLimits = d3.extent(data, function(d) { return d['fertility_rate'] })
  let lifeExpectancyLimits = d3.extent(data, function(d) { return d['life_expectancy'] })
  
  // draw axes
  let xScale = d3.scaleLinear()
    .domain([fertilityLimits[0], fertilityLimits[1]])
    .range([m.margin, m.width - m.margin])

  let yScale = d3.scaleLinear()
    .domain([lifeExpectancyLimits[0] - 5, lifeExpectancyLimits[1] + 5])
    .range([m.height - m.margin, m.margin])

  let xAxis = d3.axisBottom(xScale)

  let yAxis = d3.axisLeft(yScale)

  svg.append('g')
    .attr('transform', "translate(0," + (m.height - m.margin) + ')')
    .call(xAxis)

  svg.append('g')
    .attr('transform', 'translate(' + m.margin + ',0)')
    .call(yAxis)

  // get min and max of our year field
  let yearLimits = d3.extent(data, function(d) { return +d['time'] })

  // get min and max of out population field and make scaling function
  let popLimits = d3.extent(data, function(d) { return +d['pop_mlns'] })
  let populationScale = d3.scaleLinear()
  .domain([popLimits[0], popLimits[1]])
  .range([m.dotMin, m.dotMax])

  // plot initial data for the first recorded year
  let i = yearLimits[0]
  svg.selectAll('circle')
    .data(data.filter(function(d) { return d['time'] == i }))
    .enter()
    .append('circle')
        .attr('cx', function(d) { return xScale(+d['fertility_rate']) })
        .attr('cy', function(d) { return yScale(+d['life_expectancy']) })
        .attr('r', function(d) { return populationScale(+d['pop_mlns']) })
        .attr('fill', 'steelblue')

  // iterate through the years and use setTimeout to schedule transitions
  // more about setTimeout:
  // https://www.w3schools.com/jsref/met_win_settimeout.asp
  for (let i = yearLimits[0]; i <= yearLimits[1]; i++) {
    setTimeout(function() { plotData(i, xScale, yScale, data, populationScale) }, 
      500*(i - yearLimits[0]))
  }

})

// plot data for a given year
// year -> given year we want to plot
// xScale -> d3 scaling function
// yScale -> d3 scaling function
// data -> loaded csv data for every year
// populationScale -> scaling function for size of circle
function plotData(year, xScale, yScale, data, populationScale) {
  // remove old title (if any) and append new one
  d3.select('#title').remove()

  svg.append('text')
    .attr('x', 230)
    .attr('y', 40)
    .attr('id', 'title')
    .text(year)

  // get data for only this year
  const thisYearData = data.filter(function(d) { return +d['time'] == year })
  
  // get selection
  // the second parameter is a "key" function
  // makes sure our data is tracking the same circle
  // try this code with and without the second parameter to .data
  let update = svg.selectAll('circle')
    .data(thisYearData, function(d) { return d['location'] })

  // append extra circles
  update
    .enter()
    .append('circle')
      .attr('cx', function(d) { return xScale(+d['fertility_rate']) })
      .attr('cy', function(d) { return yScale(+d['life_expectancy']) })
      .attr('r', function(d) { return populationScale(+d['pop_mlns']) })
      .attr('fill', 'steelblue')

  // get rid of unneeded circles
  update.exit().remove()
  
  // transition existing circles
  update.transition().duration(500)
    .attr('cx', function(d) { return xScale(+d['fertility_rate']) })
    .attr('cy', function(d) { return yScale(+d['life_expectancy']) })
    .attr('r',function(d) { return populationScale(+d['pop_mlns']) })

}