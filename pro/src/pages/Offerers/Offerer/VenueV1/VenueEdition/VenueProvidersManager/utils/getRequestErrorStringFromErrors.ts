export const getRequestErrorStringFromErrors = (errors: any) => {
  if (errors instanceof Array) {
    return errors
      .map((error) =>
        Object.keys(error)
          .map((key) => error[key])
          .join(' ')
      )
      .join(' ')
  }

  if (errors instanceof Object) {
    return Object.keys(errors)
      .map((key) => errors[key].map((error: any) => error).join(' '))
      .join(' ')
  }

  return ''
}
