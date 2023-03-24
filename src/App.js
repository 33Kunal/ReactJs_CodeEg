import logo from "./logo.svg";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      state = {
    playerReady: false,
    playerSelected: false
  };
   async handleState(state) {
    if (state) {
      this.props.setStatus(state);
    } else {
      this.clearStatePolling();
      await this.waitForDeviceToBeSelected();
    }
  }
  waitForSpotify() {
    return new Promise(resolve => {
      if ('Spotify' in window) {
        resolve();
      } else {
        window.onSpotifyWebPlaybackSDKReady = () => {
          resolve();
        };
      }
    });
  }
   waitForDeviceToBeSelected() {
    return new Promise(resolve => {
      this.deviceSelectedInterval = setInterval(() => {
        if (this.webPlaybackInstance) {
          this.webPlaybackInstance.getCurrentState().then(state => {
            if (state !== null) {
              this.startStatePolling();
              clearInterval(this.deviceSelectedInterval);
              resolve(state);
            }
          });
        }
      });
    });
    tartStatePolling() {
      this.statePollingInterval = setInterval(async () => {
        let state = await this.webPlaybackInstance.getCurrentState();
        await this.handleState(state);
      }, this.props.playerRefreshRateMs || 1000);
    }
  }
    clearStatePolling() {
    clearInterval(this.statePollingInterval);
  }
sync setupWebPlaybackEvents() {
    let { Player } = window.Spotify;
    this.webPlaybackInstance = new Player({
      name: this.props.playerName,
      volume: this.props.playerInitialVolume,
      getOAuthToken: async callback => {
        if (typeof this.props.onPlayerRequestAccessToken !== 'undefined') {
          let userAccessToken = await this.props.onPlayerRequestAccessToken();
          callback(userAccessToken);
        }
      }
    });
    this.webPlaybackInstance.on('initialization_error', e => {
      this.props.onPlayerError(e.message);
    });
    this.webPlaybackInstance.on('authentication_error', e => {
      this.props.onPlayerError(e.message);
    });
    this.webPlaybackInstance.on('account_error', e => {
      this.props.onPlayerError(e.message);
    });
    this.webPlaybackInstance.on('playback_error', e => {
      this.props.onPlayerError(e.message);
    });
    this.webPlaybackInstance.on('player_state_changed', async state => {
      await this.handleState(state);
    });
    this.webPlaybackInstance.on('ready', data => {
      this.props.setDeviceId(data.device_id);
      this.props.setActiveDevice(data.device_id);
    });
    if (this.props.playerAutoConnect) {
      this.webPlaybackInstance.connect();
    }
  }
  setupWaitingForDevice() {
    return new Promise(resolve => {
      this.webPlaybackInstance.on('ready', data => {
        resolve(data);
      });
    });
    sync componentWillMount() {
      // Notify the player is loading
      this.props.onPlayerLoading();
  
      // Wait for Spotify to load player
      await this.waitForSpotify();
      // Setup the instance and the callbacks
    await this.setupWebPlaybackEvents();
    // Wait for device to be ready
    let device_data = await this.setupWaitingForDevice();
    this.props.onPlayerWaitingForDevice(device_data);
    
    // Wait for device to be selected
    await this.waitForDeviceToBeSelected();
    this.props.onPlayerDeviceSelected();
  }
  const mapDispatchToProps = dispatch => {
    return bindActionCreators(
      { setDeviceId, setActiveDevice, setStatus },
      dispatch
    );
  };
    </div>
  );
}

export default App;
