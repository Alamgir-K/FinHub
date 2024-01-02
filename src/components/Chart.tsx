import { useRef, useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

// Define the shape of the data point
interface DataPoint {
  date: string;
  yvalue: number;
}

// Props for the Chart component
interface ChartProps {
  data: DataPoint[]; // Add a prop for the external data
  dataLink: any;
  setDataLink: any;
  graphTitle: any;
}

const Chart: React.FC<ChartProps> = ({
  data,
  dataLink,
  setDataLink,
  graphTitle,
}) => {
  const chartRef = useRef(null);

  // Chart configuration
  const options: ApexOptions = {
    colors: ["#3C50E0", "#80CAEE"],
    chart: {
      height: 500, // Adjust height as necessary
      // parentHeightOffset: 20, // This offsets the height of the chart container
      // offsetY: 50,
      fontFamily: "Satoshi, sans-serif",
      type: "line",
      dropShadow: {
        enabled: false,
        color: "#623CEA14",
        top: 10,
        blur: 4,
        left: 0,
        opacity: 0.1,
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
            filename: undefined,
            columnDelimiter: ",",
            headerCategory: "category",
            headerValue: "value",
            // dateFormatter(timestamp) {
            //   return new Date(timestamp).toDateString();
            // },
          },
          svg: {
            filename: undefined,
          },
          png: {
            filename: undefined,
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
      width: 3, // Slightly increased width
      curve: "smooth", // Changed to smooth for testing
    },
    fill: {
      type: "solid",
      opacity: 0, // This will make the area beneath the line transparent
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
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
      size: 4,
      colors: "#fff",
      strokeColors: ["#3056D3", "#80CAEE"],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      hover: {
        size: undefined,
        sizeOffset: 5,
      },
    },
    xaxis: {
      type: "category",
      categories: data.map((dp) => dp.date),
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

  // Series data from props
  const series = [
    {
      name: "Fetched Data",
      // data: data.map((dp) => Math.round(dp.yvalue * 100) / 100),
      data: data.map((dp) => dp.yvalue),
    },
  ];

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <div className="w-full">
              <p className="font-semibold text-primary dark:text-white">
                {graphTitle}
              </p>
            </div>
          </div>
        </div>
        <div className="flex w-full max-w-45 justify-end">
          <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
            <button className="rounded bg-white py-1 px-3 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark">
              Month
            </button>
            <button className="rounded py-1 px-3 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
              Year
            </button>
          </div>
        </div>
      </div>

      <div>
        <div id="Chart" className="-ml-5 mt-10">
          <ReactApexChart
            options={options}
            ref={chartRef}
            series={series}
            type="area"
            height={500}
          />
        </div>
      </div>
    </div>
  );
};

export default Chart;
