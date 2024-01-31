import CharlesImage from "../images/team/charles.jpeg";

const About = () => {
  return (
    <div className="mx-auto my-10 p-6 bg-white shadow rounded-lg">
      <h1 className="text-3xl font-bold mb-12">Researchers</h1>
      <div className="grid grid-cols-1 gap-10">
        {contacts.map((contact, index) => (
          <div key={index} className="block space-y-4 md:space-y-0 md:flex">
            <img
              alt={contact.name}
              className="h-32 w-32 rounded-full mr-6"
              src={contact.image}
              style={{
                aspectRatio: "128/128",
                objectFit: "cover",
              }}
              width="128"
              height="128"
            />
            <div>
              <h2 className="text-2xl font-semibold">{contact.name}</h2>
              <p className="text-sm text-gray-500">{contact.institution}</p>
              <a className="text-blue-600 hover:underline" href={contact.email}>
                {contact.email}
              </a>
              {" \n "} | {" \n "}
              <a
                className="text-blue-600 hover:underline"
                href={contact.website}
              >
                Website
              </a>
              <p className="mt-3 text-gray-700">{contact.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;

const contacts = [
  {
    name: "Charles Martineau",
    role: "Assistant Professor of Finance",
    institution: "University of Toronto Scarborough",
    email: "charles.martineau@rotman.utoronto.ca",
    website: "https://www.charlesmartineau.com/",
    bio: `Charles Martineau is an Assistant Professor of Finance at the
          University of Toronto Scarborough with a cross-appointment to the
          Finance area at Rotman. Charles specializes in the area of
          information economics. His research investigates intraday the
          speed of price discovery and its mechanism. He also examines the
          role of investor attention to macroeconomic news announcement
          premium. His work is published in leading finance and accounting
          journals and is generously supported by funding from the Social
          Sciences and Humanities Research Council (SSHRC), Toronto-Montreal
          Exchange, NASDAQ Educational Fund, and the Canadian Securities
          Institute.`,
    image: CharlesImage,
  },
  {
    name: "Charles Martineau",
    role: "Assistant Professor of Finance",
    institution: "University of Toronto Scarborough",
    email: "charles.martineau@rotman.utoronto.ca",
    website: "https://www.charlesmartineau.com/",
    bio: `Charles Martineau is an Assistant Professor of Finance at the
          University of Toronto Scarborough with a cross-appointment to the
          Finance area at Rotman. Charles specializes in the area of
          information economics. His research investigates intraday the
          speed of price discovery and its mechanism. He also examines the
          role of investor attention to macroeconomic news announcement
          premium. His work is published in leading finance and accounting
          journals and is generously supported by funding from the Social
          Sciences and Humanities Research Council (SSHRC), Toronto-Montreal
          Exchange, NASDAQ Educational Fund, and the Canadian Securities
          Institute.`,
    image: CharlesImage,
  },
  {
    name: "Charles Martineau",
    role: "Assistant Professor of Finance",
    institution: "University of Toronto Scarborough",
    email: "charles.martineau@rotman.utoronto.ca",
    website: "https://www.charlesmartineau.com/",
    bio: `Charles Martineau is an Assistant Professor of Finance at the
          University of Toronto Scarborough with a cross-appointment to the
          Finance area at Rotman. Charles specializes in the area of
          information economics. His research investigates intraday the
          speed of price discovery and its mechanism. He also examines the
          role of investor attention to macroeconomic news announcement
          premium. His work is published in leading finance and accounting
          journals and is generously supported by funding from the Social
          Sciences and Humanities Research Council (SSHRC), Toronto-Montreal
          Exchange, NASDAQ Educational Fund, and the Canadian Securities
          Institute.`,
    image: CharlesImage,
  },
];
