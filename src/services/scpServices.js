import scpData from "../data/scpData";

export async function getAllSCPs() {
  // Temporary data source.
  // Later this will query Supabase.
  return scpData;
}

export async function getSCPById(scpId) {
  const scp = scpData.find(
    (item) => item.id.toLowerCase() === scpId.toLowerCase()
  );

  return scp || null;
}