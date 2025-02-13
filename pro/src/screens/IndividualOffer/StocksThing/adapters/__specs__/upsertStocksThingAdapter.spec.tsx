import { api } from 'apiClient/api'
import { ApiError } from 'apiClient/v1'
import { ApiRequestOptions } from 'apiClient/v1/core/ApiRequestOptions'
import { ApiResult } from 'apiClient/v1/core/ApiResult'

import { STOCK_THING_FORM_DEFAULT_VALUES } from '../../constants'
import upsertStocksThingAdapter from '../upsertStocksThingAdapter'

describe('upsertStocksThingAdapter', () => {
  it('should send StockCreationBodyModel to api', async () => {
    vi.spyOn(api, 'upsertStocks').mockResolvedValue({
      stocks_count: 0,
    })
    await upsertStocksThingAdapter({
      offerId: 1,
      values: {
        activationCodesExpirationDatetime: '',
        activationCodes: [],
        remainingQuantity: STOCK_THING_FORM_DEFAULT_VALUES.remainingQuantity,
        bookingsQuantity: STOCK_THING_FORM_DEFAULT_VALUES.bookingsQuantity,
        bookingLimitDatetime: '',
        quantity: 12,
        price: 10,
        isDuo: undefined,
      },
      departementCode: '75',
    })
    expect(api.upsertStocks).toHaveBeenCalledWith({
      offerId: 1,
      stocks: [
        {
          bookingLimitDatetime: null,
          price: 10,
          quantity: 12,
        },
      ],
    })
  })

  it('should send StockEditionBodyModel to api', async () => {
    vi.spyOn(api, 'upsertStocks').mockResolvedValue({
      stocks_count: 0,
    })
    await upsertStocksThingAdapter({
      offerId: 1,
      values: {
        activationCodesExpirationDatetime: '',
        activationCodes: [],
        stockId: 1,
        remainingQuantity: STOCK_THING_FORM_DEFAULT_VALUES.remainingQuantity,
        bookingsQuantity: STOCK_THING_FORM_DEFAULT_VALUES.bookingsQuantity,
        bookingLimitDatetime: '',
        quantity: 12,
        price: 10,
        isDuo: undefined,
      },
      departementCode: '75',
    })
    expect(api.upsertStocks).toHaveBeenCalledWith({
      offerId: 1,
      stocks: [
        {
          id: 1,
          bookingLimitDatetime: null,
          price: 10,
          quantity: 12,
        },
      ],
    })
  })

  it('should return errors from api', async () => {
    vi.spyOn(api, 'upsertStocks').mockRejectedValue(
      new ApiError(
        {} as ApiRequestOptions,
        {
          status: 400,
          body: {
            price: 'API price ERROR',
            quantity: 'API quantity ERROR',
            bookingLimitDatetime: 'API bookingLimitDatetime ERROR',
          },
        } as ApiResult,
        ''
      )
    )
    const reponse = await upsertStocksThingAdapter({
      offerId: 1,
      values: {
        stockId: 12,
        activationCodesExpirationDatetime: '',
        activationCodes: [],
        remainingQuantity: STOCK_THING_FORM_DEFAULT_VALUES.remainingQuantity,
        bookingsQuantity: STOCK_THING_FORM_DEFAULT_VALUES.bookingsQuantity,
        bookingLimitDatetime: '',
        quantity: 12,
        price: 10,
        isDuo: undefined,
      },
      departementCode: '75',
    })

    expect(reponse.payload).toEqual({
      errors: {
        price: 'API price ERROR',
        quantity: 'API quantity ERROR',
        bookingLimitDatetime: 'API bookingLimitDatetime ERROR',
      },
    })
  })
})
