const fs = require('fs');

let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

content = content.replace(
  `        const q = query(
          collection(db, 'activity_logs'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(30)
        );`,
  `        // Removed orderBy to prevent composite index requirement. 
        // We will sort them in memory.
        const q = query(
          collection(db, 'activity_logs'),
          where('userId', '==', user.uid),
          limit(100)
        );`
);

content = content.replace(
  `        querySnapshot.forEach((doc) => {
          fetchedLogs.push({ id: doc.id, ...doc.data() } as ActivityLog);
        });
        setLogs(fetchedLogs);`,
  `        querySnapshot.forEach((doc) => {
          fetchedLogs.push({ id: doc.id, ...doc.data() } as ActivityLog);
        });
        // Sort in memory by timestamp descending
        fetchedLogs.sort((a, b) => {
          const timeA = a.timestamp?.seconds || 0;
          const timeB = b.timestamp?.seconds || 0;
          return timeB - timeA;
        });
        setLogs(fetchedLogs.slice(0, 30));`
);

fs.writeFileSync('src/pages/Profile.tsx', content, 'utf8');
