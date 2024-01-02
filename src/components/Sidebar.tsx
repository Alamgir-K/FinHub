import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "../images/logo/rotman-logo.png";
import { RiArrowDropDownLine } from "react-icons/ri";
import { IoIosClose } from "react-icons/io";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  setGraphTitle: any;
  setDataLink: any;
}

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  setGraphTitle,
  setDataLink,
}: SidebarProps) => {
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  const [isDemeanedOpen, setDemeaned] = useState(false);
  const [isNotDemeanedOpen, setNotDemeanedOpen] = useState(false);
  const [isStandardizedOpen, setStandardizedOpen] = useState(false);

  // Function to handle button clicks
  const handleButtonClick = (value: string, title: string) => {
    setDataLink(value);
    setGraphTitle(title);
  };

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector("body")?.classList.add("sidebar-expanded");
    } else {
      document.querySelector("body")?.classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/">
          <img className="w-14 h-14" src={Logo} alt="Logo" />
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <IoIosClose />
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear text-white">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          {/* <!-- Attention Group --> */}
          <div className="mb-20">
            <h3 className="mb-4 ml-4 text-sm font-semibold">Attention</h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                <button
                  onClick={() => setDemeaned(!isDemeanedOpen)}
                  className="flex items-center"
                >
                  <RiArrowDropDownLine
                    className={`transform transition-transform mr-2 ${
                      isDemeanedOpen ? "rotate-180" : ""
                    }`}
                  />
                  <span className="text-base font-medium">Demeaned</span>
                </button>
                {isDemeanedOpen && (
                  <ul className="ml-10">
                    <li
                      onClick={() =>
                        handleButtonClick(
                          "https://raw.githubusercontent.com/charlesmartineau/mai_rfs/main/MAI%20Data/monetary%20and%20unemployment%20updated%20to%202022/MAI_Monthly_Demeaned.csv",
                          "Demeaned DGraph"
                        )
                      }
                      className="cursor-pointer"
                    >
                      DGraph
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <button
                  onClick={() => setNotDemeanedOpen(!isNotDemeanedOpen)}
                  className="flex items-center"
                >
                  <RiArrowDropDownLine
                    className={`transform transition-transform mr-2 ${
                      isNotDemeanedOpen ? "rotate-180" : ""
                    }`}
                  />
                  <span className="text-base font-medium">Not Demeaned</span>
                </button>
                {isNotDemeanedOpen && (
                  <ul className="ml-10">
                    <li
                      onClick={() =>
                        handleButtonClick(
                          "https://raw.githubusercontent.com/charlesmartineau/mai_rfs/main/MAI%20Data/monetary%20and%20unemployment%20updated%20to%202022/MAI_Monthly_NotDemeaned.csv",
                          "Demeaned DNotGraph"
                        )
                      }
                      className="cursor-pointer"
                    >
                      DNotGraph
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <button
                  onClick={() => setStandardizedOpen(!isStandardizedOpen)}
                  className="flex items-center"
                >
                  <RiArrowDropDownLine
                    className={`transform transition-transform mr-2 ${
                      isStandardizedOpen ? "rotate-180" : ""
                    }`}
                  />
                  <span className="text-base font-medium">Standardized</span>
                </button>
                {isStandardizedOpen && (
                  <ul className="ml-10">
                    <li
                      onClick={() =>
                        handleButtonClick(
                          "https://raw.githubusercontent.com/charlesmartineau/mai_rfs/main/MAI%20Data/monetary%20and%20unemployment%20updated%20to%202022/MAI_Monthly_Standardized.csv",
                          "Demeaned SGraph"
                        )
                      }
                      className="cursor-pointer"
                    >
                      SGraph
                    </li>
                  </ul>
                )}
              </li>
              {/* Repeat the same pattern for Y and Z */}
            </ul>
          </div>

          {/* <!-- Other Group --> */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold">Other</h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {/* <!-- Menu Item BB --> */}

              {/* <!-- Menu Item BB --> */}
            </ul>
          </div>
        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
};

export default Sidebar;
