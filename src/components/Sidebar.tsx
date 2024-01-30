import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "../images/logo/rotman-logo-modified.png";
import { IoIosClose } from "react-icons/io";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  setIndex: any;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen, setIndex }: SidebarProps) => {
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  // Function to handle button clicks
  const handleButtonClick = (index: any, category: string) => {
    const updatedIndex = {
      ...index,
      category: category,
    };
    setIndex(updatedIndex);
    setSidebarOpen(false); // This will close the sidebar
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
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/">
          <img src={Logo} alt="Logo" />
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <IoIosClose className="text-white w-8 h-8" />
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear text-white">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          {combinedIndices.map((group) => (
            <div key={group.category} className="mb-20">
              <h3 className="mb-4 ml-4 text-sm font-semibold">
                {group.category}
              </h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                {group.items.map((index) => (
                  <NavLink to="/" key={index.title}>
                    <li
                      className="ml-4 cursor-pointer"
                      onClick={() => handleButtonClick(index, group.category)}
                    >
                      <span className="text-base font-medium">
                        {index.title}
                      </span>
                    </li>
                  </NavLink>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

const combinedIndices = [
  {
    category: "Macroeconomic Attention Indices",
    items: [
      { title: "Credit Rating", columns: [1, 2, 3] },
      { title: "GDP", columns: [4, 5, 6] },
      { title: "Housing Market", columns: [7, 8, 9] },
      { title: "Inflation", columns: [10, 11, 12] },
      { title: "Monetary", columns: [13, 14, 15] },
      { title: "Oil", columns: [16, 17, 18] },
      { title: "Unemployment", columns: [19, 20, 21] },
      { title: "U.S. Dollar", columns: [22, 23, 24] },
    ],
  },
  {
    category: "Narrative Uncertainty",
    items: [
      { title: "Commodity", columns: [21, 22, 23, 24] },
      { title: "Monetary", columns: [1, 2, 3, 4] },
      { title: "Inflation", columns: [13, 14, 15, 16, 17, 18, 19, 20] },
    ],
  },
];
