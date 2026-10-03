const { INITIAL_EVENTS, INITIAL_EXECOM, INITIAL_SETTINGS } = require('./serverSeedData.cjs');

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    if (Number.isInteger(val)) return { integerValue: val.toString() };
    return { doubleValue: val };
  }
  if (typeof val === "string") return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === "object") {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreDoc(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) fields[k] = toFirestoreValue(v);
  }
  return { fields };
}

async function feedAll() {
  const apiKey = "AIzaSyDg-xHaf7-hUbc_lKmL1W19-kQzzQs4SDU";
  const projectId = "admin-web-16b4a";
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

  console.log("1. Authenticating as admin@foss.tkmce.ac.in...");
  const authRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@foss.tkmce.ac.in", password: "AdminPassword123!", returnSecureToken: true })
  });
  const authData = await authRes.json();
  if (!authData.idToken) {
    throw new Error("Authentication failed: " + JSON.stringify(authData));
  }
  const idToken = authData.idToken;
  console.log("   Authenticated successfully! UID:", authData.localId);

  // Helper to clear existing collection
  async function clearCollection(colName) {
    console.log(`   Cleaning collection: ${colName}...`);
    try {
      const getRes = await fetch(`${baseUrl}/${colName}?key=${apiKey}`, {
        headers: { "Authorization": `Bearer ${idToken}` }
      });
      if (getRes.ok) {
        const data = await getRes.json();
        if (data.documents && data.documents.length > 0) {
          for (const doc of data.documents) {
            await fetch(`https://firestore.googleapis.com/v1/${doc.name}?key=${apiKey}`, {
              method: "DELETE",
              headers: { "Authorization": `Bearer ${idToken}` }
            });
          }
          console.log(`   Deleted ${data.documents.length} old documents from ${colName}.`);
        }
      }
    } catch (err) {
      console.warn(`   Notice cleaning ${colName}:`, err.message);
    }
  }

  // 2. Clear old collections
  await clearCollection("foss_events");
  await clearCollection("foss_execom");
  await clearCollection("foss_announcements");
  await clearCollection("foss_reports");

  // 3. Feed Events
  console.log(`2. Feeding ${INITIAL_EVENTS.length} events to Firestore...`);
  for (const ev of INITIAL_EVENTS) {
    const docData = toFirestoreDoc({
      ...ev,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const res = await fetch(`${baseUrl}/foss_events?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify(docData)
    });
    if (!res.ok) {
      const err = await res.json();
      console.error(`   Failed to insert event "${ev.title}":`, err);
    } else {
      const inserted = await res.json();
      console.log(`   ✓ Inserted event: "${ev.title}" (${inserted.name.split('/').pop()})`);
    }
  }

  // 4. Feed Execom
  console.log(`3. Feeding ${INITIAL_EXECOM.length} past execom members to Firestore...`);
  for (const mem of INITIAL_EXECOM) {
    const docData = toFirestoreDoc({
      ...mem,
      createdAt: new Date().toISOString()
    });
    const res = await fetch(`${baseUrl}/foss_execom?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify(docData)
    });
    if (!res.ok) {
      const err = await res.json();
      console.error(`   Failed to insert execom "${mem.name}":`, err);
    } else {
      const inserted = await res.json();
      console.log(`   ✓ Inserted execom: "${mem.name}" - ${mem.role} (${inserted.name.split('/').pop()})`);
    }
  }

  // 5. Feed Settings
  console.log(`4. Feeding club settings to Firestore (foss_settings/general)...`);
  const settingsData = toFirestoreDoc({
    ...INITIAL_SETTINGS,
    updatedAt: new Date().toISOString()
  });
  const setRes = await fetch(`${baseUrl}/foss_settings/general?key=${apiKey}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: JSON.stringify(settingsData)
  });
  if (setRes.ok) {
    console.log(`   ✓ Settings saved successfully!`);
  } else {
    console.error(`   Failed to save settings:`, await setRes.text());
  }

  console.log("\n=========================================");
  console.log("🎉 ALL DATA FED TO FIRESTORE SUCCESSFULLY!");
  console.log("=========================================\n");
}

feedAll().catch(err => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
