// import cookie from "js-cookie"

export const isLoggedIn = () => {
  // let token = cookie.get("token") || null
  // return token !== null
  return false
}

export const getToken = () => {
  // let token = cookie.get("token") || null
  // return token
  return false
}

export const getRole = () => {
//   let roles = cookie.get("roles") || ""
//   roles = roles.split(",")
//   return roles.length > 0 ? roles[0] : ""
  return ""
}

export const getUserId = () => {
  return null
}

export const getUsername = () => {
  // return cookie.get("username") || null
  return null
}

export const login = ({ id, username, token, roles }) => {
  // cookie.set("token", token, { expires: 1 })
  // cookie.set("id", id, { expires: 1 })
  // cookie.set("username", username, { expires: 1 })
  // cookie.set("roles", roles.join(","), { expires: 1 })
}

export const logout = () => {
  cookie.remove("token")
  //
  cookie.remove("id")
  cookie.remove("username")
  cookie.remove("roles")
  // to support logging out from all windows
  window.localStorage.setItem("logout", Date.now())
}