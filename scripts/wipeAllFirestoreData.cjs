const apiKey = "AIzaSyDg-xHaf7-hUbc_lKmL1W19-kQzzQs4SDU";
const projectId = "admin-web-16b4a";
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

async function wipeDatabase() {
  console.log("Authenticating admin...");
  const authRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@foss.tkmce.ac.in", password: "AdminPassword123!", returnSecureToken: true })
  });
  const authData = await authRes.json();
  if (!authData.idToken) {
    throw new Error("Auth failed: " + JSON.stringify(authData));
  }
  const idToken = authData.idToken;
  console.log("Authenticated! Token acquired.");

  const collections = [
    "foss_events",
    "foss_execom",
    "foss_announcements",
    "foss_reports",
    "foss_projects"
  ];

  for (const colName of collections) {
    console.log(`Clearing collection: ${colName}...`);
    try {
      const getRes = await fetch(`${baseUrl}/${colName}?key=${apiKey}`, {
        headers: { "Authorization": `Bearer ${idToken}` }
      });
      if (getRes.ok) {
        const data = await getRes.json();
        if (data.documents && data.documents.length > 0) {
          for (const doc of data.documents) {
            const delRes = await fetch(`https://firestore.googleapis.com/v1/${doc.name}?key=${apiKey}`, {
              method: "DELETE",
              headers: { "Authorization": `Bearer ${idToken}` }
            });
            console.log(`  - Deleted ${doc.name.split('/').pop()} (status: ${delRes.status})`);
          }
        } else {
          console.log(`  - Collection ${colName} is already empty.`);
        }
      } else {
        console.log(`  - Could not list ${colName}: HTTP ${getRes.status}`);
      }
    } catch (e) {
      console.error(`  - Error clearing ${colName}:`, e.message);
    }
  }

  console.log("All Firestore collections completely wiped!");
}

wipeDatabase().catch(console.error);
