import Chart from "../components/Chart";
import { useOutletContext } from "react-router-dom";

const Main = () => {
  const { index } = useOutletContext<any>(); // Specify the type here

  return (
    <>
      <div className="mt-4 md:mt-6 2xl:mt-7.5 w-full">
        <Chart index={index} />
      </div>
    </>
  );
};

export default Main;
