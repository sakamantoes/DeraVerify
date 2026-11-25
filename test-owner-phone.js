
const BASE_URL = "https://api.ctex.online/api/v1";

const API_KEY = process.env.CTEX_API_KEY;

if (!API_KEY) {
  console.error("Missing CTEX_API_KEY environment variable.");
  process.exit(1);
}

async function testOwnerPhone() {
  try {
    console.log("Testing merchant owner phone endpoint...\n");

    const response = await fetch(`${BASE_URL}/merchants/me/owner-phone`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
      },
    });

    const result = await response.json();

    console.log("HTTP Status:", response.status);
    console.log("Response:");
    console.log(JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log("\nEndpoint test successful.");

      if (result.data?.ownerPhone) {
        console.log("Owner phone:", result.data.ownerPhone);
      } else {
        console.log("The merchant owner has no phone number saved.");
      }
    } else if (response.status === 401) {
      console.error("\nAuthentication failed. Check your API key.");
    } else if (response.status === 403) {
      console.error("\nPermission denied. The key needs merchants.read.");
    } else {
      console.error("\nRequest failed.");
    }
  } catch (error) {
    console.error("Request error:", error.message);
  }
}

testOwnerPhone();
