import React from 'react'

// contexts
export const UserContext = React.createContext(null)
export const CustomIncidentTypesContext = React.createContext(null)
export const HeaderLogoSrcContext = React.createContext(null)

// context functions
export function withUserContext(Component) {
  return props => (
    <UserContext.Consumer>
      {state => <Component {...props} currentUser={state} />}
    </UserContext.Consumer>
  )
}
export function withCustomIncidentTypesContext(Component) {
  return props => (
    <CustomIncidentTypesContext.Consumer>
      {state => <Component {...props} customIncidentTypes={state} />}
    </CustomIncidentTypesContext.Consumer>
  )
}

export function withHeaderLogoSrcContext(Component) {
  return props => (
    <HeaderLogoSrcContext.Consumer>
      {headerLogoSrc => <Component {...props} headerLogoSrc={headerLogoSrc} />}
    </HeaderLogoSrcContext.Consumer>
  )
}

// test function
export function withContext(Context) {
  return Component => props => {
    console.log('Context, Component, props', Context, Component, props)
    return (
      <Context.Consumer>
        {context => <Component {...props} context={context} />}
      </Context.Consumer>
    )
  }
}
