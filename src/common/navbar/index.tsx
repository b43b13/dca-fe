import React from 'react';
import styled from 'styled-components';
import WalletContext from 'common/wallet-context';
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';
import IconButton from '@mui/material/IconButton';
import TwitterIcon from '@mui/icons-material/Twitter';
import DiscordIcon from 'assets/svg/atom/discord';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import WhaveLogoDark from 'assets/logo/wave_logo_dark';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import InsightsIcon from '@mui/icons-material/Insights';
import AddIcon from '@mui/icons-material/Add';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useAppDispatch } from 'state/hooks';
import { useMainTab, useSubTab } from 'state/tabs/hooks';
import { changeMainTab, changeSubTab } from 'state/tabs/actions';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import Collapse from '@mui/material/Collapse';
import { useLocation } from 'react-router-dom';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import AppBar from '@mui/material/AppBar';
import ListItemText from '@mui/material/ListItemText';
import Container from '@mui/material/Container';
import usePushToHistory from 'hooks/usePushToHistory';
import ConnectWalletButtom from '../connect-wallet';
import WalletButtom from '../wallet';

const StyledNavbarWrapper = styled.div`
  width: 100%;
  background: rgba(5, 3, 13, 0.1);
  box-shadow: inset 0px -1px 0px rgba(255, 255, 255, 0.1);
  // padding: 10px 0px;
  padding-top: 10px;
  position: sticky;
  top: 0;
  // background: #121212;
  z-index: 90;
  backdrop-filter: blur(15px);
`;

const StyledNavbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1500px;
  margin: 0 auto;
  width: 100%;
`;

const StyledNavbarMainContent = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  gap: 10px;
`;

const StyledSubContent = styled.div`
  display: flex;
  flex: 1;
  margin-left: 60px;
`;

const StyledInsetSeparator = styled.div`
  display: flex;
  flex: 1;
  box-shadow: inset 0px -1px 0px rgba(255, 255, 255, 0.1);
  height: 1px;
`;

const StyledTabLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StyledNavbarEndContent = styled.div<{ small: boolean }>`
  display: flex;
  ${({ small }) => (small ? 'flex: 1;' : '')}
  ${({ small }) => (small ? 'padding: 0 10px;' : '')}
  ${({ small }) => (small ? 'justify-content: space-between;' : '')}
`;

const StyledButtonContainer = styled.div<{ breakpoint: ReturnType<typeof useCurrentBreakpoint> }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.breakpoint === 'xs' ? 'space-between' : 'flex-end')};
  ${(props) => (props.breakpoint === 'xs' ? 'flex: 1;' : '')}
`;

const StyledTab = styled(Tab)`
  text-transform: none;
  padding: 5px 10px;
`;

const StyledAppbarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 10px;
`;

const RawTabs = withStyles(() =>
  createStyles({
    root: {
      overflow: 'visible',
    },
    scroller: {
      overflow: 'visible !important',
    },
  })
)(Tabs);

const StyledTabs = styled(RawTabs)<{ breakpoint: ReturnType<typeof useCurrentBreakpoint>; noMargin?: boolean }>`
  ${({ noMargin }) => (noMargin ? 'margin-left: 0px;' : '')}
`;

interface NavBarProps {
  isLoading: boolean;
}

const NavBar = ({ isLoading }: NavBarProps) => {
  const currentBreakPoint = useCurrentBreakpoint();
  const tabIndex = useMainTab();

  return (
    <>
      <StyledNavbarWrapper>
        <Container sx={{ display: 'flex', paddingBottom: '10px' }}>
          {currentBreakPoint !== 'xs' && (
            <StyledNavbarMainContent>
              {/* <WhaveLogoDark
                size="45px"
              /> */}
              <StyledTabs
                breakpoint={currentBreakPoint}
                TabIndicatorProps={{ style: { bottom: '-10px' } }}
                value={tabIndex}
              >
                <StyledTab
                  label={
                    <StyledTabLabel>
                      <FormattedMessage description="invest" defaultMessage="Gnoberra" />
                    </StyledTabLabel>
                  }
                  value={1000}
                  sx={{ ...(tabIndex === 0 ? { color: '#90caf9' } : {}) }}
                />
              </StyledTabs>
            </StyledNavbarMainContent>
          )}
        </Container>
      </StyledNavbarWrapper>
    </>
  );
};

export default NavBar;
