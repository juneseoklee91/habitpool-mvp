// Mock Firebase Implementation for MVP Testing without Backend Keys
// Stores data in LocalStorage

// Auth Mocks
export type User = any;
export const auth = {} as any;
export const db = {} as any;
export const storage = {} as any;

let currentUser: any = null;
let authStateListener: ((user: any) => void) | null = null;

const emitAuthState = () => {
  if (authStateListener) authStateListener(currentUser);
};

export const onAuthStateChanged = (authInstance: any, callback: (user: any) => void) => {
  authStateListener = callback;
  if (typeof window !== "undefined") {
    const savedUser = localStorage.getItem("mock_firebase_user");
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
    }
  }
  callback(currentUser);
  return () => { authStateListener = null; };
};

export const signInWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Allow predefined admin
  if (email === "admin@test.com" && password === "admin123") {
    currentUser = { uid: "admin-id", email };
  } else if (email === "demo@habit.com") {
    currentUser = { uid: "demo-id", email };
  } else {
    // Or just accept any password for testing
    currentUser = { uid: email.replace(/[^a-z0-9]/gi, '_'), email };
  }
  localStorage.setItem("mock_firebase_user", JSON.stringify(currentUser));
  emitAuthState();
  return { user: currentUser };
};

export const createUserWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  currentUser = { uid: email.replace(/[^a-z0-9]/gi, '_'), email };
  localStorage.setItem("mock_firebase_user", JSON.stringify(currentUser));
  emitAuthState();
  return { user: currentUser };
};

export const updateProfile = async (user: any, { displayName }: { displayName: string }) => {
  if (currentUser) {
    currentUser.displayName = displayName;
    localStorage.setItem("mock_firebase_user", JSON.stringify(currentUser));
    emitAuthState();
  }
};

export const signOut = async (authInstance: any) => {
  currentUser = null;
  localStorage.removeItem("mock_firebase_user");
  emitAuthState();
};

// Firestore Mocks
const getLocalData = (collectionName: string) => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(`mock_db_${collectionName}`);
  let parsed = data ? JSON.parse(data) : [];

  if (collectionName === "challenges") {
    const hasMock = parsed.some((c: any) => c.id === "mock1");
    if (!hasMock) {
      const defaultChallenges = [
        { id: "mock1", title: "매일 아침 30분 운동하기", type: "regular", targetSuccessRate: 80, entryFee: 50, status: "waiting", userId: "dummy1", createdAt: Date.now() },
        { id: "mock2", title: "매일 물 2리터 마시기", type: "regular", targetSuccessRate: 90, entryFee: 30, status: "waiting", userId: "dummy2", createdAt: Date.now() - 1000 },
        { id: "mock3", title: "아침 6시 기상 인증", type: "wakeup", targetTime: "06:00", targetSuccessRate: 70, entryFee: 100, status: "waiting", userId: "dummy3", createdAt: Date.now() - 2000 },
        { id: "mock4", title: "저녁 식후 영양제 챙겨먹기", type: "regular", targetSuccessRate: 95, entryFee: 10, status: "waiting", userId: "dummy4", createdAt: Date.now() - 3000 },
        { id: "mock5", title: "자기 전 독서 10페이지", type: "regular", targetSuccessRate: 85, entryFee: 40, status: "waiting", userId: "dummy5", createdAt: Date.now() - 4000 },
        { id: "mock6", title: "하루 감사일기 쓰기", type: "regular", targetSuccessRate: 80, entryFee: 20, status: "waiting", userId: "dummy6", createdAt: Date.now() - 5000 },
        { id: "mock7", title: "매일 스쿼트 100개", type: "regular", targetSuccessRate: 60, entryFee: 150, status: "waiting", userId: "dummy7", createdAt: Date.now() - 6000 },
        { id: "mock8", title: "출근 전 영어 기사 1개 읽기", type: "regular", targetSuccessRate: 75, entryFee: 60, status: "waiting", userId: "dummy8", createdAt: Date.now() - 7000 },
        { id: "mock9", title: "점심시간 15분 산책", type: "regular", targetSuccessRate: 90, entryFee: 20, status: "waiting", userId: "dummy9", createdAt: Date.now() - 8000 },
        { id: "mock10", title: "새벽 5시 미라클 모닝", type: "wakeup", targetTime: "05:00", targetSuccessRate: 60, entryFee: 200, status: "waiting", userId: "dummy10", createdAt: Date.now() - 9000 },
        { id: "mock11", title: "사무실 책상 정리정돈", type: "regular", targetSuccessRate: 85, entryFee: 100, status: "waiting", userId: "dummy11", createdAt: Date.now() - 10000 },
        { id: "mock12", title: "매일 코딩 1커밋 달성", type: "regular", targetSuccessRate: 70, entryFee: 80, status: "waiting", userId: "dummy12", createdAt: Date.now() - 11000 }
      ];
      parsed = [...parsed, ...defaultChallenges];
      saveLocalData("challenges", parsed);
    }
  }

  return parsed;
};

const saveLocalData = (collectionName: string, data: any[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(`mock_db_${collectionName}`, JSON.stringify(data));
};

export const collection = (dbInstance: any, path: string) => {
  return { path };
};

export const doc = (dbInstance: any, collectionName: string, id: string) => {
  return { collectionName, id };
};

export const setDoc = async (docRef: any, data: any) => {
  const docs = getLocalData(docRef.collectionName);
  const existingIndex = docs.findIndex((d: any) => d.id === docRef.id);
  if (existingIndex >= 0) docs[existingIndex] = { id: docRef.id, ...data };
  else docs.push({ id: docRef.id, ...data });
  saveLocalData(docRef.collectionName, docs);
};

export const getDoc = async (docRef: any) => {
  if (docRef.collectionName === "users" && docRef.id === "admin-id") {
    return {
      exists: () => true,
      data: () => ({ email: "admin@test.com", nickname: "최고 관리자", pointBalance: 9999, role: "admin" })
    };
  }
  if (docRef.collectionName === "users" && docRef.id === "demo-id") {
    return {
      exists: () => true,
      data: () => ({ email: "demo@habit.com", nickname: "성실한데모유저", pointBalance: 70, role: "user" })
    };
  }
  const docs = getLocalData(docRef.collectionName);
  const found = docs.find((d: any) => d.id === docRef.id);
  return {
    exists: () => !!found,
    data: () => found
  };
};

export const deleteDoc = async (docRef: any) => {
  let docs = getLocalData(docRef.collectionName || docRef.path?.split('/')[0]);
  const colName = docRef.collectionName || docRef.path?.split('/')[0];
  docs = docs.filter((d: any) => d.id !== docRef.id);
  saveLocalData(colName, docs);
};

export const addDoc = async (collectionRef: any, data: any) => {
  const docs = getLocalData(collectionRef.path);
  const id = Math.random().toString(36).substring(2, 10);
  docs.push({ id, ...data, _createdAt: Date.now() });
  saveLocalData(collectionRef.path, docs);
  return { id };
};

export const updateDoc = async (docRef: any, data: any) => {
  const docs = getLocalData(docRef.collectionName || docRef.path?.split('/')[0]); // simplified
  const colName = docRef.collectionName || docRef.path?.split('/')[0];
  const existingIndex = docs.findIndex((d: any) => d.id === docRef.id);
  if (existingIndex >= 0) {
    docs[existingIndex] = { ...docs[existingIndex], ...data };
    saveLocalData(colName, docs);
  }
};

export const query = (collectionRef: any, ...constraints: any[]) => {
  return { collectionRef, constraints };
};

export const where = (field: string, op: string, value: any) => {
  return { type: 'where', field, op, value };
};

export const orderBy = (field: string, direction: string = 'asc') => {
  return { type: 'orderBy', field, direction };
};

export const getDocs = async (queryRef: any) => {
  let docs = getLocalData(queryRef.collectionRef ? queryRef.collectionRef.path : queryRef.path);

  if (queryRef.constraints) {
    for (const constraint of queryRef.constraints) {
      if (constraint.type === 'where') {
        docs = docs.filter((d: any) => {
          if (constraint.op === '==') return d[constraint.field] === constraint.value;
          return true; // simplified
        });
      }
      if (constraint.type === 'orderBy') {
        docs.sort((a: any, b: any) => {
          const valA = a[constraint.field] || a._createdAt || 0;
          const valB = b[constraint.field] || b._createdAt || 0;
          return constraint.direction === 'desc' ? valB - valA : valA - valB;
        });
      }
    }
  }

  return {
    docs: docs.map((d: any) => ({
      id: d.id,
      data: () => d
    }))
  };
};

export const serverTimestamp = () => {
  return new Date().toISOString(); // Simplified for mock
};

// Storage Mocks
export const ref = (storageInstance: any, path: string) => {
  return { path };
};

export const uploadBytes = async (storageRef: any, file: any) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return { ref: storageRef };
};

export const getDownloadURL = async (storageRef: any) => {
  // Return a dummy image URL
  return "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&auto=format&fit=crop";
};
