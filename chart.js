
function plotChart() {
    let traceOne = {
        mode: 'lines',
        x: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
        y: [-100,201,-102,203,-104,205,-106,207,-108,-209,-110,211,-112,213,-114,215,-116,217,118,-219,120],
        name: "Trace One",
        yaxis: 'y1',
    }

    let traceTwo = {
        mode: 'lines',
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        y: [21, -32, 23, 34, -25, 36, 27, -38, 29, 50,- 31, 52, 33, -54, 35, 56, -37, -58, -39, 60],
        name: "Trace Two",
        yaxis: 'y2',
    }

    let chartData = [traceOne, traceTwo];

	//layout options
	const layout = {
        dragmode: 'zoom',
        legend: {
            orientation: 'h',
            y: 1.0596774193548388,
            x: 0.50,
            xanchor: 'center',
            yanchor: 'middle',
            valign: 'middle',
            traceorder: 'normal',
            bgcolor: '#fff',
            bordercolor: '#444',
            borderwidth: 0,
        },
		yaxis: {
			anchor: 'x',
			automargin: true,
		},
		//sets right side yaxis options
		yaxis2: {
			showgrid: false,
			overlaying: "y",
			anchor: 'x',
			side: "right",
			ticks: 'outside',
			zeroline: false,
			automargin: true,
		},
		xaxis: {
			ticks: 'outside',
			automargin: true,
			showline: true,
			showgrid: false,
		},
		height: 600
	};

    Plotly.react(
        'chart',
        chartData,
        layout,
        {
            responsive: true,
            doubleClick: false /*'reset'*/
        }).then(function (chartData) {
            adjustChart(chartData);
            document.getElementById('chart').on('plotly_relayout', function (eventData) {
                adjustChart(
                    document.getElementById('chart'),
                    eventData
                );
            });
        });
}

function adjustChart(chartData = null, eventData = null) {
    const axisZoomedIn = eventData !== null && eventData['xaxis.range[0]'] ? true : false;

    let y1_min;
    let y1_max;

    let y2_min;
    let y2_max;

    if (axisZoomedIn) { // zoomed in - don't need to apply 
        if (eventData['yaxis.range[0]']) {
            y1_min = eventData['yaxis.range[0]'];
        }

        if (eventData['yaxis.range[1]']) {
            y1_max = eventData['yaxis.range[1]'];
        }

        if (eventData['yaxis2.range[0]']) {
            y2_min = eventData['yaxis2.range[0]'];
        }

        if (eventData['yaxis2.range[1]']) {
            y2_max = eventData['yaxis2.range[1]'];
        }
    } else { // find min/max for each axis
        const rows = chartData.data;

        const y1Data = rows.filter(row => {
            if (row.yaxis === "y") {
                return row;
            }
        });

        const y2Data = rows.filter(row => {
            if (row.yaxis === "y2") {
                return row;
            }
        });

        var yTrace = y1Data[0].y;

        y1_min = Math.min(...yTrace);
        y1_max = Math.max(...yTrace);

        var y2Trace = y2Data[0].y;

        y2_min = Math.min(...y2Trace);
        y2_max = Math.max(...y2Trace);
    }

    // OVERRIDE RANGES - if found
    var y1_min_input = document.getElementById('y1_min').value;
    var y1_max_input = document.getElementById('y1_max').value;
    var y2_min_input = document.getElementById('y2_min').value;
    var y2_max_input = document.getElementById('y2_max').value;

    if (y1_min_input) {
        y1_min = y1_min_input;
    }

    if (y1_max_input) {
        y1_max = y1_max_input;
    }

    if (y2_min_input) {
        y2_min = y2_min_input;
    }

    if (y2_max_input) {
        y2_max = y2_max_input;
    }

    console.log(y1_min, y1_max, y2_min, y2_max);

    const ticksObj = this.getTicks(y1_min, y1_max, y2_min, y2_max);

    var layoutObj = {
        'yaxis.range': ticksObj.y1Range,
        'yaxis2.range': ticksObj.y2Range,
        'yaxis.dtick': ticksObj.y1dTick,
        'yaxis2.dtick': ticksObj.y2dTick,
        'xaxis.range': axisZoomedIn
            ? chartData.layout.xaxis.range
            : [1, 20]
    };

    Plotly.update('chart', null, layoutObj);
}

function getTicks (y1_min, y1_max, y2_min, y2_max) {
    const GRIDLINES = 5

    var y1_range
    if (y1_min < 0) {
        y1_range = y1_max - y1_min
    } else {
        y1_range = y1_max
    }

    y1_range = y1_range * 1000  // mult by 1000 to account for ranges < 1
    var y1_len = Math.floor(y1_range).toString().length

    var y1_pow10_divisor = Math.pow(10, y1_len - 1)
    var y1_firstdigit = Math.floor(y1_range / y1_pow10_divisor)
    var y1_max_base = y1_pow10_divisor * y1_firstdigit / 1000  // div by 1000 to account for ranges < 1

    var y1_dtick = Math.abs(y1_max_base / GRIDLINES)

    // ************************************************************************
    // Y2 Calculations

    var y2_range
    if (y2_min < 0) {
        y2_range = y2_max - y2_min
    } else {
        y2_range = y2_max
    }

    y2_range = y2_range * 1000  // mult by 1000 to account for ranges < 1
    var y2_len = Math.floor(y2_range).toString().length

    var y2_pow10_divisor = Math.pow(10, y2_len - 1)
    var y2_firstdigit = Math.floor(y2_range / y2_pow10_divisor)
    var y2_max_base = y2_pow10_divisor * y2_firstdigit / 1000  // div by 1000 to account for ranges < 1

    var y2_dtick = Math.abs(y2_max_base / GRIDLINES)

    /**************************************************************************/
    // Capture the highest dtick ratio as your global dtick ratio.
    //
    // All other axes will have their positive and negative ranges scaled to
    // make their dtick_ratios match the global ratio. When the ratios match,
    // the gridlines match!
    /**************************************************************************/

    var y1_dtick_ratio = y1_range / y1_dtick
    var y2_dtick_ratio = y2_range / y2_dtick

    var global_dtick_ratio = Math.max(y1_dtick_ratio, y2_dtick_ratio)

    /**************************************************************************/
    // Calculate Range Minimums
    //
    // 1. This is done by first finding the negative ratio for all axes:
    //     1. what percentage of the range is coming from negative values
    //     2. multiply percentage by global ratio to get the percentage of the
    //        global ratio (percentage of total gridlines) that should be shown
    //        under the zero baseline.
    //
    //     NEGATIVE RATIO == NUMBER OF GRIDLINES NEEDED FOR NEGATIVE VALUES
    //
    // 2. Capturing the highest negative ratio as the global negative ratio
    //
    // 3. Then applying the negative ratio to all of your axis minimumsto get
    //    their new proportionally scaled range minimums
    /**************************************************************************/

    var negative = false  // Are there any negative values present
    var y1_negative_ratio
    if (y1_min < 0) {
        negative = true
        y1_negative_ratio = Math.abs(y1_min / y1_range) * global_dtick_ratio
    } else {
        y1_negative_ratio = 0
    }

    var y2_negative_ratio
    if (y2_min < 0) {
        negative = true
        y2_negative_ratio = Math.abs(y2_min / y2_range) * global_dtick_ratio
    } else {
        y2_negative_ratio = 0
    }

    // Increase the ratio by 0.1 so that your range minimums are extended just
    // far enough to not cut off any part of your lowest value
    var global_negative_ratio = Math.max(y1_negative_ratio, y2_negative_ratio) + 0.1;

    // If any negative value is present, you must proportionally extend the
    // range minimum of all axes
    var y1_range_min
    var y2_range_min
    if (negative) {
        y1_range_min = (global_negative_ratio) * y1_dtick * -1
        y2_range_min = (global_negative_ratio) * y2_dtick * -1
    } else {  // If no negatives, baseline is set to zero
        y1_range_min = 0
        y2_range_min = 0
    }

    // ************************************************************************
    // Calculate Range Maximums
    //
    // 1. This is done by first finding the positive ratio for all axes:
    //     1. what percentage of the range is coming from positive values
    //     2. multiply percentage by global ratio to get the percentage of the
    //        global ratio (percentage of total gridlines) that should be shown
    //        above the zero baseline.
    //
    //     POSITIVE RATIO == NUMBER OF GRIDLINES NEEDED FOR POSITIVE VALUES
    //
    // 2. Capturing the highest positive ratio as the global positive ratio
    //
    // 3. Then applying the positive ratio to all of your axis maximums to get
    //    their new proportionally scaled range maximums
    /**************************************************************************/

    var y1_positive_ratio = Math.abs(y1_max / y1_range) * global_dtick_ratio
    var y2_positive_ratio = Math.abs(y2_max / y2_range) * global_dtick_ratio

    // Increase the ratio by 0.1 so that your range maximums are extended just
    // far enough to not cut off any part of your highest value
    var global_positive_ratio = Math.max(y1_positive_ratio, y2_positive_ratio) + 0.1;

    var y1_range_max = (global_positive_ratio) * y1_dtick
    var y2_range_max = (global_positive_ratio) * y2_dtick

    return {
        y1Range: [y1_range_min, y1_range_max],
        y1dTick: y1_dtick,
        y2Range: [y2_range_min, y2_range_max],
        y2dTick: y2_dtick
    };
}