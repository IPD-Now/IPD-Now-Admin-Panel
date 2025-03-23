import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Divider,
  InputAdornment,
  Tab,
  Tabs,
  FormControlLabel,
  Switch,
  IconButton,
  LinearProgress,
  Dialog as PdfDialog,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNotifications } from '../context/NotificationsContext';
import { usePatientsContext } from '../context/PatientsContext';
import { getUpcomingPatients, admitPatient, dischargePatient, subscribeToUpcomingPatients } from '../firebase';
import { toast } from 'react-toastify';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  borderRadius: theme.spacing(1),
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: status === 'Admitted' 
    ? theme.palette.success.light 
    : theme.palette.grey[300],
  color: status === 'Admitted' 
    ? theme.palette.success.dark 
    : theme.palette.grey[700],
}));

const ReportButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  gap: theme.spacing(0.5),
}));

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    {...other}
  >
    {value === index && children}
  </div>
);

const DetailField = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .label': {
    fontWeight: 600,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
  },
  '& .value': {
    color: theme.palette.text.primary,
  },
}));

const ReportSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.02)',
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const initialPatients = [
  {
    id: 1,
    name: 'John Doe',
    age: 45,
    appointmentTime: '10:00 AM',
    department: 'Cardiology',
    condition: 'Regular Checkup',
    phoneNumber: '+91 98765 43210',
    emergencyContact: '+91 98765 43211',
    photo: null,
    report: 'patient_report_1.pdf',
  },
  {
    id: 2,
    name: 'Jane Smith',
    age: 32,
    appointmentTime: '11:30 AM',
    department: 'Neurology',
    condition: 'Migraine',
    phoneNumber: '+91 98765 43212',
    emergencyContact: '+91 98765 43213',
    photo: null,
    report: 'patient_report_2.pdf',
  },
  {
    id: 3,
    name: 'Robert Johnson',
    age: 58,
    appointmentTime: '2:00 PM',
    department: 'Orthopedics',
    condition: 'Back Pain',
    photo: null,
  },
  {
    id: 4,
    name: 'Emily Brown',
    age: 28,
    appointmentTime: '3:30 PM',
    department: 'Pathology',
    condition: 'Blood Test',
    photo: null,
  },
];

const UpcomingPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isAllDay, setIsAllDay] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { addNotification } = useNotifications();
  const { admittedPatients, dischargedPatients, addPatient } = usePatientsContext();
  const [pdfOpen, setPdfOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      const hospitalId = localStorage.getItem('hospitalId');
      
      if (!isAuthenticated || !hospitalId) {
        toast.error('Please login to continue');
        navigate('/login');
        return false;
      }
      return true;
    };

    if (!checkAuth()) return;

    const hospitalId = localStorage.getItem('hospitalId');
    setLoading(true);

    // Set up real-time listener for patients
    const unsubscribe = subscribeToUpcomingPatients(hospitalId, (updatedPatients) => {
      try {
        // Set default status if not present
        const patientsWithStatus = updatedPatients.map(patient => ({
          ...patient,
          status: patient.status || 'Upcoming',
          department: patient.department || 'Unknown',
          name: patient.name || 'Unknown Patient'
        }));
        setPatients(patientsWithStatus);
      } catch (error) {
        console.error('Error processing patients:', error);
        toast.error('Error updating patient list');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigate]);

  const handleAdmit = async (patient) => {
    try {
      const hospitalId = localStorage.getItem('hospitalId');
      if (!hospitalId) {
        toast.error('Please login again');
        return;
      }

      // Get department ID from the departments collection
      const departmentsRef = collection(db, 'hospitals', hospitalId, 'departments');
      const q = query(departmentsRef, where('name', '==', patient.department));
      const departmentSnapshot = await getDocs(q);
      
      if (departmentSnapshot.empty) {
        toast.error('Department not found');
        return;
      }

      const departmentDoc = departmentSnapshot.docs[0];
      
      // Update patient with department ID
      await updateDoc(doc(db, 'hospitals', hospitalId, 'upcomingPatients', patient.id), {
        departmentId: departmentDoc.id
      });

      // Now admit the patient
      await admitPatient(hospitalId, patient.id);

      // Update status in user's Bookings collection - using the correct path structure
      if (patient.userId && patient.bookingId) {
        const userBookingRef = doc(db, 'Users', patient.userId, 'Bookings', patient.bookingId);
        await updateDoc(userBookingRef, {
          status: 'Admitted',
          admissionDateTime: new Date().toISOString()
        });
      }
      
      addNotification({
        title: 'Patient Admitted',
        message: `${patient.name} has been admitted to ${patient.department}`,
      });
      
      toast.success('Patient admitted successfully');
      if (detailsOpen) setDetailsOpen(false);
      
      // Switch to Admitted tab
      setTabValue(1);
    } catch (error) {
      if (error.message.includes('No beds available')) {
        toast.error('Cannot admit patient: No beds available in this department');
      } else {
        console.error('Admission error:', error);
        toast.error('Failed to admit patient');
      }
    }
  };

  const handleDischarge = async (patientId) => {
    try {
      const hospitalId = localStorage.getItem('hospitalId');
      if (!hospitalId) {
        toast.error('Please login again');
        return;
      }

      const patient = patients.find(p => p.id === patientId);
      if (!patient) {
        toast.error('Patient not found');
        return;
      }

      await dischargePatient(hospitalId, patientId);

      // Update status in user's Bookings collection - using the correct path structure
      if (patient.userId && patient.bookingId) {
        const userBookingRef = doc(db, 'Users', patient.userId, 'Bookings', patient.bookingId);
        await updateDoc(userBookingRef, {
          status: 'Discharged',
          dischargeDateTime: new Date().toISOString()
        });
      }
      
      addNotification({
        title: 'Patient Discharged',
        message: `${patient.name} has been discharged from ${patient.department}`,
      });
      
      toast.success('Patient discharged successfully');
      if (detailsOpen) setDetailsOpen(false);
      
      // Switch to Discharged tab
      setTabValue(2);
    } catch (error) {
      console.error('Discharge error:', error);
      toast.error('Failed to discharge patient');
    }
  };

  const getPatientsByStatus = (status) => {
    console.log('Filtering patients by status:', status);
    console.log('All patients:', patients);
    const filtered = patients.filter(patient => patient.status === status);
    console.log('Filtered patients:', filtered);
    return filtered;
  };

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setDetailsOpen(true);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filterPatients = (patientList) => {
    return patientList.filter(patient => {
      // Text search
      const matchesSearch = 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.department.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Date and time filtering
      if (selectedDate) {
        let patientDate;
        
        if (tabValue === 0) {
          // For upcoming patients, create a date from the appointment time
          const today = dayjs();
          const [time, period] = patient.appointmentTime.split(' ');
          const [hours, minutes] = time.split(':');
          let hour = parseInt(hours);
          
          // Convert to 24-hour format
          if (period === 'PM' && hour !== 12) hour += 12;
          if (period === 'AM' && hour === 12) hour = 0;
          
          patientDate = today.hour(hour).minute(parseInt(minutes));
        } else {
          // For admitted/discharged patients
          patientDate = dayjs(tabValue === 1 ? patient.admissionDate : patient.dischargeDate);
        }

        const filterDate = dayjs(selectedDate);

        // Compare dates (only year, month, day)
        if (filterDate.format('YYYY-MM-DD') !== patientDate.format('YYYY-MM-DD')) {
          return false;
        }

        // Time filtering (only if not all day and time is selected)
        if (!isAllDay && selectedTime) {
          const filterTime = dayjs(selectedTime);
          
          // Compare only hours and minutes
          if (filterTime.hour() !== patientDate.hour() ||
              filterTime.minute() !== patientDate.minute()) {
            return false;
          }
        }
      }

      return true;
    });
  };

  const clearFilters = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setIsAllDay(true);
  };

  const formatDate = (timestamp, dateTimeString) => {
    if (timestamp?.toDate) {
      return dayjs(timestamp.toDate()).format('MMM DD, YYYY hh:mm A');
    } else if (dateTimeString) {
      return dayjs(dateTimeString).format('MMM DD, YYYY hh:mm A');
    } else if (timestamp instanceof Date) {
      return dayjs(timestamp).format('MMM DD, YYYY hh:mm A');
    }
    return 'N/A';
  };

  const handleViewPdf = (pdfUrl) => {
    if (!pdfUrl) {
      toast.error('No PDF report available');
      return;
    }
    setSelectedPdf(pdfUrl);
    setPdfOpen(true);
  };

  const handleViewReport = (reportUrl) => {
    if (!reportUrl) {
      toast.error('No report available for this patient');
      return;
    }
    setSelectedPdfUrl(reportUrl);
    setPdfDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Patient Management
      </Typography>

      {loading ? (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress />
        </Box>
      ) : (
        <>
          <SearchContainer>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SearchField
                fullWidth
                placeholder="Search by name or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <IconButton
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? 'primary' : 'default'}
              >
                <FilterListIcon />
              </IconButton>
            </Box>

            {showFilters && (
              <FilterContainer>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Filter by date"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    slotProps={{ textField: { sx: { width: 200 } } }}
                  />
                  {!isAllDay && (
                    <TimePicker
                      label="Filter by time"
                      value={selectedTime}
                      onChange={(newValue) => setSelectedTime(newValue)}
                      slotProps={{ textField: { sx: { width: 200 } } }}
                    />
                  )}
                </LocalizationProvider>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isAllDay}
                      onChange={(e) => {
                        setIsAllDay(e.target.checked);
                        if (e.target.checked) {
                          setSelectedTime(null);
                        }
                      }}
                    />
                  }
                  label="All Day"
                />
                {(selectedDate || selectedTime) && (
                  <IconButton onClick={clearFilters} size="small">
                    <ClearIcon />
                  </IconButton>
                )}
              </FilterContainer>
            )}
          </SearchContainer>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Upcoming" />
              <Tab label="Admitted" />
              <Tab label="Discharged" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <List>
              {filterPatients(getPatientsByStatus('Upcoming')).map((patient) => (
                <StyledListItem
                  key={patient.id}
                  elevation={1}
                  component={Paper}
                >
                  <ListItemAvatar>
                    {patient.photo ? (
                      <Avatar src={patient.photo} alt={patient.name} />
                    ) : (
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    )}
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={patient.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" component="span">
                          {`${patient.age} years | ${patient.department}`}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Arrived: {patient.timestamp ? formatDate(patient.timestamp) : patient.createdAt}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <Box>
                    <ActionButton
                      variant="outlined"
                      color="primary"
                      onClick={() => handleViewDetails(patient)}
                    >
                      Details
                    </ActionButton>
                    <ActionButton
                      variant="contained"
                      color="primary"
                      onClick={() => handleAdmit(patient)}
                    >
                      Admit
                    </ActionButton>
                  </Box>
                </StyledListItem>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <List>
              {filterPatients(getPatientsByStatus('Admitted')).map((patient) => (
                <StyledListItem
                  key={patient.id}
                  elevation={1}
                  component={Paper}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={patient.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" component="span">
                          {`${patient.age} years | ${patient.department}`}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Admitted on: {formatDate(patient.admissionDate, patient.admissionDateTime)}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusChip
                      label="Admitted"
                      status="Admitted"
                      size="small"
                    />
                    <ActionButton
                      variant="outlined"
                      color="primary"
                      onClick={() => handleViewDetails(patient)}
                    >
                      Details
                    </ActionButton>
                    <ActionButton
                      variant="contained"
                      color="error"
                      onClick={() => handleDischarge(patient.id)}
                    >
                      Discharge
                    </ActionButton>
                  </Box>
                </StyledListItem>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <List>
              {filterPatients(getPatientsByStatus('Discharged')).map((patient) => (
                <StyledListItem
                  key={patient.id}
                  elevation={1}
                  component={Paper}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={patient.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" component="span">
                          {`${patient.age} years | ${patient.department}`}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Admitted: {formatDate(patient.admissionDate, patient.admissionDateTime)}
                          <br />
                          Discharged: {formatDate(patient.dischargeDate, patient.dischargeDateTime)}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusChip
                      label="Discharged"
                      status="Discharged"
                      size="small"
                    />
                    <ActionButton
                      variant="outlined"
                      color="primary"
                      onClick={() => handleViewDetails(patient)}
                    >
                      Details
                    </ActionButton>
                  </Box>
                </StyledListItem>
              ))}
            </List>
          </TabPanel>

          <Dialog
            open={detailsOpen}
            onClose={() => setDetailsOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            {selectedPatient && (
              <>
                <DialogTitle>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Patient Details
                  </Typography>
                </DialogTitle>
                <DialogContent dividers>
                  <Box sx={{ py: 2 }}>
                    {/* Personal Information */}
                    <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
                      Personal Information
                    </Typography>
                    <DetailField>
                      <Typography className="label">Name</Typography>
                      <Typography className="value">{selectedPatient.name}</Typography>
                    </DetailField>

                    <DetailField>
                      <Typography className="label">Age</Typography>
                      <Typography className="value">{selectedPatient.age} years</Typography>
                    </DetailField>

                    <DetailField>
                      <Typography className="label">Phone Number</Typography>
                      <Typography className="value">{selectedPatient.phoneNumber}</Typography>
                    </DetailField>

                    <DetailField>
                      <Typography className="label">Address</Typography>
                      <Typography className="value">{selectedPatient.address}</Typography>
                    </DetailField>

                    <DetailField>
                      <Typography className="label">Emergency Contact</Typography>
                      <Typography className="value">{selectedPatient.emergencyContact}</Typography>
                    </DetailField>

                    <DetailField>
                      <Typography className="label">User ID</Typography>
                      <Typography className="value">{selectedPatient.userId}</Typography>
                    </DetailField>

                    {/* Department Information */}
                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 4, mb: 2 }}>
                      Department Information
                    </Typography>
                    <DetailField>
                      <Typography className="label">Department</Typography>
                      <Typography className="value">{selectedPatient.department}</Typography>
                    </DetailField>

                    <DetailField>
                      <Typography className="label">Department ID</Typography>
                      <Typography className="value">{selectedPatient.departmentId}</Typography>
                    </DetailField>

                    <DetailField>
                      <Typography className="label">Hospital Name</Typography>
                      <Typography className="value">{selectedPatient.hospitalName}</Typography>
                    </DetailField>

                    <DetailField>
                      <Typography className="label">Hospital ID</Typography>
                      <Typography className="value">{selectedPatient.hospitalId}</Typography>
                    </DetailField>

                    {/* Medical Information */}
                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 4, mb: 2 }}>
                      Medical Information
                    </Typography>
                    <DetailField>
                      <Typography className="label">Condition</Typography>
                      <Typography className="value">{selectedPatient.condition || 'Not specified'}</Typography>
                    </DetailField>

                    <Box sx={{ mb: 3 }}>
                      <Typography className="label" gutterBottom>Medical History</Typography>
                      <Box sx={{ pl: 2 }}>
                        <DetailField>
                          <Typography className="label">Allergies</Typography>
                          <Typography className="value">{selectedPatient.medicalHistory?.allergies || 'None'}</Typography>
                        </DetailField>
                        <DetailField>
                          <Typography className="label">Conditions</Typography>
                          <Typography className="value">{selectedPatient.medicalHistory?.conditions || 'None'}</Typography>
                        </DetailField>
                        <DetailField>
                          <Typography className="label">Family History</Typography>
                          <Typography className="value">{selectedPatient.medicalHistory?.familyHistory || 'None'}</Typography>
                        </DetailField>
                        <DetailField>
                          <Typography className="label">Medications</Typography>
                          <Typography className="value">{selectedPatient.medicalHistory?.medications || 'None'}</Typography>
                        </DetailField>
                        <DetailField>
                          <Typography className="label">Surgeries</Typography>
                          <Typography className="value">{selectedPatient.medicalHistory?.surgeries || 'None'}</Typography>
                        </DetailField>
                      </Box>
                    </Box>

                    {/* Ambulance Information */}
                    {selectedPatient.withAmbulance && (
                      <>
                        <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 4, mb: 2 }}>
                          Ambulance Details
                        </Typography>
                        <DetailField>
                          <Typography className="label">Ambulance Call ID</Typography>
                          <Typography className="value">{selectedPatient.ambulanceCallId}</Typography>
                        </DetailField>
                        <DetailField>
                          <Typography className="label">Status</Typography>
                          <Typography className="value">{selectedPatient.ambulanceDetails?.status}</Typography>
                        </DetailField>
                        <DetailField>
                          <Typography className="label">Call Time</Typography>
                          <Typography className="value">{selectedPatient.ambulanceDetails?.callTime}</Typography>
                        </DetailField>
                        <DetailField>
                          <Typography className="label">Request ID</Typography>
                          <Typography className="value">{selectedPatient.ambulanceDetails?.requestId}</Typography>
                        </DetailField>
                      </>
                    )}

                    {/* Timestamps */}
                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 4, mb: 2 }}>
                      Time Information
                    </Typography>
                    <DetailField>
                      <Typography className="label">Created At</Typography>
                      <Typography className="value">{selectedPatient.timestamp ? formatDate(selectedPatient.timestamp) : selectedPatient.createdAt}</Typography>
                    </DetailField>
                    {selectedPatient.status === 'Admitted' && (
                      <DetailField>
                        <Typography className="label">Admission Date</Typography>
                        <Typography className="value">{formatDate(selectedPatient.admissionDate, selectedPatient.admissionDateTime)}</Typography>
                      </DetailField>
                    )}
                    {selectedPatient.status === 'Discharged' && (
                      <>
                        <DetailField>
                          <Typography className="label">Admission Date</Typography>
                          <Typography className="value">{formatDate(selectedPatient.admissionDate, selectedPatient.admissionDateTime)}</Typography>
                        </DetailField>
                        <DetailField>
                          <Typography className="label">Discharge Date</Typography>
                          <Typography className="value">{formatDate(selectedPatient.dischargeDate, selectedPatient.dischargeDateTime)}</Typography>
                        </DetailField>
                      </>
                    )}
                    <DetailField>
                      <Typography className="label">Last Updated</Typography>
                      <Typography className="value">{selectedPatient.updatedAt}</Typography>
                    </DetailField>

                    {/* Location Information */}
                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 4, mb: 2 }}>
                      Location Information
                    </Typography>
                    <DetailField>
                      <Typography className="label">Latitude</Typography>
                      <Typography className="value">{selectedPatient.latitude}</Typography>
                    </DetailField>
                    <DetailField>
                      <Typography className="label">Longitude</Typography>
                      <Typography className="value">{selectedPatient.longitude}</Typography>
                    </DetailField>

                    {/* Medical Reports */}
                    {(selectedPatient.reportFileURL1 || selectedPatient.reportFileURL2) && (
                      <>
                        <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 4, mb: 2 }}>
                          Medical Reports
                        </Typography>
                        {selectedPatient.reportFileURL1 && (
                          <Box sx={{ mb: 2 }}>
                            <Button
                              variant="outlined"
                              color="primary"
                              startIcon={<PictureAsPdfIcon />}
                              onClick={() => handleViewReport(selectedPatient.reportFileURL1)}
                              fullWidth
                            >
                              View Medical Report 1
                            </Button>
                          </Box>
                        )}
                        {selectedPatient.reportFileURL2 && (
                          <Box sx={{ mb: 2 }}>
                            <Button
                              variant="outlined"
                              color="primary"
                              startIcon={<PictureAsPdfIcon />}
                              onClick={() => handleViewReport(selectedPatient.reportFileURL2)}
                              fullWidth
                            >
                              View Medical Report 2
                            </Button>
                          </Box>
                        )}
                      </>
                    )}

                    {/* Booking Information */}
                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 4, mb: 2 }}>
                      Booking Information
                    </Typography>
                    <DetailField>
                      <Typography className="label">Booking ID</Typography>
                      <Typography className="value">{selectedPatient.bookingId}</Typography>
                    </DetailField>
                    <DetailField>
                      <Typography className="label">Status</Typography>
                      <Typography className="value">
                        <Chip 
                          label={selectedPatient.status} 
                          color={
                            selectedPatient.status === 'Admitted' ? 'success' : 
                            selectedPatient.status === 'Discharged' ? 'error' : 
                            'default'
                          }
                          size="small"
                        />
                      </Typography>
                    </DetailField>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                  {selectedPatient.status !== 'Discharged' && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        if (selectedPatient.status === 'Admitted') {
                          handleDischarge(selectedPatient.id);
                        } else {
                          handleAdmit(selectedPatient);
                        }
                        setDetailsOpen(false);
                      }}
                    >
                      {selectedPatient.status === 'Admitted' ? 'Discharge Patient' : 'Admit Patient'}
                    </Button>
                  )}
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Add PDF Viewer Dialog */}
          <PdfDialog
            open={pdfOpen}
            onClose={() => setPdfOpen(false)}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Medical Report</Typography>
              <IconButton onClick={() => setPdfOpen(false)} size="small">
                <ClearIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ height: '80vh', p: 0 }}>
              {selectedPdf && (
                <iframe
                  src={selectedPdf}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  title="PDF Viewer"
                />
              )}
            </DialogContent>
          </PdfDialog>

          {/* Add this new dialog for PDF viewing */}
          <Dialog
            open={pdfDialogOpen}
            onClose={() => setPdfDialogOpen(false)}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Typography variant="h6">Medical Report</Typography>
              <IconButton 
                onClick={() => setPdfDialogOpen(false)}
                size="small"
              >
                <ClearIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ height: '80vh', p: 0 }}>
              {selectedPdfUrl && (
                <iframe
                  src={selectedPdfUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  title="PDF Viewer"
                />
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default UpcomingPatients;