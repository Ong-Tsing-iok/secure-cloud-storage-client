import { ResponseType } from './Types'

export function checkIsLoggedIn(userId) {
  return userId !== ''
}

export function checkNameValid(name) {
  return String(name).length <= 50 && String(name).length > 0
  // check name with regex?
}

export function checkEmailValid(email) {
  return String(email).match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
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
