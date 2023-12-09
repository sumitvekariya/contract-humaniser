export const dynamic = 'force-dynamic' // defaults to force-static
export async function POST(request: Request) {
  const { INFURA_API_KEY, INFURA_API_KEY_SECRET } = process.env;
  const Auth = Buffer.from(
    INFURA_API_KEY + ":" + INFURA_API_KEY_SECRET,
  ).toString("base64");
  const { chainId } = await request.json();
  const res = await fetch(`https://gas.api.infura.io/networks/${chainId}/suggestedGasFees`, {
    headers: {
      Authorization: `Basic ${Auth}`,
    },
  })
  const data = await res.json()

  return Response.json(data)
}