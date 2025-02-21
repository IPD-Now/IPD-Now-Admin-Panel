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
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isAllDay, setIsAllDay] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { addNotification } = useNotifications();
  const { admittedPatients, dischargedPatients, addPatient, dischargePatient } = usePatientsContext();

  useEffect(() => {
    // Simulate fetching initial patients
    setPatients(initialPatients);
  }, []);

  const handleAdmit = (patient) => {
    const admissionDate = new Date();
    const patientWithDate = {
      ...patient,
      admissionDate,
      admissionTime: dayjs(admissionDate).format('hh:mm A')
    };
    
    addPatient(patientWithDate, patient.department);
    addNotification({
      title: 'Patient Admitted',
      message: `${patient.name} has been admitted to ${patient.department}`,
    });
    setPatients(patients.filter(p => p.id !== patient.id));
  };

  const handleDischarge = (patientId) => {
    const patient = admittedPatients.find(p => p.id === patientId);
    if (patient) {
      dischargePatient(patientId);
      addNotification({
        title: 'Patient Discharged',
        message: `${patient.name} has been discharged from ${patient.department}`,
      });
    }
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

  const formatDate = (date) => {
    return dayjs(date).format('MMM DD, YYYY hh:mm A');
  };

  // Simulate new patient arrival every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newPatient = {
        id: Date.now(),
        name: 'New Patient',
        age: Math.floor(Math.random() * 50) + 20,
        appointmentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        department: ['Cardiology', 'Neurology', 'Orthopedics'][Math.floor(Math.random() * 3)],
        condition: 'Emergency Checkup',
        photo: null,
      };

      setPatients(prev => [newPatient, ...prev]);
      addNotification({
        title: 'New Patient Arrival',
        message: `${newPatient.name} has arrived for ${newPatient.department} at ${newPatient.appointmentTime}`,
      });
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [addNotification]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Patient Management
      </Typography>

      <SearchContainer>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <SearchField
            fullWidth
            placeholder="Search by patient name or department..."
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
            color={showFilters ? "primary" : "default"}
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
          <Tab label="Upcoming Patients" />
          <Tab label="Admitted Patients" />
          <Tab label="Discharged Patients" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <List>
          {filterPatients(patients).map((patient) => (
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
                secondary={`${patient.age} years | ${patient.appointmentTime} | ${patient.department}`}
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
          {filterPatients(admittedPatients).map((patient) => (
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
                      Admitted on: {formatDate(patient.admissionDate)}
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
                  variant="contained"
                  color="primary"
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
          {filterPatients(dischargedPatients).map((patient) => (
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
                      Admitted: {formatDate(patient.admissionDate)}
                      <br />
                      Discharged: {formatDate(patient.dischargeDate)}
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
                <ReportButton
                  variant="outlined"
                  color="primary"
                  startIcon={<DescriptionIcon />}
                >
                  Medical Report
                </ReportButton>
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
                <DetailField>
                  <Typography className="label">Name</Typography>
                  <Typography className="value">{selectedPatient.name}</Typography>
                </DetailField>

                <DetailField>
                  <Typography className="label">Department</Typography>
                  <Typography className="value">{selectedPatient.department}</Typography>
                </DetailField>

                <DetailField>
                  <Typography className="label">Phone Number</Typography>
                  <Typography className="value">{selectedPatient.phoneNumber}</Typography>
                </DetailField>

                <DetailField>
                  <Typography className="label">Emergency Contact</Typography>
                  <Typography className="value">{selectedPatient.emergencyContact}</Typography>
                </DetailField>

                <DetailField>
                  <Typography className="label">Age</Typography>
                  <Typography className="value">{selectedPatient.age} years</Typography>
                </DetailField>

                <DetailField>
                  <Typography className="label">Condition</Typography>
                  <Typography className="value">{selectedPatient.condition}</Typography>
                </DetailField>

                <ReportSection>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PictureAsPdfIcon color="error" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Medical Report
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        PDF Document
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PictureAsPdfIcon />}
                    sx={{ ml: 'auto' }}
                    onClick={() => {
                      // Handle PDF download/view
                      console.log('View PDF:', selectedPatient.report);
                    }}
                  >
                    View Report
                  </Button>
                </ReportSection>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  handleAdmit(selectedPatient);
                  setDetailsOpen(false);
                }}
              >
                Admit Patient
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default UpcomingPatients; 