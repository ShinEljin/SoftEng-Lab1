google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
  var data = google.visualization.arrayToDataTable([
    ["Date", "New Cases", "Active Cases"],
    ["10-1", 8, 15],
    ["10-2", 5, 17],
    ["10-3", 2, 20],
    ["10-4", 1, 18],
    ["10-5", 7, 21],
    ["10-6", 3, 16],
    ["10-7", 2, 15],
    ["10-8", 2, 12],
  ]);

  var options = {
    title: "CET Covid Tracker",
    hAxis: { title: "Date", titleTextStyle: { color: "#333" } },
    vAxis: { minValue: 0 },
  };

  var chart = new google.visualization.AreaChart(
    document.getElementById("chart_div")
  );
  chart.draw(data, options);
}
