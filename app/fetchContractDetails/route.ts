export const dynamic = 'force-dynamic' // defaults to force-static
export async function POST(request: Request) {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY

  const { apiRoute } = await request.json();
  const etherscanAPIRoute = new URL(apiRoute)
  etherscanAPIRoute.searchParams.set('apiKey', apiKey as string);
  const res = await fetch(etherscanAPIRoute, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await res.json()
 
  return Response.json(data)
}