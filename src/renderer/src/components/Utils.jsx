export function checkIsLoggedIn(userId) {
  return userId !== ''
}

export function checkNameValid(name) {
  return String(name).length <= 50
  // check name with regex?
}

export function checkEmailValid(email) {
  return (
    String(email).match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ) || email === ''
  )
}
