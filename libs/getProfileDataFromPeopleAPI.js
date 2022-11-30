const getProfileDataFromPeopleAPI = (token) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const url = isDevelopment ? '/demo.json' : 'https://people.googleapis.com/v1/people/me?personFields=birthdays';
  return fetch(url, {
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