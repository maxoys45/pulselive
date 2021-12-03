import playerStats from '../data/player-stats.json'
import { roundTwoDecimals } from '../helpers/utils'

// Global selectors
const selectors = {
  playerDropdown: '[player-dropdown]',
  playerContainer: '[player-container]',
}

const positionMap = {
  G: 'Goalkeeper',
  D: 'Defender',
  M: 'Midfielder',
  F: 'Forward',
}

/**
 * Retrieve the player data from the dummy JSON.
 */
const PlayerData = () => {
  // HTML Nodes
  const nodes = {
    playerDropdown: document.querySelector(selectors.playerDropdown),
    playerContainer: document.querySelector(selectors.playerContainer),
  }

  /**
   * Simulate retrieving data.
   * @returns an Object of the player data
   */
  const getData = async () => {
    const data = await playerStats

    return data
  }

  /**
   * Populate the player dropdown select.
   * @param {Array} players 
   */
  const populateDropdown = players => {
    const playersSorted = players.sort((a, b) => a.player.name.last.localeCompare(b.player.name.last))

    playersSorted.map(player => {
      const { player: { id, name }} = player
      const option = document.createElement('option')

      option.text = `${name.first} ${name.last}`
      option.value = id

      nodes.playerDropdown.appendChild(option)
    })
  }

  /**
   * Selecting a player.
   * @param {Array} players 
   */
  const playerSelect = players => {
    nodes.playerDropdown.addEventListener('change', event => {
      const id = Number(event.target.value)

      getPlayerData(id, players)
        .then(selectedPlayer => {
          loadSelectedPlayer(selectedPlayer)
        })
    })
  }

  /**
   * Get the selected players data.
   * @param {Number} id 
   * @param {Array} players 
   * @returns Array of player which matches ID
   */
  const getPlayerData = async (id, players) => {
    return await players.filter(({ player }) => player.id === id)[0]
  }

  const loadSelectedPlayer = ({ player, stats }) => {
    const newStats = stats.reduce((obj, item) => (obj[item.name] = item.value, obj), {})
    const { appearances, goals, goal_assist, fwd_pass, backward_pass, mins_played } = newStats

    /**
     * I don't love this way of checking but in a real world scenario
     * you'd probably request the data coming from the API is consistent (Mertesacker having no goal_assist attribute).
     */
    const selectedStats = {
      appearances: appearances ? appearances : 0, 
      goals: goals ? goals : 0,
      assists: goal_assist ? goal_assist : 0,
      goalsPerMatch: (goals && appearances) ? roundTwoDecimals(goals / appearances): 0,
      passesPerMinute: (fwd_pass && backward_pass && mins_played) ? roundTwoDecimals((fwd_pass + backward_pass) / mins_played) : 0,
    }

    const playerHTML = `
      <img class="player__img" src="./assets/img/p${player.id}.png" />

      <div class="player__details">
        <h2 class="player__name">${player.name.first} ${player.name.last}</h2>

        <div class="player__position">${positionMap[player.info.position]}</div>

        <div class="player__badge player__badge--${player.currentTeam.id}"></div>

        <ul class="player__stats">
          <li class="player__stat stat">
            <span class="stat__label">Appearances</span>
            <span class="stat__value">${selectedStats.appearances}</span>
            </li>
          <li class="player__stat stat">
            <span class="stat__label">Goals</span>
            <span class="stat__value">${selectedStats.goals}</span>
            </li>
          <li class="player__stat stat">
            <span class="stat__label">Assists</span>
            <span class="stat__value">${selectedStats.assists}</span>
            </li>
          <li class="player__stat stat">
            <span class="stat__label">Goals per match</span>
            <span class="stat__value">${selectedStats.goalsPerMatch}</span>
            </li>
          <li class="player__stat stat">
            <span class="stat__label">Passes per minute</span>
            <span class="stat__value">${selectedStats.passesPerMinute}</span>
            </li>
        </ul>
      </div>
    `

    nodes.playerContainer.innerHTML = playerHTML
  }

  /**
   * Initialise component
   */
  const init = () => {
    getData()
      .then(({ players }) => {
        populateDropdown(players)
        playerSelect(players)
      })
  }

  return Object.freeze({
    init,
  })
}

export default new PlayerData
