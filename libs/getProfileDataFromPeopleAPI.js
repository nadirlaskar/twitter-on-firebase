const getProfileDataFromPeopleAPI = (token) => {
  return fetch('https://people.googleapis.com/v1/people/me?personFields=birthdays', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(res => res.json()).then(res => {
    return {
      dob: res.birthdays[res.birthdays.length-1].date
    }
  })
}
 export default getProfileDataFromPeopleAPI;