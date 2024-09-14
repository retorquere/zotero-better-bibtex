// https://firefox-storage-test.glitch.me/script.js
const gVersion = 60 // what the (@#*&( is this?

/**
 * The subsystem is broken, it impacts all content using the subsystem, and
 * there's nothing content can do to work-around the problem.
 */
const kFullyBroken = "fullyBroken";

/**
 * Meaning varies by subsystem:
 * - IndexedDB: Since each database is a separate SQLite database, it's
 *   possible to fail to open an existing database but to be able to
 *   create a new database.  (Also, deleting the old database should be
 *   recoverable.)
 * - Cache API: This shouldn't actually happen, but I'm using this as a
 *   hacky partial-error cop-out for when test invariants are violated.
 */
const kExistingBroken = "existingBroken";

/**
 * The subsystem works 100%.
 */
const kFullyOperational = "fullyOperational";

/**
 * Things are working, but it also looks like they got cleared.
 */
const kFullyOperationalAfterClear = "fullyOperationalPossiblyDueToClear";

/**
 * We use the not-always-available navigator.storage to infer QuotaManager,
 * return this when we don't have access so the logic can try and infer.
 */
const kNotDirectlyObservable = "notDirectlyObservable";

/**
 * We broke in a way we didn't expect.
 */
const kUnexpectedBreakage = "unexpectedBreakage";

const STATUS_EXPLANATIONS = {
  [kFullyBroken]: "Totally Broken.",
  [kExistingBroken]: "Previously existing data is inaccessible, but new data may be stored.",
  [kFullyOperational]: "Totally Working.",
  [kFullyOperationalAfterClear]: "Totally Working, but previously existing data is gone, suggesting the origin was automatically cleared.",
  [kNotDirectlyObservable]: "Not testable with the current build.",
  [kUnexpectedBreakage]: "Our test logic is broken, please copy and paste the contents of 'Debug Info' below and anything in the devtools console and send to :asuth.",
};

function isBadStatus(status) {
  switch (status) {
    case kFullyBroken:
    case kExistingBroken:
    case kUnexpectedBreakage:
      return true;
    case kFullyOperational:
    case kFullyOperationalAfterClear:
      return false;
    default:
      throw new Error(`what kind of status is: ${status}?`);
  }
}

/**
 * Return the Firefox major version number of Firefox, or 0 if not Firefox.
 */
function detectFirefoxMajorVersion() {
  const match = /\bFirefox\/(\d+)\.(\d+)\b/.exec(navigator.userAgent);
  if (match) {
    return parseInt(match[1], 10);
  } else {
    return 0;
  }
}

function makeEmptyContext() {
  return {
    // (Tag what we put in LS so we can auto-clear if we change things.)
    v: 1,
    curVersion: 0,
    prevVersion: 0,
    ls: {
    },
    qm: {
      lastWorkedIn: 0,
    },
    idb: {
      // The Firefox version that most recently created the "persistent" db.
      persistentCreatedIn: 0,
      // The Firefox version that most recently successfully opened the
      // "persistent" db.
      persistentLastOpenedIn: 0,
      // The Firefox version that most recently appears to have cleared the
      // origin.
      clearDetectedIn: 0
    },
    cache: {
      // The first Firefox version we believe we created a cache.
      firstCacheCreatedIn: 0,
      // The first version we believe we stashed an unpadded opaque cors request in.
      unpaddedOpaqueCreatedIn: 0,
      // The first version we believe we stashed a padded opaque cors request in.
      paddedOpaqueCreatedIn: 0,
      
    }
  };
}

const LOCALSTORAGE_KEY = "firefoxStorageState";
async function testLocalStorageAndExtractContext() {
  try {
    const savedStr = localStorage[LOCALSTORAGE_KEY];
    let ctx;
    if (savedStr) {
      ctx = JSON.parse(savedStr);
    } else {
      ctx = makeEmptyContext();
    }
    
    return [kFullyOperational, ctx, []];
  } catch (ex) {
    return [kUnexpectedBreakage, makeEmptyContext(), [ex.message]];
  }
}

function saveContextToLocalStorage(context) {
  try {
    localStorage[LOCALSTORAGE_KEY] = JSON.stringify(context);
  } catch (ex) {
    console.warn('Exception saving context to localStorage:', ex, context);
  }
}

function deleteIDB(name) {
  return new Promise(function (resolve, reject) {
    const req = indexedDB.deleteDatabase(name);
    req.onsuccess = function(evt) {
      resolve();
    };
    req.onerror = function(evt) {
      reject(req.error);
    };
  });
}


/**
 * Establish the state of IndexedDB.
 *
 * IndexedDB uses separate SQLite databases which are independently versioned.
 * This means that as long as QuotaManager isn't broken, we should be able to
 * create a new database.
 */
async function testIDB(preCtx) {
  /**
   * Open the given database.  Resolves with one of the following, with
   * exceptional errors triggering rejection.
   * - "created": The database didn't exist and we created it.
   * - "existed": The database already existed.
   * - "error": In-band error.
   */
  function openDB(name) {
    return new Promise(function(resolve, reject) {
      try {
        // Use version 1 always, we don't char about IDB schema upgrades.
        const req = indexedDB.open(name, 1);
        let created = false;
        req.onsuccess = function(evt) {
          const db = req.result;
          db.close();
          resolve(created ? "created" : "existed");
        };
        // actually do something so we're not a complete no-op
        req.onupgradeneeded = function(evt) {
          evt.currentTarget.result.createObjectStore("foo");
          created = true;
        };
        req.onerror = function(evt) {
          resolve("error");
          evt.preventDefault();
          evt.stopPropagation();
        }
      } catch(ex) {
        reject(ex);
      }
    });
  }
    
  try {
    const logs = [];
    const resultCtx = {
      persistentCreatedIn: preCtx.persistentCreatedIn,
      persistentLastOpenedIn: preCtx.persistentLastOpenedIn,
      clearDetectedIn: preCtx.clearDetectedIn,
    };
    
    const persistentCheck = await openDB("persistent");
    let status;
    if (persistentCheck === "created") {
      if (preCtx.persistentCreatedIn) {
        logs.push(`"persistent" IDB that should have existed created anew, suggesting origin cleared.`);
        resultCtx.clearDetectedIn = gVersion;
        status = kFullyOperationalAfterClear;
      } else {
        status = kFullyOperational;
      }
      resultCtx.persistentCreatedIn = gVersion;
      resultCtx.persistentLastOpenedIn = gVersion;
    } else if (persistentCheck === "existed") {
      resultCtx.persistentLastOpenedIn = gVersion;
      status = kFullyOperational;
    } else { // persistentCheck === "error"
      status = kFullyBroken;
      if (preCtx.persistentCreatedIn) {
        logs.push(`Failed to open "persistent" IDB created in ${preCtx.persistentCreatedIn} and last opened in ${preCtx.persistentLastOpenedIn}.`);
      } else {
        logs.push(`Failed to create "persistent" IDB.`);
      }
    }
    
    const transientCheck = await openDB("transient");
    if (transientCheck === "created") {
      // If we were able to create this DB, downgrade to only existing stuff being broken.
      if (status === kFullyBroken) {
        status = kExistingBroken;
      }
    } else if (transientCheck === "existed") {
      logs.push(`"transient" IDB already existed somehow.`);
    } else {
      logs.push(`Failed to create "transient" IDB.`);
    }
    await deleteIDB("transient");
    
    return [status, resultCtx, logs];
  } catch (ex) {
    return [kUnexpectedBreakage, preCtx, [ex.message]];
  }
}

/**
 * Establish the state of QuotaManager by seeing whether
 * navigator.storage.estimate() seems to work or not.  All other QuotaManager
 * checks are indirect.
 */
async function testStorageManager(preCtx) {
  try {
    if (!("storage" in navigator)) {
      return [kNotDirectlyObservable, preCtx, [`navigator.storage not available in this build, inferring status.`]];
    }
    
    const usage = await navigator.storage.estimate();
    return [kFullyOperational, { lastWorkedIn: gVersion }];
  } catch (ex) {
    const logs = [];
    if (preCtx.lastWorkedIn) {
      logs.push(`storage.estimate() threw "${ex.message}", last worked in ${preCtx.lastWorkedIn}`);
    } else {
      logs.push(`storage.estimate() threw: ${ex.message}`);
    }
    
    return [kFullyBroken, preCtx, logs];
  }
}

const CACHE_NO_OPAQUE = "clear";
const CACHE_WITH_UNPADDED_OPAQUE = "unpadded-opaque";
const CACHE_WITH_PADDED_OPAQUE = "padded-opaque";

// Let's cache this file.  So meta!
const NORMAL_URL = "script.js";

// This used to just be `known-opaque`, but ORB blocks the file in that case.
const KNOWN_OPAQUE_URL = "https://firefox-storage-test-oth.glitch.me/known-opaque.css";
const OLD_OPAQUE_URL = "https://firefox-storage-test-oth.glitch.me/known-opaque";


/**
 * The Cache API upgrade we're concerned about is from when we upgraded the
 * schema to capture opaque padding.  So we go a little overboard with
 * permutations related to this, especially given that we know that all
 * caches are stored in a single database file.  (Unlike IndexedDB, which
 * stores each content-created database in a separate SQLite database.)
 *
 * Note that when we talk about opaque padding:
 * - It's not directly observable; you need to use navigator.storage.estimate()
 *   to try and figure out if it's there or not.
 * - navigator.storage is only available in nightly...
 * - We don't actually care if it's there or not in these tests, we just want
 *   to make sure that the Response object still "works" in the sense that
 *   cache.match() returns a Response object.
 * - We make assumptions about whether there's padding magic based on the
 *   current Firefox version number, and we use that to decide what cache to
 *   put the response into so we know what we're trying to match() against.
 */
async function testCacheAPI(preCtx) {
  try {
    const logs = [];
    
    let cacheNames;
    // keys() will trigger full initialization of caches.sqlite if it doesn't
    // exist.
    try {
      cacheNames = await caches.keys();
    } catch(ex) {
      return [kFullyBroken, preCtx, [ex.message]];
    }
    
    // If we got through caches.keys(), everything should be working.  Let's
    // set to operational, and overwrite to kExistingBroken if we see anything
    // weird happen as we run through our test.
    let status = kFullyOperational;
    
    const resultCtx = {
      firstCacheCreatedIn: preCtx.firstCacheCreatedIn,
      unpaddedOpaqueCreatedIn: preCtx.unpaddedOpaqueCreatedIn,
      paddedOpaqueCreatedIn: preCtx.paddedOpaqueCreatedIn
    };
    
    let stuffExisted = (cacheNames.length !== 0);
    if (!stuffExisted) {
      if (preCtx.firstCacheCreatedIn) {
        logs.push(`Caches should exist from creation in ${preCtx.firstCacheCreatedIn}, but they do not.  Origin cleared?`);
        status = kFullyOperationalAfterClear;
        // Clear the opaque padding tracking state so we re-put and don't get confused next time.
        resultCtx.unpaddedOpaqueCreatedIn = 0;
        resultCtx.paddedOpaqueCreatedIn = 0;
      }
      resultCtx.firstCacheCreatedIn = gVersion;
    }
    
    const noOpaqueCache = await caches.open(CACHE_NO_OPAQUE);
    const unpaddedOpaqueCache = await caches.open(CACHE_WITH_UNPADDED_OPAQUE);
    const paddedOpaqueCache = await caches.open(CACHE_WITH_PADDED_OPAQUE);
    
    // -- Check things that should exist.
    if (stuffExisted) {
      // NORMAL_URL should always have been added.
      const normalResponse = await noOpaqueCache.match(NORMAL_URL);
      if (!normalResponse) {
        logs.push(`Cache API match() somehow didn't find our normal URL.`);
        status = kExistingBroken;
        stuffExisted = false;
      }
    
      if (preCtx.unpaddedOpaqueCreatedIn) {
        let response = await unpaddedOpaqueCache.match(KNOWN_OPAQUE_URL);
        // Check if the old opaque response is there; if so, that's okay.
        if (!response) {
          response = await unpaddedOpaqueCache.match(OLD_OPAQUE_URL);
        }
        if (!response) {
          logs.push(`Cache API match() somehow didn't find our expected UNpadded opaque response.`);
          status = kExistingBroken;
        }
      }

      if (preCtx.paddedOpaqueCreatedIn) {
        let response = await paddedOpaqueCache.match(KNOWN_OPAQUE_URL);
        // Check if the old opaque response is there; if so, that's okay.
        if (!response) {
          response = await unpaddedOpaqueCache.match(OLD_OPAQUE_URL);
        }
        if (!response) {
          logs.push(`Cache API match() somehow didn't find our expected padded opaque response.`);
          status = kExistingBroken;
        }
      }
    }
    
    // Put the NORMAL_URL in if it didn't/doesn't exist.
    if (!stuffExisted) { // (this got clobbered above if it didn't exist)
      await noOpaqueCache.add(NORMAL_URL);
    }
    
    // -- Get our opaque response.
    const opaqueResponse = await fetch(KNOWN_OPAQUE_URL, { mode: "no-cors" });
    const shouldBePadded = (gVersion >= 57);
    if (!shouldBePadded) {
      // Only stick it in the cache if we don't think we already put one in there.
      if (!preCtx.unpaddedOpaqueCreatedIn) {
        await unpaddedOpaqueCache.put(KNOWN_OPAQUE_URL, opaqueResponse);
        resultCtx.unpaddedOpaqueCreatedIn = gVersion;
      }
    } else {
      if (!preCtx.paddedOpaqueCreatedIn) {
        await paddedOpaqueCache.put(KNOWN_OPAQUE_URL, opaqueResponse);
        resultCtx.paddedOpaqueCreatedIn = gVersion;
      }
    }
    
    return [status, resultCtx, logs];
  } catch (ex) {
    return [kUnexpectedBreakage, preCtx, [ex.message]];
  }
}

/**
 * Sequentially run all of our various checks, attempting to pull our
 * persistent state-tracking from previous runs out of LocalStorage.
 * We do things sequentially so that it's easier to correlate console
 * messages and generally debug things.
 */
async function investigateStorage() {
  const [lsState, preCtx, lsLogs] = await testLocalStorageAndExtractContext();
  
  console.log("investigating navigator.storage");
  // we may need to clobber the QM state if we have to fall back to inference
  let [qmState, qmCtx, qmLogs] = await testStorageManager(preCtx.qm);
  
  console.log("investigating IndexedDB");
  const [idbState, idbCtx, idbLogs] = await testIDB(preCtx.idb);
  
  console.log("investigating DOM Cache API");
  const [cacheState, cacheCtx, cacheLogs] = await testCacheAPI(preCtx.cache);
  
  if (qmState === kNotDirectlyObservable) {
    if (isBadStatus(idbState)) {
      qmState = idbState;
    } else if (isBadStatus(cacheState)) {
      qmState = cacheState;
    } else {
      qmState = kFullyOperational;
    }
  }
  
  const allStates = {
    ls: lsState,
    qm: qmState,
    idb: idbState,
    cache: cacheState
  };
  
  const resultCtx = makeEmptyContext();
  resultCtx.prevVersion = preCtx.curVersion;
  resultCtx.curVersion = gVersion;
  resultCtx.ls = preCtx.ls;
  resultCtx.qm = qmCtx;
  resultCtx.idb = idbCtx;
  resultCtx.cache = cacheCtx;
  saveContextToLocalStorage(resultCtx);
  
  const allLogs = [].concat(lsLogs, qmLogs, idbLogs, cacheLogs);
  
  return [allStates, resultCtx, allLogs];
}

async function resetState() {
  console.log("removing our localStorage value");
  localStorage.removeItem(LOCALSTORAGE_KEY);
  console.log("removing the 'persistent' IDB db.")
  await deleteIDB("persistent");
  console.log("nuking caches");
  await caches.delete(CACHE_NO_OPAQUE);
  await caches.delete(CACHE_WITH_UNPADDED_OPAQUE);
  await caches.delete(CACHE_WITH_PADDED_OPAQUE);
  console.log("done clearing state");
}

function renderDiagnosis(state, context) {
  const containerElem = document.getElementById("diagnosisContainer");
  containerElem.removeAttribute("style");
  
  const bodyElem = document.getElementById("diagnosisBody");
  const lines = [];
  
  // -- Give a brief overview of what seems to be going on with storage.
  let stuffBroken = false;
  let clearDetected = false;
  for (const stateKey in state) {
    const stateValue = state[stateKey];
    if (isBadStatus(stateValue)) {
      stuffBroken = true;
    }
    if (stateValue === kFullyOperationalAfterClear) {
      clearDetected = true;
    }
  }
  if (stuffBroken) {
    lines.push(`Storage is broken.`);
  } else if (clearDetected) {
    lines.push(`Storage is working, possibly due to auto-clearing of pieces of our test origin.`)
  } else {
    lines.push(`Storage is working.`);
  }
  
  // -- Explain what we think is happening version wise.
  if (!context.prevVersion) {
    lines.push(`This is your first visit or all storage was automatically cleared.`);
  } else if (context.prevVersion > context.curVersion) {
    lines.push(`You downgraded from ${context.prevVersion} to ${context.curVersion}.`);
  } else if (context.prevVersion < context.curVersion) {
    lines.push(`You upgraded from ${context.prevVersion} to ${context.curVersion}.`);
  } else {
    lines.push(`This is the same version (${context.curVersion}) as the last time you loaded this page.`);
  }
  
  bodyElem.textContent = lines.join("\n");
}

/**
 * Generate simple HTML to express what's going on, clobbering the hardcoded
 * "something is broken" message that will display if our JS fails to run.
 */
function renderStorageState(state) {
  const containerElem = document.getElementById("storageStateContainer");
  containerElem.removeAttribute("style");
  
  function renderSubsystem(subsystem, subsystemStatus) {
    const elem = document.getElementById(`status-${subsystem}`);
    
    const goodOrBad = isBadStatus(subsystemStatus) ? "Bad" : "Good";
    
    elem.textContent = `${goodOrBad}: ${STATUS_EXPLANATIONS[subsystemStatus]} (${subsystemStatus})`;
    elem.className = subsystemStatus;
  }
  
  document.getElementById("brokenWarning").style.display = "none";
  
  renderSubsystem("qm", state.qm);
  renderSubsystem("idb", state.idb);
  renderSubsystem("cacheApi", state.cache);
  renderSubsystem("ls", state.ls);
}

function renderDebugInfo(logs, context) {
  document.getElementById("debugContainer").removeAttribute("style");
  document.getElementById("logsContainer").textContent = logs.join("\n");
  document.getElementById("jsonContainer").textContent = JSON.stringify(context, null, 2);
}

function renderWrongBrowser() {
  document.getElementById("brokenWarning").style.display = "none";
  document.getElementById("wrongBrowser").style.display = "block";
}

export async function main() {
  const [state, context, logs] = await investigateStorage();
  return { state, logs }
}
