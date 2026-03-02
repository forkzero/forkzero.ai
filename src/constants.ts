export const INSTALL_URL = 'https://forkzero.ai/lattice/install.sh'
export const INSTALL_CMD = `curl -fsSL ${INSTALL_URL} | sh`
export const INSTALL_URL_WINDOWS = 'https://forkzero.ai/lattice/install.ps1'
export const INSTALL_CMD_WINDOWS = `irm ${INSTALL_URL_WINDOWS} | iex`

export const LATTICE_DATA_URL = 'https://forkzero.github.io/lattice/lattice-data.json'
export const LATTICE_DASHBOARD_PATH = '/reader?url=' + LATTICE_DATA_URL
export const LATTICE_DASHBOARD_URL = 'https://forkzero.ai' + LATTICE_DASHBOARD_PATH

export const GITHUB_ORG_URL = 'https://github.com/forkzero'
export const GITHUB_REPO_URL = 'https://github.com/forkzero/lattice'

export const SUBSCRIBE_API_URL = 'https://app.forkzero.ai/api/subscribe'
