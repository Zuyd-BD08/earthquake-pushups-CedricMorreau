
var width = d3.select("#dataviz").node().getBoundingClientRect().width;
var height = 0.5 * width;
var plotCenter = [width / 2, height / 2];
var initialLongitude = -500;

var svg = d3.select("#dataviz")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("class", "map")
    .attr("width", 1000)
    .attr("height", height)

const countryWrapper = svg.append("g")
    .attr("class", "country_wrapper");

const projection = d3.geoMercator()
    .translate(plotCenter)
    .scale(200)

const path = d3.geoPath(projection);


async function getData() {
    d3.csv("/data/earthquakes1970-2014.csv").then((data) => { displayVisual(data) });
}

async function getMapdata() {
    let path = d3.geoPath()
        .projection(projection);

    let url = "https://raw.githubusercontent.com/cszang/dendrobox/master/data/world-110m2.json";
    let topology = await d3.json(url);
    countryWrapper.selectAll("path")
        .data(topojson.feature(topology, topology.objects.countries).features)
        .enter().append("path")
        .attr("d", path);
}

getMapdata();
getData();

function displayVisual(data) {
    function compare(a, b) {
        if (a.Magnitude > b.Magnitude) {
            return -1;
        }
        if (a.Magnitude < b.Magnitude) {
            return 1;
        }
        return 0;
    }

    let dataSort = data.sort(compare)
    var topValues = dataSort.slice(1, 6)

    let tooltip = d3.select("#dataviz")
        .append("div")
        .attr("class", "tooltip")


    countryWrapper.selectAll("circle")
        .data(topValues)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return projection([d.Longitude, d.Latitude])[0]
        })
        .attr("cy", function (d) {
            return projection([d.Longitude, d.Latitude])[1]
        })
        .attr("r", function (d) {
            return d.Magnitude
        })
        .style("fill", "darkred")


        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 1)
                .style("display", "block");

            tooltip.html("Datum & tijd: " + d.DateTime + "<br/><br/>Schaal van Richter: " + d.Magnitude)
                .style("left", (event.pageX - 150) + "px")
                .style("top", (event.pageY - 100) + "px");
        })

        .on("mouseout", function () {
            tooltip.transition()
                .duration(700)
                .style("opacity", 0)
                .style("display", "none");
        })
}