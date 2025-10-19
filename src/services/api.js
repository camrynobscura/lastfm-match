const API_KEY = import.meta.env.VITE_REACT_APP_LASTFM_API_KEY

export const searchUsername = async (user, time) => {

  const response = await fetch (`http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${user}&api_key=${API_KEY}&format=json&period=${time}&limit=100`)
  const data = await response.json()

  return data

}
