import React from 'react';
import styled from 'styled-components';
import Card from '@mui/material/Card';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';

const StyledCard = styled(Card)`
  ${({ theme }) => `
    margin: 10px;
    border-radius: 10px;
    position: relative;
    min-height: 215px;
    background-color: transparent;
    color: ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.4)' : '#FFF'};
    border: 3px dashed ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.8)'};
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    align-self: stretch;
  `}
`;

const TerminatedAffectedPositions = () => (
  <StyledCard variant="outlined">
    <Typography variant="h4">
      <FormattedMessage
        description="terminated affected positions"
        defaultMessage="You have terminated all your active positions."
      />
    </Typography>
  </StyledCard>
);

export default TerminatedAffectedPositions;
