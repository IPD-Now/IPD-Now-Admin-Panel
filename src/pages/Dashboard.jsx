import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  styled,
  Chip,
  LinearProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { usePatientsContext } from '../context/PatientsContext';

const DepartmentCard = styled(Card)(({ theme }) => ({
  height: '100%',
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -1,
    left: 16,
    right: 16,
    height: 2,
    background: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius,
  },
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const BedCount = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '1.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  fontWeight: 500,
}));

const FloatingFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 90,
  right: 24,
  zIndex: theme.zIndex.speedDial,
}));

const initialDepartments = [
  {
    id: 1,
    name: 'Cardiology',
    mainDoctor: 'Dr. John Smith',
    assistantDoctor: 'Dr. Sarah Johnson',
    bedsAvailable: 10,
    totalBeds: 15,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Pathology',
    mainDoctor: 'Dr. Michael Brown',
    assistantDoctor: 'Dr. Emily Davis',
    bedsAvailable: 15,
    totalBeds: 20,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Radiology',
    mainDoctor: 'Dr. Robert Wilson',
    assistantDoctor: 'Dr. Lisa Anderson',
    bedsAvailable: 8,
    totalBeds: 12,
    status: 'Active',
  },
  {
    id: 4,
    name: 'Neurology',
    mainDoctor: 'Dr. James Miller',
    assistantDoctor: 'Dr. Emma White',
    bedsAvailable: 12,
    totalBeds: 18,
    status: 'Active',
  },
  {
    id: 5,
    name: 'Orthopedics',
    mainDoctor: 'Dr. William Taylor',
    assistantDoctor: 'Dr. Olivia Martin',
    bedsAvailable: 20,
    totalBeds: 25,
    status: 'Active',
  },
  {
    id: 6,
    name: 'Pediatrics',
    mainDoctor: 'Dr. David Clark',
    assistantDoctor: 'Dr. Sophie Turner',
    bedsAvailable: 15,
    totalBeds: 20,
    status: 'Active',
  },
];

const Dashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    mainDoctor: '',
    assistantDoctor: '',
    totalBeds: '',
  });
  const [errors, setErrors] = useState({});
  const { admittedPatients, dischargedPatients } = usePatientsContext();

  useEffect(() => {
    if (departments.length > 0) {
      const updatedDepartments = departments.map(dept => {
        const admittedCount = admittedPatients.filter(p => p.department === dept.name).length;
        return {
          ...dept,
          bedsAvailable: dept.totalBeds - admittedCount,
          status: dept.totalBeds - admittedCount === 0 ? 'Full' : 'Active',
        };
      });
      setDepartments(updatedDepartments);
    }
  }, [admittedPatients, dischargedPatients]);

  const handleBedCount = (id, increment) => {
    setDepartments(departments.map(dept => {
      if (dept.id === id) {
        const newCount = Math.max(0, dept.bedsAvailable + (increment ? 1 : -1));
        return {
          ...dept,
          bedsAvailable: Math.min(newCount, dept.totalBeds),
          status: newCount === 0 ? 'Full' : 'Active',
        };
      }
      return dept;
    }));
  };

  const getBedUtilization = (available, total) => {
    return ((total - available) / total) * 100;
  };

  const validateDepartment = () => {
    const newErrors = {};
    if (!newDepartment.name.trim()) newErrors.name = 'Name is required';
    if (!newDepartment.mainDoctor.trim()) newErrors.mainDoctor = 'Main doctor is required';
    if (!newDepartment.assistantDoctor.trim()) newErrors.assistantDoctor = 'Assistant doctor is required';
    if (!newDepartment.totalBeds || newDepartment.totalBeds < 1) {
      newErrors.totalBeds = 'Total beds must be at least 1';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddDepartment = () => {
    if (!validateDepartment()) return;

    const newDept = {
      id: Date.now(),
      ...newDepartment,
      bedsAvailable: parseInt(newDepartment.totalBeds),
      totalBeds: parseInt(newDepartment.totalBeds),
      status: 'Active',
    };

    setDepartments([...departments, newDept]);
    setNewDepartment({
      name: '',
      mainDoctor: '',
      assistantDoctor: '',
      totalBeds: '',
    });
    setErrors({});
  };

  const handleRemoveDepartment = (id) => {
    setDepartments(departments.filter(dept => dept.id !== id));
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Department Details
        </Typography>
        <StyledChip
          icon={<LocalHospitalRoundedIcon />}
          label={`${departments.length} Departments`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {departments.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Departments Added
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click the settings button to add departments
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {departments.map((department) => (
            <Grid item xs={12} sm={6} md={4} key={department.id}>
              <DepartmentCard>
                <CardContent>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
                      {department.name}
                    </Typography>
                    <StyledChip
                      label={department.status}
                      color={department.status === 'Full' ? 'error' : 'success'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Main Doctor:</strong> {department.mainDoctor}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Assistant:</strong> {department.assistantDoctor}
                  </Typography>

                  <StatsContainer>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Bed Utilization
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={getBedUtilization(department.bedsAvailable, department.totalBeds)}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'rgba(3, 123, 65, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#037B41',
                          }
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleBedCount(department.id, false)}
                        disabled={department.bedsAvailable === 0}
                        sx={{ 
                          backgroundColor: 'rgba(3, 123, 65, 0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(3, 123, 65, 0.2)',
                          }
                        }}
                      >
                        <RemoveRoundedIcon />
                      </IconButton>
                      
                      <BedCount>
                        {department.bedsAvailable}
                        <Typography variant="body2" color="text.secondary">
                          /{department.totalBeds}
                        </Typography>
                      </BedCount>
                      
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleBedCount(department.id, true)}
                        disabled={department.bedsAvailable === department.totalBeds}
                        sx={{ 
                          backgroundColor: 'rgba(3, 123, 65, 0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(3, 123, 65, 0.2)',
                          }
                        }}
                      >
                        <AddRoundedIcon />
                      </IconButton>
                    </Box>
                  </StatsContainer>
                </CardContent>
              </DepartmentCard>
            </Grid>
          ))}
        </Grid>
      )}

      <FloatingFab
        color="primary"
        aria-label="settings"
        onClick={() => setSettingsOpen(true)}
      >
        <SettingsRoundedIcon />
      </FloatingFab>

      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manage Departments</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Add New Department
            </Typography>
            <TextField
              fullWidth
              label="Department Name"
              value={newDepartment.name}
              onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Main Doctor"
              value={newDepartment.mainDoctor}
              onChange={(e) => setNewDepartment({ ...newDepartment, mainDoctor: e.target.value })}
              error={!!errors.mainDoctor}
              helperText={errors.mainDoctor}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Assistant Doctor"
              value={newDepartment.assistantDoctor}
              onChange={(e) => setNewDepartment({ ...newDepartment, assistantDoctor: e.target.value })}
              error={!!errors.assistantDoctor}
              helperText={errors.assistantDoctor}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Total Beds"
              type="number"
              value={newDepartment.totalBeds}
              onChange={(e) => setNewDepartment({ ...newDepartment, totalBeds: e.target.value })}
              error={!!errors.totalBeds}
              helperText={errors.totalBeds}
              margin="normal"
              InputProps={{ inputProps: { min: 1 } }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleAddDepartment}
              sx={{ mt: 2 }}
            >
              Add Department
            </Button>
          </Box>

          {departments.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
                Existing Departments
              </Typography>
              <List>
                {departments.map((dept) => (
                  <ListItem key={dept.id}>
                    <ListItemText
                      primary={dept.name}
                      secondary={`${dept.mainDoctor} | ${dept.totalBeds} beds`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveDepartment(dept.id)}
                        color="error"
                      >
                        <DeleteRoundedIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 