export const addDomainToVercel = async (domain: string) => {
    console.log(`Adding domain: ${domain}`);

    console.log(`PROJECT_ID_VERCEL: ${process.env.PROJECT_ID_VERCEL}`);
    console.log(`AUTH_BEARER_TOKEN: ${process.env.AUTH_BEARER_TOKEN}`);

    if (!process.env.PROJECT_ID_VERCEL || !process.env.AUTH_BEARER_TOKEN) {
        throw new Error("Missing Vercel project ID or authorization token.");
    }

    const response = await fetch(
      `https://api.vercel.com/v10/projects/${
        process.env.PROJECT_ID_VERCEL
      }/domains${
        process.env.TEAM_ID_VERCEL ? `?teamId=${process.env.TEAM_ID_VERCEL}` : ""
      }`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: domain,
        }),
      }
    ).then(async (res) => res.json());
  
    console.log(`Response: ${JSON.stringify(response)}`);
    return response;
};