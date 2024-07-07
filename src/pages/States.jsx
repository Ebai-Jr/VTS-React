import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Make sure this path is correct
import { Margin } from '@mui/icons-material';

function States() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const locationsCollection = collection(db, 'locations');
      const locationsSnapshot = await getDocs(locationsCollection);
      const locationsList = locationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLocations(locationsList);
    };

    fetchLocations();
  }, []);

  return (
    <div className='states'>
      <h1>States</h1>
      <ul style={{margin: 'auto'}}>
        {locations.map(location => (
          <li key={location.id}>{location.message}</li>
        ))}
      </ul>
    </div>
  );
}

export default States;


// import React from 'react'

// function States() {
//   return (
//     <div className='states'>
//         <h1>States</h1>
//     </div>
//   )
// }

// export default States;