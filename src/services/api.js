const API_KEY = import.meta.env.VITE_REACT_APP_LASTFM_API_KEY

export const searchUsername = async (user, time) => {

  // const convertedStartDate = new Date(startDate).getTime() / 1000
  // const convertedEndDate = new Date(endDate).getTime() / 1000
  // console.log(convertedEndDate)
  // console.log('test1')
  // console.log(convertedStartDate)
  // console.log('test2')
  console.log(`http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${user}&api_key=${API_KEY}&format=json&period=${time}`)


  // const response = await fetch(`http://ws.audioscrobbler.com/2.0/?method=user.getweeklytrackchart&user=${user}&api_key=492fd34aae48441f8aa971a3329fbb26&format=json&from=${convertedStartDate}&to=${convertedEndDate}`);

  // console.log(`http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${user}&api_key=${API_KEY}&format=json&period=${time}`)

  const response = await fetch (`http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${user}&api_key=492fd34aae48441f8aa971a3329fbb26&format=json&period=${time}`)


  const data = await response.json()
  console.log(data)
  // console.log('test3')


  return data
}
