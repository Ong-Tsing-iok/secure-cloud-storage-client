import { ResponseType } from './Types'

export function checkIsLoggedIn(userId) {
  return userId !== ''
}

export function checkNameValid(name) {
  return String(name).length <= 50 && String(name).length > 0
  // check name with regex?
}

export function checkEmailValid(email) {
  return String(email).match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )
}

export function statusToColor(status) {
  switch (status) {
    case ResponseType.A:
      return 'green'
    case ResponseType.R:
      return 'red'
    default:
      return 'black'
  }
}
