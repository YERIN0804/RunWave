const SERVICE_KEY = import.meta.env.VITE_MARATHON_API_KEY;

export async function getMarathons() {
  const url =
    `https://api.odcloud.kr/api/15138980/v1/uddi:eedc77c5-a56b-4e77-9c1d-9396fa9cc1d3` +
    `?page=1` +
    `&perPage=100` +
    `&returnType=JSON` +
    `&serviceKey=${SERVICE_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  return data.data;
}