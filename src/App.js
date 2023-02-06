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
    </div>
  );
}

export default App;
