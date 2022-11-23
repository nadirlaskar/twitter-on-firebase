const getProfileDataFromPeopleAPI = (token) => {
  return fetch('https://people.googleapis.com/v1/people/me?personFields=birthdays', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(res => res.json()).then(res => {
    if (res.birthdays && res.birthdays.length > 0) {
      return {
        dob: res.birthdays[res.birthdays.length - 1]?.date
      }
    }
    return { dob: null }
  })
}
 export default getProfileDataFromPeopleAPI;