import tokenReducer, { setTokenStatus } from '../token'

describe('src | reducers | token  ', () => {
  describe('actions', () => {
    it('should return an action of type SET_TOKEN_STATUS', () => {
      // given
      const tokenStatus = true

      // when
      const result = setTokenStatus(tokenStatus)

      // then
      expect(result).toEqual({
        payload: true,
        type: 'SET_TOKEN_STATUS',
      })
    })
  })

  describe('reducer', () => {
    it('should return initial value when no action matches', () => {
      // when
      const nextState = tokenReducer()

      // then
      expect(nextState).toEqual({
        hasBeenChecked: false,
        isValid: false,
      })
    })

    describe('when a SET_TOKEN_STATUS event is received', () => {
      // given

      // when
      const nextState = tokenReducer(
        {},
        { payload: true, type: 'SET_TOKEN_STATUS' }
      )

      // then
      expect(nextState).toEqual({
        hasBeenChecked: true,
        isValid: true,
      })
    })
  })
})
