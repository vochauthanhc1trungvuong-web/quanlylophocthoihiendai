import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Class, Student, PointRecord, SharedLink, UserProfile } from '../types';
import { db, auth, googleProvider } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, addDoc, getDoc, updateDoc, query, where, Unsubscribe } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

interface AppState {
  classes: Class[];
  students: Student[];
  records: PointRecord[];
  links: SharedLink[];
  userProfiles: UserProfile[];
  user: User | null;
  currentUserProfile: UserProfile | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (uid: string, role: 'admin' | 'teacher' | 'viewer') => Promise<void>;
  addClass: (name: string) => void;
  deleteClass: (id: string) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  bulkAddStudents: (students: Omit<Student, 'id'>[]) => void;
  updateStudent: (id: string, name: string, avatarUrl?: string) => void;
  deleteStudent: (id: string) => void;
  addRecord: (record: Omit<PointRecord, 'id' | 'timestamp'>) => void;
  deleteRecord: (id: string) => void;
  addLink: (link: Omit<SharedLink, 'id' | 'createdAt'>) => void;
  deleteLink: (id: string) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<PointRecord[]>([]);
  const [links, setLinks] = useState<SharedLink[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const currentUserProfile = userProfiles.find(p => p.id === user?.uid) || null;
  const isAdmin = user?.email === 'vochauthanh.c1trungvuong@moet.edu.vn';

  useEffect(() => {
    let unsubClasses: Unsubscribe | undefined;
    let unsubStudents: Unsubscribe | undefined;
    let unsubRecords: Unsubscribe | undefined;
    let unsubLinks: Unsubscribe | undefined;
    let unsubUsers: Unsubscribe | undefined;

    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Cleanup previous data listeners when auth changes
      if (unsubClasses) unsubClasses();
      if (unsubStudents) unsubStudents();
      if (unsubRecords) unsubRecords();
      if (unsubLinks) unsubLinks();
      if (unsubUsers) unsubUsers();

      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            await setDoc(userRef, {
              id: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: currentUser.email === 'vochauthanh.c1trungvuong@moet.edu.vn' ? 'admin' : 'viewer',
              createdAt: Date.now()
            });
          } else {
            await setDoc(userRef, {
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
            }, { merge: true });
          }
        } catch (err) {
          console.error("Error setting user profile", err);
        }

        // Only query data based on roles
        const _isAdmin = currentUser.email === 'vochauthanh.c1trungvuong@moet.edu.vn';
        
        const classesQuery = _isAdmin ? collection(db, 'classes') : query(collection(db, 'classes'), where('ownerUid', '==', currentUser.uid));
        unsubClasses = onSnapshot(classesQuery, (snapshot) => {
          setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class)));
        }, (error) => console.error("Error fetching classes:", error));

        const studentsQuery = _isAdmin ? collection(db, 'students') : query(collection(db, 'students'), where('ownerUid', '==', currentUser.uid));
        unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
          setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
        }, (error) => console.error("Error fetching students:", error));

        const recordsQuery = _isAdmin ? collection(db, 'records') : query(collection(db, 'records'), where('ownerUid', '==', currentUser.uid));
        unsubRecords = onSnapshot(recordsQuery, (snapshot) => {
          setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PointRecord)));
        }, (error) => console.error("Error fetching records:", error));

        const linksQuery = _isAdmin ? collection(db, 'links') : query(collection(db, 'links'), where('ownerUid', '==', currentUser.uid));
        unsubLinks = onSnapshot(linksQuery, (snapshot) => {
          setLinks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SharedLink)));
          setIsLoading(false);
        }, (error) => {
          console.error("Error fetching links:", error);
          setIsLoading(false);
        });

        const usersQuery = _isAdmin ? collection(db, 'users') : query(collection(db, 'users'), where('id', '==', currentUser.uid));
        unsubUsers = onSnapshot(usersQuery, (snapshot) => {
          setUserProfiles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile)));
        }, (error) => {
          console.error("Error fetching users:", error);
        });

      } else {
        // Logged out
        setClasses([]);
        setStudents([]);
        setRecords([]);
        setLinks([]);
        setUserProfiles([]);
        setIsLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubClasses) unsubClasses();
      if (unsubStudents) unsubStudents();
      if (unsubRecords) unsubRecords();
      if (unsubLinks) unsubLinks();
      if (unsubUsers) unsubUsers();
    };
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert("Lỗi: Tên miền chưa được xác thực.\n\nVui lòng vào Firebase Console -> Authentication -> Settings -> Authorized domains và thêm tên miền:\n" + window.location.hostname);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const updateUserRole = async (uid: string, role: 'admin' | 'teacher' | 'viewer') => {
    try {
      await updateDoc(doc(db, 'users', uid), { role });
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const addClass = async (name: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'classes'), { name, ownerUid: user.uid });
    } catch (error) {
      console.error("Error adding class:", error);
    }
  };

  const deleteClass = async (id: string) => {
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'classes', id));
      
      students.filter(s => s.classId === id).forEach(s => {
        batch.delete(doc(db, 'students', s.id));
      });
      
      records.filter(r => r.classId === id).forEach(r => {
        batch.delete(doc(db, 'records', r.id));
      });
      
      links.filter(l => l.classId === id).forEach(l => {
        batch.delete(doc(db, 'links', l.id));
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  };

  const addStudent = async (student: Omit<Student, 'id'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'students'), { ...student, ownerUid: user.uid });
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  const bulkAddStudents = async (newStudents: Omit<Student, 'id'>[]) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      newStudents.forEach(student => {
        const newDocRef = doc(collection(db, 'students'));
        batch.set(newDocRef, { ...student, ownerUid: user.uid });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error bulk adding students:", error);
    }
  };

  const updateStudent = async (id: string, name: string, avatarUrl?: string) => {
    try {
      const student = students.find(s => s.id === id);
      if (student) {
        await setDoc(doc(db, 'students', id), { ...student, name, avatarUrl }, { merge: true });
      }
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'students', id));
      
      records.filter(r => r.studentId === id).forEach(r => {
        batch.delete(doc(db, 'records', r.id));
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const addRecord = async (record: Omit<PointRecord, 'id' | 'timestamp'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'records'), { ...record, timestamp: Date.now(), ownerUid: user.uid });
    } catch (error) {
      console.error("Error adding record:", error);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'records', id));
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const addLink = async (link: Omit<SharedLink, 'id' | 'createdAt'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'links'), { ...link, createdAt: Date.now(), ownerUid: user.uid });
    } catch (error) {
      console.error("Error adding link:", error);
    }
  };

  const deleteLink = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'links', id));
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        classes,
        students,
        records,
        links,
        userProfiles,
        user,
        currentUserProfile,
        login,
        logout,
        updateUserRole,
        addClass,
        deleteClass,
        addStudent,
        bulkAddStudents,
        updateStudent,
        deleteStudent,
        addRecord,
        deleteRecord,
        addLink,
        deleteLink,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
