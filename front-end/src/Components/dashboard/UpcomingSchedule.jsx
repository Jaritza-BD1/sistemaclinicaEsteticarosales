import React from 'react';
import { Card, CardContent, CardHeader, List, ListItem, ListItemText, Typography } from '@mui/material';
import './dashboard.css';

const UpcomingSchedule = () => {
  const schedule = [
    { time: '09:00 AM', patient: 'Ana López', service: 'Consulta inicial' },
    { time: '10:30 AM', patient: 'Sofía Ramírez', service: 'Relleno facial' },
    { time: '12:00 PM', patient: 'Elena Castro', service: 'Peeling químico' }
  ];

  return (
    <Card>
      <CardHeader title={<Typography variant="h6">Próximas Citas</Typography>} />
      <CardContent>
        <List>
          {schedule.map((item, index) => (
            <ListItem key={index} divider>
              <ListItemText
                primary={<>
                  <strong>{item.time}</strong> <span style={{ marginLeft: 12 }}>{item.patient}</span>
                </>}
                secondary={item.service}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default UpcomingSchedule;