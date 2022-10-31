const formatRequestBody = (type: string, year: string, month: string) => {
  // Request format
  const format = {
    table: "BIL5",
    format: "JSONSTAT",
    variables: [
      {
        code: "BILTYPE",
        values: [""],
      },
      {
        code: "Tid",
        values: [`${year + month}`],
      },
    ],
  };

  // The values are the codes that DST uses for vehicle types
  switch (type.toLowerCase()) {
    case "car":
      format.variables[0].values = ["4000101002"];
      break;
    case "bus":
      format.variables[0].values = ["4000104001"];
      break;
    case "truck":
      format.variables[0].values = ["4000102001"];
      break;
    case "motorcycle":
      format.variables[0].values = ["4000106001", "4000000016", "4000000017"];
      break;
    default:
      throw new Error("Invalid request");
  }

  return format;
};

const fetchDST = async (
  type: string,
  year: string,
  month: string
): Promise<Object> => {
  // Get the body
  const body = formatRequestBody(type, year, month);

  const response = await fetch("https://api.statbank.dk/v1/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...body,
    }),
  });

  if (!response.ok) {
    throw new Error("DST Server down");
  }

  const data = await response.json();

  return data;
};

export default fetchDST;
