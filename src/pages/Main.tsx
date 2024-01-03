import Chart from "../components/Chart";
import { useOutletContext } from "react-router-dom";
import { useState } from "react";

interface DefaultLayoutContext {
  dataLink: any;
  setDataLink: any;
  index: any;
}

const Main = () => {
  const { index } = useOutletContext<DefaultLayoutContext>(); // Specify the type here

  return (
    <>
      <div className="mt-4 md:mt-6 2xl:mt-7.5 w-full">
        <Chart index={index} />
      </div>
    </>
  );
};

export default Main;
