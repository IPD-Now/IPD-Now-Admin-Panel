import { createContext, useContext, useState } from 'react';

const PatientsContext = createContext({
  admittedPatients: [],
  dischargedPatients: [],
  addPatient: () => {},
  dischargePatient: () => {},
});

export const usePatientsContext = () => useContext(PatientsContext);

export const PatientsProvider = ({ children }) => {
  const [admittedPatients, setAdmittedPatients] = useState([]);
  const [dischargedPatients, setDischargedPatients] = useState([]);

  const addPatient = (patient, department) => {
    const newPatient = {
      ...patient,
      admissionDate: new Date(),
      department,
      status: 'Admitted',
      id: Date.now(),
    };
    setAdmittedPatients(prev => [newPatient, ...prev]);
  };

  const dischargePatient = (patientId) => {
    const patient = admittedPatients.find(p => p.id === patientId);
    if (patient) {
      const dischargedPatient = {
        ...patient,
        dischargeDate: new Date(),
        status: 'Discharged',
      };
      setDischargedPatients(prev => [dischargedPatient, ...prev]);
      setAdmittedPatients(prev => prev.filter(p => p.id !== patientId));
    }
  };

  return (
    <PatientsContext.Provider 
      value={{ 
        admittedPatients, 
        dischargedPatients, 
        addPatient, 
        dischargePatient,
      }}
    >
      {children}
    </PatientsContext.Provider>
  );
}; 