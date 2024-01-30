// @ts-nocheck
import { useRef, useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const Chart = ({ index }) => {
  const [normalization, setNormalization] = useState("Demeaned");
  const chartRef = useRef(null);
  const [allData, setAllData] = useState({
    Demeaned: [],
    NotDemeaned: [],
    Standardized: [],
    LM: [],
    ML: [],
  });
  const [showDefaultValue, setShowDefaultValue] = useState(true);
  const [showWiValue, setShowWiValue] = useState(false);
  const [showNiValue, setShowNiValue] = useState(false);
  const [seriesData, setSeriesData] = useState([]);
  const [smoothingLevel, setSmoothingLevel] = useState(0);
  const [isNarrativeUncertainty, setIsNarrativeUncertainty] = useState(false);
  const [showWiScreenedValue, setShowWiScreenedValue] = useState(false);
  const [showWiWeightedValue, setShowWiWeightedValue] = useState(false);
  const [showNiScreenedValue, setShowNiScreenedValue] = useState(false);
  const [showNiWeightedValue, setShowNiWeightedValue] = useState(false);
  const [showVIX, setShowVIX] = useState(false);
  const [showMOVE, setShowMOVE] = useState(false);
  const [showMPU, setShowMPU] = useState(false);
  const [vixData, setVixData] = useState([]);
  const [mpuData, setMpuData] = useState([]);
  const [moveData, setMoveData] = useState([]);

  useEffect(() => {
    // Determine if the category is Narrative Uncertainty
    const isNU = index.category === "Narrative Uncertainty";
    setIsNarrativeUncertainty(isNU);

    const objectEntries = isNU
      ? uncertaintyMonthlyDataLinks
      : maiMonthlyDataLinks;
    let columnIndex = 0; // Start from column index 1

    const fetchData = Promise.all(
      Object.entries(objectEntries).map(([key, url]) =>
        fetch(url)
          .then((response) => response.text())
          .then((text) => {
            const rows = text.split("\n").slice(1);
            const newData = rows.map((row) => {
              const columns = row.split(",");
              let dataEntry;

              if (!isNU) {
                dataEntry = {
                  date: columns[0],
                  defaultValue: parseFloat(columns[index.columns[2]]),
                  wiValue: parseFloat(columns[index.columns[0]]),
                  niValue: parseFloat(columns[index.columns[1]]),
                };
              } else if (
                isNU &&
                (index.title === "Commodity" || index.title === "Monetary")
              ) {
                // Handle only WSJ and NYT values
                dataEntry = {
                  date: columns[0],
                  wiValue: parseFloat(columns[index.columns[columnIndex]]),
                  niValue: parseFloat(columns[index.columns[columnIndex + 2]]),
                };
              } else {
                // Handle Inflation case with 4 values
                dataEntry = {
                  date: columns[0],
                  wiWeightedValue: parseFloat(
                    columns[index.columns[columnIndex]]
                  ),
                  wiScreenedValue: parseFloat(
                    columns[index.columns[columnIndex + 2]]
                  ),
                  niWeightedValue: parseFloat(
                    columns[index.columns[columnIndex + 4]]
                  ),
                  niScreenedValue: parseFloat(
                    columns[index.columns[columnIndex + 6]]
                  ),
                };
              }
              return dataEntry;
            });
            columnIndex += 1;

            return { key, newData };
          })
      )
    ).then((results) => {
      const newData = results.reduce(
        (acc, { key, newData }) => ({ ...acc, [key]: newData }),
        {
          Demeaned: [],
          NotDemeaned: [],
          Standardized: [],
          LM: [],
          ML: [],
        }
      );
      setAllData(newData);
    });
  }, [index]);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/Alamgir-K/FinHub/main/src/data/unc_and_mai_combined.csv"
    )
      .then((response) => response.text())
      .then((text) => {
        const rows = text.split("\n").slice(1);
        const tempVixData = [],
          tempMpuData = [],
          tempMoveData = [];

        rows.forEach((row) => {
          const columns = row.split(",");
          const date = columns[0];
          tempVixData.push({ date, value: parseFloat(columns[10]) });
          tempMpuData.push({ date, value: parseFloat(columns[11]) });
          tempMoveData.push({ date, value: parseFloat(columns[12]) });
        });

        setVixData(tempVixData);
        setMpuData(tempMpuData);
        setMoveData(tempMoveData);
      });
  }, []); // Ensure 'index' is a valid dependency

  useEffect(() => {
    if (isNarrativeUncertainty) {
      if (index.title === "Commodity" || index.title === "Monetary") {
        setShowWiValue(true);
        setShowWiWeightedValue(false);
      } else {
        setShowWiWeightedValue(true);
        setShowWiValue(false);
      }
      setShowDefaultValue(false);
      setShowNiValue(false);
      setNormalization("LM");
    } else {
      setShowDefaultValue(true);
      setShowWiValue(false);
      setShowNiValue(false);
      setNormalization("Demeaned");
    }
    setShowVIX(false);
    setShowMPU(false);
    setShowMOVE(false);
    setSmoothingLevel(0);
  }, [isNarrativeUncertainty, index]);

  useEffect(() => {
    const currentData = allData[normalization];
    const rollingMean = (data, index, windowSize) => {
      let sum = 0;
      let count = 0;
      for (
        let i = Math.max(0, index - Math.floor(windowSize / 2));
        i < Math.min(data.length, index + Math.ceil(windowSize / 2));
        i++
      ) {
        sum += data[i];
        count++;
      }
      return count > 0 ? sum / count : 0;
    };

    const generateSeriesData = (data, valueKey) => {
      return data
        .map((dp, index) => ({
          x: dp.date,
          y:
            smoothingLevel > 0
              ? rollingMean(
                  data.map((d) => d[valueKey]),
                  index,
                  smoothingLevel
                )
              : dp[valueKey],
        }))
        .filter((dp) => !isNaN(dp.y));
    };

    const newSeriesData = [];

    if (showDefaultValue) {
      newSeriesData.push({
        name: "WSJ + NYT",
        data: generateSeriesData(currentData, "defaultValue"),
      });
    }
    if (showWiValue) {
      newSeriesData.push({
        name: "WSJ Value",
        data: generateSeriesData(currentData, "wiValue"),
      });
    }
    if (showNiValue) {
      newSeriesData.push({
        name: "NYT Value",
        data: generateSeriesData(currentData, "niValue"),
      });
    }
    if (showWiWeightedValue) {
      newSeriesData.push({
        name: "WSJ Weighted Value",
        data: generateSeriesData(currentData, "wiWeightedValue"),
      });
    }
    if (showWiScreenedValue) {
      newSeriesData.push({
        name: "WSJ Screened Value",
        data: generateSeriesData(currentData, "wiScreenedValue"),
      });
    }
    if (showNiWeightedValue) {
      newSeriesData.push({
        name: "NYT Weighted Value",
        data: generateSeriesData(currentData, "niWeightedValue"),
      });
    }
    if (showNiScreenedValue) {
      newSeriesData.push({
        name: "NYT Screened Value",
        data: generateSeriesData(currentData, "niScreenedValue"),
      });
    }
    if (showVIX) {
      newSeriesData.push({
        name: "VIX Value",
        data: generateSeriesData(vixData, "value"),
      });
    }
    if (showMPU) {
      newSeriesData.push({
        name: "Marked-based Uncertainty Value Value",
        data: generateSeriesData(mpuData, "value"),
      });
    }
    if (showMOVE) {
      newSeriesData.push({
        name: "MOVE Value",
        data: generateSeriesData(moveData, "value"),
      });
    }

    setSeriesData(newSeriesData);
  }, [
    allData,
    normalization,
    showDefaultValue,
    showWiValue,
    showNiValue,
    showWiWeightedValue,
    showWiScreenedValue,
    showNiWeightedValue,
    showNiScreenedValue,
    showVIX,
    showMPU,
    showMOVE,
    vixData,
    mpuData,
    moveData,
    smoothingLevel,
  ]);

  const handleButtonClick = (normalizationType) => {
    setNormalization(normalizationType);
  };

  const handleSmoothingClick = (level) => {
    setSmoothingLevel(level);
  };

  const downloadCsv = async (dataType) => {
    let url = "";

    // Determine the URL based on the given conditions
    if (isNarrativeUncertainty) {
      if (dataType === "daily") {
        url = uncertaintyDailyDataLink;
      } else {
        // dataType is monthly
        url = uncertaintyMonthlyDataLinks[normalization];
      }
    } else {
      // Not narrative uncertainty
      if (dataType === "daily") {
        url = maiDailyDataLinks[normalization];
      } else {
        // dataType is monthly
        url = maiMonthlyDataLinks[normalization];
      }
    }

    // Fetch the CSV data
    const response = await fetch(url);
    const text = await response.text();

    // Create a Blob from the CSV text
    const blob = new Blob([text], { type: "text/csv" });

    // Create a link and trigger the download
    const downloadLink = document.createElement("a");
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.download = `${index.category}_${normalization}_${dataType}.csv`; // You can customize the file name here

    // Append the link to the document and click it
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Clean up: remove the link after triggering the download
    document.body.removeChild(downloadLink);
  };

  const recessionAnnotations = NBER_recession_dates.map((period) => ({
    x: new Date(period.start).getTime(),
    x2: new Date(period.stop).getTime(),
    fillColor: "rgba(128, 128, 128, 0.2)", // Grey color with reduced opacity
    label: {
      text: "Recession",
      style: {
        color: "#000", // Text color
        background: "transparent", // Transparent background
      },
    },
  }));

  // Chart configuration
  const options = {
    annotations: {
      xaxis: recessionAnnotations.map((annotation) => ({
        x: annotation.x,
        x2: annotation.x2,
        fillColor: annotation.fillColor,
        // label: annotation.label,
      })),
    },
    colors: [
      "#3C50E0",
      "#80CAEE",
      "#FF914D",
      "#50C878",
      "#8F00FF",
      "#FF2400",
      "#FD5E53",
      "#40E0D0",
      "#9966CC",
      "#FFF44F",
    ],
    tooltip: {
      x: {
        format: "dd MMM yyyy", // Format the date as 'Day Month Year'
      },
      // ... [other tooltip options if needed] ...
    },
    chart: {
      animations: {
        enabled: false, // Disable animations
      },
      height: 500, // Adjust height as necessary
      fontFamily: "Satoshi, sans-serif",
      type: "line",
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: true,
        offsetX: 0,
        offsetY: 0,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
          customIcons: [],
        },
        export: {
          csv: {
            filename: index.title + " " + normalization,
            columnDelimiter: ",",
            headerCategory: "Date",
            headerValue: "Value",
            dateFormatter: (timestamp) => {
              // Assuming timestamp is in the format YYYY-MM-DD
              return timestamp;
            },
          },
          svg: {
            filename: index.title + " " + normalization,
          },
          png: {
            filename: index.title + " " + normalization,
          },
        },
        autoSelected: "zoom",
      },
    },
    stroke: {
      width: 2, // Slightly increased width
      curve: "smooth", // Changed to smooth for testing
      colors: [
        "#3C50E0",
        "#80CAEE",
        "#FF914D",
        "#50C878",
        "#8F00FF",
        "#FF2400",
        "#FD5E53",
        "#40E0D0",
        "#9966CC",
        "#FFF44F",
      ],
    },
    fill: {
      type: "solid",
      opacity: 0, // This will make the area beneath the line transparent
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
    },
    xaxis: {
      type: "datetime", // Set type to 'datetime'
      tickAmount: 40,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        minHeight: 60,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
      decimalsInFloat: 2,
    },
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <p className="block font-semibold text-primary dark:text-white">
        {index.title + " (Monthly Frequency)"}
      </p>
      <div className="mt-2 flex w-full flex-wrap gap-2">
        {!isNarrativeUncertainty ? (
          <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showDefaultValue}
                onChange={() => setShowDefaultValue(!showDefaultValue)}
              />
              <span className="ml-2 text-xs font-medium text-black dark:text-white">
                WSJ + NYT
              </span>
            </label>
            <label className="flex items-center ml-4">
              <input
                type="checkbox"
                checked={showWiValue}
                onChange={() => setShowWiValue(!showWiValue)}
              />
              <span className="ml-2 text-xs font-medium text-black dark:text-white">
                WSJ
              </span>
            </label>
            <label className="flex items-center ml-4">
              <input
                type="checkbox"
                checked={showNiValue}
                onChange={() => setShowNiValue(!showNiValue)}
              />
              <span className="ml-2 text-xs font-medium text-black dark:text-white">
                NYT
              </span>
            </label>
          </div>
        ) : (
          <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
            {index.title === "Inflation" ? (
              <>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showWiWeightedValue}
                    onChange={() =>
                      setShowWiWeightedValue(!showWiWeightedValue)
                    }
                  />
                  <span className="ml-2 text-xs font-medium text-black dark:text-white">
                    WSJ Weighted
                  </span>
                </label>
                <label className="flex items-center ml-4">
                  <input
                    type="checkbox"
                    checked={showWiScreenedValue}
                    onChange={() =>
                      setShowWiScreenedValue(!showWiScreenedValue)
                    }
                  />
                  <span className="ml-2 text-xs font-medium text-black dark:text-white">
                    WSJ Screened
                  </span>
                </label>
                <label className="flex items-center ml-4">
                  <input
                    type="checkbox"
                    checked={showNiWeightedValue}
                    onChange={() =>
                      setShowNiWeightedValue(!showNiWeightedValue)
                    }
                  />
                  <span className="ml-2 text-xs font-medium text-black dark:text-white">
                    NYT Weighted
                  </span>
                </label>
                <label className="flex items-center ml-4">
                  <input
                    type="checkbox"
                    checked={showNiScreenedValue}
                    onChange={() =>
                      setShowNiScreenedValue(!showNiScreenedValue)
                    }
                  />
                  <span className="ml-2 text-xs font-medium text-black dark:text-white">
                    NYT Screened
                  </span>
                </label>
              </>
            ) : (
              <>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showWiValue}
                    onChange={() => setShowWiValue(!showWiValue)}
                  />
                  <span className="ml-2 text-xs font-medium text-black dark:text-white">
                    WSJ
                  </span>
                </label>
                <label className="flex items-center ml-4">
                  <input
                    type="checkbox"
                    checked={showNiValue}
                    onChange={() => setShowNiValue(!showNiValue)}
                  />
                  <span className="ml-2 text-xs font-medium text-black dark:text-white">
                    NYT
                  </span>
                </label>
              </>
            )}
          </div>
        )}

        {!isNarrativeUncertainty ? (
          <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
            <button
              className={`rounded py-1 px-3 text-xs font-medium ${
                normalization === "Demeaned"
                  ? "text-black bg-white shadow-card "
                  : "text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark"
              }  `}
              onClick={() => handleButtonClick("Demeaned")}
            >
              Demeaned
            </button>
            <button
              className={`rounded py-1 px-3 text-xs font-medium ${
                normalization === "NotDemeaned"
                  ? "text-black bg-white shadow-card "
                  : "text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark"
              }  `}
              onClick={() => handleButtonClick("NotDemeaned")}
            >
              Not Demeaned
            </button>
            <button
              className={`rounded py-1 px-3 text-xs font-medium ${
                normalization === "Standardized"
                  ? "text-black bg-white shadow-card "
                  : "text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark"
              }  `}
              onClick={() => handleButtonClick("Standardized")}
            >
              Standardized
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
            <button
              className={`rounded py-1 px-3 text-xs font-medium ${
                normalization === "LM"
                  ? "text-black bg-white shadow-card "
                  : "text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark"
              }  `}
              onClick={() => handleButtonClick("LM")}
            >
              Loughran + McDonald
            </button>
            <button
              className={`rounded py-1 px-3 text-xs font-medium ${
                normalization === "ML"
                  ? "text-black bg-white shadow-card "
                  : "text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark"
              }  `}
              onClick={() => handleButtonClick("ML")}
            >
              BERT
            </button>
          </div>
        )}

        <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
          <button
            className={`rounded py-1 px-3 text-xs font-medium ${
              smoothingLevel === 0
                ? "text-black bg-white shadow-card "
                : "text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark"
            }`}
            onClick={() => handleSmoothingClick(0)}
          >
            No smoothing
          </button>
          <button
            className={`rounded py-1 px-3 text-xs font-medium ${
              smoothingLevel === 3
                ? "text-black bg-white shadow-card "
                : "text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark"
            }`}
            onClick={() => handleSmoothingClick(3)}
          >
            3 month smoothing
          </button>
        </div>

        <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showVIX}
              onChange={() => setShowVIX(!showVIX)}
            />
            <span className="ml-2 text-xs font-medium text-black dark:text-white">
              VIX
            </span>
          </label>
          <label className="flex items-center ml-4">
            <input
              type="checkbox"
              checked={showMPU}
              onChange={() => setShowMPU(!showMPU)}
            />
            <span className="ml-2 text-xs font-medium text-black dark:text-white">
              Market-based Monetary Uncertainty
            </span>
          </label>
          <label className="flex items-center ml-4">
            <input
              type="checkbox"
              checked={showMOVE}
              onChange={() => setShowMOVE(!showMOVE)}
            />
            <span className="ml-2 text-xs font-medium text-black dark:text-white">
              MOVE
            </span>
          </label>
        </div>

        <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
          <button
            className="rounded py-1 px-3 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark"
            onClick={() => downloadCsv("daily")}
          >
            Download Daily Data
          </button>
          <button
            className="rounded py-1 px-3 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark"
            onClick={() => downloadCsv("monthly")}
          >
            Download Monthly Data
          </button>
        </div>
      </div>

      <div>
        <div id="Chart" className="-ml-5 mt-10">
          <ReactApexChart
            options={options}
            ref={chartRef}
            series={seriesData}
            type="area"
            height={500}
          />
        </div>
      </div>
    </div>
  );
};

export default Chart;

const maiMonthlyDataLinks = {
  Demeaned:
    "https://raw.githubusercontent.com/charlesmartineau/mai_rfs/main/MAI%20Data/rfs%20original/MAI%20Monthly/MAI_Monthly_Demeaned.csv",
  NotDemeaned:
    "https://raw.githubusercontent.com/charlesmartineau/mai_rfs/main/MAI%20Data/rfs%20original/MAI%20Monthly/MAI_Monthly_NotDemeaned.csv",
  Standardized:
    "https://raw.githubusercontent.com/charlesmartineau/mai_rfs/main/MAI%20Data/rfs%20original/MAI%20Monthly/MAI_Monthly_Standardized.csv",
};
const maiDailyDataLinks = {
  Demeaned:
    "https://raw.githubusercontent.com/charlesmartineau/mai_rfs/main/MAI%20Data/rfs%20original/MAI%20Daily/MAI_Daily_Demeaned.csv",
  NotDemeaned:
    "https://raw.githubusercontent.com/charlesmartineau/mai_rfs/main/MAI%20Data/rfs%20original/MAI%20Daily/MAI_Daily_NotDemeaned.csv",
  Standardized:
    "https://raw.githubusercontent.com/charlesmartineau/mai_rfs/main/MAI%20Data/rfs%20original/MAI%20Daily/MAI_Daily_Standardized.csv",
};
const uncertaintyMonthlyDataLinks = {
  LM: "https://raw.githubusercontent.com/Alamgir-K/FinHub/main/src/data/unc_and_mai_combined.csv",
  ML: "https://raw.githubusercontent.com/Alamgir-K/FinHub/main/src/data/unc_and_mai_combined.csv",
};

const uncertaintyDailyDataLink =
  "https://raw.githubusercontent.com/Alamgir-K/FinHub/main/src/data/unc_and_mai_combined_daily.csv";

const NBER_recession_dates = [
  { start: "2020-03-01", stop: "2020-04-01" },
  { start: "2008-01-01", stop: "2009-06-01" },
  { start: "2001-04-01", stop: "2001-11-01" },
  { start: "1990-08-01", stop: "1991-03-01" },
  { start: "1981-08-01", stop: "1981-11-01" },
  { start: "1980-02-01", stop: "1981-07-01" },
];
