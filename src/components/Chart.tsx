import { useRef, useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

// Define the shape of the data point
interface DataPoint {
  date: string;
  defaultValue: number;
  wiValue: number;
  niValue: number;
}

// Props for the Chart component
interface ChartProps {
  index: any;
}

// Define the shape of each series object
// Modify the Series interface to accept data points with x and y properties
interface Series {
  name: string;
  data: { x: string; y: number }[]; // Update the type of 'data' to an array of objects
}

const Chart: React.FC<ChartProps> = ({ index }) => {
  type DataLinkKey = keyof typeof monthlyDataLinks;
  const monthlyDataLinks = {
    Demeaned:
      "https://raw.githubusercontent.com/charlesmartineau/mai_rfs/main/MAI%20Data/rfs%20original/MAI%20Monthly/MAI_Monthly_Demeaned.csv",
    NotDemeaned:
      "https://raw.githubusercontent.com/charlesmartineau/mai_rfs/main/MAI%20Data/rfs%20original/MAI%20Monthly/MAI_Monthly_NotDemeaned.csv",
    Standardized:
      "https://raw.githubusercontent.com/charlesmartineau/mai_rfs/main/MAI%20Data/rfs%20original/MAI%20Monthly/MAI_Monthly_Standardized.csv",
  };
  const dailyDataLinks = {
    Demeaned:
      "https://raw.githubusercontent.com/charlesmartineau/mai_rfs/main/MAI%20Data/rfs%20original/MAI%20Daily/MAI_Daily_Demeaned.csv",
    NotDemeaned:
      "https://raw.githubusercontent.com/charlesmartineau/mai_rfs/main/MAI%20Data/rfs%20original/MAI%20Daily/MAI_Daily_NotDemeaned.csv",
    Standardized:
      "https://raw.githubusercontent.com/charlesmartineau/mai_rfs/main/MAI%20Data/rfs%20original/MAI%20Daily/MAI_Daily_Standardized.csv",
  };

  const [dataLink, setDataLink] = useState<DataLinkKey>("Demeaned");
  const chartRef = useRef(null);
  const [allData, setAllData] = useState<{ [key in DataLinkKey]: DataPoint[] }>(
    {
      Demeaned: [],
      NotDemeaned: [],
      Standardized: [],
    }
  );
  const [showDefaultValue, setShowDefaultValue] = useState(true);
  const [showWiValue, setShowWiValue] = useState(false);
  const [showNiValue, setShowNiValue] = useState(false);
  const [seriesData, setSeriesData] = useState<Series[]>([]);

  // Load all data when the component mounts
  useEffect(() => {
    Promise.all(
      Object.entries(monthlyDataLinks).map(([key, url]) =>
        fetch(url)
          .then((response) => response.text())
          .then((text) => {
            const rows = text.split("\n").slice(1);
            const newData = rows.map((row) => {
              const columns = row.split(",");
              return {
                date: columns[0],
                defaultValue: parseFloat(columns[index.columns[0]]),
                wiValue: parseFloat(columns[index.columns[1]]),
                niValue: parseFloat(columns[index.columns[2]]),
              };
            });
            return { key, newData };
          })
      )
    ).then((results) => {
      const newData = results.reduce<{ [key in DataLinkKey]: DataPoint[] }>(
        (acc, { key, newData }) => ({ ...acc, [key]: newData }),
        { Demeaned: [], NotDemeaned: [], Standardized: [] } // Initial value with explicit type
      );
      setAllData(newData);
    });
  }, [index]);

  // Update seriesData whenever the related states change
  useEffect(() => {
    const currentData = allData[dataLink]; // Use data from preloaded datasets

    const newSeriesData: Series[] = [];
    if (showDefaultValue) {
      newSeriesData.push({
        name: "Default Value",
        data: currentData.map((dp) => ({ x: dp.date, y: dp.defaultValue })),
      });
    }
    if (showWiValue) {
      newSeriesData.push({
        name: "WSJ Value",
        data: currentData.map((dp) => ({ x: dp.date, y: dp.wiValue })),
      });
    }
    if (showNiValue) {
      newSeriesData.push({
        name: "NYT Value",
        data: currentData.map((dp) => ({ x: dp.date, y: dp.niValue })),
      });
    }
    setSeriesData(newSeriesData);
  }, [allData, dataLink, showDefaultValue, showWiValue, showNiValue]);

  const handleButtonClick = (dataLinkKey: DataLinkKey) => {
    setDataLink(dataLinkKey);
  };

  const downloadCsv = async (dataType: string) => {
    const url =
      dataType === "daily"
        ? dailyDataLinks[dataLink]
        : monthlyDataLinks[dataLink];
    const response = await fetch(url);
    const text = await response.text();

    // Define the headings
    let headings = ["Date"];
    if (showDefaultValue) headings.push("Default Value");
    if (showWiValue) headings.push("WSJ Value");
    if (showNiValue) headings.push("NYT Value");

    // Process the CSV data
    const rows = text.split("\n").slice(1);
    const filteredData = rows.map((row) => {
      const columns = row.split(",");
      let selectedData = [columns[0]]; // Always include the date
      if (showDefaultValue) selectedData.push(columns[index.columns[0]]);
      if (showWiValue) selectedData.push(columns[index.columns[1]]);
      if (showNiValue) selectedData.push(columns[index.columns[2]]);
      return selectedData.join(",");
    });

    // Prepend headings and convert array to CSV string
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headings.join(","), ...filteredData].join("\n");

    // Create a link to trigger the download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${index.title}_${dataLink}_${dataType}.csv`);
    document.body.appendChild(link); // Required for FF

    // Trigger the download
    link.click();
    document.body.removeChild(link); // Clean up
  };

  // Chart configuration
  const options: ApexOptions = {
    colors: ["#3C50E0", "#80CAEE", "#FF914D"],
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
            filename: index.title + " " + dataLink,
            columnDelimiter: ",",
            headerCategory: "Date",
            headerValue: "Value",
            dateFormatter: (timestamp) => {
              // Assuming timestamp is in the format YYYY-MM-DD
              return timestamp;
            },
          },
          svg: {
            filename: index.title + " " + dataLink,
          },
          png: {
            filename: index.title + " " + dataLink,
          },
        },
        autoSelected: "zoom",
      },
    },
    // responsive: [
    //   {
    //     breakpoint: 1024,
    //     options: {
    //       chart: {
    //         height: 800,
    //       },
    //     },
    //   },
    //   {
    //     breakpoint: 1366,
    //     options: {
    //       chart: {
    //         height: 850,
    //       },
    //     },
    //   },
    // ],
    stroke: {
      width: 2, // Slightly increased width
      curve: "smooth", // Changed to smooth for testing
      colors: ["#3C50E0", "#80CAEE", "#FF914D"],
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
        <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showDefaultValue}
              onChange={() => setShowDefaultValue(!showDefaultValue)}
            />
            <span className="ml-2 text-xs font-medium text-black dark:text-white">
              Default
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
        <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
          <button
            className={`rounded py-1 px-3 text-xs font-medium ${
              dataLink === "Demeaned"
                ? "text-black bg-white shadow-card "
                : "text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark"
            }  `}
            onClick={() => handleButtonClick("Demeaned")}
          >
            Demeaned
          </button>
          <button
            className={`rounded py-1 px-3 text-xs font-medium ${
              dataLink === "NotDemeaned"
                ? "text-black bg-white shadow-card "
                : "text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark"
            }  `}
            onClick={() => handleButtonClick("NotDemeaned")}
          >
            Not Demeaned
          </button>
          <button
            className={`rounded py-1 px-3 text-xs font-medium ${
              dataLink === "Standardized"
                ? "text-black bg-white shadow-card "
                : "text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark"
            }  `}
            onClick={() => handleButtonClick("Standardized")}
          >
            Standardized
          </button>
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
