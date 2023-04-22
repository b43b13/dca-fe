/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-restricted-properties */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import find from 'lodash/find';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import { useSubTab } from 'state/tabs/hooks';
import { useParams } from 'react-router-dom';
import {
  DEFAULT_NETWORK_FOR_VERSION,
  FAIL_ON_ERROR,
  POSITION_VERSION_4,
  SUPPORTED_NETWORKS_DCA,
  NETWORKS,
} from 'config/constants';
import { GetSwapIntervalsGraphqlResponse, NetworkStruct } from 'types';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { useQuery } from '@apollo/client';
import getAvailableIntervals from 'graphql/getAvailableIntervals.graphql';
import { setNetwork } from 'state/config/actions';
import useDCAGraphql from 'hooks/useDCAGraphql';
import usePairService from 'hooks/usePairService';
import { useAppDispatch } from 'state/hooks';
import { setDCAChainId } from 'state/create-position/actions';
import useTrackEvent from 'hooks/useTrackEvent';
import useErrorService from 'hooks/useErrorService';
import useReplaceHistory from 'hooks/useReplaceHistory';
import useSelectedNetwork from 'hooks/useSelectedNetwork';
import useSdkMappedChains from 'hooks/useMappedSdkChains';
import useWalletService from 'hooks/useWalletService';
import useWeb3Service from 'hooks/useWeb3Service';
import { fetchGraphTokenList } from 'state/token-lists/actions';

import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { gnosis } from 'wagmi/chains';
import { useAccount, useConnect, useEnsName, useProvider, useSigner } from 'wagmi';
import Safe, { SafeFactory, EthersAdapter, SafeAccountConfig } from '@safe-global/protocol-kit';
import { BigNumber, ethers } from 'ethers';
import SwapContainer from '../swap-container';
import ERC20ABI from '../../abis/erc20.json';

const SALT = '1234567890';
const USDC_ADDRESS = '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83';

interface HomeFrameProps {
  isLoading: boolean;
}

const HomeFrame = ({ isLoading }: HomeFrameProps) => {
  const tabIndex = useSubTab();
  const currentNetwork = useCurrentNetwork();
  const { chainId } = useParams<{ chainId: string }>();
  const client = useDCAGraphql();
  const pairService = usePairService();
  const walletService = useWalletService();
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const errorService = useErrorService();
  const trackEvent = useTrackEvent();
  const [hasLoadedPairs, setHasLoadedPairs] = React.useState(pairService.getHasFetchedAvailablePairs());
  const selectedNetwork = useSelectedNetwork();
  const sdkMappedNetworks = useSdkMappedChains();
  const web3Service = useWeb3Service();
  // const hasInitiallySetNetwork = React.useState()

  React.useEffect(() => {
    trackEvent('DCA - Visit create page');
  }, []);

  React.useEffect(() => {
    const chainIdToUse = Number(chainId);

    let networkToSet = find(sdkMappedNetworks, { chainId: chainIdToUse });
    if (!networkToSet && chainId) {
      networkToSet = find(sdkMappedNetworks, { name: chainId.toLowerCase() });
    }

    if (networkToSet && SUPPORTED_NETWORKS_DCA.includes(networkToSet.chainId)) {
      dispatch(setDCAChainId(networkToSet.chainId));
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dispatch(fetchGraphTokenList(networkToSet.chainId));
    } else if (SUPPORTED_NETWORKS_DCA.includes(currentNetwork.chainId)) {
      dispatch(setDCAChainId(DEFAULT_NETWORK_FOR_VERSION[POSITION_VERSION_4].chainId));
    }
  }, []);

  React.useEffect(() => {
    const fetchPairs = async () => {
      try {
        await pairService.fetchAvailablePairs(Number(chainId) || selectedNetwork.chainId);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        errorService.logError('Error fetching pairs', JSON.stringify(e), {});
      }
      setHasLoadedPairs(true);
    };

    if (!isLoading && !hasLoadedPairs) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchPairs();
    }
  }, [isLoading, hasLoadedPairs]);

  const handleChangeNetwork = (newChainId: number) => {
    if (SUPPORTED_NETWORKS_DCA.includes(newChainId)) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      walletService.changeNetworkAutomatically(newChainId, () => {
        const networkToSet = find(NETWORKS, { chainId: newChainId });
        dispatch(setNetwork(networkToSet as NetworkStruct));
        if (networkToSet) {
          web3Service.setNetwork(networkToSet?.chainId);
        }
      });
      replaceHistory(`/create/${newChainId}`);
      dispatch(setDCAChainId(newChainId));
      setHasLoadedPairs(false);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dispatch(fetchGraphTokenList(newChainId));
    }
  };

  const { loading: isLoadingSwapIntervals, data: swapIntervalsData } = useQuery<GetSwapIntervalsGraphqlResponse>(
    getAvailableIntervals,
    {
      client,
      variables: {
        ...((!FAIL_ON_ERROR && { subgraphError: 'allow' }) || { subgraphError: 'deny' }),
      },
      errorPolicy: (!FAIL_ON_ERROR && 'ignore') || 'none',
    }
  );

  // TODO- Move this logic to swap container
  const isLoadingIntervals = isLoading || (isLoadingSwapIntervals && tabIndex === 0) || !hasLoadedPairs;

  const [safeSdk, setSafeSdk] = useState<Safe | null>(null);
  const [safeAccountAddress, setSafeAccountAddress] = useState('');
  const [userUSDCBalance, setUserUSDCBalance] = useState(0);
  const { address, isConnected } = useAccount();
  const connector = new MetaMaskConnector({
    chains: [gnosis],
  });
  const { connect } = useConnect({
    connector,
  });
  const provider = useProvider();
  const { data: signer } = useSigner();

  // async function transferFunds() {
  //   if (!signer || !address) return;
  //   const USDC = new ethers.Contract(USDC_ADDRESS, ERC20ABI, provider);

  //   const result = await USDC.connect(signer).transfer(safeAccountAddress, 100);
  // }
  useEffect(() => {
    const init = async () => {
      if (!signer || !address) return;
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer,
      });
      const safeAccountConfig: SafeAccountConfig = {
        owners: [address],
        threshold: 1,
      };
      const USDC = new ethers.Contract(USDC_ADDRESS, ERC20ABI, provider);
      const usdcBalance: BigNumber = await USDC.connect(signer).balanceOf(address);
      const decimals: number = await USDC.decimals();
      setUserUSDCBalance(usdcBalance.toNumber() / Math.pow(10, decimals));
      const safeDeploymentConfig = { saltNonce: SALT };
      const safeFactory = await SafeFactory.create({ ethAdapter });
      const safeAddress = await safeFactory.predictSafeAddress({ safeAccountConfig, safeDeploymentConfig });
      if (safeAddress) {
        setSafeAccountAddress(safeAddress);
        const safeSdk: Safe = await Safe.create({ ethAdapter, safeAddress });
        setSafeSdk(safeSdk);
      }
    };
    init();
  }, [address, provider, signer]);

  console.log('swapIntervalsData:', swapIntervalsData);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} style={{ display: 'flex' }}>
        <SwapContainer swapIntervalsData={swapIntervalsData} handleChangeNetwork={handleChangeNetwork} />
      </Grid>
      {/* {isLoadingIntervals ? (
        <Grid item xs={12} style={{ display: 'flex' }}>
          <CenteredLoadingIndicator size={70} />
        </Grid>
      ) : (
        <>
          <Grid item xs={12} style={{ display: 'flex' }}>
              <SwapContainer swapIntervalsData={swapIntervalsData} handleChangeNetwork={handleChangeNetwork} />
          </Grid>
        </>
      )} */}
    </Grid>
  );
};
export default HomeFrame;
