import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function Logs() {
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

  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Latitude", "Longitude", "Date", "Timestamp"];
    const tableRows = [];

    locations.forEach(location => {
      const [latitude, longitude, date, timestamp] = location.message.split(',');
      const locationData = [
        latitude,
        longitude,
        date,
        timestamp
      ];
      tableRows.push(locationData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text("Location Logs", 14, 15);
    doc.save('location_logs.pdf');
  };

  return (
    <div className='list-page'>
      <h1>Logs</h1>
      <button onClick={downloadPDF}>Download PDF</button>
      <ul className="list-container">
        {locations.map(location => (
          <li key={location.id} className="list-item">
            <div>Latitude: {location.message.split(',')[0]}</div>
            <div>Longitude: {location.message.split(',')[1]}</div>
            <div>Date: {location.message.split(',')[2]}</div>
            <div>Timestamp: {location.message.split(',')[3]}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Logs;