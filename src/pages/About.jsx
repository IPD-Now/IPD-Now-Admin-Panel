import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  styled,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import UpdateIcon from '@mui/icons-material/Update';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const HOSPITAL_NAME = "City Hospital";

const HospitalHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(6),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -theme.spacing(3),
    left: '50%',
    transform: 'translateX(-50%)',
    width: 80,
    height: 4,
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius,
  },
}));

const Logo = styled('img')(({ theme }) => ({
  height: 80,
  marginBottom: theme.spacing(1),
}));

const PoweredBy = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.2s ease',
  cursor: 'default',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: 32,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5),
  '& .MuiListItemIcon-root': {
    minWidth: 40,
  },
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.main,
  },
  '& .MuiListItemText-primary': {
    fontWeight: 600,
  },
}));

const features = [
  {
    icon: <LocalHospitalIcon />,
    title: 'Advanced Care',
    description: 'State-of-the-art medical facilities and expert healthcare professionals.',
  },
  {
    icon: <MedicalServicesIcon />,
    title: 'Emergency Services',
    description: '24/7 emergency care with rapid response capabilities.',
  },
  {
    icon: <GroupsIcon />,
    title: 'Patient-Centric',
    description: 'Dedicated to providing compassionate and personalized patient care.',
  },
  {
    icon: <AccessTimeIcon />,
    title: 'Efficient Management',
    description: 'Streamlined processes for better patient care and reduced waiting times.',
  },
];

const services = [
  {
    title: 'IPD Management',
    description: 'Efficient inpatient department management with real-time bed tracking.',
  },
  {
    title: 'Emergency Response',
    description: 'Quick admission process for emergency cases with priority handling.',
  },
  {
    title: 'Patient Care',
    description: 'Comprehensive patient monitoring and care management system.',
  },
  {
    title: 'Digital Records',
    description: 'Secure electronic health records for better continuity of care.',
  },
];

const About = () => {
  return (
    <Box sx={{ p: 3 }}>
      <HospitalHeader>
        <Logo src="/hospital-logo.png" alt={HOSPITAL_NAME} />
        <Typography variant="h3" align="center" sx={{ fontWeight: 700 }}>
          {HOSPITAL_NAME}
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary">
          Delivering Excellence in Healthcare
        </Typography>
        <PoweredBy>
          <Typography variant="subtitle2" color="text.secondary">
            Powered by
          </Typography>
          <img src="/ipd-now-logo.png" alt="IPD Now" style={{ height: 20 }} />
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            IPD Now
          </Typography>
        </PoweredBy>
      </HospitalHeader>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <FeatureCard elevation={0}>
              <CardContent sx={{ textAlign: 'center' }}>
                {feature.icon}
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Our Services
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive healthcare services powered by advanced technology.
          </Typography>
        </Box>

        <List>
          {services.map((service, index) => (
            <StyledListItem key={index}>
              <ListItemIcon>
                <CheckCircleOutlineIcon />
              </ListItemIcon>
              <ListItemText
                primary={service.title}
                secondary={service.description}
                secondaryTypographyProps={{
                  sx: { mt: 0.5 }
                }}
              />
            </StyledListItem>
          ))}
        </List>
      </Paper>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 2024 {HOSPITAL_NAME} | Powered by IPD Now | Developed by Shudveta
        </Typography>
      </Box>
    </Box>
  );
};

export default About; 