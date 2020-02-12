/**
 * this is a somewhat legit example of a smooth transition using d3.active
 * one issue is the year (title) does not update per year
 * there is also a pause in the middle of the transition
 * (might be because the data itself is not changing much during that period of time)
 * please let me know if you can solve these problems!
 * 
 * note: this file uses the dataEveryYear.csv file which
 * does not have "NA" values but also does not include as much
 * data as the gapminder.csv file
 * 
 * Another d3.active example (from the creator of d3):
 * https://bl.ocks.org/mbostock/1125997
 * 
 * d3.active documentation:
 * https://github.com/d3/d3-transition/blob/master/README.md#active
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

  // plot axes
  let xAxis = d3.axisBottom(xScale)

  let yAxis = d3.axisLeft(yScale)

  svg.append('g')
    .attr('transform', "translate(0," + (m.height - m.margin) + ')')
    .call(xAxis)

  svg.append('g')
    .attr('transform', 'translate(' + m.margin + ',0)')
    .call(yAxis)

  // get min and max of year data
  let yearLimits = d3.extent(data, function(d) { return +d['time'] })

  // get min and max of population data and make a scale
  let popLimits = d3.extent(data, function(d) { return +d['pop_mlns'] })
  let populationScale = d3.scaleLinear()
  .domain([popLimits[0], popLimits[1]])
  .range([m.dotMin, m.dotMax])

  // couldn't figure out how to update year along with points,
  // so I only append the first year as a title
  let yearTitle = svg.append('text')
    .attr('x', 230)
    .attr('y', 40)
    .text(yearLimits[0])

  // keep a counter for the year (important for transition later)
  let i = yearLimits[0]
  svg.selectAll('circle')
    .data(data.filter(function(d) { return d['time'] == i }))
    .enter()
    .append('circle')
        .attr('cx', function(d) { return xScale(+d['fertility_rate']) })
        .attr('cy', function(d) { return yScale(+d['life_expectancy']) })
        .attr('r', function(d) { return populationScale(+d['pop_mlns']) })
        .attr('fill', 'steelblue')

    // smoth transition using d3.active
    .transition()
      .duration(10000)
      .on('start', function repeat() {
        // increment year
        i++

        // stop transition if i > max year
        if (i >= yearLimits[1]) {
          return
        }
        
        // this = just one single circle in the selection

        // get appropriate circle element and it's corresponding data
        let thisCircle = d3.select(this)
        let location = thisCircle.data()[0]['location']
        let datum = data.filter(function(d) { return d['time'] == i && location == d['location'] })
        if (datum == []) {
          datum = thisCircle.data()[0]
        } else {
          datum = datum[0]
        }
        
        if (typeof datum != 'undefined') {

          // use d3.active to smoothly chain transitions
          d3.active(this)
            .attr('cx', xScale(+datum['fertility_rate']))
            .attr('cy', yScale(+datum['life_expectancy']))
            .attr('r', populationScale(+datum['pop_mlns']))
          .transition()
            .on('start', repeat)
        }
        
      })

})