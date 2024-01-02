import { useState, useEffect } from "react";
import Chart from "../components/Chart";
import { useOutletContext } from "react-router-dom";

interface DataPoint {
  date: string;
  yvalue: number;
}

interface DefaultLayoutContext {
  dataLink: string;
  setDataLink: React.Dispatch<React.SetStateAction<string>>;
  graphTitle: string;
}

const About = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const { dataLink, setDataLink, graphTitle } =
    useOutletContext<DefaultLayoutContext>(); // Specify the type here

  useEffect(() => {
    fetch(dataLink)
      .then((response) => response.text())
      .then((text) => {
        const rows = text.split("\n").slice(1); // Split by new line and remove header
        const parsedData = rows.map((row) => {
          const columns = row.split(","); // Assuming comma-separated values
          return { date: columns[0], yvalue: parseFloat(columns[1]) }; // Adjust indices as per your CSV structure
        });
        // console.log(parsedData);
        setData(parsedData);
      });
  }, [dataLink]);

  return (
    <>
      <div className="mt-4 md:mt-6 2xl:mt-7.5 w-full">
        <Chart
          data={data}
          dataLink={dataLink}
          setDataLink={setDataLink}
          graphTitle={graphTitle}
        />
        {/* <Chart /> */}
      </div>
    </>
  );
};

export default About;
