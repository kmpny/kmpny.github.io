const w = 572, h = 651
//scales
const rowscale = d3.scaleLinear()
    .domain([0, 26])
    .range([0, h])

const colscale = d3.scaleLinear()
    .domain([0, 22])
    .range([0, w])

const circleScale = d3.scaleLinear()
    .domain([0, 10])
    .range([0, colscale(1)])

let focus;

function drawCountryes(countryData) {

    //Set up SVG
    const svg = d3.select("#chart").append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("fill", "black");

    const mapmask = svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", w)
        .attr("height", h)
        .attr("fill", "#C1EDFF");

    const gridland = svg.selectAll("polygon.land")
        .data(landGrid)
        .enter()
        .append("polygon")
        .attr("class", "land")
        .attr("fill", "white")
        .attr("stroke", "#C1EDFF")
        .attr("stroke-width", "0.5px")
        .attr("points", d => {
            return [0, 0, colscale(1), 0, colscale(1), rowscale(1), 0, rowscale(1)]
        })
        .attr("transform", d => {
            return "translate(" +
                [colscale(d.Y - 1), rowscale(d.X - 1)] + ")"
        });

    const labelCircles = svg.selectAll("circle.circles")
        .data(countryData)
        .enter()
        .append("circle")
        .attr("class", "circles")
        .attr("r", d => {
            return circleScale(Math.sqrt(Math.abs(+d['2000'])))
        })
        .attr("cx", d => {
            if (d) return colscale(+d.Col - 0.5)
        })
        .attr("cy", d => {
            if (d) return rowscale(+d.Row - 0.5);
        })

// COUNTRY label boxes
    const labelboxes = svg.selectAll("rect.boxes").data(countryData).enter().append("rect")
        .attr("fill", "white")
        .attr("class", "boxes")
        .attr("width", colscale(1))
        .attr("height", rowscale(1))
        .attr("x", d => {
            return colscale(d.Col - 1);
        })
        .attr("y", d => {
            return rowscale(d.Row - 1);
        });

    // COUNTRY Labels
    const labels = svg.selectAll("text.label")
        .data(countryData)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("x", d => {
            if (d) return colscale(+d.Col - 0.5)
        })
        .attr("y", d => {
            if (d) return rowscale(+d.Row - 0.65);
        })
        .text(d => d.CountryCode)
        .style("pointer-events", "none");

    labelboxes.on("mouseover", function (d) {
        focus = d.CountryCode
        // get THIS box's x and y values
        var xPos = parseFloat(d3.select(this).attr("x")) + 20;
        var yPos = parseFloat(d3.select(this).attr("y")) + 130;
        console.log(yPos)
        // update tooltip
        d3.select("#tooltip")
            .style("left", xPos + "px")
            .style("top", yPos + "px")
        d3.select("#tooltip .name").text(d.ShortName)

        d3.select("#tooltip").classed("hidden", false);
    });
    labelboxes.on("mouseout", function () {
        d3.select(this).style("fill", "white");
        d3.select("#tooltip").classed("hidden", true);
    });

}

const victimsData = []

d3.csv("./data/victims.csv").then((data => {
    for (i = 0; i <= data.length; i++) {
        if (data[i])
            victimsData.push(data[i])
    }
    const totalData = [398747, 407240, 408999, 399522, 389694, 380252, 376438, 369625, 377066, 379894, 380328, 389757, 393198, 387727, 389393, 386159, 389223]
    let ix = 0
    let timer = d3.interval(timerTick, 1000);

    drawCountryes(victimsData)
    drawBars(totalData)
    drawLegend()

    function timerTick(tick) {
        updateData(ix, victimsData)
        updateBars(ix, totalData)
        ix++
        if (ix > 16) {
            ix = 0
            timer.stop()
            setTimeout(function () {
                timer = d3.interval(timerTick, 1000);
            }, 4000)
        }
    }
}))

function updateData(year, countryData) {
    if (year < 10) year = "0" + year

    let t = d3.transition()
        .ease(d3.easeLinear)
        .duration(800)

    var labelCircles = d3.select("svg").selectAll("circle.circles")
        .data(countryData)

    labelCircles
        .classed("circlesInterpolate", d => {
            if (+d['20' + year] < 0) return true
            else return false
        })
        .transition(t)
        .attr("r", (d) => {
            if (!focus) focus = "RUS"
            let elem = countryData.find(el => el.CountryCode == focus)

            d3.select("#tooltip").select("#value")
                .text(d3.format(",.4f")(Math.abs(+elem['20' + year]) / 1000) + "%")

            d3.select("#tooltip .year").text(" в 20" + year);

            return circleScale(Math.sqrt(Math.abs(+d['20' + year])))
        })

    const labelboxes = d3.select("svg").selectAll("rect.boxes")

    labelboxes.on("mouseover", function (d) {
        focus = d.CountryCode
        // get THIS box's x and y values
        var xPos = parseFloat(d3.select(this).attr("x")) + 20;
        var yPos = parseFloat(d3.select(this).attr("y")) + 130;
        // update tooltip
        d3.select("#tooltip")
            .style("left", xPos + "px")
            .style("top", yPos + "px")

        d3.select("#tooltip .name").text(d.ShortName + ": ")
        d3.select("#tooltip").classed("hidden", false);
    });
    labelboxes.on("mouseout", function () {
        //d3.select("#tooltip #value").text("")
        d3.select("#tooltip").classed("hidden", true);
    });

}

function drawBars(data) {

    const width = colscale(4.60), height = rowscale(1.9), svg = d3.select("svg")

    let x = d3.scaleBand().rangeRound([0, width]).padding(0.09),
        y = d3.scaleLinear().rangeRound([0, height]);

    let g = svg.append("g").attr("class", "bars")

    g.attr("transform", "translate(" + (w - width - colscale(1) + 8) + "," + (0) + ")");

    x.domain(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17']);

    y.domain([0, d3.max(data)]);

    const text = g.append("text")
        .attr("class", "total")
        .attr("transform", "translate(" + (width - 8) + "," + (height) + ")")

    text.append("tspan").attr("dx", "0").attr("dy", "1.2em").attr("class", "line1").text(d3.format(",.0f")(data[0]).replace(/,/g, ' '))
    text.append("tspan").attr("dx", "0").attr("dy", "0").attr("class", "line2").text(" человек")


    let u = g.selectAll(".bar")
        .data(data);

    u.enter()
        .append("rect")
        .attr("class", "rectangle")
        .merge(u)
        .attr("class", "bar")
        .attr("y", d => y(0))
        .attr("x", (d, i) => x(i + 1))
        .attr("fill", "#ccc")
        .attr("width", x.bandwidth())
        .attr("height", d => y(d));

    svg.append("text")
        .attr("class", "textyear")
        .attr("x", w - colscale(1))
        .attr("y", rowscale(1) + 7)
        .attr("fill", "black")
        .text("2000")
}

function updateBars(year, data) {
    const svg = d3.select("svg")

    const g = svg.select("g.bars")
    const t = svg.select("text.total")

    t.select("tspan.line1").text(d3.format(",.0f")(data[year]).replace(/,/g, ' '))
    t.select("tspan.line2").text(" человек")

    const u = g.selectAll(".bar").data(data);
    u.enter()
        .append("rect")
        .merge(u)
        .attr("class", (d, i) => {
            const result = (i != year) ? "bar rectangle" : "bar rectangle red"
            return result
        })

    if (year < 10) year = "0" + year
    const textyear = svg.selectAll("text.textyear")
        .transition()
        .text(Math.abs('20' + year))

}

function drawLegend() {
    const svg = d3.select("svg")

    const g = svg.append("g").attr("class", "legend").attr("transform", "translate(210,-27)")

    g.append("circle").attr("r", circleScale(1)).attr("class", "legendCircle").attr("cx", 3).attr("cy", "-0.24em")
    g.append("text").text("0.001%").attr("x", 07 + circleScale(Math.sqrt(1)))

    g.append("circle").attr("r", circleScale(Math.sqrt(10))).attr("class", "legendCircle").attr("cx", 60 + circleScale(Math.sqrt(10))).attr("cy", "-0.24em")
    g.append("text").text("0.01%").attr("x", 60 + 4 + 2 * circleScale(Math.sqrt(10)))

    g.append("circle").attr("r", circleScale(Math.sqrt(20))).attr("class", "legendCircle").attr("cx", 117 + circleScale(Math.sqrt(10)) + circleScale(Math.sqrt(20))).attr("cy", "-0.24em")
    g.append("text").text("0.02%").attr("x", 117 + circleScale(Math.sqrt(10)) + 4 + 2 * circleScale(Math.sqrt(20)))

    g.append("circle").attr("r", circleScale(Math.sqrt(50))).attr("class", "legendCircle").attr("cx", 169 + 2 * circleScale(Math.sqrt(10)) + circleScale(Math.sqrt(20)) + circleScale(Math.sqrt(50))).attr("cy", "-0.24em")
    g.append("text").text("0.05% населения").attr("x", 169 + 2 * circleScale(Math.sqrt(10)) + circleScale(Math.sqrt(20)) + 4 + 2 * circleScale(Math.sqrt(50)))

    g.append("text").text("Серые кружки показывают отсутствие точных данных").attr("x", 0).attr("y", "-1.5em")

}