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
  Fab,
  Divider,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  DialogContentText,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { usePatientsContext } from '../context/PatientsContext';
import { 
  getDepartments, 
  updateDepartmentBeds, 
  getHospitalDetails,
  updateHospitalDetails,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from '../firebase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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

const EditFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 80,
  right: 16,
  backgroundColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`edit-tabpanel-${index}`}
    aria-labelledby={`edit-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const AddDepartmentCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  border: `2px dashed ${theme.palette.primary.main}`,
  backgroundColor: 'transparent',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(3, 123, 65, 0.05)',
  },
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
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    mainDoctor: '',
    assistantDoctor: '',
    totalBeds: '',
  });
  const [errors, setErrors] = useState({});
  const { admittedPatients, dischargedPatients } = usePatientsContext();
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState('');
  const [nameError, setNameError] = useState('');
  const [isSecondStep, setIsSecondStep] = useState(false);

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

    const fetchData = async () => {
      if (!checkAuth()) return;
      
      setLoading(true);
      try {
        const hospitalId = localStorage.getItem('hospitalId');
        
        // Fetch departments
        const fetchedDepartments = await getDepartments(hospitalId);
        const departmentsWithStatus = fetchedDepartments.map(dept => ({
          ...dept,
          status: dept.availableBeds === 0 ? 'Full' : 'Active'
        }));
        setDepartments(departmentsWithStatus);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (departments.length > 0) {
      const updatedDepartments = departments.map(dept => {
        // Count admitted patients in this department
        const admittedCount = admittedPatients.filter(p => p.department === dept.name && p.status === 'Admitted').length;
        
        // Calculate new available beds
        const newAvailableBeds = Math.max(0, dept.totalBeds - admittedCount);
        
        return {
          ...dept,
          availableBeds: newAvailableBeds,
          status: newAvailableBeds === 0 ? 'Full' : 'Active',
        };
      });
      setDepartments(updatedDepartments);
    }
  }, [admittedPatients, dischargedPatients]);

  const handleBedCount = async (id, increment) => {
    const hospitalId = localStorage.getItem('hospitalId');
    if (!hospitalId) {
      toast.error('Please login again');
      return;
    }

    const department = departments.find(dept => dept.id === id);
    if (!department) return;

    const newAvailable = Math.max(0, Math.min(department.availableBeds + (increment ? 1 : -1), department.totalBeds));

    try {
      await updateDepartmentBeds(hospitalId, id, newAvailable);
      
      setDepartments(departments.map(dept => {
        if (dept.id === id) {
          return {
            ...dept,
            availableBeds: newAvailable,
            status: newAvailable === 0 ? 'Full' : 'Active',
          };
        }
        return dept;
      }));

      toast.success(`Available beds ${increment ? 'increased' : 'decreased'}`);
    } catch (error) {
      toast.error('Failed to update bed count');
      console.error(error);
    }
  };

  const getBedUtilization = (available, total) => {
    if (!total) return 0;
    const occupied = total - available;
    const utilization = (occupied / total) * 100;
    return Math.min(100, Math.max(0, utilization));
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

  const handleAddNewClick = () => {
    setDepartmentName('');
    setNameError('');
    setNameDialogOpen(true);
    setIsSecondStep(false);
  };

  const handleNameSubmit = async () => {
    if (!departmentName.trim()) {
      setNameError('Department name is required');
      return;
    }

    try {
      const hospitalId = localStorage.getItem('hospitalId');
      
      // Create initial document with just the name
      await addDepartment(hospitalId, departmentName.trim(), {
        status: 'Active'
      });

      // Close name dialog and open details dialog
      setNameDialogOpen(false);
      setIsSecondStep(true);
      setNewDepartment({
        name: departmentName.trim(),
        mainDoctor: '',
        assistantDoctor: '',
        totalBeds: '',
      });
      setEditDialogOpen(true);
    } catch (error) {
      if (error.message.includes('already exists')) {
        setNameError('A department with this name already exists');
      } else {
        console.error('Creation error:', error);
        toast.error('Failed to create department');
      }
    }
  };

  const handleAddDepartment = async () => {
    if (!validateDepartment()) return;

    try {
      const hospitalId = localStorage.getItem('hospitalId');
      const departmentData = {
        name: newDepartment.name,
        mainDoctor: newDepartment.mainDoctor,
        assistantDoctor: newDepartment.assistantDoctor,
        totalBeds: parseInt(newDepartment.totalBeds),
        availableBeds: parseInt(newDepartment.totalBeds),
        status: 'Active',
      };

      // Update the existing document with full details
      await updateDepartment(hospitalId, departmentData.name, departmentData);
      
      // Update local state with the new department
      setDepartments([...departments, { 
        id: departmentData.name,  // Use name as ID
        ...departmentData 
      }]);
      
      setNewDepartment({
        name: '',
        mainDoctor: '',
        assistantDoctor: '',
        totalBeds: '',
      });
      setEditDialogOpen(false);
      setIsSecondStep(false);
      toast.success('Department added successfully');
    } catch (error) {
      console.error('Add department error:', error);
      toast.error('Failed to add department details');
    }
  };

  const handleEditDepartment = async (department) => {
    setSelectedDepartment(department);
    setNewDepartment({
      name: department.name,
      mainDoctor: department.mainDoctor,
      assistantDoctor: department.assistantDoctor,
      totalBeds: department.totalBeds.toString(),
    });
    setEditDialogOpen(true);
  };

  const handleUpdateDepartment = async () => {
    if (!validateDepartment() || !selectedDepartment) return;

    try {
      const hospitalId = localStorage.getItem('hospitalId');
      const departmentData = {
        ...newDepartment,
        totalBeds: parseInt(newDepartment.totalBeds),
      };

      await updateDepartment(hospitalId, selectedDepartment.id, departmentData);
      
      setDepartments(departments.map(dept => 
        dept.id === selectedDepartment.id 
          ? { ...dept, ...departmentData }
          : dept
      ));

      setSelectedDepartment(null);
      setNewDepartment({
        name: '',
        mainDoctor: '',
        assistantDoctor: '',
        totalBeds: '',
      });
      setEditDialogOpen(false);
      toast.success('Department updated successfully');
    } catch (error) {
      toast.error('Failed to update department');
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      // Clean up when exiting edit mode
      setSelectedDepartment(null);
      setNewDepartment({
        name: '',
        mainDoctor: '',
        assistantDoctor: '',
        totalBeds: '',
      });
    }
  };

  const handleDeleteClick = (department) => {
    setDepartmentToDelete(department);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return;

    try {
      const hospitalId = localStorage.getItem('hospitalId');
      await deleteDepartment(hospitalId, departmentToDelete.id);
      setDepartments(departments.filter(dept => dept.id !== departmentToDelete.id));
      toast.success('Department deleted successfully');
    } catch (error) {
      if (error.message.includes('admitted patients')) {
        toast.error('Cannot delete department with admitted patients');
      } else {
        toast.error('Failed to delete department');
      }
    } finally {
      setDeleteConfirmOpen(false);
      setDepartmentToDelete(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Department Overview
        </Typography>
        <Button
          variant="contained"
          color={isEditMode ? "success" : "primary"}
          startIcon={isEditMode ? <SaveRoundedIcon /> : <EditRoundedIcon />}
          onClick={toggleEditMode}
        >
          {isEditMode ? 'Save' : 'Edit'}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress />
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {isEditMode && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleEditDepartment(department)}
                            sx={{ 
                              backgroundColor: 'rgba(3, 123, 65, 0.1)',
                              '&:hover': {
                                backgroundColor: 'rgba(3, 123, 65, 0.2)',
                              }
                            }}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(department)}
                            sx={{ 
                              backgroundColor: 'rgba(211, 47, 47, 0.1)',
                              '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.2)',
                              }
                            }}
                          >
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      <StyledChip
                        label={department.status}
                        color={department.status === 'Full' ? 'error' : 'success'}
                        size="small"
                      />
                    </Box>
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
                        value={getBedUtilization(department.availableBeds, department.totalBeds)}
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
                        disabled={department.availableBeds === 0}
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
                        {department.availableBeds}
                        <Typography variant="body2" color="text.secondary">
                          /{department.totalBeds}
                        </Typography>
                      </BedCount>
                      
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleBedCount(department.id, true)}
                        disabled={department.availableBeds === department.totalBeds}
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

          {isEditMode && (
            <Grid item xs={12} sm={6} md={4}>
              <AddDepartmentCard onClick={handleAddNewClick}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 2,
                  p: 3 
                }}>
                  <AddCircleIcon sx={{ fontSize: 64, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary.main">
                    Add Department
                  </Typography>
                </Box>
              </AddDepartmentCard>
            </Grid>
          )}
        </Grid>
      )}

      {/* Name Dialog */}
      <Dialog
        open={nameDialogOpen}
        onClose={() => {
          setNameDialogOpen(false);
          setDepartmentName('');
          setNameError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Enter Department Name</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Department Name"
            value={departmentName}
            onChange={(e) => {
              setDepartmentName(e.target.value);
              setNameError('');
            }}
            error={!!nameError}
            helperText={nameError}
            margin="normal"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNameDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNameSubmit}
          >
            Next
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedDepartment(null);
          setNewDepartment({
            name: '',
            mainDoctor: '',
            assistantDoctor: '',
            totalBeds: '',
          });
          setErrors({});
          setIsSecondStep(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedDepartment ? 'Edit Department' : 'Add Department Details'}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Department Name"
            value={newDepartment.name}
            margin="normal"
            disabled={true}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDialogOpen(false);
            setIsSecondStep(false);
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={selectedDepartment ? handleUpdateDepartment : handleAddDepartment}
          >
            {selectedDepartment ? 'Update Department' : 'Create Department'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDepartmentToDelete(null);
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the department "{departmentToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteConfirmOpen(false);
            setDepartmentToDelete(null);
          }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;