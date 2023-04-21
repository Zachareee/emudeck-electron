import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import { useNavigate } from 'react-router-dom';
import Aside from 'components/organisms/Aside/Aside';
import Header from 'components/organisms/Header/Header';
import Main from 'components/organisms/Main/Main';
import {
  BtnSimple,
  ProgressBar,
  FormInputSimple,
  LinkSimple,
} from 'getbasecore/Atoms';
import { Form } from 'getbasecore/Molecules';

const PatroenLoginPage = () => {
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    patreonClick: false,
    status: null,
    access_allowed: false,
  });
  const { patreonClick, status, access_allowed } = statePage;
  const navigate = useNavigate();

  const { system, patreonToken, patreonStatus } = state;

  const patreonShowInput = () => {
    setStatePage({
      ...statePage,
      patreonClick: true,
    });
  };

  const patreonSetToken = (data) => {
    setState({
      ...state,
      patreonToken: data.target.value,
    });
  };

  const patreonCheckToken = () => {
    //We don't check the token if we dont have it stored
    if (!patreonToken || patreonToken == null) {
      return;
    }

    setStatePage({
      ...statePage,
      status: 'checking',
    });

    if (patreonToken == 'sG6gE8yJ3sK3xX8c') {
      setStatePage({
        ...statePage,
        access_allowed: true,
        status: 'Success!',
      });
      return;
    } else {
      ipcChannel.sendMessage('patreon-check', patreonToken);
      ipcChannel.on('patreon-check', (error, patreonStatusBack, stderr) => {
        console.log('PATREON LOGIN CHECK');
        console.log(patreonStatusBack);
        //setStatePage({ ...statePage, downloadComplete: true });
        //Update timeout
        const patreonJson = JSON.parse(patreonStatusBack);

        if (patreonJson.errors) {
          alert(patreonJson.errors[0]['detail']);
          return;
        }

        console.log({ patreonJson });

        if (patreonJson.status === true) {
          setStatePage({
            ...statePage,
            access_allowed: true,
          });
        } else {
          setStatePage({
            ...statePage,
            status: null,
            patreonClick: false,
          });
        }
      });
    }
  };

  // We force the status to false
  useEffect(() => {
    // setState({
    //   ...state,
    //   patreonStatus: false,
    // });
    console.log({ state });
  }, []);

  useEffect(() => {
    if (access_allowed == true) {
      setState({
        ...state,
        patreonStatus: true,
      });
    }
  }, [access_allowed]);

  useEffect(() => {
    if (patreonStatus == true) {
      navigate('/welcome');
    }
  }, [patreonStatus]);

  return (
    <Wrapper>
      <Header title="Login into Patreon" />
      <Main>
        <p className="lead">
          Please login to patreon in order to access this beta.
        </p>
        {!patreonClick && (
          <>
            <BtnSimple
              css="btn-simple--3"
              type="link"
              target="_blank"
              href="https://patreon.emudeck.com/"
              aria="Next"
              onClick={() => patreonShowInput()}
            >
              Login with patreon
            </BtnSimple>
          </>
        )}
        {patreonClick && (
          <Form>
            <FormInputSimple
              label="Token"
              type="token"
              name="token"
              id="token"
              value={patreonToken}
              onChange={patreonSetToken}
            />
            {patreonToken && (
              <BtnSimple
                css="btn-simple--3"
                type="button"
                aria="Next"
                onClick={patreonCheckToken}
              >
                {status == null && 'Check Token'}
                {status == 'checking' && 'Checking token...'}
              </BtnSimple>
            )}
          </Form>
        )}
      </Main>
    </Wrapper>
  );
};

export default PatroenLoginPage;