import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export function ReferralHandler() {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function trackClick() {
      if (!code) return;

      try {
        // Find user by referral code
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referralCode', '==', code.toUpperCase()));
        
        let querySnapshot;
        try {
          querySnapshot = await getDocs(q);
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, 'users');
          return;
        }

        if (!querySnapshot.empty) {
          const referrerDoc = querySnapshot.docs[0];
          const referrerUid = referrerDoc.id;

          // Prevent self-referral tracking in storage if possible (though we don't know the current user yet)
          localStorage.setItem('referrerUid', referrerUid);

          // Log click
          try {
            await addDoc(collection(db, 'clicks'), {
              referrerUid,
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'clicks');
          }

          // Increment click count on user profile
          try {
            await updateDoc(doc(db, 'users', referrerUid), {
              clicks: increment(1)
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `users/${referrerUid}`);
          }
        }
      } catch (error) {
        console.error('Error tracking click:', error);
      } finally {
        navigate('/', { replace: true });
      }
    }

    trackClick();
  }, [code, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to ReferralHub...</p>
      </div>
    </div>
  );
}
