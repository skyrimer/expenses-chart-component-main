const getCSSVariable = (name) => {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
};

const lightenColor = (colorHSL) => {
  const [, hue, saturation, lightness] = colorHSL.match(
    /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/
  );
  const newLightness = Math.min(parseFloat(lightness) + 15, 100);
  return `hsl(${hue}, ${saturation}%, ${newLightness}%)`;
};

// Parsing data
let data = [];
let labels = [];

// Colors
const currentDay = new Date().getDay();
const clrInactive = getCSSVariable("--clr-soft-red");
const clrInactiveHover = lightenColor(clrInactive);
const clrActive = getCSSVariable("--clr-cyan");
const clrActiveHover = lightenColor(clrActive);
let backgroundColors = [
  clrInactive,
  clrInactive,
  clrInactive,
  clrInactive,
  clrInactive,
  clrInactive,
  clrInactive,
];
backgroundColors[currentDay] = clrActive;
let backgroundHoverColors = [
  clrInactiveHover,
  clrInactiveHover,
  clrInactiveHover,
  clrInactiveHover,
  clrInactiveHover,
  clrInactiveHover,
  clrInactiveHover,
];
backgroundHoverColors[currentDay] = clrActiveHover;

// Chart setup
const spendingChart = document.querySelector("canvas[data-spending]");
const config = {
  type: "bar",
  pointStyle: "rectRounded",
  data: {
    labels: labels,
    datasets: [
      {
        data: data,
        borderWidth: 0,
        borderRadius: 5,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: backgroundHoverColors,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        display: false,
        beginAtZero: true,
      },
      x: {
        ticks: {
          color: getCSSVariable("--clr-medium-brown"),
          font: {
            family: "DM Sans",
            size: 14,
          },
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: false,
      tooltip: {
        enabled: false,
        external: (context) => {
          // Tooltip Element
          let tooltipEl = document.getElementById("chartjs-tooltip");

          // Create element on first render
          if (!tooltipEl) {
            tooltipEl = document.createElement("div");
            tooltipEl.id = "chartjs-tooltip";
            tooltipEl.innerHTML = "<table></table>";
            document.body.appendChild(tooltipEl);
          }

          // Hide if no tooltip
          const tooltipModel = context.tooltip;
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
          }

          // Set caret Position
          tooltipEl.classList.remove("above", "below", "no-transform");
          if (tooltipModel.yAlign) {
            tooltipEl.classList.add(tooltipModel.yAlign);
          } else {
            tooltipEl.classList.add("no-transform");
          }

          function getBody(bodyItem) {
            return bodyItem.lines;
          }

          // Set Text
          if (tooltipModel.body) {
            const bodyLines = tooltipModel.body.map(getBody);

            let innerHtml = "<thead>";

            innerHtml += "</thead><tbody>";

            bodyLines.forEach(function (body) {
              let style = "background:" + getCSSVariable("--clr-dark-brown");
              style += "; padding: 0.4rem";
              style += "; border-radius: 0.2rem";
              style += "; color:" + getCSSVariable("--clr-pale-orange") + ";";
              style += "; font-size: 0.9rem;";
              style += "; font-weight: 700;";
              const span = '<span style="' + style + '">$' + body + "</span>";
              innerHtml += "<tr><td>" + span + "</td></tr>";
            });
            innerHtml += "</tbody>";

            let tableRoot = tooltipEl.querySelector("table");
            tableRoot.innerHTML = innerHtml;
          }

          const position = context.chart.canvas.getBoundingClientRect();
          const bodyFont = Chart.helpers.toFont(tooltipModel.options.bodyFont);

          // Display, position, and set styles for font
          tooltipEl.style.opacity = 1;
          tooltipEl.style.position = "absolute";
          tooltipEl.style.left =
            position.left + window.pageXOffset + tooltipModel.caretX + "px";
          tooltipEl.style.transform = "translate(-50%, -150%)";
          tooltipEl.style.top =
            position.top + window.pageYOffset + tooltipModel.caretY + "px";
          tooltipEl.style.font = bodyFont.string;
          tooltipEl.style.padding = tooltipEl.style.pointerEvents = "none";
        },
        // position: "nearest",
        // backgroundColor: getCSSVariable("--clr-dark-brown"),
        // padding: 10,
        // caretSize: 0,
        // callbacks: {
        //   title: () => null,
        //   label: ({ raw }) => {
        //     return `$ ${raw}`;
        //   },
        // },
      },
    },
    hover: {
      mode: "index",
      intersect: true,
    },
    elements: {
      rectangle: {
        duration: 3000, // Transition duration in milliseconds
      },
    },
  },
};

fetch("data.json")
  .then((response) => response.json())
  .then((jsonData) => {
    var jsonArray = Array.from(jsonData);
    jsonArray.forEach((item) => {
      labels.push(item.day);
      data.push(item.amount);
    });
    new Chart(spendingChart, config);
  })
  .catch((error) => {
    console.log("Error:", error);
  });
